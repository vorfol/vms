'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';
//import { WorkspaceSettings } from './workspace-settings';
//import {RunDebugCommand} from './run-debug-command';
//import {EnumAllFiles} from './enum-all-files';
import {ConfigProvider} from './open-vms-config';
import {ConfigSerializer} from './open-vms-config';
import {WS_ConfigSerializer} from './open-vms-config';
import { window } from 'vscode';
//import { workspace } from 'vscode';

//import {workspace} from 'vscode';
//import {FS_ConfigSerializer} from './open-vms-config';
//import * as path from 'path';
//import {Uri} from 'vscode';

export function activate(context: ExtensionContext) {

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', async () => {

        // let wsc = workspace.getConfiguration('open-vms');
        // let host = wsc.get('connection.host');
        // let tst = wsc.get('connection');

        // let wsc2 = workspace.getConfiguration('open-vms.connection');
        // let host2 = wsc2.get('host');

        let serializer : ConfigSerializer = new WS_ConfigSerializer();
        let cfg_provider = new ConfigProvider(serializer);
        await cfg_provider.Load();
        RunBuildCommand(cfg_provider);
    }));

    context.subscriptions.push( commands.registerCommand('VMS.editProject', async () => {

        let serializer : ConfigSerializer = new WS_ConfigSerializer();
        /** Just for test */
        // if (workspace.rootPath) {
        //     //let's some hardcode :)
        //     let cfg_path = path.join(workspace.rootPath, '.vscode/openvms-config.json');
        //     serializer = new FS_ConfigSerializer(cfg_path);
        // }

        //let cfg_provider = new ConfigProvider(serializer);
        // await cfg_provider.Load();
        // let host = cfg_provider.host_configuration;
        // console.log(host);

        let uri = serializer.Uri();
        if (uri.scheme === 'vscode-command') {
            commands.executeCommand(uri.path);
        } else {
            window.showTextDocument(uri).then((text_editor) => {
                //OK
            }, async (reason) => {
                //Not OK - create default settings
                let cfg_provider = new ConfigProvider(serializer);
                cfg_provider.Defaults();
                await cfg_provider.Save();
                //try #2
                window.showTextDocument(uri).then((text_editor) => {
                    //OK
                }, (error) => {
                    //FAIL
                    console.log(`Edit project settings failed`);
                });
            });
        }        
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {

}