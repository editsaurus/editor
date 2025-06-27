import {useConfigStore} from "@/store/useConfig.ts";
import {useControllerStore} from "@/store/useControllerStore.ts";
import {openFileInEditor, redo, undo} from "@/api/api.ts";
import {ToolbarContent} from "@/components/all/Toolbar/ToolbarContent.tsx";
import {sendSimpleAnalyticsEvent} from "@/analytics/analytics.ts";

export function FixedToolbar() {
    const {enabled, setEnabled} = useControllerStore();
    const currentFileName = useConfigStore(state => state.currentFileName);

    return <div className="fixed bottom-[50px]" style={{
        left: '50%',
        transform: 'translateX(-50%)'
    }}>
        <ToolbarContent onUndo={() => {
            undo(currentFileName);
            sendSimpleAnalyticsEvent("undo");
        }} onRedo={() => {
            redo(currentFileName);
            sendSimpleAnalyticsEvent("redo");
        }} onOpenIDE={() => {
            if (currentFileName) {
                openFileInEditor(currentFileName);
                sendSimpleAnalyticsEvent("open in editor");
            }
        }} controllerEnabled={enabled} onControllerToggle={(newEnabled) => {
            setEnabled(newEnabled);
            sendSimpleAnalyticsEvent(`controller ${newEnabled ? 'enabled' : 'disabled'}`);
        }}/>
    </div>
}
