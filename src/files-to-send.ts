import {workspace} from 'vscode';

import { Configuration } from './configuration/config';

export class Filter {

    include: string = '';
    exclude: string = '';
}

let _filter = new Filter();

/** Get list of files to send using current workspace settings
 * 
 * @return A thenable that resolves to an array of resource identifiers.
 */
export async function FilesToSend(config: Configuration) {

    if (!await config.get('filter')) {
        config.add('filter', _filter);
        await config.load();
    }
    let files = workspace.findFiles(_filter.include);
    return files;
}