
import {workspace, Uri, WorkspaceEdit, Position} from 'vscode';
//import { inspect } from 'util';
import { Range } from 'vscode';

export type ConnectMethod = 'user_password' | 'keys';

export interface HostConfig {
    method: string;
    host: string;
    port?: number;
    user?: string;
    password?: string;
}

export abstract class Configuration implements HostConfig{

    method = 'user_password';
    host = 'host';
    port : number | undefined = 22;
    user : string | undefined = 'user';
    password : string | undefined ='';

    get host_config() : HostConfig {
        return { 
            method: this.method, 
            host: this.host,
            port: this.port,
            user: this.user,
            password: this.password
        };
    }

    set host_config(cfg : HostConfig) {
        this.method = cfg.method;
        this.host = cfg.host;
        this.port = cfg.port;
        this.user = cfg.user;
        this.password = cfg.password;
    }
    
    abstract Load() : Thenable<Configuration | undefined>;
    abstract Save() : Thenable<boolean>;
}

export class VSC_Configuration extends Configuration {

    get configPath () : Uri | undefined {
        if (workspace.workspaceFolders && workspace.workspaceFolders.length) {
            let cfgUri = workspace.workspaceFolders[0].uri;
            if (workspace.workspaceFolders.length > 1)
            {
                let last_folder_uri = workspace.workspaceFolders[workspace.workspaceFolders.length-1].uri;
                let path = last_folder_uri.path;
                if (path && path.length && path[path.length-1] == '/') {
                    path = path.slice(0, path.length-1);
                } 
            }
            let path = cfgUri.path;
            let new_path = '.vscode/openvms-config.json'
            if (path && path.length && path[path.length-1] == '/') {
                new_path = path + new_path;
            } else {
                new_path = path + '/' + new_path;
            }
            let new_cfgUri = cfgUri.with({ path: new_path });
            return new_cfgUri;
        }
        return undefined;
    }

    Load(): Thenable<Configuration | undefined> {
        let path_or_null = this.configPath;
        if (!path_or_null) {
            return Promise.resolve(undefined);
        } else {
            let path_ok = path_or_null;
            return new Promise<Configuration|undefined>( async (resolve, reject) => {
                try {
                    let text_doc = await workspace.openTextDocument(path_ok);
                    let all_text = text_doc.getText();
                    this.host_config = JSON.parse(all_text);
                    resolve(this);
                } catch(err) {
                    resolve(undefined);
                }
            });
        }
    }    

    Save(): Thenable<boolean> {
        let path_or_null = this.configPath;
        if (!path_or_null) {
            return Promise.resolve(false);
        } else {
            let path_ok = path_or_null;
            return new Promise<boolean>( async (resolve, reject) => {
                try {
                    let range : Range | undefined = undefined;
                    try {
                        let text_doc = await workspace.openTextDocument(path_ok);
                        range = text_doc.validateRange(new Range(0,0,32767,32767));
                    } catch (err) {
                        range = undefined;
                    }
                    let we = new WorkspaceEdit();
                    if (!range) {
                        we.createFile(path_ok);
                        we.insert(path_ok, new Position(0, 0), JSON.stringify(this.host_config, null, 4));
                    } else {
                        we.replace(path_ok, range, JSON.stringify(this.host_config, null, 4));
                    }
                    let status = await workspace.applyEdit(we);
                    if (status) {
                        let text_doc = await workspace.openTextDocument(path_ok);
                        let saved = await text_doc.save();
                        resolve(saved);
                    } else {
                        resolve(false);
                    }
                } catch(err) {
                    resolve(false);
                }
            });
        }
    }

}