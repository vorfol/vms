'use strict';
import {commands, ExtensionContext, workspace, window, Uri} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';
import {RunDebugCommand} from './run-debug-command';
import {EnumAllFiles} from './enum-all-files';
import * as path from 'path';

export function activate(context: ExtensionContext) {

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', () => {
        RunBuildCommand();
    }));

    context.subscriptions.push( commands.registerCommand('VMS.debugProject', () => {
        RunDebugCommand();
    }));

    context.subscriptions.push( commands.registerCommand('VMS.enumAllFiles', () => {
        EnumAllFiles();
    }));

    context.subscriptions.push( commands.registerCommand('VMS.createProject', async () => {
        if (!workspace.workspaceFolders || !workspace.workspaceFolders.length) {
            return;
        }
        let config_folder = workspace.workspaceFolders[0];
        let config_file_name = path.join(config_folder.uri.fsPath, '.vscode/openvms-config.json');
        let config_file_uri = Uri.file(config_file_name);
        try {
            await window.showTextDocument(config_file_uri);
            return;
        } catch(error) {
            config_file_uri = config_file_uri.with({ scheme: "untitled" });
        }
        //double two
        try {
            await window.showTextDocument(config_file_uri);
            //add json inside
        } catch(error) {
            //...hmmm...
        }

    }));

}

// this method is called when your extension is deactivated
export function deactivate() {

}