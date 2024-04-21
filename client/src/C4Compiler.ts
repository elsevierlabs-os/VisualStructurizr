import * as vscode from 'vscode';
import { C4ComponentView, C4ContainerView, C4Interpreter, C4SystemContextView, C4SystemLandscapeView, C4View, C4Workspace, StructurizrLexer, StructurizrParser } from "structurizr-parser";
import { MxBuilder } from 'mxbuilder';
import { posix } from 'path';

export class C4Compiler {

    private dslUri: vscode.Uri;
    private dslFilename: string;
    private dslDirname: string;

    constructor() {
    }

    async process(dslUri: vscode.Uri) : Promise<boolean> {
        console.log(`C4Compiler: I am here to compile the source at ${dslUri}`);
        this.dslUri = dslUri;
        this.dslFilename = posix.basename(dslUri.path,'.dsl');
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

        } catch (e:any) {
            if (e.message){
                vscode.window.showErrorMessage('Error converting to C4', {detail: e.message, modal: true});
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

    async createSystemContextView(view: C4SystemContextView, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = await mx.toDiagram();
        const writeData = Buffer.from(dwg, 'utf8');
        const rootSystem = view.SystemId;
        const targetFile = posix.join(this.dslDirname, this.dslFilename, "-", rootSystem, "-Context.drawio");
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