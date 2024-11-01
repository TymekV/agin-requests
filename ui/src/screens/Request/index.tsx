import React, { useEffect, useState } from "react";
import { VSCodeButton, VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { css } from "@styled-system/css";
import Columns from "@lib/components/Columns";
import { useRequest } from "@lib/hooks/useRequest";
import UrlSelector from "@lib/components/UrlSelector";
import Tabs, { TabType } from "@lib/components/Tabs";
import { RequestConfig } from "./RequestConfig";

export const requestTabs: TabType[] = [
    {
        id: 'query',
        label: 'Query',
    },
    {
        id: 'headers',
        label: 'Headers',
    },
    {
        id: 'body',
        label: 'Body',
    },
]

export function Request() {
    const request = useRequest();

    const [requestTab, setRequestTab] = useState('query');

    return (
        <Columns
            left={<RequestConfig />}
            right={<>
                Response
            </>}
        />
    )
}