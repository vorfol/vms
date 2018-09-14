import { Disposable } from "vscode";

/**
 * Base types and interfaces
 * 
 * 
 * 
 */

type simplyData = string | number | boolean | null;

/**
 * 
 */
export interface ConfigData {
    [key: string] : (simplyData | Array<ConfigData>);
}

/**
 * 
 */
export interface ConfigSection {

    name(): string;

    store(): ConfigData;

    fillFrom(data: ConfigData): boolean;

    templateToFillFrom(): ConfigData;
}

/**
 * 
 */
export interface ConfigObject {
    [key:string] : ConfigSection;
}

/**
 * 
 */
export enum ConfigStorageActionResult {
    ok = 0,
    fail = 1,
    prepare_failed = 2,
    some_data_failed = 4,
    end_failed = 8
}

/**
 * 
 */
export interface ConfigStorage {

    fillStart() : Thenable<ConfigStorageActionResult>;
    fillData(section: string, data: ConfigData) : Thenable<ConfigStorageActionResult>;
    fillEnd() : Thenable<ConfigStorageActionResult>;

    storeStart() : Thenable<ConfigStorageActionResult>;
    storeData(section: string, data: ConfigData) : Thenable<ConfigStorageActionResult>;
    storeEnd() : Thenable<ConfigStorageActionResult>;

    isStoring(): boolean;
}

/**
 * 
 */
export interface Config {
    add(cfg: ConfigSection) : boolean;
    get(section: string) : Thenable<ConfigSection|undefined>;

    load() : Thenable<ConfigStorageActionResult>;
    save() : Thenable<ConfigStorageActionResult>;
}

/**
 * 
 */
export interface ConfigEditor {
    invoke() : Thenable<boolean>;
}

/**
 * 
 */
export interface ConfigHelper extends Disposable {

    getConfig() : Config;

    getStorage() : ConfigStorage;

    getEditor() : ConfigEditor;

}
