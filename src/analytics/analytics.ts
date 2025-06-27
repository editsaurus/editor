let trackerIframe: HTMLIFrameElement | null = null;

export function injectTrackingIframe() {
    if (trackerIframe) {
        return;
    }
    trackerIframe = document.createElement('iframe');
    trackerIframe.src = `https://editsaurus.com/analytics`;
    trackerIframe.style.display = 'none';
    trackerIframe.style.width = '0';
    trackerIframe.style.height = '0';
    trackerIframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(trackerIframe);
}

export function sendSimpleAnalyticsEvent(action: string) {
    if (trackerIframe?.contentWindow) {
        trackerIframe.contentWindow.postMessage(
            {
                type: 'analytics-event',
                payload: {action},
            },
            'https://editsaurus.com'
        );
    }
}

export function uninjectTrackingIframe() {
    if (trackerIframe && trackerIframe.parentNode) {
        trackerIframe.parentNode.removeChild(trackerIframe);
        trackerIframe = null;
    }
}
