import {Client} from 'ssh2';

import {SSHSettings} from './host-settings';
import { WorkspaceSettings } from './workspace-settings';

let _messageHostSettingsIncomlete = `Host settings is incomplete: need username, host and port.`;
let _messagePasswordIsEmpty = `Please, enter password.`;
let _passwordCache : Map<string, string> = new Map<string, string>();

/** Build cache settings string
 * 
 */
function _toCacheString(settings: SSHSettings): string {
    return `${settings.username}@${settings.host}:${settings.port}`;
}

/** Create SSH client using settings from current workspace.
 * 
 *  Also ensures password and save it into cache (by 'username@host:port')
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
        //Get password from cache
        sshSettings.password = sshSettings.password || _passwordCache.get(_toCacheString(sshSettings)) || '';
        //Allow user to setup password, if it doesn't exist
        if (!await sshSettings.EnsurePassword()) {
            reject(new Error(_messagePasswordIsEmpty));
            return;
        }
        //OnReady
        client.on('ready', () => {
                //Put password to cache
                _passwordCache.set(_toCacheString(sshSettings), sshSettings.password);
                resolve(client);
            });
        //OnError
        client.on('error', (error) => {
                reject(error);
            });
        //OnEnd
        client.on('end', () => {
                console.log("Client ends");
            });
        //OnClose
        client.on('close', (hadError) => {
                if (hadError) {
                    console.log(`Client closed with error`);
                } else {
                    console.log(`Client closed`);
                }
            });
        //Remove password before try to connect
        _passwordCache.delete(_toCacheString(sshSettings));
        //client.connect(Object.assign({debug: console.log}, sshSettings));
        client.connect( sshSettings );
    });
}

