import {workspace} from 'vscode';

import {WorkspaceSettings} from './workspace-settings';

let _messageFilterNotFoud = `Please, update "filter" in workspace settings.`;

/** Get list of files to send using current workspace settings
 * 
 * @return A thenable that resolves to an array of resource identifiers.
 */
export async function FilesToSend() {

    let filter = await WorkspaceSettings.GetValue<string>('filter');
    if (!filter) {
        WorkspaceSettings.WarnUser();
        throw new Error(_messageFilterNotFoud);
    }

    let files = workspace.findFiles(filter);

    return files;
}