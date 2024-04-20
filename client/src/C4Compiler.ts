import * as vscode from 'vscode';
import { C4Interpreter, C4View, C4Workspace, StructurizrLexer, StructurizrParser } from "structurizr-parser";
import { MxBuilder } from 'mxbuilder';

export class C4Compiler {

    private uri: vscode.Uri;
    constructor() {
    }

    async process(uri: vscode.Uri) : Promise<boolean> {
        console.log(`C4Compiler: I am here to compile the source at ${uri}`);
        this.uri = uri;
        const readData = await vscode.workspace.fs.readFile(uri);
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
                        this.createSystemLandscapeView(view, c4workspace);
                        break;
                    case "SystemContext":
                        this.createSystemContextView(view, c4workspace);
                        break;
                    case "Container":
                        this.createContainerView(view, c4workspace);
                        break;
                    case "Component":
                        this.createComponentView(view, c4workspace);
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

    createSystemLandscapeView(view: C4View, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }

    createSystemContextView(view: C4View, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }

    createContainerView(view: C4View, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }

    createComponentView(view: C4View, c4workspace: C4Workspace) {
        var mx = new MxBuilder();
        const dwg = mx.toDiagram();
        throw new Error('Method not implemented.');
    }
}