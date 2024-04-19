import * as vscode from 'vscode';
import { AbacusNode } from '../tree-data-providers/AbacusComponentProvider';

export class ArchitectureComponentDragProvider implements vscode.TreeDragAndDropController<AbacusNode> {
    
    dropMimeTypes = ['application/vnd.code.tree.architectureComponents', 'text/uri-list'];
	dragMimeTypes = ['application/vnd.code.tree.architectureComponents'];


    public async handleDrag(source: readonly AbacusNode[], dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        console.log('DRAG INITIATED FROM ARCHITECTURE TREE VIEW');
        dataTransfer.set('application/vnd.code.tree.architectureComponents', new vscode.DataTransferItem(source));
    }
    public async handleDrop(target: AbacusNode, dataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        console.log('DROP INITIATED ON ARCHITECTURE TREE VIEW');
        throw new Error('Method not implemented.');
    }

}