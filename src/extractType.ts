/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import {
   TypeScriptToModel,
   ModelToArkType,
   ModelToIoTs,
   ModelToTypeScript,
   ModelToValibot,
   ModelToJavaScript,
   ModelToJsonSchema,
   TypeScriptToTypeBox,
   ModelToValue,
   ModelToZod,
   TypeBoxModel,
} from '@sinclair/typebox-codegen';
import { undoStack } from './undoStack';
import {
   getResult,
   resolveTypeDeps,
   commentOldTypes,
   onExpandedSelection,
   Result,
   getRangeText,
   keywords,
   setOverMaxMode,
} from './util';
import { getExtractors } from './config';

export const extractions = {
   ArkType: mkTypeBenchExtract(ModelToArkType),
   IoTs: mkTypeBenchExtract(ModelToIoTs),
   TypeScript: mkTypeBenchExtract(ModelToTypeScript),
   Valibot: mkTypeBenchExtract(ModelToValibot),
   Javascript: mkTypeBenchExtract(ModelToJavaScript),
   JsonSchema: mkTypeBenchExtract(ModelToJsonSchema),
   TypeBox: { transform: TypeScriptToTypeBox.Generate },
   SampleValue: mkTypeBenchExtract(ModelToValue),
   Zod: mkTypeBenchExtract(ModelToZod),
   Identity: { transform: (code: string) => code },
} as const;

export type Language = 'typescript' | 'js' | 'text' | 'json';

export const defaultExtractor = {
   extraction: 'Identity' as keyof typeof extractions,
   commentOldTypes: false,
   target: 'newDocument' as 'clipboard' | 'inplace' | 'newDocument',
   language: 'typescript' as Language,
   autoUndo: true,
};

export type Extractor = {
   target: 'clipboard' | 'inplace' | 'newDocument';
   language: Language;
   commentOldTypes: boolean;
   autoUndo: boolean;
};

export function setDefaultExtractor(values: Extractor) {
   Object.assign(defaultExtractor, values);
}


function mkTypeBenchExtract(generator: {
   Generate: (m: TypeBoxModel) => string;
}) {
   return {
      transform: (code: string) => {
         const model = TypeScriptToModel.Generate(code);
         const output = generator.Generate(model);
         return output;
      },
   };
}

export async function extractType(
   textEditor: vscode.TextEditor,
   extractionName: keyof typeof extractions
) {
   setOverMaxMode('warn');

   const extract = getExtractors()[extractionName];


   if (
      extract.target === 'inplace' ||
      extract.commentOldTypes ||
      extract.autoUndo
   ) {
      undoStack.track();
   } else {
      undoStack.ignore();
   }
   undoStack.registerChange(textEditor.document);

   let namePosition = textEditor.selection.active;
   const file = textEditor.document.uri;

   const types = new Map<string, Result>();

   let result = await onExpandedSelection(
      types,
      file,
      namePosition,
      getRangeText
   );

   const name = result?.name;

   if (name === '' || name === undefined) {
      vscode.window.showErrorMessage(`no type name found at cursor`);
      return;
   }

   if (keywords.includes(name ?? '')) {
      vscode.window.showErrorMessage(
         `Extract type must be run at a type name.  ran at ${name}`
      );
      return;
   }

   result = await getResult(types, namePosition, file);

   await resolveTypeDeps(
      types,
      result,
      textEditor,
      namePosition,
      result?.name ?? ''
   );

   const code = Array.from(types.values())
      .filter((x) => x !== undefined)
      .reverse()
      .map((info) => info?.text)
      .join('\n\n');

   const newCode = extractions[extractionName].transform(code);

   if (extract.commentOldTypes) {
      await commentOldTypes(types);
   }

   if (extract.target === 'inplace') {
      // for some reason vscode thinks the textEditor is closed
      const openEditor = await vscode.window.showTextDocument(
         textEditor.document
      );
      await openEditor.edit(
         (edit) => {
            edit.insert(
               new vscode.Position(namePosition.line, 0),
               `// name: ${name}\n${newCode}\n`
            );
         },
         { undoStopAfter: false, undoStopBefore: false }
      );
   }

   if (extract.target === 'clipboard') {
      vscode.env.clipboard.writeText(newCode);
      vscode.window.showInformationMessage('Result written to clipboard');
   }

   if (extract.target === 'newDocument') {
      const document = await vscode.workspace.openTextDocument({
         language: extract.language,
      });
      const editor = await vscode.window.showTextDocument(document);
      await editor.edit((edit) =>
         edit.insert(new vscode.Position(0, 0), newCode)
      );
   }

   if (extract.autoUndo) {
      undoStack.restore();
   }
}
