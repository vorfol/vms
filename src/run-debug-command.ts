import { inspect } from 'util';

import ToOutputChannel from './output-channel';
import CreateSSHConnection from './create-ssh-client';
import ExecCommand from './exec-command';

//process DEBUG command
export default async function RunDebugCommand() {
    try {

        //TODO: use project configuration:["host", "port", "hostKeys"])
        let sshClient = await CreateSSHConnection();

        //Run debug command
        let sshResult = await ExecCommand(sshClient, `debug`);

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
    return true;
}


