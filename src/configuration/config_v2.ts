
import { Event } from "vscode";
import { Disposable } from "vscode";
import { EventEmitter } from "vscode";

import * as nls from 'vscode-nls';
import * as fs from "fs";
import * as path from "path";
import { workspace } from "vscode";

let _localize = nls.loadMessageBundle();

/**
 * Base types and interfaces
 * 
 * 
 * 
 */

type simplyData = string | number | boolean | null;

export interface ConfigData {
    [key: string] : (simplyData | Array<simplyData>);
}

export interface ConfigSection {

    name(): string;

    store(): ConfigData;

    fillFrom(data: ConfigData): boolean;

    templateToFillFrom(): ConfigData;
}

export interface ConfigObject {
    [key:string] : ConfigSection;
}

export enum ConfigStorageActionResult {
    ok = 0,
    fail = 1,
    prepare_failed = 2,
    some_data_failed = 4,
    end_failed = 8
}

export interface ConfigStorage extends Disposable{

    fillStart() : Thenable<ConfigStorageActionResult>;
    fillData(section: string, data: ConfigData) : Thenable<ConfigStorageActionResult>;
    fillEnd() : Thenable<ConfigStorageActionResult>;

    storeStart() : Thenable<ConfigStorageActionResult>;
    storeData(section: string, data: ConfigData) : Thenable<ConfigStorageActionResult>;
    storeEnd() : Thenable<ConfigStorageActionResult>;

    readonly onDidChangeOutside: Event<null>;
}

export interface Config {
    add(cfg: ConfigSection) : boolean;
    get(section: string) : Thenable<ConfigSection|undefined>;
    load() : Thenable<ConfigStorageActionResult>;
    save() : Thenable<ConfigStorageActionResult>;
}

export interface ConfigEditor {
    invoke() : Thenable<boolean>;
}

export interface ConfigHelper {

    getConfig() : Config;

    getStorage() : ConfigStorage;

    getEditor() : ConfigEditor;

}

/**
 * ConfigPool
 * 
 * 
 * 
 * 
 * 
 */

export class ConfigPool implements Disposable, Config {

    private readonly _log_disposed = _localize('common.disposed_msg', '{0} disposed', 'ConfigPool');

    private _dispose: Disposable[] = [];
    dispose() {
        for(let disp of this._dispose) {
            disp.dispose();
        }
        this._dispose = [];
        console.log(this._log_disposed);
    }

    protected _storage: ConfigStorage;

    constructor(storage: ConfigStorage) {
        this._storage = storage;
        this._dispose.push( this._storage.onDidChangeOutside(() => {
            this.load();
        }));
    }

    protected _pool : ConfigObject = {};

    /**
     * Add ConfigSection to pool. ConfigPool will keep it up to date.
     */
    add(cfg: ConfigSection) : boolean {
        this._pool[cfg.name()] = cfg;
        this.load();
        return true;
    }
    
    /**
     * Get kept ConfigSection.
     */
    get(section: string) : Thenable<ConfigSection|undefined> {
        return new Promise<ConfigSection>(async (resolve,reject) => {
            if (this._loadPromise) {
                await this._loadPromise;
            }
            resolve(this._pool[section]);
        });
    }

    protected _loadPromise : Thenable<ConfigStorageActionResult> | undefined = undefined;
    load() : Thenable<ConfigStorageActionResult> {
        if (!this._loadPromise) {
            this._loadPromise = new Promise<ConfigStorageActionResult>(async (resolve,reject) => {
                //do load
                this._storage.fillStart().then(async (started) => {
                    if (started === ConfigStorageActionResult.ok) {
                        let ret_code = ConfigStorageActionResult.ok;
                        for(let section_name in this._pool) {
                            let cfg = this._pool[section_name];
                            if (cfg.name() === section_name) {
                                let data = cfg.templateToFillFrom();
                                try {
                                    let r = await this._storage.fillData(section_name, data);
                                    if (r === ConfigStorageActionResult.ok) {
                                        cfg.fillFrom(data);
                                    } else {
                                        ret_code |= r;
                                    }
                                } catch (err) {
                                    console.log( _localize('config_v2.filldata.failed', 'filling data("{0}") failed', section_name ));
                                    console.log(err);
                                    ret_code |= ConfigStorageActionResult.some_data_failed;
                                }
                            }
                        }
                        this._storage.fillEnd().then((ended) => {
                            resolve(ended | ret_code);
                        });
                    } else {
                        resolve(started); //didn't start
                    }
                    this._loadPromise = undefined;
                });
            });
        }
        return this._loadPromise;
    }

