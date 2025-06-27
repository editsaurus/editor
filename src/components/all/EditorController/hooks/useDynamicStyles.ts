import {useCallback, useEffect, useRef} from 'react';
import {getShadowRoot} from "@/components/all/ShadowDom/shadowDomUtils.ts";

// Constants
const DATA_ATTRIBUTE_NAME = 'data-dynamic-style';
const STYLE_ID_PREFIX = 'dynamic-style-';

// Types
interface DynamicStyleRefs {
  styleSheet: CSSStyleSheet | null;
  styleId: string | null;
  styleElement: HTMLStyleElement | null;
}

interface StyleRule {
  selector: string;
  property: string;
  value: string;
}

/**
 * Hook for managing dynamic styles on HTML elements using data attributes
 * @param targetElement - The HTML element to apply dynamic styles to
 * @returns Tuple containing functions to set opacity to zero and set height
 */
export const useDynamicPaddingWithDataAttribute = (targetElement: HTMLElement | null) => {
    const refs = useRef<DynamicStyleRefs>({
        styleSheet: null,
        styleId: null,
        styleElement: null,
    });

    /**
     * Generates a unique style ID
     */
    const generateStyleId = useCallback((): string => {
        return `${STYLE_ID_PREFIX}${Math.random().toString(36).substring(2, 9)}`;
    }, []);

    /**
     * Creates a unique CSS selector for the target element
     */
    const createSelector = useCallback((styleId: string): string => {
        return `[${DATA_ATTRIBUTE_NAME}="${styleId}"]`;
    }, []);

    /**
     * Finds a CSS rule by selector in the stylesheet
     */
    const findStyleRule = useCallback((selector: string): CSSStyleRule | null => {
        if (!refs.current.styleSheet) return null;

        const rules = Array.from(refs.current.styleSheet.cssRules) as CSSStyleRule[];
        return rules.find((rule) => rule.selectorText === selector) || null;
    }, []);

    /**
     * Applies a style rule to the target element
     */
    const applyStyleRule = useCallback(({ selector, property, value }: StyleRule): void => {
        const rule = findStyleRule(selector);
        if (rule) {
            rule.style[property as any] = value;
        }
    }, [findStyleRule]);

    /**
     * Sets up the dynamic styling system
     */
    const setupDynamicStyling = useCallback((element: HTMLElement): (() => void) => {
        // Generate unique ID and create selector
        const styleId = generateStyleId();
        const selector = createSelector(styleId);
        
        // Set data attribute on target element
        element.setAttribute(DATA_ATTRIBUTE_NAME, styleId);
        
        // Create and append style element
        const styleElement = document.createElement('style');
        const shadowRoot = getShadowRoot();
        
        if (shadowRoot?.host) {
            shadowRoot.host.appendChild(styleElement);
        } else {
            console.warn('Shadow root not found, falling back to document.head');
            document.head.appendChild(styleElement);
        }
        
        // Get stylesheet and initialize with empty rule
        const sheet = styleElement.sheet as CSSStyleSheet;
        sheet.insertRule(`${selector} {}`, 0);
        
        // Store references
        refs.current = {
            styleSheet: sheet,
            styleId,
            styleElement,
        };
        
        // Return cleanup function
        return () => {
            element.removeAttribute(DATA_ATTRIBUTE_NAME);
            if (styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement);
            }
            refs.current = {
                styleSheet: null,
                styleId: null,
                styleElement: null,
            };
        };
    }, [generateStyleId, createSelector]);

    // Effect to set up and clean up dynamic styling
    useEffect(() => {
        if (!targetElement) return;

        const cleanup = setupDynamicStyling(targetElement);
        return cleanup;
    }, [targetElement, setupDynamicStyling]);

    /**
     * Sets the opacity of the target element to zero
     */
    const setOpacityToZero = useCallback((): void => {
        if (!refs.current.styleSheet || !refs.current.styleId) {
            console.warn('Dynamic styling not initialized');
            return;
        }

        const selector = createSelector(refs.current.styleId);
        applyStyleRule({
            selector,
            property: 'opacity',
            value: '0',
        });
    }, [createSelector, applyStyleRule]);

    /**
     * Sets the height of the target element
     * @param height - Height in pixels
     */
    const setHeight = useCallback((height: number): void => {
        if (!refs.current.styleSheet || !refs.current.styleId) {
            console.warn('Dynamic styling not initialized');
            return;
        }

        if (height < 0) {
            console.warn('Height cannot be negative');
            return;
        }

        const selector = createSelector(refs.current.styleId);
        applyStyleRule({
            selector,
            property: 'height',
            value: `${height}px`,
        });
    }, [createSelector, applyStyleRule]);

    return [setOpacityToZero, setHeight] as const;
}

