import { useHTTPResponse, useRequestController } from "@lib/hooks";
import { useMemo, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import { v4 } from "uuid";
import { mapContentType } from "@lib/util";
import ThemedEditor from "@lib/components/ThemedEditor";
import { editor } from "./styles";

export default function ResponseContent() {
    const { status, cancel } = useRequestController();
    const [response] = useHTTPResponse();

    const [tab, setTab] = useState<string>('body');

    const statusColor = response.status < 400 ? 'green' : 'red';

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const requestId = useMemo(() => {
        return v4();
    }, [response.data]);

    const model = useMemo(() => {
        console.log(response.headers['content-type'])
        return mapContentType(response.headers['content-type']?.split(';')[0]);
    }, [response.data]);

    return (
        <ThemedEditor
            height="100%"
            className={editor}
            defaultLanguage={model}
            defaultValue={typeof response.data == 'string' ? response.data : JSON.stringify(response.data, null, 4)}
            onMount={(editor, monaco) => {
                editorRef.current = editor;
            }}
            path={requestId}
            options={{
                readOnly: true,
                readOnlyMessage: {
                    value: 'Cannot edit HTTP response'
                },
                minimap: {
                    enabled: false,
                },
                renderFinalNewline: 'off',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                language: model,
            }}
        />
    )
}