import {Client} from 'ssh2';

//import {SSHSettings} from './host-settings';
//import { WorkspaceSettings } from './workspace-settings';
import { ConfigProvider, HostConfig } from './open-vms-config';
import { window } from 'vscode';

//let _messageHostSettingsIncomlete = `Host settings is incomplete: need username, host and port.`;
let _messagePasswordIsEmpty = `Please, enter password.`;
let _passwordCache : Map<string, string> = new Map<string, string>();

/** Build cache settings string
 * 
 */
function _toCacheString(settings: HostConfig): string {
    return `${settings.username}@${settings.host}:${settings.port}`;
}

/** Create SSH client using settings from current workspace.
 * 
 *  Also ensures password and save it into cache (by 'username@host:port')
*/
export function CreateSSHClient(cfg_provider: ConfigProvider)  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let sshSettings = cfg_provider.host_configuration;

        //Get password from cache
        sshSettings.password = sshSettings.password || _passwordCache.get(_toCacheString(sshSettings)) || '';

        //Allow user to setup password, if it doesn't exist
        let pass_check = new Promise<boolean>((resolve, reject) => {
            if (!sshSettings.password) {
                let prompt = `Enter password for ${sshSettings.username?sshSettings.username+'@':''}${sshSettings.host}:${sshSettings.port}`;
                window.showInputBox( { password: true, prompt })
                .then((value) => {
                    if (value) {
                        sshSettings.password = value;
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                },
                (error) => {
                    sshSettings.password = '';
                    resolve(false);
                });
            } else {
                resolve(true);
            }
        });

        if (!await pass_check) {
            reject(new Error(_messagePasswordIsEmpty));
            return;
        }
        //OnReady
        client.on('ready', () => {
                //Put password to cache
                _passwordCache.set(_toCacheString(sshSettings), sshSettings.password || '');
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

