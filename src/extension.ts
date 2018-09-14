'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';

import * as nls from 'vscode-nls';
import { ConfigHelper } from './config_v2/config_v2';
import { FS_Proxy_Config_Helper } from './config_v2/fs-config-helper';
import { Config } from './config_v2/config_v2';
import { InitCfg as FilesToSendInitCfg } from './files-to-send';
import { InitCfg as ConnectionInitCfg } from './create-ssh-client';

//const _lang_opt = { locale: env.language };
//const _lang_opt = { locale: 'ru' };
let _localize = nls.config()();

let _helper : ConfigHelper | undefined = undefined;
let _config : Config | undefined = undefined;

export async function activate(context: ExtensionContext) {

    console.log(_localize('extension.activated', 'OpenVMS extension is activated'));
    
    if (!_helper) {
        _helper =  FS_Proxy_Config_Helper.getConfigHelper();
    }

    if (!_config) {
        _config = _helper.getConfig();
    }

    context.subscriptions.push(_helper);

    FilesToSendInitCfg(_config).then(() => {
        console.log('FilesToSendInitCfg configured');
    });
    
    //test full path to Config object
    ConnectionInitCfg(FS_Proxy_Config_Helper.getConfigHelper().getConfig()).then(() => {
        console.log('ConnectionInitCfg configured');
    });

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', async () => {
        console.log('build start');
        await RunBuildCommand();
        console.log('build end');
    }));

    context.subscriptions.push( commands.registerCommand('VMS.editProject', async () => {
        console.log('edit start');
        if  (_helper ) {
            await _helper.getEditor().invoke();
        }
        console.log('edit end');
    }));

    console.log('activation end');
}

// this method is called when your extension is deactivated
export function deactivate() {

}