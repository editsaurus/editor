import launch from "launch-editor";
import type {SectionLocation} from "../../../shared/apiTypes";

export function openEditor(location: SectionLocation) {

    const fileName = location.fileNamePath;
    const lineNumber = location?.lineStart ?? 0;
    const columnNumber = 0;

    try {
        launch(
            // filename:line:column
            // both line and column are optional
            `${fileName}:${lineNumber}:${columnNumber}`
        )

        return {
            success: true
        }
    } catch (e) {
        return {
            success: false
        }
    }
}
