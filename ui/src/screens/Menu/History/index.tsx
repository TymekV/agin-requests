import Request from "@lib/components/Request";
import { history } from "./styles";
import Welcome from "@lib/components/Welcome";
import { IconHistory } from "@tabler/icons-react";

export default function History() {
    return (
        <div className={history}>
            <div style={{ marginTop: '20px' }}>
                <Welcome
                    icon={IconHistory}
                    title="History will be avaliable soon!"
                    subtitle="I'm working on it, stay tuned!"
                    size="sm"
                />
            </div>
            {/* <Request
                method="get"
                type="http"
                url="https://example.com"
            />
            <Request
                method="get"
                type="http"
                url="https://example.com"
            />
            <Request
                method="get"
                type="http"
                url="https://example.com"
            />
            <Request
                method="get"
                type="http"
                url="https://example.com"
            />
            <Request
                method="get"
                type="http"
                url="https://example.com"
            /> */}
        </div>
    )
}