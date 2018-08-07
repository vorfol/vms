import {Client} from 'ssh2';

//
export default function CreateSSHClient()  {
    return new Promise((resolve : (client : Client) => void, reject: (error: Error) => void) => {
        let client = new Client();
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect({    
                //TODO: get all from project config
                host: 'localhost',
                port: 22,
                username: 'foo',
                password: 'bar'
            });
    });
}

