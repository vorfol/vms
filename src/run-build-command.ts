
import {ToOutputChannel} from './output-channel';
import {CreateSSHClient} from './create-ssh-client';
import {CreateSFTP} from './create-sftp';
import {SendFile} from './send-file';
import {ExecSSHCommand} from './exec-ssh-command';
import {FilesToSend} from './files-to-send';
import { Configuration } from './configuration/config';

let _commandBuilAll = `show time`;

/** Process BUILD command
 * 
 */
export async function RunBuildCommand(config: Configuration) {
    try {

        //get list before creating client to check 'filter' settings... ugly?
        let files = await FilesToSend(config);

        let sshClient = await CreateSSHClient(config);
        let sftp = await CreateSFTP(sshClient);
        
        
        for(let file of files) {
            await SendFile(sftp, file);
        }
        sftp.end();

        //NOTE: sshClient.exec will close connection
        let sshResult = await ExecSSHCommand(sshClient, _commandBuilAll);

        ToOutputChannel(sshResult.stdout);
        if (sshResult.stderr) {
            ToOutputChannel(sshResult.stderr);
        }

        sshClient.end();
    }
    catch(error) {
        if (error instanceof Error) {
            ToOutputChannel(error.message);
        }
        else {
            console.log(error);
        }
    }
}

