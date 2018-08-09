import * as vscode from 'vscode';

import {WorkspaceSettings} from './workspace-settings';

let _password = '';
//let _watcher = 
vscode.workspace.onDidChangeConfiguration( e => {
    //drop _password 
    if (e.affectsConfiguration(WorkspaceSettings.GetConfigurationSection() + '.host') ||
        e.affectsConfiguration(WorkspaceSettings.GetConfigurationSection() + '.port') ||
        e.affectsConfiguration(WorkspaceSettings.GetConfigurationSection() + '.username') ) {
        _password = '';
    }
});

export class SSHSettings {

    private constructor( public host: string = '', 
                         public port: number = 0,
                         public username: string = '',
                         public password: string = '' ) {

    }

    public IsComplete() : boolean {
        return !!this.host && !!this.port;
    }

    public static FromWorkspace() {
        let sshSettings = new SSHSettings(
            WorkspaceSettings.GetValue<string>('host') || '',
            WorkspaceSettings.GetValue<number>('port') || 0,
            WorkspaceSettings.GetValue<string>('username') || '',
            WorkspaceSettings.GetValue<string>('password') || '');
        if (!sshSettings.password) {
            sshSettings.password = _password;
        }
        return sshSettings;
    }

    public static GetEmpty() {
        return new SSHSettings();
    }

    public TestPassword() {
        if (!_password) {
            let prompt = `Password for ${this.username?this.username+'@':''}${this.host}:${this.port}`;
            vscode.window.showInputBox( { password: true, prompt})
            .then((value) => {
                _password = value || '';
            },
            (error) => {
                _password = '';
            });
            return false;
        }
        return true;
    }
    
}

