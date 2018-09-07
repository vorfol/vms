'use strict';
import {commands} from 'vscode';
import {ExtensionContext} from 'vscode';
 
import {RunBuildCommand} from './run-build-command';
//import {RunDebugCommand} from './run-debug-command';
//import {EnumAllFiles} from './enum-all-files';
import {ConfigProvider} from './open-vms-config';
import {ConfigSerializer} from './open-vms-config';
import {VSC_ConfigSerializer} from './open-vms-config';
import { window } from 'vscode';

//import {workspace} from 'vscode';
//import {FS_ConfigSerializer} from './open-vms-config';
//import * as path from 'path';

export function activate(context: ExtensionContext) {

    context.subscriptions.push( commands.registerCommand('VMS.buildProject', async () => {
        RunBuildCommand();
    }));

    context.subscriptions.push( commands.registerCommand('VMS.editProject', async () => {

        let serializer : ConfigSerializer = new VSC_ConfigSerializer();
        /** Just for test */
        // if (workspace.rootPath) {
        //     //let's some hardcode :)
        //     let cfg_path = path.join(workspace.rootPath, '.vscode/openvms-config.json');
        //     serializer = new FS_ConfigSerializer(cfg_path);
        // }

        window.showTextDocument(serializer.Uri()).then((text_editor) => {
            //OK
        }, async (reason) => {
            //Not OK - create default settings
            let cfg_provider = new ConfigProvider(serializer);
            cfg_provider.Defaults();
            await cfg_provider.Save();
            //try #2
            window.showTextDocument(serializer.Uri()).then((text_editor) => {
                //OK
            }, (error) => {
                //FAIL
                console.log(`Edit project settings failed`);
            });
        });
        
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {

}