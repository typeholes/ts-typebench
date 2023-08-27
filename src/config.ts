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
const MaxTypesKey = 'TypeBench.maxTypes';

export let maxTypes = 100;

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

function getMaxTypes() {
   maxTypes =
      vscode.workspace.getConfiguration('TypeBench').get('maxTypes') ?? 100;
   console.log(maxTypes);
   return maxTypes;
}



vscode.workspace.onDidChangeConfiguration(onChange);

function onChange(event: vscode.ConfigurationChangeEvent) {
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
