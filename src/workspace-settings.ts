import {workspace} from 'vscode';
import {window} from 'vscode';

//Get value from workspace settings 
//if not found, show message and open settings, returns undefined
export default function GetValue<T>(section:string) : T | undefined {

    let configuration = workspace.getConfiguration("open-vms");
    let config = configuration.inspect(section);
    if (!config || !config.workspaceValue) 
    {
        let errStr = `You should copy and edit "OpenVms settings" for current workspace`;
        window.showErrorMessage(errStr);
        workspace.findFiles('.vscode/settings.json').then(
            (files) => {
                window.showTextDocument(files[0]).then(
                    (editor) => {
                        //console.log(editor);
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            },
            (error) => {
                console.log(error);
            }
        );
        return undefined;
    }
    return configuration.get<T>(section);
}