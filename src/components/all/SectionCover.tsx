import React, { useCallback, useMemo } from "react";
import { getSectionInfo } from "@/api/api.ts";
import { useConfigStore } from "@/store/useConfig.ts";
import { getRelativeOffset } from "@/components/all/EditorController/utils/elementUtils.ts";
import { SideMenuButton } from "@/components/all/EditorController/SideMenu/SideMenuButton.tsx";
import { useSectionsStore } from "@/store/useSectionStore.ts";
import type { Section } from "@/components/all/types.ts";
import { EditorController, type EditorOperation } from "@/components/all/EditorController/EditorController.tsx";

// Custom hook for section positioning calculations
const useSectionPositioning = (section: Section) => {
  return useMemo(() => {
    const rect = section.element.getBoundingClientRect();
    const markdownRect = section.markdownElement.getBoundingClientRect();
    
    // Calculate offsets for proper positioning
    const offsets = section.innerMarkdown 
      ? { top: 100, left: 100 } 
      : getRelativeOffset(section.element, section.markdownElement);

    return {
      containerStyle: {
        position: "absolute" as const,
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX - 50,
        width: rect.height + 50,
        height: rect.width,
        cursor: "text" as const
      },
      editorStyle: {
        position: "absolute" as const,
        left: 50 - offsets.left,
        top: -offsets.top,
        width: markdownRect.width,
        height: "100%"
      },
      sideMenuStyle: {
        position: "absolute" as const,
        left: 0,
        top: 0,
        width: 50
      },
      buttonContainerStyle: {
        display: "flex" as const,
        flexDirection: "row" as const,
        paddingTop: /^h[1-3]$/.test(section.markdownElement.tagName.toLowerCase()) ? '0' : '4px'
      }
    };
  }, [section]);
};

// Custom hook for section info management
const useSectionInfo = (section: Section, currentFileName: string) => {
  return useMemo(() => {
    return getSectionInfo(
      currentFileName, 
      section.element.localName, 
      section.element.innerText, 
      section.childIndex
    );
  }, [currentFileName, section.childIndex, section.element.localName, section.element.innerText]);
};

// Custom hook for operations management
const useOperations = () => {
  const [operations, setOperations] = React.useState<EditorOperation[]>();
  const { setSectionOperation } = useSectionsStore();

  const handleSectionClick = useCallback((section: Section) => {
    if (section.operation === "edit") {
      setSectionOperation(section, "edit");
    }
  }, [setSectionOperation]);

  return {
    operations,
    setOperations,
    handleSectionClick
  };
};

// Side menu component with proper conditional rendering
const SectionSideMenu: React.FC<{ operations: EditorOperation[] | undefined }> = ({ operations }) => {
  const shouldShowButton = operations && operations.length > 0;
  
  if (!shouldShowButton) {
    return null;
  }

  return <SideMenuButton operations={operations} />;
};

// Main section cover component
type SectionCoverProps = {
  section: Section;
};

export function SectionCover({ section }: SectionCoverProps) {
  const currentFileName = useConfigStore(state => state.currentFileName);
  
  // Custom hooks for better separation of concerns
  const positioning = useSectionPositioning(section);
  const sectionInfoPromise = useSectionInfo(section, currentFileName);
  const { operations, setOperations, handleSectionClick } = useOperations();

  // Generate CSS class name
  const className = `editsaurus ${section.operation}`;

  return (
    <div className={className} style={positioning.containerStyle}>
      {/* Side Menu Area */}
      <div style={positioning.sideMenuStyle}>
        <div style={positioning.buttonContainerStyle}>
          <SectionSideMenu operations={operations} />
        </div>
      </div>

      {/* Editor Area */}
      <div
        className="editsaurus"
        style={positioning.editorStyle}
        onClick={() => handleSectionClick(section)}
      >
        <EditorController
          key={section.id}
          sectionId={section.id}
          element={section.markdownElement}
          nestedMarkdown={section.innerMarkdown}
          metadata={section.metadata}
          getSectionInfoPromise={sectionInfoPromise}
          onInit={setOperations}
          shouldCommitChanges={!section.shouldBeRemoved}
        />
      </div>
    </div>
  );
}
