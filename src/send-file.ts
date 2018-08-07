import {Uri} from 'vscode';
import {workspace} from 'vscode';
import {SFTPWrapper} from 'ssh2';

import ToOutputChannel from './output-channel';
//
export default function SendFile(sftp : SFTPWrapper, file : Uri ) : Promise<boolean> {
    let relativeFile = workspace.asRelativePath(file);
    ToOutputChannel(`Sending file: ${relativeFile}`);
    return new Promise((resolve : (ok:boolean) => void, reject : (error:Error) => void) => {
        //TODO: do read from VFS
        sftp.fastPut(file.fsPath, relativeFile, (error: Error) => {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

