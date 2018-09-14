import * as fs from "fs";
import { ConfigStorageActionResult, ConfigStorage, ConfigData } from "./config_v2";

export let _log_this_file = console.log;
//_log_this_file = function() {};

/**
  * 
  * 
  * 
  */
 export class FS_ConfigStorage implements ConfigStorage {

    protected _filename: string;
    constructor(filename: string) {
        this._filename = filename;
    }

    protected _json_data: any = {};
    protected _fillStartPromise: Thenable<ConfigStorageActionResult> | undefined;
    fillStart(): Thenable<ConfigStorageActionResult> {
        _log_this_file('fillStart =');
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
                            _log_this_file('fillStart => ok');
                        } catch (error) {
                            resolve(ConfigStorageActionResult.prepare_failed);
                            _log_this_file('fillStart => fail');
                        }
                    }
                    this._fillStartPromise = undefined;
                    _log_this_file('fillStart => clear');
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
            _log_this_file('fillData => ok ' + section);
            return Promise.resolve(ConfigStorageActionResult.ok);
        } else {
            _log_this_file('fillData => fail ' + section);
            return Promise.resolve(ConfigStorageActionResult.some_data_failed);
        }
    }

    fillEnd(): Thenable<ConfigStorageActionResult> {
        _log_this_file('fillEnd');
        this._json_data = {};
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeStart(): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeStart');
        this._json_data = {};
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        //TODO: test if section was added before?
        _log_this_file('storeData ' + section);
        this._json_data[section] = data;
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    protected _storePromise: Thenable<ConfigStorageActionResult> | undefined;
    storeEnd(): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeEnd =');
        if (!this._storePromise) {
            this._storePromise = new Promise<ConfigStorageActionResult>((resolve, reject) => {
                fs.writeFile(this._filename, JSON.stringify(this._json_data, null, 4), (err) => {
                    this._json_data = {};
                    if (err) {
                        _log_this_file('storeEnd => fail');
                        resolve(ConfigStorageActionResult.end_failed);
                    } else {
                        _log_this_file('storeEnd => ok');
                        resolve(ConfigStorageActionResult.ok);
                    }
                    this._storePromise = undefined;
                });
            })
        }
        return this._storePromise;
    }

    isStoring(): boolean {
        return !!this._storePromise;
    }

}
