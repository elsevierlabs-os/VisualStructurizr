import path = require('path');
//import { PlantUMLWriter } from 'structurizr-typescript';
import * as vscode from 'vscode';
import { AbacusClient } from '../../AbacusClient';
import { C4Level } from '../../c4level';
//import { FsConsumer } from '../../FsConsumer';
//import { StructurizrDslFormatter } from '../../formatters/StructurizrDslFormatter';
//import { WorkspaceFactory } from '../../WorkspaceFactory';
//import { C4PlantUMLFormatter } from '../../formatters/C4PlantUMLFormatter';
//import { DrawIOFormatter } from '../../formatters/DrawIOFormatter';

export class AbacusComponentProvider implements vscode.TreeDataProvider<AbacusNode>, vscode.TreeDragAndDropController<AbacusNode> {

    // dropMimeTypes: readonly string[];
    // dragMimeTypes: readonly string[];

    dropMimeTypes = ['application/vnd.code.tree.architectureComponents', 'text/uri-list'];
	dragMimeTypes = ['application/vnd.code.tree.architectureComponents'];

    // Pass in context or something if required, for now we need nothing about the workspace
    constructor(){}

    getTreeItem(element: AbacusNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    async getChildren(element?: AbacusNode): Promise<AbacusNode[]> {

        let items: AbacusNode[] = [];
        let componentTypeName = '';
        let childC4Level:C4Level = null;
        let page = 0;
        let itemCount = 0;

        // Section if there is a parent element
        if (element) {
            switch (element.c4level){
                case C4Level.SOFTWARESYSTEM:
                    childC4Level = C4Level.CONTAINER;
                    break;
                case C4Level.CONTAINER:
                    childC4Level = C4Level.COMPONENT;
                    break;
            }
            do {
                let childDS = await AbacusClient.getChildren(element.eeid, childC4Level, "", 0);
                if (childDS) {
                    itemCount = childDS.value.length;
                    for (var item of childDS.value) {
                        let newItem = new AbacusNode(item.Name, item.EEID.toString(), childC4Level, vscode.TreeItemCollapsibleState.Collapsed);
                        newItem.tooltip = item.Description;
                        items.push(newItem);
                    }
                    page++;
                }
                else {
                    itemCount = 0;
                }
            } while (itemCount === 200);
            return Promise.resolve(items);
        }

        // Section if there is no parent element so this is the root
        do {
            let abacusDS = await AbacusClient.getSystemsDataset(C4Level.SOFTWARESYSTEM, "", page);
            if (abacusDS) {
                itemCount = abacusDS.value.length;
                for (var item of abacusDS.value) {
                    let newItem = new AbacusNode(item.Name, item.EEID.toString(), C4Level.SOFTWARESYSTEM, vscode.TreeItemCollapsibleState.Collapsed);
                    newItem.tooltip = item.Description;
                    items.push(newItem);
                }
                page++;
            }
            else {
                itemCount = 0;
            }
        } while (itemCount === 200);
        return Promise.resolve(items);
    }

/*     async createDSL(node: AbacusNode) {
        console.log(`createDSL called with the following node:`);
        console.log(node);
        let workspacefactory = new WorkspaceFactory();
        let workspace = await workspacefactory.buildWorkspace(node.eeid);
        let formatter = new StructurizrDslFormatter();
        const dslString = await formatter.formatWorkspace(workspace);
        let fsclient = new FsConsumer();
        await fsclient.createFile(node.label + ".dsl", dslString);
    } */

/*     async createPlantUML(node: AbacusNode) {
		console.log(`createPlantUML called with the following node:`);
        console.log(node);
        let workspacefactory = new WorkspaceFactory();
        let workspace = await workspacefactory.buildWorkspace(node.eeid);
        const plantUML = new PlantUMLWriter().toPlantUML(workspace);
        let fsclient = new FsConsumer();
        await fsclient.createFile(node.label + ".puml", plantUML);
	} */

/*     async createC4PlantUML(node: AbacusNode) {
        console.log(`createC4PlantUML called with the following node:`);
        console.log(node);
        let workspacefactory = new WorkspaceFactory();
        let workspace = await workspacefactory.buildWorkspace(node.eeid);
        const c4plantUML = new C4PlantUMLFormatter().formatWorkspace(workspace);
        let fsclient = new FsConsumer();
        if (c4plantUML.context.length > 0)
        {
            await fsclient.createFile(node.label + "-Context.puml", c4plantUML.context);
        }
        if (c4plantUML.container.length > 0)
        {
            await fsclient.createFile(node.label + "-Container.puml", c4plantUML.container);
        }
        if (c4plantUML.component.length > 0)
        {
            await fsclient.createFile(node.label + "-Component.puml", c4plantUML.component);
        }
        if (c4plantUML.deployment.length > 0)
        {
            await fsclient.createFile(node.label + "-Deployment.puml", c4plantUML.deployment);
        }
    } */

/*     async createDrawIO(node: AbacusNode) {
        console.log(`createDrawIO called with the following node:`);
        console.log(node);
        let workspacefactory = new WorkspaceFactory();
        let workspace = await workspacefactory.buildWorkspace(node.eeid);
        let drawIOformatter = new DrawIOFormatter();
        let drawIO = await drawIOformatter.formatWorkspace(workspace);
        let fsclient = new FsConsumer();
        if (drawIO.context.length > 0)
        {
            await fsclient.createFile(node.label + "-Context.drawio", drawIO.context);
        }
        if (drawIO.container.length > 0)
        {
            await fsclient.createFile(node.label + "-Container.drawio", drawIO.container);
        }
        if (drawIO.component.length > 0)
        {
            await fsclient.createFile(node.label + "-Component.drawio", drawIO.component);
        }
        if (drawIO.deployment.length > 0)
        {
            await fsclient.createFile(node.label + "-Deployment.drawio", drawIO.deployment);
        }
    } */

    private _onDidChangeTreeData: vscode.EventEmitter<AbacusNode | undefined | null | void> = new vscode.EventEmitter<AbacusNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<AbacusNode | undefined | null | void> = this._onDidChangeTreeData.event;
  
    refresh(): void {
        console.log('Refresh of architecture tree view requested.');
      this._onDidChangeTreeData.fire();
    }

    public async handleDrag(source: readonly AbacusNode[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        console.log('DRAG INITIATED FROM ARCHITECTURE TREE VIEW');
        dataTransfer.set('application/vnd.code.tree.architectureComponents', new vscode.DataTransferItem(source));
    }
    public async handleDrop(target: AbacusNode, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        console.log('DROP INITIATED ON ARCHITECTURE TREE VIEW');
        throw new Error('Method not implemented.');
    }

}

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