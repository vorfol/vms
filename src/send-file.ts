
import {workspace, Uri} from 'vscode';
import {SFTPWrapper} from 'ssh2';

import {ToOutputChannel} from './output-channel';
//
export function SendFile(sftp : SFTPWrapper, file : Uri ) : Promise<boolean> {
    let relativeFile = workspace.asRelativePath(file);
    ToOutputChannel(`Sending file: ${relativeFile}`);
    return new Promise((resolve : (ok:boolean) => void, reject : (error:Error) => void) => {
        //TODO: do read from VFS and open-write-close sftp
        sftp.fastPut(file.fsPath, relativeFile, (error: Error) => {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

