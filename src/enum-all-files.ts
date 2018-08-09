import {workspace} from 'vscode';
import {RelativePattern} from 'vscode';

import {ToOutputChannel} from './output-channel';

/** Enumerate all files in all workspaces. For test only.
*/
export async function EnumAllFiles() {
    if (workspace.workspaceFolders) {
        workspace.workspaceFolders.forEach((folder) => {
            //BUG: for MemFS does start search from "file://d:", not from "memfs:/"
            workspace.findFiles(new RelativePattern(folder, '*'))
            .then((uris) => {
                uris.forEach((uri) => {
                    ToOutputChannel(uri.toString());
                });
            });
        });
    }
}
