'use strict';
import * as vscode from 'vscode';
import * as ssh2 from 'ssh2';
import { inspect } from 'util';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('VMS.buildProject', () => {
        RunBuildCommand();
    });

    context.subscriptions.push(disposable);
}

//Get or create new output channel named 'VMS Build'
let _channel: vscode.OutputChannel;
const outputChannelName = 'VMS Build';
function getOutputChannel(): vscode.OutputChannel {
	if (!_channel) {
		_channel = vscode.window.createOutputChannel(outputChannelName);
	}
	return _channel;
}

//process command
async function RunBuildCommand() {
    try {
        //Get files to send to VMS (project configuration:"filter")
        //TODO: use project configuration:["includeFiles"]
        let files : vscode.Uri[] = await vscode.workspace.findFiles('**/*.c');

        //TODO: use project configuration:["host", "port", "hostKeys"])
        let sftpClient = await CreateSSHConnection();
        let sftp = await CreateSFTP(sftpClient);

        //Send files
        for(let file of files) {
            await SendFile(sftp, file);
        }

        //Close SFTP connection
        sftpClient.end();

        //Run build command
        let sshClient = await CreateSSHConnection();
        let sshResult = await ExecCommand(sshClient, `build all`);

        //Show output to user
        getOutputChannel().appendLine(`Result: ${sshResult.stdout}`);
        if (sshResult.stderr) {
            getOutputChannel().appendLine(`Errors: ${sshResult.stderr}`);
        }

        //Close connection
        sshClient.end();
    }
    catch(error) {
        getOutputChannel().appendLine(inspect(error));
    }
    return true;
}

//
function CreateSSHConnection()  {
    return new Promise((resolve : (client : ssh2.Client) => void, reject: (error: Error) => void) => {
        let client = new ssh2.Client();
        client.on('ready', () => resolve(client))
            .on('error', (error) => reject(error))
            .connect({    
                //TODO: get all from project config
                host: 'localhost',
                port: 22,
                username: 'foo',
                password: 'bar'
            });
    });
}

//
function CreateSFTP(client : ssh2.Client) : Promise<ssh2.SFTPWrapper> {
    return new Promise((resolve : (sftp : ssh2.SFTPWrapper) => void, reject : (error:Error) => void) => {
        client.sftp(function(err, sftp) {
            if (err) {
                reject(err);
            }
            resolve(sftp);
        });
    });
}

//
type ExecCmdResult = { stdout: string, stderr: string};

function ExecCommand(client : ssh2.Client, command: string) : Promise<ExecCmdResult> {
    return new Promise((resolve : (result : ExecCmdResult) => void, reject : (error:Error) => void) => {
        client.exec(command, (error : Error, stream : ssh2.ClientChannel) => {
            if (error) {
                reject(error);
            }
            let result : ExecCmdResult = {stdout: '', stderr: ''};
            stream.on('close', (code : any, signal : any) => {
                console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                resolve(result);
              }).on('data', function(data : string) {
                result.stdout += data;
              }).stderr.on('data', function(data) {
                result.stderr += data;
              });
        });
    });
}

//
function SendFile(sftp : ssh2.SFTPWrapper, file : vscode.Uri ) : Promise<boolean> {
    getOutputChannel().appendLine(`Sending file: ${file.fsPath}`);
    return new Promise((resolve : (ok:boolean) => void, reject : (error:Error) => void) => {
        sftp.fastPut(file.fsPath, file.path, (error: Error) => {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
}