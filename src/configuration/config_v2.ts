
import { Event } from "vscode";
import { Disposable } from "vscode";
import { EventEmitter } from "vscode";

import * as nls from 'vscode-nls';
import * as fs from "fs";
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

/**
 * ConfigPool
 * 
 * 
 * 
 * 
 * 
 */

export class ConfigPool implements Disposable {

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
        return new Promise<ConfigSection>((resolve,reject) => {
            resolve(this._pool[section]);
        });
    }

    protected _loadPromise : Thenable<ConfigStorageActionResult> | undefined = undefined;
    load() : Thenable<ConfigStorageActionResult> {
        if (!this._loadPromise) {
            this._loadPromise = new Promise<ConfigStorageActionResult>(async (resolve,reject) => {
                //do load
                this._storage.fillStart().then(async (started) => {
                    this._loadPromise = undefined;
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
                    this._savePromise = undefined;
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
                        });
                    } else {
                        resolve(started); //didn't start
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

    private readonly _section = 'connection';

    name(): string {
        return this._section;
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

export class FilterdSection implements ConfigSection {
    include: string = '';
    exclude: string = '';

    private readonly _section = 'filter';

    name(): string {
        return this._section;
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

 export class FS_ConfigStorage implements ConfigStorage {

    private readonly _log_disposed = _localize('common.disposed_msg', '{0} disposed', 'ConfigPool');

    private _dispose: Disposable[] = [];
    dispose() {
        for(let disp of this._dispose) {
            disp.dispose();
        }
        this._dispose = [];
        this._emitter.dispose();
        console.log(this._log_disposed);
    }
     
    protected _filename: string;
    constructor(filename: string) {
        this._filename = filename;
        let watcher = workspace.createFileSystemWatcher(this._filename);
        this._dispose.push( watcher.onDidChange(() => {
            this._emitter.fire();
        }));
        this._dispose.push(watcher);
    }

    protected _json_data: any = {};
    protected _fillStartPromise: Thenable<ConfigStorageActionResult> | undefined;
    fillStart(): Thenable<ConfigStorageActionResult> {
        if (!this._fillStartPromise) {
            this._fillStartPromise = new Promise<ConfigStorageActionResult>(async (resolve, reject) => {
                fs.readFile(this._filename, (err, data) => {
                    this._fillStartPromise = undefined;
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
                });
            })
        } 
        return this._fillStartPromise;
    }     

    fillData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        if (this._json_data && this._json_data[section]) {
            let json_section = this._json_data[section];
            for(let key in data) {
                if (json_section[key]) {
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
                this._storePromise = undefined;
                fs.writeFile(this._filename, JSON.stringify(this._json_data, null, 4), (err) => {
                    this._json_data = {};
                    if (err) {
                        resolve(ConfigStorageActionResult.end_failed);
                    } else {
                        resolve(ConfigStorageActionResult.ok);
                    }
                });
            })
        }
        return this._storePromise;
    }

    private _emitter = new EventEmitter<null>();
    onDidChangeOutside: Event<null> = this._emitter.event;

 }







