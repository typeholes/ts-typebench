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
exports.getRangeText = exports.omit = exports.select = exports.getResult = exports.setOverMaxMode = exports.onExpandedSelection = exports.commentOldTypes = exports.getOffsetOf = exports.resolveTypeDeps = exports.keywords = void 0;
var vscode = require("vscode");
var undoStack_1 = require("./undoStack");
// import { Type } from '@sinclair/typebox';
var _isValidIdentifier = require("is-valid-identifier");
var config_1 = require("./config");
var tsDirs_1 = require("./tsDirs");
var isValidIdentifier = _isValidIdentifier;
console.log(isValidIdentifier);
exports.keywords = [
    'export',
    'import',
    'type',
    'interface',
    'string',
    'number',
    'bigint',
    'boolean',
];
function resolveTypeDeps(transformInterfaces, types, info, editor, position, name) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var nameOffset, arr, _i, arr_1, alias, defOffset, definitions, _c, def, _d, defUri, defRange, defDocument, defEditor, file, result;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (overMaxMode === 'abort') {
                        overMaxMode = 'warn';
                        throw new Error('Aborting TypeBench Extract');
                    }
                    if (info === undefined) {
                        return [2 /*return*/];
                    }
                    nameOffset = name.length;
                    arr = info.text
                        .split(/(\s|[^[A-Za-z_0-9$_]+)/)
                        .filter(function (x, i, xs) {
                        var _a;
                        return !exports.keywords.includes(x) &&
                            x.match(/^[A-Za-z_0-9$_]+$/) &&
                            !((_a = xs[i + 1]) !== null && _a !== void 0 ? _a : '').match(/^\s*:/);
                    })
                        .map(function (x) { return ({ text: x, kind: 'aliasName' }); });
                    _i = 0, arr_1 = arr;
                    _e.label = 1;
                case 1:
                    if (!(_i < arr_1.length)) return [3 /*break*/, 10];
                    alias = arr_1[_i];
                    if (!!types.has(alias.text)) return [3 /*break*/, 9];
                    console.log(alias.text);
                    defOffset = getOffsetOf(editor.document, position, nameOffset, alias.text, 'ignoreError');
                    if (!(defOffset === 1)) return [3 /*break*/, 2];
                    _c = undefined;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, vscode.commands.executeCommand('vscode.executeDefinitionProvider', editor.document.uri, editor.document.positionAt(defOffset))];
                case 3:
                    _c = (_e.sent());
                    _e.label = 4;
                case 4:
                    definitions = _c;
                    if (!(definitions && definitions.length > 0)) return [3 /*break*/, 9];
                    def = definitions[0];
                    _d = def instanceof vscode.Location
                        ? [def.uri, def.range]
                        : [
                            def.targetUri,
                            (_a = def.targetSelectionRange) !== null && _a !== void 0 ? _a : def.targetRange,
                        ], defUri = _d[0], defRange = _d[1];
                    return [4 /*yield*/, openTextDocument(defUri)];
                case 5:
                    defDocument = _e.sent();
                    if (!defDocument) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showTextDocument(defDocument
                        // { preserveFocus: true }
                        )];
                case 6:
                    defEditor = _e.sent();
                    file = defDocument.uri;
                    return [4 /*yield*/, getResult(types, defRange.start, file)];
                case 7:
                    result = _e.sent();
                    types.set(alias.text, result);
                    return [4 /*yield*/, resolveTypeDeps(transformInterfaces, types, result, defEditor, position, (_b = result === null || result === void 0 ? void 0 : result.name) !== null && _b !== void 0 ? _b : '')];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.resolveTypeDeps = resolveTypeDeps;
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getOffsetOf(document, position, nameOffset, name, ignoreError) {
    if (ignoreError === void 0) { ignoreError = undefined; }
    var offset = document.offsetAt(position);
    var text = document.getText().slice(offset + nameOffset);
    var match = text.match(new RegExp("^(.*?)\\b".concat(escapeRegExp(name), "\\b"), 's'));
    if (!match) {
        if (ignoreError === undefined) {
            throw new Error("alias text not found: ".concat(name));
        }
        console.log("alias text not found: ".concat(name));
        return -1;
    }
    var delta = match[0].length;
    return offset + delta + nameOffset;
}
exports.getOffsetOf = getOffsetOf;
function commentOldTypes(types) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, result, document_1, editor;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = types.values();
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    result = _a[_i];
                    if (!result) return [3 /*break*/, 4];
                    return [4 /*yield*/, openTextDocument(result.fileName)];
                case 2:
                    document_1 = _b.sent();
                    if (!document_1) return [3 /*break*/, 4];
                    return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                case 3:
                    editor = _b.sent();
                    commentRange(editor, result.range, document_1);
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.commentOldTypes = commentOldTypes;
function onExpandedSelection(types, fileName, position, action) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var name, document, editor, ranges, range, text, text, offset, remaining, result;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    name = '';
                    return [4 /*yield*/, openTextDocument(fileName)];
                case 1:
                    document = _c.sent();
                    if (!document) {
                        return [2 /*return*/, Promise.resolve(undefined)];
                    }
                    undoStack_1.undoStack.registerChange(document);
                    return [4 /*yield*/, vscode.window.showTextDocument(document)];
                case 2:
                    editor = _c.sent();
                    editor.selection = new vscode.Selection(position, position);
                    return [4 /*yield*/, vscode.commands.executeCommand('vscode.executeSelectionRangeProvider', document.uri, [position])];
                case 3:
                    ranges = _c.sent();
                    if (!((ranges === null || ranges === void 0 ? void 0 : ranges.length) > 0)) return [3 /*break*/, 5];
                    range = ranges[0];
                    {
                        text = document.getText(range.range);
                        if (isValidIdentifier(text)) {
                            name = text;
                        }
                        else if (types.has(name)) {
                            return [2 /*return*/, types.get(name)];
                        }
                    }
                    while (range.parent &&
                        // !(range.parent?.parent?.parent === undefined) &&
                        !(range.parent.range.start.line === 0 &&
                            ((_a = range.parent) === null || _a === void 0 ? void 0 : _a.range.end.line) === document.lineCount - 1)) {
                        text = document.getText(range.parent.range);
                        if (isValidIdentifier(text)) {
                            name = text;
                        }
                        else if (types.has(name)) {
                            return [2 /*return*/, types.get(name)];
                        }
                        if (range.parent.range.start.line === 0 &&
                            range.parent.range.start.character === 0) {
                            offset = document.offsetAt(range.parent.range.end);
                            remaining = document.getText().slice(offset);
                            if (!remaining.match(/\S/)) {
                                break;
                            }
                        }
                        range = range.parent;
                        editor.selection = new vscode.Selection(range.range.start, range.range.end);
                    }
                    if (!range) return [3 /*break*/, 5];
                    _b = {
                        name: name,
                        fileName: fileName,
                        position: position,
                        range: range.range
                    };
                    return [4 /*yield*/, action(editor, range, document)];
                case 4:
                    result = (_b.text = _c.sent(),
                        _b);
                    types.set(name, result);
                    return [2 /*return*/, result];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.onExpandedSelection = onExpandedSelection;
