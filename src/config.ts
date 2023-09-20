/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import {
   Extractor,
   defaultExtractor,
   extractions,
   setDefaultExtractor,
} from './extractType';
import { omit, select } from './util';

const DefaultKey = 'TypeBench.extractor.default';
const ExtractorsKey = 'TypeBench.extractor';
const MaxTypesKey = 'TypeBench.maxTypes';

export let maxTypes = 100;

export async function updatePackage(context: vscode.ExtensionContext) {
   const packagePath = context.extensionUri.fsPath + '/package.json';
   const packageUri = vscode.Uri.parse(packagePath);
   const packageContents = await vscode.workspace.fs.readFile(packageUri);
   const packageObj = JSON.parse(packageContents.toString());
   console.log(packageObj);

   const settings = packageObj.contributes.configuration.properties;

   for (const name in extractions) {
      const [settingName, extractorConfig] = mkExtractorConfig(
         name,
         'typescript'
      );
      settings[settingName] ??= {};
      settings[settingName] = { ...extractorConfig, ...settings[settingName] };
   }

   await vscode.workspace.fs.writeFile(
      packageUri,
      new TextEncoder().encode(JSON.stringify(packageObj, null, 2))
   );
}

export function getDefaultExtractor() {
   const setting = Object.assign(
      {},
      vscode.workspace.getConfiguration(DefaultKey)
   );
   setDefaultExtractor(select(Object.keys(defaultExtractor), setting) as any);
   return setting;
}

export function getExtractors() {
   const setting = Object.assign(
      {},
      vscode.workspace.getConfiguration(ExtractorsKey)
   );
   const extractors = omit(['has', 'get', 'update', 'inspect'], setting);
   for (const key in extractors) {
      extractors[key] = { ...extractors[key] };
   }
   return extractors as Record<string, Extractor>;
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

function mkExtractorConfig(name: string, language: Extractor['language']) {
   const settingName = 'TypeBench.extractor.' + name;
   return [
      settingName,
      {
         type: 'object',
         default: {
            target: 'clipboard',
            language,
            commentOldTypes: false,
            autoUndo: false,
         },
         additionalProperties: false,
         required: ['target', 'language', 'commentOldTypes', 'autoUndo'],
         properties: {
            commentOldTypes: {
               type: 'boolean',
            },
            target: {
               type: 'string',
               enum: ['clipboard', 'inplace', 'newDocument'],
            },
            language: {
               type: 'string',
               enum: ['typescript', 'javascript', 'json', 'text'],
            },
            autoUndo: {
               type: 'boolean',
            },
         },
      },
   ] as const;
}
