import {BaseApiTypes, SectionContext} from "../../../shared/apiTypes";
import {fileInfoAction, sectionInfoAction} from "./info";
import {submitAction} from "./submit";
import {openEditor} from "./openEditor";
import {redoAction, undoAction} from "./history";
import {projectCwd} from "../cli";

export async function callToAction(url: string, body: unknown) {
    if (url.includes("/info")) {
        return processGetFileInfoRequest((body as BaseApiTypes["info"]["req"]).name);
    } else if (url.includes("/section-info")) {
        return processGetSectionInfoRequest(body as BaseApiTypes["section-info"]["req"]);
    } else if (url.includes("/submit")) {
        return submitAction(body as BaseApiTypes["submit"]["req"]);
    } else if (url.includes("/open")) {
        return openEditor(body as BaseApiTypes["open"]["req"]);
    } else if (url.includes("/undo")) {
        return undoAction((body as BaseApiTypes["undo"]["req"]).filePath);
    } else if (url.includes("/redo")) {
        return redoAction((body as BaseApiTypes["redo"]["req"]).filePath);
    }
}

export async function processGetSectionInfoRequest(sectionContext: SectionContext) {
    return sectionInfoAction(sectionContext);
}

export async function processGetFileInfoRequest(sourceName: string) {
    return fileInfoAction(projectCwd, sourceName);
}




