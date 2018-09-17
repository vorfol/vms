import { Uri } from "vscode";
import { Config } from "../config_v2/config_v2";
import { FilterSection } from "../config_v2/sections/filter";


export interface SyncHelper {
    getSynchronizer() : Synchronizer;
    getSyncWatcher() : SyncWatcher;
}

export interface SyncWatcher {
    watch() : boolean;
}


export interface Synchronizer {
    synchronize() : Thenable<boolean>;
}

export interface Handle {

}

export enum Mode {
    read,
    write
}

export interface Stat {
    size_in_bytes?: number;
    mod_time?: Date;
    crc32?: number;
}

export interface FileSystem {

    open(path: Uri, mode: Mode) : Thenable<Handle>;
    close(h: Handle) : Thenable<boolean>;
    read(h:Handle, n?: number) : Thenable<Buffer>;
    write(h: Handle, buff: Buffer) : Thenable<number>;
    stat(path: Uri, need: Stat): Thenable<Stat>;
    files(include: string, exclude: string): IterableIterator<Uri>;
}

/**
 * 
 */

export class Sync_v1 implements Synchronizer {
    
    protected _filter: FilterSection = new FilterSection();
    
    constructor(protected _cfg: Config, 
                protected _primary: FileSystem, 
                protected _secondary: FileSystem) {
        
        _cfg.add(this._filter);
    }
    
    protected _syncPromise: Promise<boolean> | undefined = undefined;
    synchronize(): Thenable<boolean> {
        if (!this._syncPromise) {
            this._syncPromise = new Promise<boolean>(async (resolve, reject) => {
                let ret_code = false;
                let file_iter = this._primary.files(this._filter.include, this._filter.exclude);
                for(let uri of file_iter) {
                    try {
                        ret_code = (await this.syncFile(uri)) && ret_code;
                    } catch(err) {
                        ret_code = false;
                    }
                }
                resolve(ret_code);
                this._syncPromise = undefined;
            });
        }
        return this._syncPromise;
    }

    protected syncFile(path: Uri) : Thenable<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let result = true;
            if (await this.testFile(path)) {
                result = await this.sendFile(path);
            }
            resolve(result);
        });
    }

    /**
     * test crc32. thing to override
     */
    protected testFile(path: Uri) : Thenable<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let stat : Stat = {crc32: 0};
            try {
                let primaryStat = await this._primary.stat(path, stat);
                let secondaryStat = await this._secondary.stat(path, stat);
                let doSend = (primaryStat.crc32 != secondaryStat.crc32);
                resolve(doSend);
            } catch(err) {
                resolve(true);  //do send if getting stats is failed
            }
        });
    }

    protected sendFile(path: Uri) : Thenable<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                let h_prim = await this._primary.open(path, Mode.read);
                let buff = await this._primary.read(h_prim);
                this._primary.close(h_prim);
                let h_sec = await this._secondary.open(path, Mode.write);
                let written = await this._secondary.write(h_sec, buff);
                this._secondary.close(h_sec);
                let result = (written === buff.length);
                resolve(result);
            } catch(err) {
                resolve(false);
            }
        });
    }

}