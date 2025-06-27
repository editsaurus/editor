import { Sections } from "./components/all/Sections.tsx";
import { useControllerStore } from "./store/useControllerStore.ts";
import { useConfigStore } from "./store/useConfig.ts";
import { ShadowDom, } from "./components/all/ShadowDom/ShadowDom.tsx";
import { useCurrentFileUpdater } from "./components/all/hooks/useCurrentFileUpdater.ts";
import { ShadowDomPortal } from "./components/all/ShadowDom/ShadowDomPortal.tsx";
import { useSectionsListenersInit } from "./components/all/hooks/useSectionsListenersInit.ts";
import "./index.css"
import { FixedToolbar } from "./components/all/Toolbar/FixedToolbar.tsx";
import { useEffect } from "react";
import { injectTrackingIframe, uninjectTrackingIframe } from "@/analytics/analytics.ts";

export function Editsaurus() {
    const enabled = useControllerStore(state => state.enabled);

    const currentFileName = useConfigStore(state => state.currentFileName);

    useCurrentFileUpdater();
    useSectionsListenersInit();

    useEffect(() => {
        injectTrackingIframe();
        return () => {
            uninjectTrackingIframe();
        };
    }, []);

    return (
        <div>
            <ShadowDom />
            <ShadowDomPortal targetId="sections">
                {enabled && !currentFileName && <Sections />}
            </ShadowDomPortal>
            <ShadowDomPortal targetId="ui">
                {!currentFileName && <FixedToolbar />}
            </ShadowDomPortal>
        </div>
    );
}
