
import {ToOutputChannel} from './output-channel';
import {CreateSSHClient} from './create-ssh-client';
import {CreateSFTP} from './create-sftp';
import {SendFile} from './send-file';
import {ExecSSHCommand} from './exec-ssh-command';
import {FilesToSend} from './files-to-send';

let _commandBuilAll = `build all`;

//process BUILD command
export async function RunBuildCommand() {
    try {
        let sshClient = await CreateSSHClient();
        let sftp = await CreateSFTP(sshClient);
        let files = await FilesToSend();
        for(let file of files) {
            await SendFile(sftp, file);
        }
        sftp.end();

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

