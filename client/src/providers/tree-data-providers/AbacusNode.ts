import * as vscode from 'vscode';
import path = require('path');
import { C4Level } from '../../c4level';

export class AbacusNode extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public eeid: string,
        public c4level: C4Level,
        public readonly collabsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collabsibleState);
        // this.tooltip = `${this.label} - ${this.eeid}`;
        this.description = this.eeid;
        this.contextValue = c4level;
        
        switch(c4level){
            case C4Level.SOFTWARESYSTEM:
                this.iconPath = {
                    light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'light', 'softwaresystem.svg'),
                    dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'dark', 'softwaresystem.svg')
                };
                break;
            case C4Level.CONTAINER:
                this.iconPath = {
                    light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'light', 'container.svg'),
                    dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'dark', 'container.svg')
                };
                break;
            case C4Level.COMPONENT:
                this.iconPath = {
                    light: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'light', 'component.svg'),
                    dark: path.join(__filename, '..', '..', '..', '..', '..', 'resources', 'c4', 'dark', 'component.svg')
                };
                break;
        }
    }
}