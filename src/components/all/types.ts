export type SectionOperation = "hover" | "edit";

export type ElementWrapper = {
    operation: SectionOperation;
    id: string;
    element: HTMLElement;
}

export type SectionMetadata = "header";

export type Section = ElementWrapper & {
    metadata?: SectionMetadata;
    cover: HTMLElement | null;
    childIndex: number;
    markdownElement: HTMLElement;
    innerMarkdown: boolean;
    shouldBeRemoved?: boolean;
}
