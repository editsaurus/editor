// will detect change in the dome after the refresh of the webpack
export function checkContentChange(selector: string, originalContent: string, onChangeDetected: () => void, onTimeout: () => void) {
    let counter = 0;
    const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            const currentContent = element.innerHTML;

            // Check if content has changed from the original content
            if (currentContent === originalContent) {
                onChangeDetected();
                clearInterval(intervalId);
            }
        }

        counter += 100;
        if (counter >= 5000) {
            clearInterval(intervalId);
            onTimeout();
        }
    }, 100);
}

export function getRelativeOffset(parent: HTMLElement, child: HTMLElement) {
    const parentRect = parent.getBoundingClientRect();
    const childRect = child.getBoundingClientRect();

    // Get the computed styles of the child element for padding
    const style = window.getComputedStyle(child);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingLeft = parseFloat(style.paddingLeft);

    // Calculate the content offset by subtracting padding from the child element
    const top = childRect.bottom - parentRect.top - paddingTop;
    const left = childRect.right - parentRect.left - paddingLeft;

    return { top, left };
}

export function getMarkdownRootElement(element: HTMLElement) {
    let markdownElement = element;

    // Find the root element with the markdown class
    while (markdownElement && !markdownElement.classList.contains('markdown')) {
        markdownElement = markdownElement.parentElement as HTMLElement;
    }

    return markdownElement;
}
