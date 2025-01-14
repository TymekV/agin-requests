import { useVsCodeApi } from '@lib/hooks';
import { Collection, RequestConfig, VSCodeMessage } from '@shared/types';
import { createContext, useCallback, useEffect, useState } from 'react';
import { WorkspaceFolder } from 'vscode';

export type Workspace = {
    folders: WorkspaceFolder[] | undefined;
    openedFolder: WorkspaceFolder | undefined;
    collections: Collection[];
    createEmptyCollection: (path: string) => Promise<void>;
    deleteCollection: (path: string) => Promise<void>;
    deleteCollectionConfirm: (path: string) => Promise<void>;
    createRequest: (collectionPath: string, requestOptions: RequestConfig) => Promise<void>;
    deleteRequest: (path: string, slug: string) => Promise<void>;
    deleteRequestConfirm: (path: string, slug: string) => Promise<void>;
    duplicateCollection: (path: string) => Promise<void>;
}

const initialWorkspace: Workspace = {
    folders: undefined,
    openedFolder: undefined,
    collections: [],
    createEmptyCollection: async () => { },
    deleteCollection: async () => { },
    deleteCollectionConfirm: async () => { },
    createRequest: async () => { },
    deleteRequest: async () => { },
    deleteRequestConfirm: async () => { },
    duplicateCollection: async () => { },
}

export const WorkspaceContext = createContext<Workspace>(initialWorkspace);

export default function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [folders, setFolders] = useState<WorkspaceFolder[] | undefined>(undefined);
    const [openedFolder, setOpenedFolder] = useState<WorkspaceFolder | undefined>(undefined);
    const [collections, setCollections] = useState<Collection[]>([]);

    const vscode = useVsCodeApi();

    useEffect(() => {
        vscode.postMessage({ command: 'folders.get' });
        vscode.postMessage({ command: 'workspace.folder.get' });
        vscode.postMessage({ command: 'workspace.collections.get' });

        const onMessage = (event: MessageEvent<VSCodeMessage>) => {
            const message = event.data;
            console.log('_msg', { message });
            if (message.command === 'folders') {
                setFolders(message.data);

            } else if (message.command === 'workspace.folder') {
                setOpenedFolder(message.data);

            } else if (message.command === 'workspace.collections') {
                setCollections(message.data);
            }
        };

        window.addEventListener('message', onMessage);

        return () => {
            window.removeEventListener('message', onMessage);
        };
    }, []);

    const createEmptyCollection = useCallback(async (path: string) => {
        vscode.postMessage({ command: 'workspace.collections.createEmpty', path });
    }, [vscode.postMessage]);

    const deleteCollection = useCallback(async (path: string) => {
        vscode.postMessage({ command: 'workspace.collections.delete', path });
    }, [vscode.postMessage]);

    const deleteCollectionConfirm = useCallback(async (path: string) => {
        vscode.postMessage({ command: 'workspace.collections.deleteConfirm', path });
    }, [vscode.postMessage]);

    const deleteRequest = useCallback(async (path: string, slug: string) => {
        vscode.postMessage({ command: 'workspace.requests.delete', path, slug });
    }, [vscode.postMessage]);

    const deleteRequestConfirm = useCallback(async (path: string, slug: string) => {
        vscode.postMessage({ command: 'workspace.requests.deleteConfirm', path, slug });
    }, [vscode.postMessage]);

    const createRequest = useCallback(async (collectionPath: string, requestOptions: RequestConfig) => {
        vscode.postMessage({ command: 'workspace.requests.create', collectionPath, data: requestOptions });
    }, [vscode.postMessage]);

    const duplicateCollection = useCallback(async (path: string) => {
        vscode.postMessage({ command: 'workspace.collections.duplicate', path });
    }, [vscode.postMessage]);

    return (
        <WorkspaceContext.Provider value={{
            folders,
            openedFolder,
            collections,
            createEmptyCollection,
            deleteCollection,
            deleteCollectionConfirm,
            createRequest,
            deleteRequest,
            deleteRequestConfirm,
            duplicateCollection,
        }}>
            {children}
        </WorkspaceContext.Provider>
    )
}