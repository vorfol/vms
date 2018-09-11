import { Editor, Serializer, SerializeHelper } from "./config";
import { commands } from "vscode";
import { Uri } from 'vscode';
import { workspace } from "vscode";
import { Disposable } from "vscode";
import { Event } from "vscode";
import { WaitFireEventEmitter } from "../wait-fire-event-emitter";
//import { EventEmitter } from "vscode";

export class WS_SerializeHelper implements SerializeHelper {

    _serializer: Serializer;

    _editor: Editor;

    constructor(section: string) {
        this._serializer = new WS_Serializer(section);
        this._editor = new WS_Editor();
    }

    getSerializer(): Serializer {
        return this._serializer;
    }    
    
    getEditor(): Editor {
        return this._editor;
    }

    dispose(): void {
        this._serializer.dispose();
        //this._editor.dispose(); TODO?
        console.log(`WS_SerializeHelper disposed`);
    } 

}

export class WS_Editor implements Editor {
    
    dispose(): void {
        console.log(`WS_Editor disposed`);
    }

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

    private _emitter = new WaitFireEventEmitter<null>(1000);
    //private _emitter = new EventEmitter<null>(); //fire immediate

    onDidChangeOutside: Event<null> = this._emitter.event;

    private _dispose: Disposable[] = [];

    dispose(): void {
        if (this._dispose) {
            for(let disp of this._dispose) {
                disp.dispose();
            }
        }
        this._dispose = [];
        console.log(`WS_Serializer disposed`);
    }
    
    private readonly _command = 'workbench.action.openWorkspaceSettings';

    constructor(private _section: string) {
        this._dispose.push( this._emitter );
        this._dispose.push( workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(_section)) {
                this._emitter.fire(null);
            }
        }));
    }

    load(obj: any): Thenable<any> {
        return new Promise<any>(async (resolve, reject) => {
            let configuration = workspace.getConfiguration(this._section);
            let ret: any = {};
            for(let section in obj) {
                let sect_obj = obj[section];
                let sect_ret: any = {};
                for(let val_key in sect_obj ) {
                    let sect_val = configuration.get(`${section}.${val_key}`);
                    if (sect_val !== undefined) {
                        sect_ret[val_key] = sect_val;
                    }
                }
                ret[section] = sect_ret;
            }
            resolve(ret);
        });
    }    

    save(obj: any): Thenable<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let configuration = workspace.getConfiguration(this._section);
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