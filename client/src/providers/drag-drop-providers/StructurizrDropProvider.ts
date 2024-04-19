import { CancellationToken, DataTransfer, DocumentDropEdit, DocumentDropEditProvider, Position, ProviderResult, TextDocument } from "vscode";

// See https://github.com/ElecTreeFrying/drag-import-relative-path/blob/main/src/subscriptions/auto-import-on-drop-provider.ts
export class StructurizrDropProvider implements DocumentDropEditProvider {
    provideDocumentDropEdits(document: TextDocument, position: Position, dataTransfer: DataTransfer, token: CancellationToken): ProviderResult<DocumentDropEdit> {
        console.log('DROP ON STRUCTURIZR TARGET INITATED');
        throw new Error("Method not implemented.");
    }

}