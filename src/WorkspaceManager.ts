import { Collection, CollectionManifest, CreateCollectionOptions, RequestConfig, WorkspaceManifest } from '@shared/types';
import { ensureFolderExists } from './util/fs';
import * as vscode from 'vscode';
import yaml from 'yaml';
import semver from 'semver';
import { randomUUID } from 'crypto';
import { createSlug } from './util';
import EventEmitter from 'node:events';

type WMEvents = {
    'collection-created': (path: string) => void;
    'request-created': (path: string) => void;
    'collections-updated': (collections: Collection[]) => void;
};

const STORAGE_FOLDER = '.agin-requests';
const VERSION = '1.0.2';

const databaseReadme = `# Agin Requests Database

This database was auto-generated by [Agin Requests](https://requests.agin.rocks). If you want to collaborate, you should include this directory in your version control system. You can learn more about Agin Requests Databases [here](https://docs.requests.agin.rocks/features/git-sync).`;

export class WorkspaceManager {
    private static instance: WorkspaceManager;
    public static folder?: vscode.WorkspaceFolder;
    private static baseUri?: vscode.Uri;
    public static manifest?: WorkspaceManifest;
    public static collections?: Collection[];
    private static emitter = new EventEmitter();
    private static watcher: vscode.FileSystemWatcher;

    private constructor() {
        WorkspaceManager.watcher = vscode.workspace.createFileSystemWatcher(`**/${STORAGE_FOLDER}/**`);
        const handler = async (e: vscode.Uri) => {
            console.log('File changed', e);
            await WorkspaceManager.loadManifest();
            await WorkspaceManager.loadCollections();
        }
        WorkspaceManager.watcher.onDidChange(handler);
        WorkspaceManager.watcher.onDidCreate(handler);
        WorkspaceManager.watcher.onDidDelete(handler);
    }

    public static getInstance(): WorkspaceManager {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    }

    public static isAvaliable(): boolean {
        return !!vscode.workspace.workspaceFolders;
    }

    public static async setFolder(folder: vscode.WorkspaceFolder): Promise<void> {
        WorkspaceManager.folder = folder;
        WorkspaceManager.baseUri = vscode.Uri.joinPath(folder.uri, STORAGE_FOLDER);
        console.log(WorkspaceManager.baseUri);

        await ensureFolderExists(WorkspaceManager.baseUri);
        await this.loadManifest();
        await this.loadCollections();
    }

    public static async loadManifest() {
        if (!WorkspaceManager.baseUri) return;

        const readmePath = vscode.Uri.joinPath(WorkspaceManager.baseUri, 'README.md');
        await vscode.workspace.fs.writeFile(readmePath, Buffer.from(databaseReadme));

        let manifest: WorkspaceManifest | undefined = undefined;
        let manifestPath: vscode.Uri | undefined = undefined;
        try {
            manifestPath = vscode.Uri.joinPath(WorkspaceManager.baseUri, 'manifest.yaml');
            const file = await vscode.workspace.fs.readFile(manifestPath);

            manifest = yaml.parse(file.toString());
        } catch (error) {
            if (error instanceof vscode.FileSystemError) {
                if (error.code == 'FileNotFound' && manifestPath) {
                    manifest = {
                        extensionVersion: VERSION,
                        databaseVersion: 1,
                    };

                    const manifestYaml = yaml.stringify(manifest);
                    await vscode.workspace.fs.writeFile(manifestPath, Buffer.from(manifestYaml));
                }
            }
        }

        if (!manifest) return vscode.window.showErrorMessage('Unable to load manifest');

        if (manifest.databaseVersion > 1) return vscode.window.showErrorMessage('Unsupported database version. Please update Agin Requests in order to open this workspace.');
        if (semver.gt(manifest.extensionVersion, VERSION)) vscode.window.showWarningMessage('This workspace was saved with a newer version of Agin Requests. Some features may not be avaliable.');

        WorkspaceManager.manifest = manifest;
        console.log({ manifest });

        return manifest;
    }

    public static async loadCollections(): Promise<void> {
        if (!WorkspaceManager.baseUri) return;

        const collectionsPath = vscode.Uri.joinPath(WorkspaceManager.baseUri, 'agin-collections');
        await ensureFolderExists(collectionsPath);

        const items = await vscode.workspace.fs.readDirectory(collectionsPath);
        const collectionNames = items.filter(([filename, type]) => type == vscode.FileType.Directory).map(x => x[0]);

        const collections: Collection[] = [];
        for (const col of collectionNames) {
            const colPath = vscode.Uri.joinPath(collectionsPath, col);
            const colData = await this.readCollection(colPath);
            if (!colData) continue;

            collections.push(colData);
        }

        WorkspaceManager.collections = collections;

        console.log({ collections });
        WorkspaceManager.emitter.emit('collections-updated', collections);
    }

