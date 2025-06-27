import {useMemo} from 'react';
import type {Section, SectionMetadata} from "@/components/all/types.ts";
import {useHoveredElement} from "@/components/all/hooks/useHoveredElement.ts";

export const useHoveredSection = () => {
    const [hoveredElement, childIndex] = useHoveredElement();

    return useMemo<Section | undefined>(() => {
        if (!hoveredElement) {
            return undefined;
        }

        let markdownElement = hoveredElement;
        let metadata: SectionMetadata | undefined = undefined;
        if (hoveredElement.localName === "header") {
            markdownElement = hoveredElement.lastChild as HTMLElement;
            metadata = "header";
        }

        // else if (hoveredElement.classList.contains("theme-code-block")) {
        //     metadata = "code";
        //     const codeElement  = hoveredElement.querySelector("code");
        //     if (!codeElement) {
        //         throw new Error("failed to analyze");
        //     }
        //     markdownElement = codeElement;
        // }

        return {
            id: crypto.randomUUID(),
            childIndex: childIndex + 1000,
            operation: "hover",
            element: hoveredElement,
            markdownElement,
            innerMarkdown: markdownElement === hoveredElement,
            metadata,
            cover: null,
        };
    }, [childIndex, hoveredElement]);
};
