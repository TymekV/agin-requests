import { ServerEvent } from "@shared/types/ServerEvent";
import { Icon, IconArrowDown, IconArrowUp, IconPlug, IconX } from "@tabler/icons-react";
import { argsList, eventCodeContainer, eventContent, eventDate, eventIcon, eventInner, eventLeft, eventName, eventStyles, seeMore, seeMoreButton, seeMoreInside } from "./styles";
import ThemeIcon from "../ThemeIcon";
import { formatDateToTime } from "@lib/util";
import Highlight from "../Highlight";
import { useMemo, useState } from "react";
import { RealtimeMessage, SocketIOMessage, WSMessage } from "@shared/types";
import { useRequest } from "@lib/hooks";
import IOArgument from "./IOArgument";

type Color = 'green' | 'red' | 'blue';

export default function Event({ data, receivedAt, type, event }: ServerEvent<string | RealtimeMessage>) {
    const [icon, color]: [Icon, Color] = type == 'connected' ? [IconPlug, 'green'] : type == 'incoming' ? [IconArrowDown, 'blue'] : type == 'outgoing' ? [IconArrowUp, 'green'] : [IconX, 'red'];

    const lang = useMemo(() => {
        let lang = typeof data == 'object' ? data.type : 'text';
        try {
            JSON.parse(typeof data == 'object' ? data.data : data);
            lang = 'json';
        } catch (error) {
        }
        return lang;
    }, [data]);
    const code = typeof data == 'object' ? data.data : data;

    const request = useRequest();

    // FIXME: Not accounting for line breaks
    const overflowing = code ? code.split('\n').length > 6 : false;

    const [expanded, setExpanded] = useState(false);

    return (
        <div className={eventStyles}>
            <div className={eventInner}>
                <div className={eventLeft}>
                    <div className={eventIcon}>
                        <ThemeIcon icon={icon} iconColor={color} />
                    </div>
                    <div>
                        {event && <div className={eventName({ argsDisplayed: (data as RealtimeMessage)?.args?.length !== 0 })}>{event}</div>}
                        {type == 'connected' || type == 'disconnected' ? <>
                            <div className={eventContent({ bold: true })}>{typeof data === 'string' && data}</div>
                        </> : <>
                            {request?.values.type !== 'socketio' ? <div className={eventCodeContainer({ expanded: overflowing ? expanded : true })}>
                                <Highlight language={lang} code={code} />
                            </div> : <>
                                {(data as RealtimeMessage).args.length > 0 && <div className={argsList}>
                                    {(data as RealtimeMessage).args.map((arg, i) => <IOArgument key={arg.data} data={arg} index={i} />)}
                                </div>}
                            </>}
                        </>}
                    </div>
                </div>
                <div className={eventLeft}>
                    <div className={eventDate}>{formatDateToTime(receivedAt)}</div>
                </div>
            </div>
            {overflowing && <div className={seeMore({ visible: overflowing && !expanded })}>
                <div className={seeMoreButton} onClick={() => setExpanded(e => !e)}>
                    <div className={seeMoreInside}>See {expanded ? 'Less' : 'More'}</div>
                </div>
            </div>}
        </div>
    )
}