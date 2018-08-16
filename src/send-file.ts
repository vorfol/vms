import * as fs from 'fs';
import * as util from 'util';
import {workspace, Uri} from 'vscode';
import {SFTPWrapper} from 'ssh2';
import {Stats} from 'ssh2-streams';

import {ToOutputChannel} from './output-channel';

const localStatFn = util.promisify(fs.stat);
const mTimeTreshold = 100;
/**
 * Send file using SFTP client
 * 
 * @param sftp SFTP channel
 * @param file file to send
 */
export function SendFile(sftp : SFTPWrapper, file : Uri ) : Promise<boolean> {
    let relativeFile = workspace.asRelativePath(file);
    ToOutputChannel(`Sending file: ${relativeFile}`);
    return new Promise(async (resolve : (ok:boolean) => void, reject : (error:Error) => void) => {
        //TODO: do read from VFS and open-write-close sftp. Now only local FS is supported
        try {
            let localStat = await localStatFn(file.fsPath);
            let sftpStat = await new Promise<Stats>((resolveStat, rejectStat) => {
                sftp.stat(relativeFile, (err, stats) => {
                    if (err) {
                        rejectStat(err);    //INNER PROMISE: will be cought in catch below
                    }
                    else {
                        resolveStat(stats); //INNER PROMISE: returned to sftpStaf
                    }
                })
            });
            if (localStat.size === sftpStat.size &&
                Math.abs(localStat.mtimeMs - sftpStat.mtime) < mTimeTreshold )  //besause mtimeMs is too big to be integer
            {
                resolve(false); //file not sent, but not reject this operation
            }   
            else {
                sftp.fastPut(file.fsPath, relativeFile, (error: Error) => {
                    if (error) {
                        reject(error);  //error while sending file, reject operation
                    }
                    else {
                        //TODO: call sftp.SETSTAT, align mTime
                        resolve(true);  //file sent successfully
                    }
                });
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

