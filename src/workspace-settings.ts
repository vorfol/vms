import {workspace} from 'vscode';
import {window} from 'vscode';
//import * as vscode from 'vscode';

//Get value from workspace settings 
//if not found, show message and open settings, returns undefined
export async function GetValue<T>(section:string) : Promise<T | undefined> {

    let configuration = workspace.getConfiguration("open-vms");
    let config = configuration.inspect(section);
    if (!config || !config.workspaceValue) 
    {
        let errStr = `You should edit and save "OpenVms settings" for current workspace`;
        window.showErrorMessage(errStr);
        // // let commands = await vscode.commands.getCommands();
        // // commands = commands.filter(command => command.indexOf("workbench.action.showAboutDialog") >= 0);
        // // if (commands) {
        // //     let result = await vscode.commands.executeCommand(commands[0]);
        // //     console.log(result);
        // // }
        //TODO: open workspace setting
        // workspace.findFiles('.code-workspace').then(
        //     (files) => {
        //         if (files && files[0]) {
        //             window.showTextDocument(files[0]).then(
        //                 (editor) => {
        //                     //console.log(editor);
        //                 },
        //                 (error) => {
        //                     console.log(error);
        //                 }
        //             );
        //         }
        //     },
        //     (error) => {
        //         console.log(error);
        //     }
        // );
        return undefined;
    }
    return configuration.get<T>(section);
}