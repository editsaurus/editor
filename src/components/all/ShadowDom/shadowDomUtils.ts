export const SHADOW_DOM_ID = "host";

export function getShadowRoot(): ShadowRoot | null {
    const shadowHost = document.getElementById(SHADOW_DOM_ID);
    if (shadowHost) {
        return shadowHost.shadowRoot;
    }
    return null;
}

export function getDivInShadowRoot(id: string): HTMLDivElement | null {
    const shadowRoot = getShadowRoot();
    if (shadowRoot) {
        return shadowRoot.getElementById(id) as HTMLDivElement;
    }
    return null;
}


