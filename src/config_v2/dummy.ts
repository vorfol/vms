import { ConfigEditor, ConfigStorageActionResult, ConfigData, ConfigStorage } from "./config_v2";

/**
 * Dummy implementations
 * 
 * 
 */

export class DummyStorage implements ConfigStorage {
    
    isStoring(): boolean {
        return false;
    }

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
 }

 
export class DummyEditor implements ConfigEditor {
    invoke() : Thenable<boolean> {
        return Promise.resolve(false);
    }
}
