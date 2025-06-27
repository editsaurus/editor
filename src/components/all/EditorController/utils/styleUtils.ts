// Text-related styles
const TEXT_STYLES = [
    "font-size",
    "color",
    "font-weight",
    "line-height",
    // "text-decoration",
    "text-decoration-line",
    // "text-decoration-style",
    // "text-decoration-color",
    // "text-decoration-thickness",
    "font-family",
    // "text-transform",
    // "font-style",
    // "white-space",
    // "word-wrap",
    // "letter-spacing",
    // "text-align"
] as const;

// Layout-related styles
const LAYOUT_STYLES = [
    "background-color",
    "border",
    "border-radius",
    "padding",
    // "margin",
    "padding-top",
    "padding-right",
    "padding-bottom",
    "padding-left",
    // "margin-top",
    // "margin-right",
    // "margin-bottom",
    // "margin-left",
    "box-shadow",
    "outline",
    "outline-offset"
] as const;

// List-specific styles
const LIST_STYLES = [
    "list-style-type",
    "list-style-position",
    "list-style-image",
    "list-style",
    "padding-left",
    "margin-left",
    "counter-reset",
    "counter-increment"
] as const;

// Tag-specific style mappings
const TAG_SPECIFIC_STYLES: Record<string, string[]> = {
    'ul': [...LIST_STYLES],
    'ol': [...LIST_STYLES],
    'li': [...LIST_STYLES],
    'lic': [...LIST_STYLES],
    "code": ["vertical-align", /*"border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius"*/],

};

// Combined styles for collection
const DEFAULT_STYLES_TO_COLLECT = [...TEXT_STYLES, ...LAYOUT_STYLES];

// Fixed styles that override computed/composed styles for specific tags
const FIXED_STYLES: Record<string, Record<string, string>> = {
    'a': {
        'font-size': 'inherit',
    },
    // Add more tag-specific fixed styles here as needed
};

export function collectStyles(
    element: HTMLElement
): Record<string, Record<string, string>> {
    const types = ['p', 'h1', 'h2'];
    const styles = ['font-size', 'color', 'font-weight'];
    const result: Record<string, Record<string, string>> = {};

    // Function to collect specified styles from an element
    const collectStyles = (el: HTMLElement): Record<string, string> => {
        const computedStyle = window.getComputedStyle(el);
        const collectedStyles: Record<string, string> = {};

        styles.forEach((style) => {
            collectedStyles[style] = computedStyle.getPropertyValue(style) || '';
        });

        return collectedStyles;
    };

    // Collect styles for the provided element itself
    result[element.tagName.toLowerCase()] = collectStyles(element);

    // Iterate through all matching child elements
    for (const child of element.querySelectorAll<HTMLElement>(types.join(','))) {
        const tagName = child.tagName.toLowerCase();

        // Skip if this tag is already processed
        if (result[tagName]) continue;

        // Collect and save styles for this child
        result[tagName] = collectStyles(child);

        // Stop processing if we've collected styles for all types
        if (Object.keys(result).length - 1 === types.length) break;
    }

    return result;
}

