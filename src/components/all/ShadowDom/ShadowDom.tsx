import {useRef, useEffect} from "react";
import {SHADOW_DOM_ID} from "@/components/all/ShadowDom/shadowDomUtils.ts";

export function ShadowDom() {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hostRef.current || hostRef.current.shadowRoot) {
            return;
        }
        // Create shadow root
        const shadow = hostRef.current.attachShadow({mode: "open"});

        const link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "/editsaurus.css"); // must be accessible
        shadow.appendChild(link);

        const sections = document.createElement("div");
        sections.id = "sections";
        shadow.appendChild(sections);

        const ui = document.createElement("div");
        ui.id = "ui";
        shadow.appendChild(ui);
    }, []);

    return <div id={SHADOW_DOM_ID} ref={hostRef}/>;
}
