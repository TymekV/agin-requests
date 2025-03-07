import useSynced from "@lib/hooks/useSynced";
import { RealtimeMessage, SocketIOMessage, WSMessage } from "@shared/types";
import { useForm } from "@mantine/form";
import React, { createContext, useEffect } from "react";

type RealtimeMessagesForm = {
    messages: RealtimeMessage[];
    activeMessage: RealtimeMessage;
}

type RealtimeMessagesContextType = ReturnType<typeof useForm<RealtimeMessagesForm>>

export const RealtimeMessagesContext = createContext<RealtimeMessagesContextType | null>(null);

export default function RealtimeMessagesProvider({ children }: { children: React.ReactNode }) {
    const messages = useForm<RealtimeMessagesForm>({
        initialValues: {
            messages: [],
            activeMessage: {
                data: '',
                type: 'json',
                args: [],
            }
        }
    });

    useSynced('realtimeMessages', messages.values, messages.setValues);

    useEffect(() => {
        messages.resetDirty();
    }, [messages.values.activeMessage.label]);

    return (
        <RealtimeMessagesContext.Provider value={messages}>
            {children}
        </RealtimeMessagesContext.Provider>
    )
}