function commentRange(editor, range, document) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    editor.selection = new vscode.Selection(range.start, range.end);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, vscode.commands.executeCommand('editor.action.addCommentLine')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.log("failed to comment (".concat(document.fileName, "): ").concat(e_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, 'commented'];
            }
        });
    });
}
var overMaxMode = 'warn';
function setOverMaxMode(mode) {
    overMaxMode = mode;
}
exports.setOverMaxMode = setOverMaxMode;
function getResult(types, namePosition, file) {
    return __awaiter(this, void 0, void 0, function () {
        var choice, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(overMaxMode === 'warn' && types.size > config_1.maxTypes)) return [3 /*break*/, 2];
                    return [4 /*yield*/, vscode.window.showQuickPick(['Abort', 'Continue'], {
                            title: "More than ".concat(config_1.maxTypes, " checked. Things may have gone off the rails."),
                        })];
                case 1:
                    choice = _a.sent();
                    overMaxMode = choice === 'Continue' ? 'ignore' : 'abort';
                    _a.label = 2;
                case 2:
                    if (overMaxMode === 'abort') {
                        overMaxMode = 'warn';
                        throw new Error('Aborting TypeBench Extract');
                    }
                    return [4 /*yield*/, onExpandedSelection(types, file, namePosition, getRangeText)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getResult = getResult;
function select(keys, obj) {
    return Object.fromEntries(keys.map(function (k) { return [k, obj[k]]; }));
}
exports.select = select;
function omit(keys, obj) {
    return Object.fromEntries(Object.entries(obj).filter(function (e) { return !keys.includes(e[0]); }));
}
exports.omit = omit;
function getRangeText(editor, range, document) {
    return Promise.resolve(document.getText(range.range));
}
exports.getRangeText = getRangeText;
function openTextDocument(fileName) {
    return __awaiter(this, void 0, void 0, function () {
        var document;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, tsDirs_1.getLibFiles)().some(function (name) {
                        return fileName.fsPath.match(new RegExp("lib/".concat(escapeRegExp(name))));
                    })) {
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, vscode.workspace.openTextDocument(fileName)];
                case 1:
                    document = _a.sent();
                    return [2 /*return*/, document];
            }
        });
    });
}
