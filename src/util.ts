import * as vscode from 'vscode';
import { undoStack } from './undoStack';

import _isValidIdentifier = require('is-valid-identifier');
import { types } from 'util';

const isValidIdentifier = _isValidIdentifier as unknown as (
   text: string,
   strict?: boolean
) => boolean;

console.log(isValidIdentifier);

export type Result =
   | {
        name: string;
        position: vscode.Position;
        fileName: string;
        text: string;
        range: vscode.Range;
     }
   | undefined;

export const keywords = [
   'export',
   'import',
   'type',
   'interface',
   'string',
   'number',
   'bigint',
   'boolean',
];

export async function resolveTypeDeps(
   transformInterfaces: boolean,
   types: Map<string, Result | undefined>,
   info: Result,
   editor: vscode.TextEditor,
   position: vscode.Position,
   nameOffset: number
) {
   if (info === undefined) {
      return;
   }

   const arr = info.text
      .split(/(\s|[^[A-Za-z_0-9$_]+)/)
      .filter(
         (x, i, xs) =>
            !keywords.includes(x) &&
            x.match(/^[A-Za-z_0-9$_]+$/) &&
            !(xs[i + 1] ?? '').match(/^\s*:/)
      )
      .map((x) => ({ text: x, kind: 'aliasName' }));

   for (const alias of arr) {
      if (!types.has(alias.text)) {
         console.log(alias.text);
         const defOffset = getOffsetOf(
            editor.document,
            position,
            nameOffset,
            alias.text,
            'ignoreError'
         );
         const definitions =
            defOffset === 1
               ? undefined
               : ((await vscode.commands.executeCommand(
                    'vscode.executeDefinitionProvider',
                    editor.document.uri,
                    editor.document.positionAt(defOffset)
                 )) as Array<vscode.Location | vscode.LocationLink>);
         if (definitions && definitions.length > 0) {
            const def = definitions[0];
            const [defUri, defRange] =
               def instanceof vscode.Location
                  ? [def.uri, def.range]
                  : [
                       def.targetUri,
                       def.targetSelectionRange ?? def.targetRange,
                    ];
            const defDocument = await vscode.workspace.openTextDocument(defUri);
            const defEditor = await vscode.window.showTextDocument(
               defDocument
               // { preserveFocus: true }
            );
            // const defOffset = getOffsetOf(
            //    defDocument,
            //    defRange.start,
            //    alias.text
            // );

            const file = defDocument.fileName;

            const result = await getResult(types, defRange.start, file);

            types.set(alias.text, result);
            await resolveTypeDeps(
               transformInterfaces,
               types,
               result,
               defEditor,
               position,
               result?.name.length ?? 0
            );
         }
      }
   }
}

function escapeRegExp(s: string): string {
   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getOffsetOf(
   document: vscode.TextDocument,
   position: vscode.Position,
   nameOffset: number,
   name: string,
   ignoreError: 'ignoreError' | undefined = undefined
) {
   const offset = document.offsetAt(position);
   const text = document.getText().slice(offset + nameOffset);
   const match = text.match(
      new RegExp(`^(.*?)\\b${escapeRegExp(name)}\\b`, 's')
   );
   if (!match) {
      if (ignoreError === undefined) {
         throw new Error(`alias text not found: ${name}`);
      }
      console.log(`alias text not found: ${name}`);
      return -1;
   }

   const delta = match[0].length;
   return offset + delta + nameOffset;
}

export async function commentOldTypes(types: Map<string, Result>) {
   for (const result of types.values()) {
      if (result) {
         const document = await vscode.workspace.openTextDocument(
            result.fileName
         );
         const editor = await vscode.window.showTextDocument(document);
         commentRange(editor, result.range, document);
      }
   }
}

export async function onExpandedSelection(
   types: Map<string, Result>,
   fileName: string,
   position: vscode.Position,
   action: (
      editor: vscode.TextEditor,
      range: vscode.SelectionRange,
      document: vscode.TextDocument
   ) => Promise<string>
): Promise<Result | undefined> {
   let name = '';

   const document = await vscode.workspace.openTextDocument(fileName);
   undoStack.registerChange(document);

   const editor = await vscode.window.showTextDocument(document);
   editor.selection = new vscode.Selection(position, position);
   const ranges = await vscode.commands.executeCommand<vscode.SelectionRange[]>(
      'vscode.executeSelectionRangeProvider',
      document.uri,
      [position]
   );
   if (ranges?.length > 0) {
      let range = ranges[0];
      {
         const text = document.getText(range.range);
         if (isValidIdentifier(text)) {
            name = text;
         } else if (types.has(name)) {
            return types.get(name);
         }
      }

      while (
         range.parent &&
         // !(range.parent?.parent?.parent === undefined) &&
         !(
            range.parent.range.start.line === 0 &&
            range.parent?.range.end.line === document.lineCount - 1
         )
      ) {
         const text = document.getText(range.parent.range);
         if (isValidIdentifier(text)) {
            name = text;
         } else if (types.has(name)) {
            return types.get(name);
         }

         if (
            range.parent.range.start.line === 0 &&
            range.parent.range.start.character === 0
         ) {
            const offset = document.offsetAt(range.parent.range.end);
            const remaining = document.getText().slice(offset);
            if (!remaining.match(/\S/)) {
               break;
            }
         }
         range = range.parent;
         editor.selection = new vscode.Selection(
            range.range.start,
            range.range.end
         );
      }
      if (range) {
         const result = {
            name,
            fileName,
            position,
            range: range.range,
            text: await action(editor, range, document),
         };
         types.set(name, result);
         return result;
      }
   }
}

async function commentRange(
   editor: vscode.TextEditor,
   range: vscode.Range,
   document: vscode.TextDocument
) {
   editor.selection = new vscode.Selection(range.start, range.end);
   try {
      await vscode.commands.executeCommand('editor.action.addCommentLine');
   } catch (e) {
      console.log(`failed to comment (${document.fileName}): ${e}`);
   }
   return 'commented';
}

export async function getResult(
   types: Map<string, Result>,
   namePosition: vscode.Position,
   file: string
) {
   let result = await onExpandedSelection(
      types,
      file,
      namePosition,
      getRangeText
   );
   return result;
}

export function select<K extends string>(
   keys: K[],
   obj: Record<string, any>
): Record<K, string> {
   return Object.fromEntries(keys.map((k) => [k, obj[k]])) as never;
}

export function omit(
   keys: PropertyKey[],
   obj: Record<string, any>
): Record<PropertyKey, any> {
   return Object.fromEntries(
      Object.entries(obj).filter((e) => !keys.includes(e[0]))
   );
}

export function getRangeText(
   editor: vscode.TextEditor,
   range: vscode.SelectionRange,
   document: vscode.TextDocument
): Promise<string> {
   return Promise.resolve(document.getText(range.range));
}
