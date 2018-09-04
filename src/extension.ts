'use strict';
import {commands, ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';
import {RunDebugCommand} from './run-debug-command';
import {EnumAllFiles} from './enum-all-files';
import {VSC_Configuration} from './open-vms-config';

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
        let oc = new VSC_Configuration();
        //let loaded = 
        await oc.Load();
        //console.log(loaded);
        oc.user = "anonymous";
        //let saved = 
        await oc.Save();
        //console.log(saved);
    }));


}

// this method is called when your extension is deactivated
export function deactivate() {

}