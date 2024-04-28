import * as vscode from 'vscode';
import { C4ComponentView, C4ContainerView, C4Element, C4Interpreter, C4Person, C4Relationship, C4SoftwareSystem, C4SystemContextView, C4SystemLandscapeView, C4View, C4Workspace, StructurizrLexer, StructurizrParser } from "structurizr-parser";
import { MxBuilder } from 'mxbuilder';
import { posix } from 'path';
import { mkdirSync } from 'fs';

export class C4Compiler {

    private dslUri: vscode.Uri;
    private dslFilename: string;
    private dslDirname: string;

    constructor() {
    }

    async process(dslUri: vscode.Uri): Promise<boolean> {
        console.log(`C4Compiler: I am here to compile the source at ${dslUri}`);
        this.dslUri = dslUri;
        this.dslFilename = posix.basename(dslUri.path, '.dsl');
        this.dslDirname = posix.dirname(dslUri.path);
        const readData = await vscode.workspace.fs.readFile(dslUri);
        const readStr = Buffer.from(readData).toString('utf8');
        console.log(readStr);
        let lexingResult = StructurizrLexer.tokenize(readStr);
        StructurizrParser.input = lexingResult.tokens;
        const cst = StructurizrParser.workspaceWrapper();
        if (StructurizrParser.errors.length > 0) {
            return false;
        }
        try {
            const c4workspace = C4Interpreter.visit(cst) as C4Workspace;
            if (!c4workspace) {
                return false;
            }

            for (let view of c4workspace.Views) {
                console.log(`We have a view of type: ${view.Type}`);
                switch (view.Type) {
                    case "SystemLandscape":
                        this.createSystemLandscapeView(view as C4SystemLandscapeView, c4workspace);
                        break;
                    case "SystemContext":
                        this.createSystemContextView(view as C4SystemContextView, c4workspace);
                        break;
                    case "Container":
                        this.createContainerView(view as C4ContainerView, c4workspace);
                        break;
                    case "Component":
                        this.createComponentView(view as C4ComponentView, c4workspace);
                        break;
                    default:
                        break;
                }
            }

        } catch (e: any) {
            if (e.message) {
                vscode.window.showErrorMessage('Error converting to C4', { detail: e.message, modal: true });
            } else {
                vscode.window.showErrorMessage('Unknown error converting to C4');
            }
            return false;
        }


        return true;
    }

    async createSystemLandscapeView(view: C4SystemLandscapeView, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }

