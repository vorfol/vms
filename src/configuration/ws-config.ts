import { Editor, Serializer, SerializeHelper } from "./config";
import { commands } from "vscode";
import { Uri } from 'vscode';
import { workspace } from "vscode";

export class WS_SerializeHelper implements SerializeHelper {

    _serializer: Serializer = new WS_Serializer('open-vms');

    _editor: Editor = new WS_Editor();

    getSerializer(): Serializer {
        return this._serializer;
    }    
    
    getEditor(): Editor {
        return this._editor;
    }

}

export class WS_Editor implements Editor {

    invoke(uri: Uri): Thenable<boolean> {
        if (uri.scheme === 'vscode-command') {
            return new Promise<boolean>((resolve, reject) => {
                commands.executeCommand(uri.path).then(() => {
                    resolve(true);
                }, (err) => {
                    //TODO: generate log? message?
                    resolve(false);
                });
            });
        } else {
            return Promise.resolve(false);
        }
    }

}

export class WS_Serializer implements Serializer {
    
    private readonly _command = 'workbench.action.openWorkspaceSettings';

    constructor(private _section: string) {

    }

    load(): Thenable<any> {
        throw new Error("Method not implemented.");
    }    

    save(obj: any): Thenable<boolean> {
        let configuration = workspace.getConfiguration(this._section);
        return new Promise<boolean>(async (resolve, reject) => {
            for(let section in obj) {
                let sect_obj = obj[section];
                for(let val_key in sect_obj ) {
                    let sect_val = sect_obj[val_key];
                    await configuration.update(`${section}.${val_key}`, sect_val);
                }
            }
            resolve(true);
        });
    }

    getUri(): Uri {
        return Uri.parse('vscode-command:'+ this._command);
    }


}