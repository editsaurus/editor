import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {useElementSize, useMergedRef} from "@mantine/hooks";
import {openSectionInEditor, submit} from "@/api/api.ts";
import {useSectionsStore} from "@/store/useSectionStore.ts";

import getCssSelector from "css-selector-generator";
import type {SectionMetadata} from "../types.ts";
import {useAllSectionDynamicStyles} from "@/components/all/EditorController/hooks/useAllSectionDynamicStyles.ts";
import {checkContentChange} from "@/components/all/EditorController/utils/elementUtils.ts";
import {useDynamicPaddingWithDataAttribute} from "@/components/all/EditorController/hooks/useDynamicStyles.ts";
import type {BaseApiTypes, SectionLocation} from "../../../../shared/apiTypes.ts";
import {ContentEditor, type CreateEditorOptions} from "@/components/editor/ContentEditor.tsx";

export type EditorOperation = {
    type: "delete" | "open",
    action: () => void;
}

type Props = {
    sectionId: string;
    element: HTMLElement;
    nestedMarkdown: boolean;
    metadata?: SectionMetadata;
    getSectionInfoPromise: Promise<BaseApiTypes["section-info"]["res"]>;
    shouldCommitChanges: boolean;
    onInit: (callbacks: EditorOperation[]) => void;
}

const normalizeSpaces = (content: string) => {
    return content.replace(/\s+/g, "");
};

export function EditorController({
                                     sectionId,
                                     element,
                                     metadata,
                                     nestedMarkdown,
                                     getSectionInfoPromise,
                                     shouldCommitChanges,
                                     onInit,
                                 }: Props) {
    const [sectionLocation, setSectionLocation] = useState<SectionLocation | undefined>();
    const [originalMarkdown, setOriginalMarkdown] = useState("");
    const [changedMarkdown, setChangedMarkdown] = useState<string | undefined>();
    const [unsupported, setUnsupported] = useState(false);

    const [runningCommiting, setRunningCommiting] = useState(false);

    const {removeSection} = useSectionsStore();

    const originalElementHeight = useMemo(() => element.getBoundingClientRect().height, [element]);

    const [setOpacityToZero, setHeightToHiddenElement] = useDynamicPaddingWithDataAttribute(element);

    const init = useCallback(async () => {
        const result = await getSectionInfoPromise;
        if (!result.success) {
            setUnsupported(true);
            return;
        }

        if (result.payload.unsupported) {
            setUnsupported(true);
        }

        const infoDetails = result.payload;

        if (infoDetails.markdown && !infoDetails.unsupported) {
            // normalize spaces and remove new lines
            if (infoDetails.type === "list") {
                setOriginalMarkdown(infoDetails.markdown);
            } else {
                setOriginalMarkdown(infoDetails.markdown.replace(/\n/g, " ").replace(/\s+/g, " "));
            }

            setTimeout(() => {
                setOpacityToZero();
            }, 100);
        }

        if (infoDetails.location) {
            setSectionLocation(infoDetails.location);
            onInit([{
                type: "open" as const,
                action: () => {
                    openSectionInEditor(infoDetails.location);
                }
            }, ...(metadata !== "header" ? [{
                type: "delete" as const,
                action: () => {
                    submit(infoDetails.location, "");
                    removeSection(sectionId);
                }
            }] : [])]);
        }
    }, [getSectionInfoPromise, onInit, removeSection, sectionId, setOpacityToZero, metadata]);

    //TODO: make it one time only and not on every cover selection
    // apply dynamic styles of the markdown root
    const [rootClassPrefix, cssClassesString] = useAllSectionDynamicStyles(element, nestedMarkdown);

    useEffect(() => {
        init();
    }, [init, element]);

    const tryToCommitChangesIfNeeded = useCallback(async () => {
        if (runningCommiting) {
            return;
        }

        if (sectionLocation && changedMarkdown !== undefined && changedMarkdown === originalMarkdown) {
            setRunningCommiting(true);
            await submit(sectionLocation, changedMarkdown);
            const parentElement = element.parentElement;

            if (parentElement) {
                // const parentSelector = getElementSelector(parentElement);

                const parentSelector = getCssSelector(parentElement, {
                    selectors: ["class", "tag", "id"],
                    blacklist: [
                        /data-.*$/ // Regular expression to match any data-* attribute
                    ]
                });

                const beforeChangeContent = parentElement.innerHTML;

                if (beforeChangeContent) {
                    checkContentChange(parentSelector, beforeChangeContent, () => {
                        setTimeout(() => {
                            removeSection(sectionId);
                            setRunningCommiting(false);
                        }, 5000);
                    }, () => {
                        //TODO: need to decide what to do it a case of an error
                    });
                }
            }
        } else {
            removeSection(sectionId);
        }
    }, [runningCommiting, sectionLocation, changedMarkdown, originalMarkdown, element.parentElement, removeSection, sectionId]);

    useEffect(() => {
        if (shouldCommitChanges || !shouldCommitChanges) {
            tryToCommitChangesIfNeeded();
        }
    }, [tryToCommitChangesIfNeeded, shouldCommitChanges, removeSection, sectionId])


    const {ref: resizeRef, height} = useElementSize();

    useLayoutEffect(() => {
        setHeightToHiddenElement(height);
    }, [element, height, originalElementHeight, setHeightToHiddenElement]);


    const mergedRef = useMergedRef(
        resizeRef
    );

    const handleOnChange = useCallback((markdown: string) => {
        setChangedMarkdown(markdown.replace(/\n/g, ""));
    }, []);

    const editorOptions = useMemo<CreateEditorOptions | undefined>(() => {
        if (metadata === "header") {
            return {
                disableFloatingToolbar: false
            };
        }
    }, [metadata]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
        }
    };

    if (!element || originalMarkdown || unsupported) {
        return;
    }

    return <div ref={mergedRef} key={sectionId} className={rootClassPrefix} /*data-gramm="false"*/
                onKeyDown={handleKeyDown}>
        <style>{cssClassesString}</style>
        <ContentEditor markdown={originalMarkdown} onChange={handleOnChange} editorOptions={editorOptions}/>
    </div>;
}
