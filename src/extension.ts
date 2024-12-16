// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import path from 'path';
import { getMonacoTheme } from './helpers';
import axios from 'axios';
import { convertCheckableFields, generateHtml } from './util';
import { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import createRequestWebview from './createRequestView';
import { importCurl } from './util/importCurl';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const sidebarProvider = new SidebarProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "agin-requests-sidebar",
            sidebarProvider
        )
    );

    const webview = vscode.commands.registerCommand('agin-requests.new', () => {
        createRequestWebview(context);
    });
    context.subscriptions.push(webview);

    const sse = vscode.commands.registerCommand('agin-requests.new-sse', () => {
        createRequestWebview(context, {
            type: 'sse',
        });
    });
    context.subscriptions.push(sse);

    const websocket = vscode.commands.registerCommand('agin-requests.new-websocket', () => {
        createRequestWebview(context, {
            type: 'ws',
        });
    });
    context.subscriptions.push(websocket);

    const socketio = vscode.commands.registerCommand('agin-requests.new-socketio', () => {
        // TODO: Add Socket.IO
    });
    context.subscriptions.push(socketio);

    const importCurlCmd = vscode.commands.registerCommand('agin-requests.import-curl', async () => {
        await importCurl(context);
    });
    context.subscriptions.push(importCurlCmd);
}

// This method is called when your extension is deactivated
export function deactivate() { }