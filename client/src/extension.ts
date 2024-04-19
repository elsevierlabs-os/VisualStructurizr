/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';
import { DrawioEditorProvider } from './DrawioEditor';
import { StructurizrLexer, StructurizrParser, StructurizrInterpreter, ContainerInstance } from 'structurizr-parser' ;
import { AbacusComponentProvider } from './providers/tree-data-providers/AbacusComponentProvider';
import AbacusAuthenticationProvider from './providers/authentication-providers/AbacusAuthenticationProvider';
import { StructurizrDropProvider } from './providers/drag-drop-providers/StructurizrDropProvider';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
  	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for structurizr text documents
		documentSelector: [{ scheme: 'file', language: 'structurizr' }],
		synchronize: {
			// Notify the server about file changes to '.dsl files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.dsl')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'structurizrLanguageServer',
		'Structurizr Language Server',
		serverOptions,
		clientOptions
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('visualstructurizr.createDrawIO', async (uri: vscode.Uri) => {
			// Here we need to call the drawio compiler to generate the drawio files.
			console.log(`Please execute the Create DrawIO for ${uri} command here.`);
			const readData = await vscode.workspace.fs.readFile(uri);
			const readStr = Buffer.from(readData).toString('utf8');
			console.log(readStr);
			let lexingResult = StructurizrLexer.tokenize(readStr);
			StructurizrParser.input = lexingResult.tokens;
			const cst = StructurizrParser.workspaceWrapper();
		})
	);

	context.subscriptions.push(DrawioEditorProvider.register(context));

	context.subscriptions.push(
		vscode.authentication.registerAuthenticationProvider(
			AbacusAuthenticationProvider.id, 'Abacus Enterprise', new AbacusAuthenticationProvider(context.secrets)
		)
	);

	const treeDataProvider = new AbacusComponentProvider();

	context.subscriptions.push(
		vscode.window.createTreeView(
			'architectureComponents', 
			{treeDataProvider: treeDataProvider, showCollapseAll: true, canSelectMany: false, dragAndDropController: treeDataProvider})
	);
	
	// context.subscriptions.push(
	// 	vscode.window.registerTreeDataProvider(
	// 		'architectureComponents', treeDataProvider
	// 	)
	// )

	context.subscriptions.push(
		vscode.commands.registerCommand('architectureComponents.refreshEntry', () =>
			treeDataProvider.refresh()
	  	)
	);

	context.subscriptions.push(
		vscode.languages.registerDocumentDropEditProvider({ scheme: 'file', language: 'structurizr' }, new StructurizrDropProvider())
	)

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}