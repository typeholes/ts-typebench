import * as vscode from 'vscode';
import { readdirSync } from 'fs';

function getTsdk() {
   tsdk =
      vscode.workspace.getConfiguration('typescript').get('tsdk') ??
      './node_modules/typescript/lib/';
   return tsdk;
}

let libFiles: string[] = [];

export function getLibFiles() {
   if (libFiles.length === 0) {
      const tsdk = getTsdk();
      const files = readdirSync(tsdk);
      libFiles.push(...files.filter((name) => name.startsWith('lib')));
   }
   return libFiles;
}

export let tsdk = '';
