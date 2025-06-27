import {BaseApiTypes} from "../../../shared/apiTypes";
import {redo, undo} from "../fileWatcher/historyController";

export async function undoAction(filePath: string): Promise<BaseApiTypes["undo"]["res"]> {
    return undo(filePath);
}

export function redoAction(filePath: string): Promise<BaseApiTypes["redo"]["res"]> {
    return redo(filePath);
}
