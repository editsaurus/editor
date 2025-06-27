import React, {useEffect} from "react";
import {SectionCover} from "./SectionCover.tsx";
import {useSectionsStore} from "@/store/useSectionStore.ts";

export function Sections() {
    const {sections, commitAll} = useSectionsStore();

    useEffect(() => {
        const handleDocumentClick = (event: MouseEvent) => {
            const docusaurusRoot = document.getElementById('__docusaurus');
            if (!docusaurusRoot) return;

            // Check if the click is within the docusaurus root
            if (!docusaurusRoot.contains(event.target as Node)) {
                commitAll();
            }
        };

        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [commitAll]);

    return <>{sections.map((section) => (
        <React.Fragment key={section.id + "broken"}>
            <SectionCover
                section={section}
            />
        </React.Fragment>
    ))}
    </>;
}
