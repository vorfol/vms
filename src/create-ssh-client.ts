import {Client} from 'ssh2';
import { Configuration } from './configuration/config';
import { UserPasswordHostConfig } from './user-password-config';

let _messagePasswordIsEmpty = `Please, enter password.`;

let _settings: UserPasswordHostConfig = new UserPasswordHostConfig();

/**
 * Create SSH client using settings from current workspace.
 * 
 * @param config configuration assistent
 */
export function CreateSSHClient(config: Configuration)  {
    return new Promise(async (resolve : (client : Client) => void, reject: (error: Error) => void) => {
        
        if (!await config.get('connection')) {
            config.add('connection', _settings);
            await config.load();
        }

        let client = new Client();

        //Allow user to setup password, if it doesn't exist
        if (!await _settings.ensurePassword()) {
            reject(new Error(_messagePasswordIsEmpty));
            return;
        }
        
        //OnReady
        client.on('ready', () => {
            _settings.didUse(true);
            resolve(client);
        });
        //OnError
        client.on('error', (error) => {
            _settings.didUse(false);
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
        //client.connect(Object.assign({debug: console.log}, _settings));
        client.connect( _settings );
    });
}

