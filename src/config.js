"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExtractors = exports.getDefaultExtractor = exports.maxTypes = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
var vscode = require("vscode");
var extractType_1 = require("./extractType");
var util_1 = require("./util");
var DefaultKey = 'TypeBench.extractor.default';
var ExtractorsKey = 'TypeBench.extractor.extractors';
var MaxTypesKey = 'TypeBench.maxTypes';
exports.maxTypes = 100;
function getDefaultExtractor() {
    var setting = vscode.workspace.getConfiguration(DefaultKey);
    (0, extractType_1.setDefaultExtractor)((0, util_1.select)(Object.keys(extractType_1.defaultExtractor), setting));
    return setting;
}
exports.getDefaultExtractor = getDefaultExtractor;
function getExtractors() {
    var setting = vscode.workspace.getConfiguration(ExtractorsKey);
    (0, extractType_1.setExtractors)((0, util_1.omit)(['has', 'get', 'update', 'inspect'], setting));
    return setting;
}
exports.getExtractors = getExtractors;
function getMaxTypes() {
    var _a;
    exports.maxTypes =
        (_a = vscode.workspace.getConfiguration('TypeBench').get('maxTypes')) !== null && _a !== void 0 ? _a : 100;
    console.log(exports.maxTypes);
    return exports.maxTypes;
}
vscode.workspace.onDidChangeConfiguration(onChange);
function onChange(event) {
    if (event.affectsConfiguration(DefaultKey)) {
        getDefaultExtractor();
    }
    if (event.affectsConfiguration(ExtractorsKey)) {
        getExtractors();
    }
    if (event.affectsConfiguration(MaxTypesKey)) {
        getMaxTypes();
    }
}
getMaxTypes();
