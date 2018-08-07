import {Client} from 'ssh2';

import GetSetting from './workspace-settings';
//
export default function CreateSSHClient()  {
    return new Promise((resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let host = GetSetting<string>('host');
        let port = GetSetting<number>('port');
        let username = GetSetting<string>('username');
        let password = GetSetting<string>('password');
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

