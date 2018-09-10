import {Client} from 'ssh2';

import { window } from 'vscode';
import { Configuration } from './configuration/config';
import { UserPasswordHostConfig } from './open-vms-config';

let _messagePasswordIsEmpty = `Please, enter password.`;

let _settings: UserPasswordHostConfig = new UserPasswordHostConfig();

/** Create SSH client using settings from current workspace.
 * 
 *  Also ensures password and save it into cache (by 'username@host:port')
*/
export function CreateSSHClient(config: Configuration)  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        
        if (!await config.get('connection')) {
            config.add('connection', _settings);
            await config.load();
        }

        let client = new Client();

        //Allow user to setup password, if it doesn't exist
        let pass_check = new Promise<boolean>((resolve, reject) => {
            if (!_settings.password) {
                let prompt = `Enter password for ${_settings.username?_settings.username+'@':''}${_settings.host}:${_settings.port}`;
                window.showInputBox( { password: true, prompt })
                .then((value) => {
                    if (value) {
                        _settings.password = value;
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                },
                (error) => {
                    _settings.password = '';
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
        //client.connect(Object.assign({debug: console.log}, _settings));
        client.connect( _settings );
    });
}

