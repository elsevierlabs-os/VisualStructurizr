import { CancellationToken, DataTransfer, DocumentDropEdit, DocumentDropEditProvider, Position, ProviderResult, SnippetString, TextDocument } from "vscode";
import { AbacusNode } from "../tree-data-providers/AbacusNode";

// See https://github.com/ElecTreeFrying/drag-import-relative-path/blob/main/src/subscriptions/auto-import-on-drop-provider.ts
export class StructurizrDropProvider implements DocumentDropEditProvider {
    
    public async provideDocumentDropEdits(document: TextDocument, position: Position, dataTransfer: DataTransfer, token: CancellationToken): Promise<DocumentDropEdit> {
        console.log('DROP ON STRUCTURIZR TARGET INITATED');
        const dataTransferItem = dataTransfer.get('application/vnd.code.tree.architectureComponents');
        if (!dataTransferItem) {
            return undefined;
        }
        if (token.isCancellationRequested) {
            return undefined;
        }
        const dropFilePath = document.uri.fsPath;
        const dragEntity = JSON.parse(dataTransferItem.value);
        console.log('File: ' + dragEntity);
        const snippet = new SnippetString();
        snippet.appendText(dragEntity[0].eeid);
        snippet.appendText(' = ');
        snippet.appendText(dragEntity[0].c4level);
        snippet.appendText(' ');
        snippet.appendText(dragEntity[0].label);
        snippet.appendText(' ');
        const cleanedDescription = this.removeLineBreaks(dragEntity[0].tooltip as string);
        snippet.appendText(cleanedDescription);
        return new DocumentDropEdit(snippet);
    }


    private removeLineBreaks(p0: string) {
        return p0.replace(/(\r\n|\n|\r)/gm, " ");
    }
}