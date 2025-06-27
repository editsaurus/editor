import {useState, useEffect} from "react";

export const useHoveredElement = (): [HTMLElement | null, number] => {
    const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
    const [indexInMarkdownParent, setIndexInMarkdownParent] = useState<number>(-1);

    useEffect(() => {
        const findChildInMarkdownChain = (target: HTMLElement, markdownParent: HTMLElement): HTMLElement | null => {
            let childInChain: HTMLElement | null = target;
            
            while (childInChain && childInChain.parentElement !== markdownParent) {
                childInChain = childInChain.parentElement as HTMLElement | null;
            }
            
            return childInChain;
        };

        const getIndexInMarkdownParent = (childInChain: HTMLElement, markdownParent: HTMLElement): number => {
            const allSectionElements = Array.from(markdownParent.children);
            return allSectionElements.indexOf(childInChain);
        };

        const resetHoverState = () => {
            setHoveredElement(null);
            setIndexInMarkdownParent(-1);
        };

        const handleMouseOver = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Check if target is within docusaurus
            const hasDocusaurusParent = target.closest("#__docusaurus") !== null;
            if (!hasDocusaurusParent) {
                return;
            }

            // Skip elements with dynamic styles
            if (target.hasAttribute("data-dynamic-style")) {
                return;
            }

            const markdownParent = target.closest(".markdown") as HTMLElement | null;

            // Reset if hovering directly on markdown parent
            if (target === markdownParent) {
                resetHoverState();
                return;
            }

            const hasEditsaurus = target.closest(".editsaurus") !== null;

            if (markdownParent) {
                const childInChain = findChildInMarkdownChain(target, markdownParent);
                
                if (childInChain) {
                    const index = getIndexInMarkdownParent(childInChain, markdownParent);
                    setIndexInMarkdownParent(index);
                    setHoveredElement(childInChain);
                }
            } else if (!hasEditsaurus) {
                resetHoverState();
            }
        };

        document.addEventListener("mouseover", handleMouseOver);

        return () => {
            document.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    return [hoveredElement, indexInMarkdownParent];
};