    protected _savePromise : Thenable<ConfigStorageActionResult> | undefined = undefined;
    save() : Thenable<ConfigStorageActionResult> {
        if (!this._savePromise) {
            this._savePromise = new Promise<ConfigStorageActionResult>(async (resolve,reject) => {
                //do save
                this._storage.storeStart().then( async (started) => {
                    if (started === ConfigStorageActionResult.ok) {
                        let ret_code = ConfigStorageActionResult.ok;
                        for(let section_name in this._pool) {
                            let cfg = this._pool[section_name];
                            if (cfg.name() === section_name) {
                                let data = cfg.store();
                                try {
                                    ret_code |= await this._storage.storeData(section_name, data);
                                } catch(err) {
                                    console.log( _localize('config_v2.storedata.failed', 'storing data("{0}") failed', section_name ));
                                    console.log(err);
                                    ret_code |= ConfigStorageActionResult.some_data_failed;
                                }
                            }
                        }
                        this._storage.storeEnd().then((ended) => {
                            resolve(ended | ret_code);
                            this._savePromise = undefined;
                        });
                    } else {
                        resolve(started); //didn't start
                        this._savePromise = undefined;
                    }
                });
            });
        }
        return this._savePromise;
    }
}

/**
 *  ConfigSection implementations 
 * 
 * 
 * 
 */

export class UserPasswordSection implements ConfigSection {
    
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

    protected _ensurePasswordPromise : Thenable<boolean> | undefined = undefined;
    ensurePassword() : Thenable<boolean> {
        if (typeof this.password === 'string') {
            return Promise.resolve(true);
        }
        if (!this._ensurePasswordPromise) {
            this._ensurePasswordPromise = new Promise<boolean>((resolve, reject) => {
                //do some...
                this._ensurePasswordPromise = undefined;
                resolve(false);
            })
        }
        return this._ensurePasswordPromise;
    }
}

export class FilterSection implements ConfigSection {
    include: string = '';
    exclude: string = '';

    static readonly _section = 'filter';

    name(): string {
        return FilterSection._section;
    }

    store(): ConfigData {
        return { include: this.include, 
                 exclude: this.exclude
            };
    }

    templateToFillFrom(): ConfigData {
        return { include: '', 
                 exclude: ''
            };
    }

    fillFrom(data: ConfigData): boolean {
        if (typeof data.include === 'string') {
            this.include = data.include;
        }
        if (typeof data.exclude === 'string') {
            this.exclude = data.exclude;
        }
        return true;
    }

}

