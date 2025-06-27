import {BaseApiTypes, SectionInfoDetails} from "../../../shared/apiTypes";
import MagicString from 'magic-string';
import fs from "fs";
import {updateFileWithHistoryUpdate} from "../fileWatcher/historyController";

export async function submitAction(infoDetails: SectionInfoDetails): Promise<BaseApiTypes["submit"]["res"]> {
    const location = infoDetails.location;
    const content = infoDetails.markdown;

    const fileContent = fs.readFileSync(location.fileNamePath, 'utf8');
    const s = new MagicString(fileContent);

    const lines = fileContent.split('\n');
    const startLine = location.lineStart - 1;
    const endLine = location.lineEnd - 1;
    
    // Replace the lines directly
    lines.splice(startLine, endLine - startLine + 1, content);
    
    const updatedContent = lines.join('\n');
    s.overwrite(0, fileContent.length, updatedContent);

    const history = await updateFileWithHistoryUpdate(location.fileNamePath, s.toString());
    return {
        success: true,
        payload: history,
    }
}
