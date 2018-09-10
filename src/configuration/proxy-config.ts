import { Configuration, SerializeHelper } from "./config";

/** Configuration with proxy object
 * 
 */
export class ProxyConfiguration implements Configuration {

    _proxy: any;
    _helper: SerializeHelper;

    constructor(helper: SerializeHelper) {
        this._helper = helper;
        this._proxy = {};
    }

    add(section: string, object: any): boolean {
        if (this._proxy[section]) {
            //TODO: generate error?
            return false;
        }
        this._proxy[section] = object;
        return true;
    }    
    
    get(section: string): Thenable<any> {
        //TODO: test existing?
        return this._proxy[section];
    }

    remove(section: string): boolean {
        if (this._proxy[section]) {
            this._proxy[section] = undefined;
            return true;
        }
        //TODO: log?
        return false;
    }

    load(): Thenable<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            let serializer = this._helper.getSerializer();
            serializer.load().then( (obj) => {
                for(let section in obj) {
                    if (this._proxy[section]) {
                        let sect_obj = obj[section];
                        for(let s_key in sect_obj) {
                            this._proxy[section][s_key] = sect_obj[s_key];
                        }
                    } else {
                        //no section in _proxy, TODO: add? or generate error?
                    }
                }
                resolve(true);
            }, (err) => {
                //TODO: log err
                resolve(false);
            });
        });
    }

    save(): Thenable<boolean> {
        let serializer = this._helper.getSerializer();
        return serializer.save(this._proxy);
    }

    edit(): Thenable<boolean> {
        let editor = this._helper.getEditor();
        let serializer = this._helper.getSerializer();
        return editor.invoke(serializer.getUri());
    }

}
