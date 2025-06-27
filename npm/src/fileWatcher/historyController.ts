import chokidar from 'chokidar';
import fs from 'fs';

const fileHistory: Record<string, string[]> = {}; // Keeps track of file content history
const currentIndex: Record<string, number> = {}; // Tracks the current position in the history (undo/redo index)
const disabled: Record<string, boolean> = {};
let lastUpdatedFile: string | null = null;


export type UndoRedoStatus = {
    hasUndo: boolean;
    hasRedo: boolean;
}

export function watchFile(filePath: string): void {
    if (fileHistory[filePath]) {
        return;
    }

    // Initialize history with the initial content of the file
    const initialData = fs.readFileSync(filePath, 'utf-8');
    fileHistory[filePath] = [initialData];  // Start with initial data
    currentIndex[filePath] = 0;  // Set the starting index

    const watcher = chokidar.watch(filePath, {
        persistent: true
    });

    watcher.on('change', (path: string) => {
        if (disabled[path]) {
            disabled[path] = false;
            return;
        }
        // Clear redo history when a new change is made
        if (fileHistory[filePath].length > currentIndex[filePath] + 1) {
            // Truncate history after the current index
            fileHistory[filePath] = fileHistory[filePath].slice(0, currentIndex[filePath] + 1);
        }

        const data = fs.readFileSync(path, 'utf-8');
        fileHistory[filePath].push(data);
        currentIndex[filePath] = fileHistory[filePath].length - 1; // Update the index to the new change
        lastUpdatedFile = filePath;
    });
}


export function hasHistory(filePath: string) {
    const fileData = fileHistory[filePath];
    if (!fileData || fileData.length === 0) {
        return {
            hasUndo: false,
            hasRedo: false
        };
    }

    const index = currentIndex[filePath] || 0;
    const hasUndo = index > 0;
    const hasRedo = index < fileData.length - 1;

    return {
        hasUndo,
        hasRedo
    };
}

export async function updateFileWithHistoryUpdate(filePath: string, content: string): Promise<UndoRedoStatus> {
    const watcher = chokidar.watch(filePath, {
        persistent: true
    });

    return new Promise((resolve) => {
        const innerCallback = async () => {
            const historyStatus = hasHistory(filePath);
            resolve(historyStatus);
            watcher.off("change", innerCallback);
        }

        watcher.on('change', innerCallback);
        fs.writeFileSync(filePath, content);
    });
}

export async function undo(filePath: string) {
    const index = currentIndex[filePath] || 0;
    if (index === 0) {
        return hasHistory(filePath); // No more history to undo
    }

    // Move the index back for undo
    currentIndex[filePath] = index - 1;
    const undoContent = fileHistory[filePath][currentIndex[filePath]];

    disabled[filePath] = true;
    return updateFileWithHistoryUpdate(filePath, undoContent);
}

export async function redo(filePath: string) {
    const index = currentIndex[filePath] || 0;
    if (index === fileHistory[filePath].length - 1) {
        return hasHistory(filePath); // No more history to redo
    }

    // Move the index forward for redo
    currentIndex[filePath] = index + 1;
    const redoContent = fileHistory[filePath][currentIndex[filePath]];

    disabled[filePath] = true;
    return updateFileWithHistoryUpdate(filePath, redoContent);
}

