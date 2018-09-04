
/** File stats for synchronization
 * 
 */
export interface SyncStats {

    IsEqual(stats: SyncStats) : boolean;
}

/** File in project
 * 
 */
export interface ProjectFile {

    /** Relative path from project root
     * 
    */
    Path() : string;
}

export interface Handle {

}

/** Remote system
 * 
 */
export interface RemoteSystem {
    /** Retrieve file information for synchronization
     *  @file file in project/workspace
     *  @returns SyncStats
     */
    FileStats(file : ProjectFile) : Thenable<SyncStats>;

    /** Put file to remote system
     *  @file file in project/workspace
     *  @returns true if file sent, otherwise false
     */
    PutFile(file : ProjectFile) : Thenable<boolean>;

    OpenFile(file : ProjectFile) : Thenable<Handle>;

    CloseFile(handle : Handle) : Thenable<boolean>;

    
}

/** Implementation
 * 
 */
export class SizeChSum implements SyncStats {
    
    constructor(protected size : number, protected checksum : number) {

    }

    IsEqual(stats: SyncStats): boolean {
        if (stats instanceof SizeChSum) {
            let is_eq = (stats.size === this.size) && (stats.checksum === this.checksum);
            return is_eq;
        }
        //throw new Error("Not a SizeChSum.");
        return false;
    }

}

