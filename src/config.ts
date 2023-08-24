/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import {
   defaultExtractor,
   setDefaultExtractor,
   setExtractors,
} from './extractType';
import { omit, select } from './util';

const DefaultKey = 'TypeBench.extractor.default';
const ExtractorsKey = 'TypeBench.extractor.extractors';

export function getDefaultExtractor() {
   const setting = vscode.workspace.getConfiguration(DefaultKey);
   setDefaultExtractor(select(Object.keys(defaultExtractor), setting) as any);
   return setting;
}

export function getExtractors() {
   const setting = vscode.workspace.getConfiguration(ExtractorsKey);
   setExtractors(omit(['has', 'get', 'update', 'inspect'], setting) as any);
   return setting;
}

vscode.workspace.onDidChangeConfiguration(onChange);

function onChange(event: vscode.ConfigurationChangeEvent) {
   if (event.affectsConfiguration(DefaultKey)) {
      getDefaultExtractor();
   }
   if (event.affectsConfiguration(ExtractorsKey)) {
      getExtractors();
   }
}
