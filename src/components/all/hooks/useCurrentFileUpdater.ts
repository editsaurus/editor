import {useConfigStore} from "@/store/useConfig.ts";
import {getFileInfo} from "@/api/api.ts";
import {useLocation} from "wouter";
import {useEffect} from "react";

export function useCurrentFileUpdater() {
    const setCurrentFile = useConfigStore(state => state.setCurrentFileName);
    const setHistory = useConfigStore(state => state.setHistory);

    const [location] = useLocation();

    useEffect(() => {
        const fetchFileInfo = async () => {
            const response = await getFileInfo();
            if (response.success) {
                const fileInfoDetails = response.payload;
                setHistory({
                    hasUndo: fileInfoDetails.hasUndo,
                    hasRedo: fileInfoDetails.hasRedo,
                });
                setCurrentFile(fileInfoDetails.filePath);
            }

        };
        fetchFileInfo();
    }, [location, setCurrentFile, setHistory]);
}
