import {workspace} from 'vscode';

//import {WorkspaceSettings} from './workspace-settings';
import { ConfigProvider } from './open-vms-config';

//let _messageFilterNotFoud = `Please, update "filter" in workspace settings.`;

/** Get list of files to send using current workspace settings
 * 
 * @return A thenable that resolves to an array of resource identifiers.
 */
export async function FilesToSend(cfg_provider: ConfigProvider) {

    let filter = cfg_provider.filter_configuration.include;
    let files = workspace.findFiles(filter);
    return files;
}