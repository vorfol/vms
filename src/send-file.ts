import * as fs from 'fs';
import * as util from 'util';
import {workspace, Uri} from 'vscode';
import {SFTPWrapper} from 'ssh2';
import {Stats, InputAttributes} from 'ssh2-streams';

import {ToOutputChannel} from './output-channel';

const localStatFn = util.promisify(fs.stat);
const mTimeTreshold = 2;    //two seconds
/**
 * Send file using SFTP client
 * 
 * @param sftp SFTP channel
 * @param file file to send
 */
export function SendFile(sftp : SFTPWrapper, file : Uri ) : Promise<boolean> {
    let relativeFile = workspace.asRelativePath(file);
    //TODO: verbose? silent?
    ToOutputChannel(`Sending file: ${relativeFile}`);
    return new Promise(async (resolve : (ok:boolean) => void, reject : (error:Error) => void) => {
        //TODO: do read from VFS and open-write-close sftp. Now only local FS is supported
        try {
            //get local file attributes
            let localStat = await localStatFn(file.fsPath);
            //get remote file attributes
            let sftpStat = await new Promise<Stats | undefined>((resolveStat, rejectStat) => {
                sftp.stat(relativeFile, (err, stats) => {
                    if (err) {
                        resolveStat(undefined); //ok, if no file - it will be created
                    }
                    else {
                        resolveStat(stats);
                    }
                })
            });
            //do not send if size and modification time are the same
            if (sftpStat &&
                localStat.size === sftpStat.size &&
                Math.abs(localStat.mtimeMs/1000 - sftpStat.mtime) < mTimeTreshold )  //sftpStat.mtime in seconds!
            {
                //TODO: verbose? silent?
                ToOutputChannel(`File: ${relativeFile} has not been altered`);
                resolve(false); //file not sent, but not reject this operation
            }   
            else {
                //send
                sftp.fastPut(file.fsPath, relativeFile, (error: Error) => {
                    if (error) {
                        reject(error);  //error while sending file, reject operation
                    }
                    else {
                        //set size and time
                        let attrs :InputAttributes  = {
                            size: localStat.size,
                            mtime: localStat.mtime, //as Date
                            atime: localStat.atime  //as Date
                        };
                        sftp.setstat(relativeFile, attrs, (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                //TODO: verbose? silent?
                                ToOutputChannel(`File: ${relativeFile} has been sent`);
                                resolve(true);  //file sent successfully        
                            }
                        });
                    }
                });
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

