import React, { useEffect, useState } from "react";
import { useRequest } from "@lib/hooks/useRequest";
import UrlSelector from "@lib/components/UrlSelector";
import Tabs, { TabType } from "@lib/components/Tabs";
import { container, left, tabs, urlSelector } from "./styles";
import Param from "@lib/components/Param";
import ParamsGroup from "@lib/components/ParamsGroup";
import ParamsEditor from "./ParamsEditor";
import HeadersEditor from "./HeadersEditor";
import BodyEditor from "./BodyEditor";
import AuthEditor from "./AuthEditor";
import { RequestBodyType } from "@lib/types";

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
        id: 'auth',
        label: 'Authorization',
    },
    {
        id: 'body',
        label: 'Body',
    },
    {
        id: 'settings',
        label: 'Settings',
    },
];

export function RequestConfig() {
    const request = useRequest();

    const [tab, setTab] = useState<string>('query');

    useEffect(() => {
        const last = request?.values.params[request?.values.params.length - 1];
        if (last?.name != '' || last?.value != '') request?.insertListItem('params', {
            enabled: false,
            name: '',
            value: '',
        });
    }, [request?.values.params]);

    useEffect(() => {
        const last = request?.values.headers[request?.values.headers.length - 1];
        if (last?.name != '' || last?.value != '') request?.insertListItem('headers', {
            enabled: false,
            name: '',
            value: '',
        });
    }, [request?.values.headers]);

    useEffect(() => {
        // Convert between String and array of FormItems when switching between text editors (JSON, XML, Text) and graphical editors (URL-encoded, Form Data)
        if (!(request?.values.requestBody instanceof Object)) {
            if (['formdata', 'urlencoded'].includes(request?.values.requestBodyType as RequestBodyType)) {
                request?.setFieldValue('requestBody', []);
            }
            return;
        } else {
            if (['json', 'xml', 'text'].includes(request?.values.requestBodyType as RequestBodyType)) {
                request?.setFieldValue('requestBody', '');
                return;
            }
        }
        const last = request?.values.requestBody[request?.values.requestBody.length - 1];
        if (last?.name != '' || last?.value != '') request?.insertListItem('requestBody', {
            enabled: false,
            name: '',
            value: '',
            file: null,
        });
    }, [request?.values.requestBody, request?.values.requestBodyType]);

    return (
        <div className={left}>
            <div className={container}>
                <div className={urlSelector}>
                    <UrlSelector />
                </div>
                <div className={tabs}>
                    <Tabs tabs={requestTabs} active={tab} onChange={setTab} />
                </div>
            </div>
            {tab == 'query' && <ParamsEditor />}
            {tab == 'headers' && <HeadersEditor />}
            {tab == 'body' && <BodyEditor />}
            {tab == 'auth' && <AuthEditor />}
        </div>
    )
}