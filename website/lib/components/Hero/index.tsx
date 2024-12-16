'use client';
import { useEffect, useState } from "react";
import { Title } from "../Title";
import { content, hero, heroSubtitle, heroTextBox, heroTitle, screenshot, screenshotContainer, secondaryGrid } from "./styles";

export function Hero() {
    // FIXME: Background highlighting when the page is scrolled
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (event: MouseEvent) => {
        setMousePosition({ x: event.clientX, y: event.clientY });
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className={hero}>
            <div className={secondaryGrid} style={{
                maskPosition: `${mousePosition.x - 200}px ${mousePosition.y - 200}px`,
            }}></div>
            <div className={content}>
                <div className={heroTextBox}>
                    <div className={heroTitle}>The Ultimate Client for APIs</div>
                    <div className={heroSubtitle}>Effortlessly send HTTP requests, listen to Server-Sent Events (SSE), connect to WebSocket (WS) endpoints, and communicate with Socket.IO servers — all from the comfort of your editor.</div>
                </div>
                <div className={screenshotContainer}>
                    <img src="/images/screenshot.png" className={screenshot} />
                </div>
            </div>
        </div>
    )
}