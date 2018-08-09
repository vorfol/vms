import {workspace} from 'vscode';

import {WorkspaceSettings} from './workspace-settings';

let _messageFilterNotFoud = `No "filter" found in settings`;

export async function FilesToSend() {

    let filter = await WorkspaceSettings.GetValue<string>('filter');
    if (!filter) {
        WorkspaceSettings.WarnUser();
        throw new Error(_messageFilterNotFoud);
    }

    let files = workspace.findFiles(filter);

    return files;
}