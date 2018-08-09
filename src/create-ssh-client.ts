import {Client} from 'ssh2';

import {SSHSettings} from './host-settings';

let _messageHostSettingsIncomlete = `Host settings is incomplete`;
//
export function CreateSSHClient()  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let sshSettings = SSHSettings.FromWorkspace(); 
        if (!sshSettings.IsComplete) {
            reject(new Error(_messageHostSettingsIncomlete));
        }
        if (!sshSettings.TestPassword()) {
            reject(new Error(_messageHostSettingsIncomlete));
        }
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect(sshSettings);
    });
}

