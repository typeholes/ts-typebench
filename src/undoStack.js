"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.undoStack = void 0;
var vscode = require("vscode");
var maxUndoDepth = 5;
var _ignore = false;
var _undoStack = [];
function track() {
    _ignore = false;
    if (maxUndoDepth <= 0) {
        return;
    }
    if (_undoStack.length === maxUndoDepth) {
        _undoStack.shift();
    }
    else {
        _undoStack.push({});
    }
}
function ignore() {
    _ignore = true;
}
function registerChange(document) {
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
function restore() {
    return __awaiter(this, void 0, void 0, function () {
        var restoreCnt, files, _loop_1, _a, _b, _c, _i, fileName;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (_undoStack.length === 0) {
                        vscode.window.showErrorMessage('Nothing to undo');
                        throw new Error('undoStack.track not called before restore');
                    }
                    restoreCnt = 0;
                    files = _undoStack.pop();
                    _loop_1 = function (fileName) {
                        var document_1, editor;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    restoreCnt++;
                                    return [4 /*yield*/, vscode.workspace.openTextDocument(fileName)];
                                case 1:
                                    document_1 = _e.sent();
                                    return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                                case 2:
                                    editor = _e.sent();
                                    editor.selection = new vscode.Selection(new vscode.Position(0, 0), new vscode.Position(document_1.lineCount, Number.MAX_SAFE_INTEGER));
                                    return [4 /*yield*/, editor
                                            .edit(function (edit) { return edit.replace(editor.selection, files[fileName]); }, {
                                            undoStopAfter: false,
                                            undoStopBefore: false,
                                        })
                                            .then(function (success) {
                                            if (!success) {
                                                vscode.window.showErrorMessage("Could not restore ".concat(fileName));
                                                throw new Error("Could not restore ".concat(fileName));
                                            }
                                        })];
                                case 3:
                                    _e.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a = files;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _i = 0;
                    _d.label = 1;
                case 1:
                    if (!(_i < _b.length)) return [3 /*break*/, 4];
                    _c = _b[_i];
                    if (!(_c in _a)) return [3 /*break*/, 3];
                    fileName = _c;
                    return [5 /*yield**/, _loop_1(fileName)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (restoreCnt === 0) {
                        vscode.window.showWarningMessage('No files were restored');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.undoStack = {
    ignore: ignore,
    track: track,
    registerChange: registerChange,
    restore: restore,
};
