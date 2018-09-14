
import { ConfigStorageActionResult, ConfigStorage, ConfigData, valueData } from "./config_v2";
import { workspace } from "vscode";
import { WorkspaceConfiguration } from "vscode";

export let _log_this_file = console.log;
//_log_this_file = function() {};

/**
  * 
  * 
  * 
  */
export class VSC_ConfigStorage implements ConfigStorage {

    constructor(protected _section: string) {

    }

    fillStart(): Thenable<ConfigStorageActionResult> {
        _log_this_file('fillStart =');
        return Promise.resolve(ConfigStorageActionResult.ok);
    }     

    protected setCfgValue<T extends valueData>(value: T, cfg_key: string, configuration: WorkspaceConfiguration) : T {
        let tmp = configuration.get<T>(cfg_key);
        if (tmp) {
            value = tmp;
        }
        return value;
    }

    fillData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        let configuration = workspace.getConfiguration(this._section);
        for(let key in data) {
            data[key] = this.setCfgValue(data[key], `${section}.${key}`, configuration);
        }
        _log_this_file('fillData => ok ' + section);
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    fillEnd(): Thenable<ConfigStorageActionResult> {
        _log_this_file('fillEnd');
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeStart(): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeStart');
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    storeData(section: string, data: ConfigData): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeData ' + section);
        
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    protected _storePromise: Thenable<ConfigStorageActionResult> | undefined;
    storeEnd(): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeEnd =');
        return Promise.resolve(ConfigStorageActionResult.ok);
    }

    isStoring(): boolean {
        return false;
    }

}
