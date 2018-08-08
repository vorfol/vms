import {Client} from 'ssh2';

import {GetValue} from './workspace-settings';
//
export function CreateSSHClient()  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let host = await GetValue<string>('host');
        let port = await GetValue<number>('port');
        let username = await GetValue<string>('username');
        let password = await GetValue<string>('password');
        if (!host || !port || !username || !password) {
            console.log("setting not found: host,port,username,password");
            return;
        }
        //config.update()
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect({    
                host,
                port,
                username,
                password
            });
    });
}

