"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
var vscode = require("vscode");
var undoStack_1 = require("./undoStack");
var extractType_1 = require("./extractType");
var config_1 = require("./config");
var util_1 = require("./util");
function activate(context) {
    (0, config_1.getExtractors)();
    {
        var disposable = vscode.commands.registerTextEditorCommand('sinclair.text-edit', function (editor) { return (0, extractType_1.extractType)(editor, extractType_1.defaultExtractor); });
        context.subscriptions.push(disposable);
    }
    {
        var disposable = vscode.commands.registerTextEditorCommand('sinclair.text-edit.choose', function (editor) {
            vscode.window.showQuickPick(Object.keys(extractType_1.extractors)).then(function (key) {
                if (key && key in extractType_1.extractors) {
                    (0, extractType_1.extractType)(editor, extractType_1.extractors[key]);
                }
            });
        });
        context.subscriptions.push(disposable);
    }
    {
        var disposable = vscode.commands.registerTextEditorCommand('sinclair.undo-edit', undoStack_1.undoStack.restore);
        context.subscriptions.push(disposable);
    }
    {
        var disposable = vscode.commands.registerCommand('sinclair.abort', function () {
            return (0, util_1.setOverMaxMode)('abort');
        });
        context.subscriptions.push(disposable);
    }
    var action = new vscode.CodeAction('Extract TypeBench Type', vscode.CodeActionKind.RefactorExtract);
    action.command = { title: '', command: 'sinclair.text-edit' };
    var provider = {
        provideCodeActions: function (document, range, context, cancellationToken) { return [
            action,
        ]; },
    };
    {
        var disposable = vscode.languages.registerCodeActionsProvider({ language: 'typescript', scheme: 'file' }, provider, { providedCodeActionKinds: [vscode.CodeActionKind.RefactorExtract] });
        context.subscriptions.push(disposable);
    }
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