    // SYSTEM CONTEXT IS All PEOPLE, SOFTWARE SYSTEMS AND RELATIONSHIPS DIRECTLY LINKED TO PROVIDED ROOT SYSTEM
    async createSystemContextView(view: C4SystemContextView, c4workspace: C4Workspace) {
        // We need to build a list of linked entities
        const entityList: C4Element[] = [];
        const relationshipList: ViewRelationship[] = [];
        // We can add the root software system right away - this will always then be the [0] entry in the entity list
        const rootSystemTree = c4workspace.Model.findElement(view.SystemId);
        if (rootSystemTree.length > 0) {
            entityList.push(rootSystemTree[0]);
            // Now we need to look at all relationships that start or end with the root system
            // First those that start with the root system
            entityList[0].Relationships.forEach(r => {
                let targetTree = c4workspace.Model.findElement(r.TargetId);
                if (targetTree.length > 0) {
                    if (targetTree[0] instanceof C4SoftwareSystem || targetTree[0] instanceof C4Person) {
                        relationshipList.push(new ViewRelationship(entityList[0].Id, targetTree[0].Id, r.Description, r.Technology));
                        if (!entityList.includes(targetTree[0])) { entityList.push(targetTree[0]); };
                    }
                }
            });
            // Then we need to find those that end with the root system - could we combine this with the earlier?
            c4workspace.Model.People.forEach(p => p.Relationships.forEach(r => {
                let targetTree = c4workspace.Model.findElement(r.TargetId);
                if (targetTree.length > 0 && targetTree[0] instanceof C4SoftwareSystem && targetTree[0].Id === entityList[0].Id) {
                    relationshipList.push(new ViewRelationship(p.Id, targetTree[0].Id, r.Description, r.Technology));
                    if (!entityList.includes(p)) { entityList.push(p); };
                };
            }));
            c4workspace.Model.SoftwareSystems.forEach(ss => ss.Relationships.forEach(r => {
                let targetTree = c4workspace.Model.findElement(r.TargetId);
                if (targetTree.length > 0 && targetTree[0] instanceof C4SoftwareSystem && targetTree[0].Id === entityList[0].Id) {
                    relationshipList.push(new ViewRelationship(ss.Id, targetTree[0].Id, r.Description, r.Technology));
                    if (!entityList.includes(ss)) { entityList.push(ss); };
                };
            }));
            c4workspace.Model.Groups.forEach(g => {
                g.People.forEach(p => {
                    p.Relationships.forEach(r => {
                        let targetTree = c4workspace.Model.findElement(r.TargetId);
                        if (targetTree.length > 0 && targetTree[0] instanceof C4SoftwareSystem && targetTree[0].Id === entityList[0].Id) {
                            relationshipList.push(new ViewRelationship(p.Id, targetTree[0].Id, r.Description, r.Technology));
                            if (!entityList.includes(p)) { entityList.push(p); };
                        };
                    });
                });
                g.SoftwareSystems.forEach(ss => {
                    ss.Relationships.forEach(r => {
                        let targetTree = c4workspace.Model.findElement(r.TargetId);
                        if (targetTree.length > 0 && targetTree[0] instanceof C4SoftwareSystem && targetTree[0].Id === entityList[0].Id) {
                            relationshipList.push(new ViewRelationship(ss.Id, targetTree[0].Id, r.Description, r.Technology));
                            if (!entityList.includes(ss)) { entityList.push(ss); };
                        };
                    });
                });
            });
        }

        var mx = new MxBuilder();

        // Place Entities 
        c4workspace.Model.SoftwareSystems.forEach(ss => {
            if (entityList.includes(ss)) {
                mx.placeSoftwareSystem(ss.Name, ss.Description, ss.Id);
            }
        });
        c4workspace.Model.People.forEach(p =>{
            if (entityList.includes(p)) {
                mx.placePerson(p.Name, p.Description, p.Id);
            }
        });
        c4workspace.Model.Groups.forEach(g => {
            mx.placeGroupBoundary(g.Name, "", g.Id);
            g.People.forEach(p => {
                if (entityList.includes(p)) {
                    mx.placePerson(p.Name, p.Description, p.Id, g.Id);
                }
            });
            g.SoftwareSystems.forEach(ss => {
                if (entityList.includes(ss)) {
                    mx.placeSoftwareSystem(ss.Name, ss.Description, ss.Id, g.Id);
                }
            });
        });

        // Place Relationships
        relationshipList.forEach(r => {
            mx.placeRelationship(r.description, r.technology, r.sourceId, r.targetId);
        });

        // Add legend?? Should be default of mx maybe?
        // Create Drawing
        const dwg = await mx.toDiagram();
        const writeData = Buffer.from(dwg, 'utf8');
        const targetFile = posix.join(this.dslDirname, this.dslFilename + "-" + entityList[0].Name + "-Context.drawio");
        const targetUri = vscode.Uri.file(targetFile);
        await vscode.workspace.fs.writeFile(targetUri, writeData);
        await vscode.commands.executeCommand("vscode.open", targetUri);
    }

    async createContainerView(view: C4ContainerView, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }

    async createComponentView(view: C4ComponentView, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }
}

class ViewRelationship {

    sourceId: string;
    targetId: string;
    description: string;
    technology: string;

    constructor(src: string, tgt: string, desc?: string, tech?: string) {
        this.sourceId = src;
        this.targetId = tgt;
        this.description = desc;
        this.technology = tech;
    }

}