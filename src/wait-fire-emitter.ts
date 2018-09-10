import { EventEmitter } from "vscode";
import { Event } from "vscode";

export class WaitFireEmitter<T> {

    private _emitter = new EventEmitter<T>();

    event: Event<T> = this._emitter.event;
    
    constructor(private _wait_msec: number) {
        
    }

    fire(data?: T) {
        this._fireSoon(data);
    }

    dispose(): void {
        if (this._fireSoonHandle) {
            clearTimeout(this._fireSoonHandle);
            this._fireSoonHandle = undefined;
        }
        this._emitter.dispose();
    } 

    private _fireSoonHandle: NodeJS.Timer | undefined;

    private _fireSoon(e: T | undefined): void {
        if (this._fireSoonHandle) {
            clearTimeout(this._fireSoonHandle);
        }
        this._fireSoonHandle = setTimeout(() => {
            this._emitter.fire(e);
        }, this._wait_msec);
    }
}
