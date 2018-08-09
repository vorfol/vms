import {Client} from 'ssh2';

import {SSHSettings} from './host-settings';
import { WorkspaceSettings } from './workspace-settings';

let _messageHostSettingsIncomlete = `Host settings is incomplete: need username, host and port.`;
let _messagePasswordIsEmpty = `Please, enter password.`;

/** Create SSH client using settings from current workspace.
 * 
 *  Also ensures password.
*/
export function CreateSSHClient()  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let sshSettings = SSHSettings.FromWorkspace(); 
        if (!sshSettings.IsComplete) {
            WorkspaceSettings.WarnUser();
            reject(new Error(_messageHostSettingsIncomlete));
            return;
        }
        if (!await sshSettings.EnsurePassword()) {
            reject(new Error(_messagePasswordIsEmpty));
            return;
        }
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect(sshSettings);
    });
}

