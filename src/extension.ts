'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import RunBuildCommand from './run-build-command';
import RunDebugCommand from './run-debug-command';

export function activate(context: ExtensionContext) {

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', () => {
        RunBuildCommand();
    }));

    context.subscriptions.push( commands.registerCommand('VMS.debugProject', () => {
        RunDebugCommand();
    }));
}


// this method is called when your extension is deactivated
export function deactivate() {
}