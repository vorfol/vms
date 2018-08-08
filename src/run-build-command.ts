import {Uri} from 'vscode';
import {workspace} from 'vscode';
import {inspect} from 'util';

import {ToOutputChannel} from './output-channel';
import {CreateSSHClient} from './create-ssh-client';
import {CreateSFTP} from './create-sftp';
import {SendFile} from './send-file';
import {ExecCommand} from './exec-command';
import {GetValue} from './workspace-settings';

//process BUILD command
export async function RunBuildCommand() {
    try {
        //Get files to send to VMS
        let filter = await GetValue<string>('filter');
        if (!filter) {
            console.log("Error while getting filter");
            return;
        }

        let files : Uri[] = await workspace.findFiles(filter);

        let sshClient = await CreateSSHClient();
        let sftp = await CreateSFTP(sshClient);

        //Send files
        for(let file of files) {
            await SendFile(sftp, file);
        }

        //Close SFTP connection
        sftp.end();

        //Run build command
        let sshResult = await ExecCommand(sshClient, `build all`);

        //Show output to user
        ToOutputChannel(sshResult.stdout);
        if (sshResult.stderr) {
            ToOutputChannel(sshResult.stderr);
        }

        //Close connection
        sshClient.end();
    }
    catch(error) {
        ToOutputChannel(inspect(error));
    }
}

