import {useMemo} from "react";
import {getMarkdownRootElement} from "../utils/elementUtils.ts";
import {getRandomString} from "../utils/styleUtils.ts";
import {
    getComputedStylesForTags,
    getComputedStylesForNestedTags
} from "@/components/all/EditorController/utils/styleUtils.ts";

// Constants for better maintainability
const PARENT_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "ol", "ul", "blockquote"];
const CHILD_TAGS = ["code", "a", "span"];
const ALL_TAGS = [...PARENT_TAGS, ...CHILD_TAGS];

export function useAllSectionDynamicStyles(element: HTMLElement, nestedMarkdown: boolean): [string, string] {
    const classPrefix = useMemo(() => getRandomString(), []);

    const cssClasses = useMemo(() => {
        if (!element) {
            return "";
        }

        const elementToAnalyze = nestedMarkdown ? element : getMarkdownRootElement(element);

        // Get computed styles
        const flatStyles = getComputedStylesForTags(elementToAnalyze, ALL_TAGS);
        const nestedStyles = getComputedStylesForNestedTags(elementToAnalyze, PARENT_TAGS, CHILD_TAGS);
        const marginBottomStyles = getComputedStylesForTags(elementToAnalyze, ALL_TAGS, ["margin-bottom"]);
        const marginTopStyles = getComputedStylesForTags(elementToAnalyze, ALL_TAGS, ["margin-top"]);
        const listRelatedMarginStyles = getComputedStylesForNestedTags(elementToAnalyze, ["ul", "ol"], ["li"], ["margin-top"]);

        // Helper function to build CSS rules
        const buildCssRules = (styles: Record<string, Record<string, string>>, selectorPrefix: string, pseudoSelector = "") => {
            return Object.entries(styles).map(([selector, properties]) => {
                const cssSelector = `.${classPrefix} .slate-${selector}${pseudoSelector}`;
                const cssProperties = Object.entries(properties)
                    .map(([name, value]) => `${name}: ${value};`)
                    .join("\n    ");
                return `${cssSelector} {\n    ${cssProperties}\n}`;
            }).join("\n");
        };

        // Build CSS sections
        const flatCss = buildCssRules(flatStyles, "");
        const nestedCss = Object.entries(nestedStyles).map(([selector, properties]) => {
            const [parent, child] = selector.split(' ');
            const cssSelector = `.${classPrefix} .slate-${parent} .slate-${child}`;
            const cssProperties = Object.entries(properties)
                .map(([name, value]) => `${name}: ${value};`)
                .join("\n    ");
            return `${cssSelector} {\n    ${cssProperties}\n}`;
        }).join("\n");

        const marginBottomCss = buildCssRules(marginBottomStyles, "", ":not(:last-child)");
        const marginTopCss = buildCssRules(marginTopStyles, "", ":not(:first-child)");

        const listRelatedMarginCss = Object.entries(listRelatedMarginStyles).map(([selector, properties]) => {
            const [parent, child] = selector.split(' ');
            const cssSelector = `.${classPrefix} .slate-${parent} .slate-${child}:not(:first-child)`;
            const cssProperties = Object.entries(properties)
                .map(([name, value]) => `${name}: ${value};`)
                .join("\n    ");
            return `${cssSelector} {\n    ${cssProperties}\n}`;
        }).join("\n");

        // Combine all CSS sections
        return [
            flatCss,
            nestedCss,
            marginBottomCss,
            marginTopCss,
            listRelatedMarginCss
        ].filter(Boolean).join("\n");
    }, [classPrefix, element, nestedMarkdown]);

    return [classPrefix, cssClasses];
}
