import {workspace} from 'vscode';
//import {ConfigurationTarget} from 'vscode';
import {Client} from 'ssh2';

//
export default function CreateSSHClient()  {
    return new Promise((resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        //Get all from project config
        let config = workspace.getConfiguration("open-vms");
        let host = config.get<string>('host') || 'localhost';
        let port = config.get<number>('port') || 22;
        let username = config.get<string>('username') || 'foo';
        let password = config.get<string>('password') || 'bar';
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect({    
                host,
                port,
                username,
                password
            });
        //TODO: if configuration doesn't present, create it
        // config.update('host', host, ConfigurationTarget.Workspace)
        //     .then(() => {
        //         console.log('host updated');
        //     }, (reason: any) => {
        //         console.log(`host update failed, reason: ${reason}`);
        //     });
    });
}