/**
 * ConfigStorage implementations
 * 
 * 
 */

 export class DummyStorage implements ConfigStorage {

    fillStart(): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.prepare_failed);
    }     
    
    fillData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.some_data_failed);
    }

    fillEnd(): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.end_failed);
    }

    storeStart(): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.prepare_failed);
    }

    storeData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.some_data_failed);
    }

    storeEnd(): Thenable<ConfigStorageActionResult> {
        return Promise.resolve(ConfigStorageActionResult.end_failed);
    }

    protected _emitter: EventEmitter<null> = new EventEmitter<null>();
    onDidChangeOutside: Event<null> = this._emitter.event;
    
    dispose() {
        this._emitter.dispose();
    }


 }

 /**
  * 
  * 
  * 
  */
 export class FS_ConfigStorage implements ConfigStorage {

    private readonly _log_disposed = _localize('common.disposed_msg', '{0} disposed', 'FS_ConfigStorage');

    private _dispose: Disposable[] = [];
    dispose() {
        for(let disp of this._dispose) {
            disp.dispose();
        }
        this._dispose = [];
        this._emitter.dispose();
        console.log(this._log_disposed);
    }
     
    protected _skipNextFire = false;
    protected _filename: string;
    constructor(filename: string) {
        this._filename = filename;
        let watcher = workspace.createFileSystemWatcher(this._filename);
        this._dispose.push( watcher.onDidChange(() => {
            if (!this._storePromise) {
                if (this._skipNextFire) {
                    this._skipNextFire = false;
                } else {
                    this._emitter.fire();
                }
            }
        }));
        this._dispose.push(watcher);
    }

    protected _json_data: any = {};
    protected _fillStartPromise: Thenable<ConfigStorageActionResult> | undefined;
    fillStart(): Thenable<ConfigStorageActionResult> {
        if (!this._fillStartPromise) {
            this._fillStartPromise = new Promise<ConfigStorageActionResult>(async (resolve, reject) => {
                fs.readFile(this._filename, (err, data) => {
                    if (err) {
                        resolve(ConfigStorageActionResult.prepare_failed);
                    } else {
                        let content = data.toString('utf8');
                        try {
                            this._json_data = JSON.parse(content);
                            resolve(ConfigStorageActionResult.ok);
                        } catch (error) {
                            resolve(ConfigStorageActionResult.prepare_failed);
                        }
                    }
                    this._fillStartPromise = undefined;
                });
            })
        } 
        return this._fillStartPromise;
    }     

    fillData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        if (this._json_data && this._json_data[section]) {
            let json_section = this._json_data[section];
            for(let key in data) {
                if (json_section[key] !== undefined) {
                    data[key] = json_section[key];
                }
            }
            return Promise.resolve(ConfigStorageActionResult.ok);
        } else {
            return Promise.resolve(ConfigStorageActionResult.some_data_failed);
        }
    }

    fillEnd(): Thenable<ConfigStorageActionResult> {
        this._json_data = {};
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeStart(): Thenable<ConfigStorageActionResult> {
        this._json_data = {};
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        //TODO: test if section was added before?
        this._json_data[section] = data;
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    protected _storePromise: Thenable<ConfigStorageActionResult> | undefined;
    storeEnd(): Thenable<ConfigStorageActionResult> {
        if (!this._storePromise) {
            this._storePromise = new Promise<ConfigStorageActionResult>((resolve, reject) => {
                fs.writeFile(this._filename, JSON.stringify(this._json_data, null, 4), (err) => {
                    this._json_data = {};
                    if (err) {
                        resolve(ConfigStorageActionResult.end_failed);
                    } else {
                        resolve(ConfigStorageActionResult.ok);
                    }
                    this._storePromise = undefined;
                    this._skipNextFire = true;
                });
            })
        }
        return this._storePromise;
    }

    private _emitter = new EventEmitter<null>();
    onDidChangeOutside: Event<null> = this._emitter.event;

 }

/**
 * 
 * ConfigHelper omplementation
 * 
 * 
 */

export class FS_Proxy_Config implements ConfigHelper {

    protected static _config : Config;
    protected static _storage : ConfigStorage;
    protected static _editor : ConfigEditor;
    
    getConfig(): Config {
        if (!FS_Proxy_Config._config) {
            let storage = this.getStorage();
            FS_Proxy_Config._config = new ConfigPool(storage);
        }
        return FS_Proxy_Config._config;
    }    
    
    getStorage(): ConfigStorage {
        if (!FS_Proxy_Config._storage) {
            if (workspace.rootPath) {
                let filename = path.join(workspace.rootPath, '.vscode/openvms-settings.json');
                FS_Proxy_Config._storage = new FS_ConfigStorage(filename);
            } else {
                FS_Proxy_Config._storage = new DummyStorage();
            }
        }
        return FS_Proxy_Config._storage;
    }

    getEditor(): ConfigEditor {
        return FS_Proxy_Config._editor;
    }

}

export async function Test()  {
    
    let helper : ConfigHelper = new FS_Proxy_Config();

    let cfg = helper.getConfig();

    let userpass = new UserPasswordSection();
    cfg.add(userpass);

    let filter = new FilterSection();
    cfg.add(filter);

    setTimeout(async () => {
        let userpass_get = await cfg.get(UserPasswordSection._section);
        console.log(userpass_get === userpass);
        let filetr_get = await cfg.get(FilterSection._section);
        console.log(filetr_get === filter);
        let save_result = await cfg.save();
        console.log(save_result);
        userpass_get = await cfg.get(UserPasswordSection._section);
        console.log(userpass_get === userpass);
        filetr_get = await cfg.get(FilterSection._section);
        console.log(filetr_get === filter);
    }, 1000);
    
    return true;
}

