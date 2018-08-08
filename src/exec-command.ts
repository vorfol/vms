import {Client} from 'ssh2';
import {ClientChannel} from 'ssh2';

//
type ExecCmdResult = { stdout: string, stderr: string};

export function ExecCommand(client : Client, command: string) : Promise<ExecCmdResult> {
    return new Promise((resolve : (result : ExecCmdResult) => void, reject : (error:Error) => void) => {
        client.exec(command, (error : Error, stream : ClientChannel) => {
            if (error) {
                reject(error);
            }
            let result : ExecCmdResult = {stdout: '', stderr: ''};
            stream.on('close', (code : any, signal : any) => {
                resolve(result);
              }).on('data', function(data : string) {
                result.stdout += data;
              }).stderr.on('data', function(data) {
                result.stderr += data;
              });
        });
    });
}
