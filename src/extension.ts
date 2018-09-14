'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';

import * as nls from 'vscode-nls';
import { FS_Proxy_Config_Helper } from './config_v2/fs-config-helper';

import { InitCfg as FilesToSendInitCfg } from './files-to-send';
import { InitCfg as ConnectionInitCfg } from './create-ssh-client';
import { ConfigHelper, Config } from './config_v2/config_v2';
import { HostCollection } from './config_v2/sections/host-collection';

//const _lang_opt = { locale: env.language };
//const _lang_opt = { locale: 'ru' };
let _localize = nls.config()();

export async function activate(context: ExtensionContext) {

    console.log(_localize('extension.activated', 'OpenVMS extension is activated'));
    
    let _helper: ConfigHelper = FS_Proxy_Config_Helper.getConfigHelper();
    let _config: Config = _helper.getConfig();
    
    let _hosts = new HostCollection();
    _config.add(_hosts);
    
    FilesToSendInitCfg(_config).then(() => {
        console.log('FilesToSendInitCfg configured');
    });

    //test full path to Config object
    ConnectionInitCfg(_config).then(() => {
        console.log('ConnectionInitCfg configured');
    });

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', async () => {
        console.log('build start');
        await RunBuildCommand();
        console.log('build end');
    }));

    context.subscriptions.push( commands.registerCommand('VMS.editProject', async () => {
        console.log('edit start');
        //we have to save current configuration before edit
        await _config.save();
        let _editor = _helper.getEditor();
        await _editor.invoke();
        console.log('edit end');
    }));

    context.subscriptions.push(_helper);

    console.log('activation end');
}

// this method is called when your extension is deactivated
export function deactivate() {

}