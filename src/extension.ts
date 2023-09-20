import * as vscode from 'vscode';
import { undoStack } from './undoStack';
import { extractType, defaultExtractor } from './extractType';
import { getExtractors, updatePackage } from './config';
import { setOverMaxMode } from './util';

export async function activate(context: vscode.ExtensionContext) {
   await updatePackage(context);

   {
      const disposable = vscode.commands.registerTextEditorCommand(
         'sinclair.text-edit',
         (editor) => extractType(editor, defaultExtractor.extraction)
      );
      context.subscriptions.push(disposable);
   }

   {
      const disposable = vscode.commands.registerTextEditorCommand(
         'sinclair.text-edit.choose',
         (editor) => {
            const extractors = getExtractors();
            vscode.window.showQuickPick(Object.keys(extractors)).then((key) => {
               if (key && key in extractors) {
                  extractType(editor, key as never);
               }
            });
         }
      );
      context.subscriptions.push(disposable);
   }

   {
      const disposable = vscode.commands.registerTextEditorCommand(
         'sinclair.undo-edit',
         undoStack.restore
      );
      context.subscriptions.push(disposable);
   }

   {
      const disposable = vscode.commands.registerCommand('sinclair.abort', () =>
         setOverMaxMode('abort')
      );
      context.subscriptions.push(disposable);
   }

   const action = new vscode.CodeAction(
      'Extract TypeBench Type',
      vscode.CodeActionKind.RefactorExtract
   );
   action.command = { title: '', command: 'sinclair.text-edit' };

   const provider: vscode.CodeActionProvider<vscode.CodeAction> = {
      provideCodeActions: (document, range, context, cancellationToken) => [
         action,
      ],
   };

   {
      const disposable = vscode.languages.registerCodeActionsProvider(
         { language: 'typescript', scheme: 'file' },
         provider,
         { providedCodeActionKinds: [vscode.CodeActionKind.RefactorExtract] }
      );
      context.subscriptions.push(disposable);
   }
}

export function deactivate() {}
