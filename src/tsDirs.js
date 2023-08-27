"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsdk = exports.getLibFiles = void 0;
var vscode = require("vscode");
var fs_1 = require("fs");
function getTsdk() {
    var _a;
    exports.tsdk =
        (_a = vscode.workspace.getConfiguration('typescript').get('tsdk')) !== null && _a !== void 0 ? _a : './node_modules/typescript/lib/';
    return exports.tsdk;
}
var libFiles = [];
function getLibFiles() {
    if (libFiles.length === 0) {
        var tsdk_1 = getTsdk();
        var files = (0, fs_1.readdirSync)(tsdk_1);
        libFiles.push.apply(libFiles, files.filter(function (name) { return name.startsWith('lib'); }));
    }
    return libFiles;
}
exports.getLibFiles = getLibFiles;
exports.tsdk = '';
