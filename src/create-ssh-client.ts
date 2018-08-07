import {Client} from 'ssh2';

import GetSetting from './workspace-settings';
//
export default function CreateSSHClient()  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let host = await GetSetting<string>('host');
        let port = await GetSetting<number>('port');
        let username = await GetSetting<string>('username');
        let password = await GetSetting<string>('password');
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

