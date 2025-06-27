export type SectionContext = {
    htmlTag: string;
    filePath: string;
    outerText: string;
    sectionIndex: number;
}

export type APIResponse<T> = {
    success: boolean;
    message?: string;
    payload: T;
}

export type SectionLocation = {
    fileNamePath: string;
    lineStart: number;
    lineEnd: number;
}

export type SectionInfoDetails = {
    unsupported?: boolean;
    markdown: string;
    type?: "list" | "paragraph" | "heading" | "code" | "blockquote" | "table" | "image" | "link";
    location: SectionLocation;
}

export type FileInfoDetails = {
    filePath: string;
    // hasUndo: boolean;
}

export type FileHistoryStatus = {
    hasUndo: boolean;
    hasRedo: boolean;
}

export type BaseApiTypes = {
    open: {
        req: SectionLocation,
        res: APIResponse<void>,
    },
    // ai: {
    //     req: {
    //         uid: string;
    //         component: T,
    //         prompt: string,
    //         additionalPrompt: string,
    //     },
    // },
    submit: {
        req: SectionInfoDetails,
        res: APIResponse<FileHistoryStatus>
    },
    // add: {
    //     req: {
    //         insert: Insert;
    //         component: T,
    //         content: string,
    //     },
    //     // res: APIResponse
    // },
    // wrap: {
    //     req: {
    //         component: T,
    //         wrapComponentName: string,
    //     },
    //     // res: APIResponse
    // },
    // operation: {
    //     req: {
    //         operation: "delete" | "clone"
    //         component: T,
    //     },
    //     // res: APIResponse
    // },
    // user: {
    //     req: {
    //         token: string,
    //     },
    //     res: {
    //         success: boolean;
    //         message?: string;
    //         user?: User;
    //     }
    // },
    info: {
        req: { name: string },
        res: APIResponse<{ filePath: string } & FileHistoryStatus>
    },
    "section-info": {
        req: SectionContext,
        res: APIResponse<SectionInfoDetails>
    },
    undo: {
        req: { filePath: string },
        res: FileHistoryStatus
    }
    redo: {
        req: { filePath: string },
        res: FileHistoryStatus
    }
}

export type ClientApiTypes = keyof BaseApiTypes;
export type ClientRequest = BaseApiTypes[keyof BaseApiTypes]
// export type ClientResponseType = ClientApiTypes[keyof ClientApiTypes]["res"]
