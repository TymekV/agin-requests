import { WorkspaceManager as workspace } from '../WorkspaceManager';
import { Handler } from './Handler';
import { Collection, VSCodeMessage } from '@shared/types';
import * as vscode from 'vscode';

export class WorkspaceHandler extends Handler {
    constructor(prefix: string, webview: vscode.Webview) {
        super(prefix, webview);
        workspace.on('collections-updated', (collections) => {
            this.onCollectionsChanged(collections);
        });

        // TODO: Move it to a folder selector logic
        (async () => {
            if (workspace.isAvaliable() && vscode.workspace.workspaceFolders) {
                await workspace.setFolder(vscode.workspace.workspaceFolders[0]);
            }
        })();
    }

    private onCollectionsChanged(collections: Collection[]) {
        this.webview.postMessage({ command: 'workspace.collections', data: collections });
    }

    async onMessage(message: VSCodeMessage): Promise<void> {
        if (message.command === 'workspace.folder.get') {
            const folder = workspace.folder;
            this.webview.postMessage({ command: 'workspace.folder', data: folder });

        } else if (message.command === 'workspace.open') {
            await workspace.setFolder(message.data);

        } else if (message.command === 'workspace.collections.get') {
            console.log('GET COLLECTIONS', workspace.collections);

            if (!workspace.collections) return;
            this.onCollectionsChanged(workspace.collections);

        } else if (message.command === 'workspace.collections.createEmpty') {
            await workspace.createEmptyCollection(message.path);

        } else if (message.command === 'workspace.collections.delete') {
            await workspace.deleteCollection(message.path);

        } else if (message.command === 'workspace.collections.deleteConfirm') {
            await workspace.deleteCollectionConfirm(message.path);

        } else if (message.command === 'workspace.requests.create') {
            await workspace.createRequest(message.collectionPath, message.data);

        } else if (message.command === 'workspace.requests.delete') {
            await workspace.deleteRequest(message.path, message.slug);

        } else if (message.command === 'workspace.requests.deleteConfirm') {
            await workspace.deleteRequestConfirm(message.path, message.slug);

        }
    }
}