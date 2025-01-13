import { useVsCodeApi } from '@lib/hooks';
import { Collection, VSCodeMessage } from '@shared/types';
import { createContext, useEffect, useState } from 'react';
import { WorkspaceFolder } from 'vscode';

export type Workspace = {
    folders: WorkspaceFolder[] | undefined;
    openedFolder: WorkspaceFolder | undefined;
    collections: Collection[];
}

const initialWorkspace: Workspace = {
    folders: undefined,
    openedFolder: undefined,
    collections: [],
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

    return (
        <WorkspaceContext.Provider value={{ folders, openedFolder, collections }}>
            {children}
        </WorkspaceContext.Provider>
    )
}