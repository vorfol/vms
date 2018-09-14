import { ConfigStorageActionResult } from "./config_v2";
import { Uri } from "vscode";
import { workspace } from "vscode";
import { FS_ConfigStorage } from "./fs-storage";
import { Range } from "vscode";
import { WorkspaceEdit } from "vscode";
import { Position } from "vscode";

export let _log_this_file = console.log;
//_log_this_file = function() {};

/**
 * Such as FS_ConfigStorage, but using VS Code provided read/write functions
 */
export class VFS_ConfigStorage extends FS_ConfigStorage {

    constructor(protected _fileUri: Uri) {
        super(_fileUri.fsPath);
    }   

    fillStart(): Thenable<ConfigStorageActionResult> {
        _log_this_file('fillStart =');
        if (!this._fillStartPromise) {
            this._fillStartPromise = new Promise<ConfigStorageActionResult>(async (resolve, reject) => {
                try {
                    let text_doc = await workspace.openTextDocument(this._fileUri);
                    let content = text_doc.getText();
                    this._json_data = JSON.parse(content);
                    resolve(ConfigStorageActionResult.ok);
                    _log_this_file('fillStart => ok');
                } catch (error) {
                    resolve(ConfigStorageActionResult.prepare_failed);
                    _log_this_file('fillStart => fail');
                }
                this._fillStartPromise = undefined;
                _log_this_file('fillStart => clear');
            });
        } 
        return this._fillStartPromise;
    }     

    storeEnd(): Thenable<ConfigStorageActionResult> {
        _log_this_file('storeEnd =');
        if (!this._storePromise) {
            this._storePromise = new Promise<ConfigStorageActionResult>(async (resolve, reject) => {
                try {
                    let range : Range | undefined = undefined;
                    try {
                        let text_doc = await workspace.openTextDocument(this._fileUri);
                        range = text_doc.validateRange(new Range(0,0,32767,32767));
                    } catch (err) {
                        range = undefined;
                    }
                    let we = new WorkspaceEdit();
                    let str = JSON.stringify(this._json_data, null, 4);
                    if (!range) {
                        we.createFile(this._fileUri);
                        we.insert(this._fileUri, new Position(0, 0), str);
                    } else {
                        we.replace(this._fileUri, range, str);
                    }
                    let status = await workspace.applyEdit(we);
                    if (status) {
                        let text_doc = await workspace.openTextDocument(this._fileUri);
                        let saved = await text_doc.save();
                        resolve(saved?ConfigStorageActionResult.ok:ConfigStorageActionResult.end_failed);
                    } else {
                        resolve(ConfigStorageActionResult.end_failed);
                    }
                } catch(err) {
                    resolve(ConfigStorageActionResult.end_failed);
                }
            })
        }
        return this._storePromise;
    }

}
