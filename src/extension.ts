'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';
import { Configuration, SerializeHelper } from './configuration/config';
import { WS_SerializeHelper } from './configuration/ws-config';
import { ProxyConfiguration } from './configuration/proxy-config';

const _section = 'open-vms';

export function activate(context: ExtensionContext) {

    let _serialize_helper: SerializeHelper = new WS_SerializeHelper(_section);
    let _config: Configuration = new ProxyConfiguration(_serialize_helper);

    context.subscriptions.push(_serialize_helper);
    context.subscriptions.push(_config);

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', async () => {
        RunBuildCommand(_config);
    }));

    context.subscriptions.push( commands.registerCommand('VMS.editProject', async () => {
        _config.edit();
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {

}