function addGlobalStyle(rule: string, values: Record<string, string>) {
    let styleString = '';
    for (const [property, value] of Object.entries(values)) {
        styleString += `${property}: ${value};\n`;
    }

    const complexClassRule = `
        ${rule} {
            ${styleString}
        }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = complexClassRule;

    // const shadowRoot = getShadowRoot();
    // shadowRoot?.host?.appendChild(styleElement);
    // document.head.appendChild(styleElement);

    return styleElement;
}

export function applyGlobalStyles(classPrefix: string, props: Record<string, Record<string, string>>) {
    const styleElements: HTMLStyleElement[] = [];
    for (const [selector, styleValues] of Object.entries(props)) {
        const rule = `.${classPrefix} .slate-${selector}`;
        styleElements.push(addGlobalStyle(rule, styleValues));
    }

    return styleElements;
}


export function getRandomString(length: number = 10) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
        const randomIndex = randomValues[i] % letters.length; // Map to a valid index in the `letters` string
        result += letters[randomIndex];
    }

    return result;
}


// will detect style of a tag dynamically
function getSpecificComputedStyles(
    parentElement: HTMLElement,
    tagName: string,
    stylesToCollect: string[] = ["font-size", "color", "font-weight"]
): Record<string, string> {
    if (!parentElement || !tagName) {
        throw new Error("Both parentElement and tagName are required.");
    }

    // Create a temporary element of the given tag
    const tempElement = document.createElement(tagName);

    // Ensure it takes natural styles but remains invisible
    // tempElement.style.all = "unset"; // Reset inherited styles
    tempElement.style.opacity = "0"; // Make it invisible
    tempElement.style.pointerEvents = "none"; // Prevent interactions

    // Append to the parent element
    parentElement.insertBefore(tempElement, parentElement.children[1] || null);

    // Get computed styles
    const computedStyles = window.getComputedStyle(tempElement);

    // Collect only the specified styles
    const styles: Record<string, string> = {};
    for (const prop of stylesToCollect) {
        styles[prop] = computedStyles.getPropertyValue(prop);
    }

    // add static props
    // styles["white-space"] = "pre";
    // styles["word-wrap"] = "break-word";

    // Remove the temporary element
    parentElement.removeChild(tempElement);

    // debugger;
    return styles;
}


export function getComputedStylesForTags(
    parentElement: HTMLElement,
    tagNames: string[],
    generalStylesToCollect: string[] = DEFAULT_STYLES_TO_COLLECT
): Record<string, Record<string, string>> {
    if (!parentElement || tagNames.length === 0) {
        throw new Error("Parent element and at least one tag name are required.");
    }

    const result: Record<string, Record<string, string>> = {};

    for (const tagName of tagNames) {
        // Combine general styles with tag-specific styles
        const tagSpecificStyles = TAG_SPECIFIC_STYLES[tagName] || [];
        const combinedStyles = [...new Set([...generalStylesToCollect, ...tagSpecificStyles])];

        // Get computed styles
        const computed = getSpecificComputedStyles(parentElement, tagName, combinedStyles);

        // Apply fixed styles if present (override computed)
        if (FIXED_STYLES[tagName]) {
            result[tagName] = {...computed, ...FIXED_STYLES[tagName]};
        } else {
            result[tagName] = computed;
        }
    }

    return result;
}

/**
 * Computes styles for nested tag structures, e.g., code under h1, h2, p, etc.
 * Returns a mapping from selector (like 'h1 code') to the computed styles of the child tag when nested under the parent tag.
 *
 * @param parentElement The parent element to which temporary test elements will be appended.
 * @param parentTags Array of parent tag names (e.g., ['h1', 'h2', 'p'])
 * @param childTags Array of child tag names (e.g., ['code'])
 * @param generalStylesToCollect Array of CSS property names to collect (optional)
 */
export function getComputedStylesForNestedTags(
    parentElement: HTMLElement,
    parentTags: string[],
    childTags: string[],
    generalStylesToCollect: string[] = DEFAULT_STYLES_TO_COLLECT
): Record<string, Record<string, string>> {
    if (!parentElement || parentTags.length === 0 || childTags.length === 0) {
        throw new Error("Parent element and at least one parent and child tag name are required.");
    }

    const result: Record<string, Record<string, string>> = {};
    const listRelatedTags = ["li"];

    for (const parentTag of parentTags) {
        for (const childTag of childTags) {
            // Combine general styles with tag-specific styles for the child
            const tagSpecificStyles = TAG_SPECIFIC_STYLES[childTag] || [];
            const combinedStyles = [...new Set([...generalStylesToCollect, ...tagSpecificStyles])];

            // Create parent and child elements
            const tempParent = document.createElement(parentTag);
            let tempChild: HTMLElement;
            if (listRelatedTags.includes(childTag)) {
                // For list-related tags, create two children and get the styles of the second child
                const firstChild = document.createElement(childTag);
                firstChild.style.opacity = "0";
                firstChild.style.pointerEvents = "none";
                tempParent.appendChild(firstChild);
                tempChild = document.createElement(childTag);
                tempChild.style.opacity = "0";
                tempChild.style.pointerEvents = "none";
                tempParent.appendChild(tempChild);
            } else {
                tempChild = document.createElement(childTag);
                tempChild.style.opacity = "0";
                tempChild.style.pointerEvents = "none";
                tempParent.appendChild(tempChild);
            }
            parentElement.appendChild(tempParent);

            const computedStyles = window.getComputedStyle(tempChild);
            const styles: Record<string, string> = {};
            for (const prop of combinedStyles) {
                styles[prop] = computedStyles.getPropertyValue(prop);
            }

            // Apply fixed styles if present (override computed)
            if (FIXED_STYLES[childTag]) {
                result[`${parentTag} ${childTag}`] = {...styles, ...FIXED_STYLES[childTag]};
            } else {
                result[`${parentTag} ${childTag}`] = styles;
            }

            // Clean up
            parentElement.removeChild(tempParent);
        }
    }

    return result;
}
