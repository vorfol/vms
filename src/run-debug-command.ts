import { inspect } from 'util';

import {ToOutputChannel} from './output-channel';
import {CreateSSHClient} from './create-ssh-client';
import {ExecCommand} from './exec-command';

//process DEBUG command
export async function RunDebugCommand() {
    try {
        let sshClient = await CreateSSHClient();

        //Run debug command
        //TODO: use settings
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
}


