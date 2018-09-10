import { Uri } from "vscode";

/** Serializer 
 * 
*/
export interface Serializer {
    
    load() : Thenable<any>;

    save(obj: any) : Thenable<boolean>;

    getUri() : Uri;
}

/** Editor 
 * 
*/
export interface Editor {
    
    invoke(uri: Uri): Thenable<boolean>;
}

/** Serialize helper
 * 
 */
export interface SerializeHelper {
    
    getSerializer() : Serializer;

    getEditor() : Editor;
}

/** Configuration
 * 
 */
export interface Configuration {
    
    add(section: string, object: any) : boolean;

    get(section: string) : Thenable<any>;

    remove(section: string) : boolean;

    load() : Thenable<boolean>;
    
    save() : Thenable<boolean>;
    
    edit() : Thenable<boolean>;
    
}

