import * as vscode from 'vscode';

let maxUndoDepth = 5;
let _ignore = false;

const _undoStack: Record<string, string>[] = [];

function track() {
   _ignore = false;
   if (maxUndoDepth <= 0) {
      return;
   }

   if (_undoStack.length === maxUndoDepth) {
      _undoStack.shift();
   } else {
      _undoStack.push({});
   }
}

function ignore() {
   _ignore = true;
}

function registerChange(document: vscode.TextDocument) {
   if (_ignore) {
      return;
   }
   if (_undoStack.length === 0) {
      vscode.window.showErrorMessage('Undo not being tracked');
      throw new Error('undoStack.track not called before registerChange');
   }

   if (!(document.fileName in _undoStack[_undoStack.length - 1])) {
      _undoStack[_undoStack.length - 1][document.fileName] = document.getText();
   }
}

async function restore() {
   if (_undoStack.length === 0) {
      vscode.window.showErrorMessage('Nothing to undo');
      throw new Error('undoStack.track not called before restore');
   }

   let restoreCnt = 0;

   const files = _undoStack.pop();

   for (const fileName in files) {
      restoreCnt++;
      const document = await vscode.workspace.openTextDocument(fileName);
      const editor = await vscode.window.showTextDocument(document);
      editor.selection = new vscode.Selection(
         new vscode.Position(0, 0),
         new vscode.Position(document.lineCount, Number.MAX_SAFE_INTEGER)
      );
      await editor
         .edit((edit) => edit.replace(editor.selection, files[fileName]), {
            undoStopAfter: false,
            undoStopBefore: false,
         })
         .then((success) => {
            if (!success) {
               vscode.window.showErrorMessage(`Could not restore ${fileName}`);
               throw new Error(`Could not restore ${fileName}`);
            }
         });
   }

   if (restoreCnt === 0) {
      vscode.window.showWarningMessage('No files were restored');
   }
}

export const undoStack = {
   ignore,
   track,
   registerChange,
   restore,
};
