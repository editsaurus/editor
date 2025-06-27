import {useEffect} from "react";

import {useSectionsStore} from "@/store/useSectionStore.ts";
import {useHoveredSection} from "./useHoveredSection.ts";

export function useSectionsListenersInit(): void {
    const hoveredSection = useHoveredSection();
    const {cleanAllHovered, addSection} = useSectionsStore();

    useEffect(() => {
        if (hoveredSection) {
            cleanAllHovered();
            addSection(hoveredSection);
        }
    }, [hoveredSection, addSection, cleanAllHovered]);
}
