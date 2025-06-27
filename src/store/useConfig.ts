import type {FileHistoryStatus} from "../../shared/apiTypes.ts";
import {create} from "zustand";

type ConfigStore = {
    currentFileName: string;
    history: FileHistoryStatus;
    setCurrentFileName: (fileName: string) => void;
    setHistory: (historyState: FileHistoryStatus) => void;
}

export const useConfigStore = create<ConfigStore>((set) => ({
    currentFileName: '',
    history: {hasUndo: false, hasRedo: false},
    setCurrentFileName: (currentFileName) => set(() => ({currentFileName})),
    setHistory: (history) => set(() => ({history})),
}))
