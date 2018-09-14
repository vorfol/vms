import { ConfigSection, ConfigData } from "./config_v2";
import { UserPasswordHostConfig } from "../host-config";

/**
 *  ConfigSection implementations 
 * 
 * 
 * 
 */

export class UserPasswordSection implements ConfigSection, UserPasswordHostConfig {
    
    method: string = 'user_password';
    host: string = '';
    port: number = 22;
    username: string = '';
    password: string = '';

    static readonly _section = 'connection';

    name(): string {
        return UserPasswordSection._section;
    }

    store(): ConfigData {
        //do not store password
        return { host: this.host, 
                 port: this.port, 
                 username: this.username
            };
    }

    templateToFillFrom(): ConfigData {
        return { host: '', 
                 port: 0, 
                 username: '',
                 password: ''
            };
    }
    
    fillFrom(data: ConfigData): boolean {
        if (typeof data.host === 'string') {
            this.host = data.host;
        }
        if (typeof data.port === 'number') {
            this.port = data.port;
        }
        if (typeof data.username === 'string') {
            this.username = data.username;
        }
        if (typeof data.password === 'string') {
            this.password = data.password;
        }
        return true;
    }

}
