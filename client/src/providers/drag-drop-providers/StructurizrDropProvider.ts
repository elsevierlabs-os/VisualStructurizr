import { CancellationToken, DataTransfer, DocumentDropEdit, DocumentDropEditProvider, Position, ProviderResult, TextDocument } from "vscode";

// See https://github.com/ElecTreeFrying/drag-import-relative-path/blob/main/src/subscriptions/auto-import-on-drop-provider.ts
export class StructurizrDropProvider implements DocumentDropEditProvider {
    
    public async provideDocumentDropEdits(document: TextDocument, position: Position, dataTransfer: DataTransfer, token: CancellationToken): Promise<DocumentDropEdit> {
        console.log('DROP ON STRUCTURIZR TARGET INITATED');
        const dataTransferItem = dataTransfer.get('application/vnd.code.tree.architectureComponents');
        const dropFilePath = document.uri.fsPath;
        const dragFilePath = dataTransferItem.value;
        console.log('File: ' + dragFilePath);
        // throw new Error("Method not implemented.");
        return new DocumentDropEdit('Hello world');
    }

}