    public static async createEmptyCollection(path: string) {
        if (!WorkspaceManager.baseUri) return;

        const isLabeledAsFolder = path !== '';

        const collectionName = await vscode.window.showInputBox({
            prompt: `Enter the ${isLabeledAsFolder ? 'folder' : 'collection'} name`,
            placeHolder: `${isLabeledAsFolder ? 'Folder' : 'Collection'} name`,
            validateInput: (input) => {
                if (input == '_collection') return `Choose a different name for the ${isLabeledAsFolder ? 'folder' : 'collection'}.`;
                return null;
            }
        });

        if (!collectionName || collectionName === '_collection') return;

        return await this.createCollection(path, {
            authType: 'none',
            headers: [],
            label: collectionName,
            type: 'collection',
        });
    }

    public static async createCollection(path: string, options: CreateCollectionOptions) {
        if (!WorkspaceManager.baseUri) return;
        const collectionPath = vscode.Uri.joinPath(WorkspaceManager.baseUri, 'agin-collections', path);

        // TODO: Recursively create sub-collections
        const id = randomUUID();
        const slug = options.slug ?? createSlug(options.label);

        const collection: Collection = {
            id,
            slug,
            ...options,
            requests: [],
            children: [],
            path,
        }

        if (collection.slug == '_collection') {
            vscode.window.showErrorMessage('Choose a different name for the collection.');
            return;
        }
        const basePath = vscode.Uri.joinPath(collectionPath, collection.slug);

        await ensureFolderExists(basePath);

        const rawCollection = Buffer.from(yaml.stringify(collection));
        const manifestPath = vscode.Uri.joinPath(basePath, '_collection.yaml');

        await vscode.workspace.fs.writeFile(manifestPath, rawCollection);

        await this.loadCollections();

        WorkspaceManager.emitter.emit('collection-created', manifestPath.toString());

        return collection;
    }

    public static async createRequest(collectionPath: string, requestOptions: RequestConfig) {
        if (!WorkspaceManager.baseUri) return;

        const slug = requestOptions.slug ?? createSlug(requestOptions.label);

        const request: RequestConfig = {
            slug,
            ...requestOptions,
        }

        if (slug == '_collection') {
            vscode.window.showErrorMessage('Choose a different name for the request.');
            return;
        }
        const basePath = vscode.Uri.joinPath(WorkspaceManager.baseUri, 'agin-collections', collectionPath);
        await ensureFolderExists(basePath);

        const requestPath = vscode.Uri.joinPath(basePath, `${slug}.yaml`);

        await vscode.workspace.fs.writeFile(requestPath, Buffer.from(yaml.stringify(request)));

        await this.loadCollections();

        WorkspaceManager.emitter.emit('request-created', requestPath.toString());

        return request;
    }

    private static async readRequest(uri: vscode.Uri): Promise<RequestConfig | undefined> {
        const requestData = yaml.parse((await vscode.workspace.fs.readFile(uri)).toString()) as RequestConfig;
        return requestData;
    }

    private static async readCollection(uri: vscode.Uri): Promise<Collection | undefined> {
        const manifestPath = vscode.Uri.joinPath(uri, '_collection.yaml');
        const manifest = yaml.parse((await vscode.workspace.fs.readFile(manifestPath)).toString()) as CollectionManifest;

        const items = await vscode.workspace.fs.readDirectory(uri);

        const collections: Collection[] = [];
        const requests: RequestConfig[] = [];
        for (const [col, type] of items) {
            if (col == '_collection.yaml') continue;
            const colPath = vscode.Uri.joinPath(uri, col);

            if (type == vscode.FileType.Directory) {
                const colData = await this.readCollection(colPath);
                if (!colData) continue;

                collections.push(colData);
            } else if (type == vscode.FileType.File) {
                const reqData = await this.readRequest(colPath);
                if (!reqData) continue;

                requests.push(reqData);
            }

        }

        const relativePath = uri.path.split('/agin-collections/')[1]?.split('/').slice(0, -1).join('/') ?? '';
        return {
            ...manifest,
            children: collections,
            requests,
            path: relativePath,
        }
    }

    public static async deleteCollectionConfirm(path: string) {
        const confirm = await vscode.window.showInformationMessage(`Are you sure you want to delete the collection?`, 'Delete', 'Cancel');
        if (confirm !== 'Delete') return;

        await this.deleteCollection(path);
    }

    public static async deleteCollection(path: string) {
        if (!this.baseUri) return;

        const collectionPath = vscode.Uri.joinPath(this.baseUri, 'agin-collections', path);
        await vscode.workspace.fs.delete(collectionPath, { recursive: true });

        await this.loadCollections();
    }

    public static on<E extends keyof WMEvents>(event: E, listener: WMEvents[E]) {
        WorkspaceManager.emitter.on(event, listener);
    }

    public static off<E extends keyof WMEvents>(event: E, listener: WMEvents[E]) {
        WorkspaceManager.emitter.off(event, listener);
    }

    public static removeListener<E extends keyof WMEvents>(event: E, listener: WMEvents[E]) {
        WorkspaceManager.emitter.removeListener(event, listener);
    }

    public static removeAllListeners<E extends keyof WMEvents>(event?: E) {
        WorkspaceManager.emitter.removeAllListeners(event);
    }
}

// Usage:
export default WorkspaceManager.getInstance();