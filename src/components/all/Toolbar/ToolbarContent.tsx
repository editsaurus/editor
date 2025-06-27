import {Undo, Redo, Code, EllipsisVertical, Bug, Lightbulb, Star} from "lucide-react"
import * as Switch from "@radix-ui/react-switch"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {Tooltip} from "./Tooltip.tsx"
import { useConfigStore } from "@/store/useConfig.ts"
import {getDivInShadowRoot} from "@/components/all/ShadowDom/shadowDomUtils.ts"

export type Props = {
    onUndo: () => void;
    onRedo: () => void;
    onOpenIDE: () => void;
    controllerEnabled: boolean;
    onControllerToggle: (enabled: boolean) => void;
    message?: string;
};

const GITHUB_ISSUES_URL = "https://github.com/editsaurus/editor/issues";
const GITHUB_DISCUSSIONS_URL = "https://github.com/orgs/editsaurus/discussions";
const GITHUB_REPO_URL = "https://github.com/editsaurus/editor";

export function ToolbarContent({
                                                onUndo,
                                                onRedo,
                                                onOpenIDE,
                                                controllerEnabled,
                                                onControllerToggle,
                                                message
                                            }: Props) {
    const history = useConfigStore(state => state.history);

    return (
        <div>
            {/* Floating Control Bar */}
            <div>
                <div
                    className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 shadow-xl shadow-gray-900/10 ring-1 ring-gray-900/5" // Reduced px-6 to px-4
                    style={{
                        boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 20px rgba(34, 197, 94, 0.15)", // Adjusted glow color to green
                    }}
                >
                    <div className="flex items-center gap-3">
                        {/* Undo & Redo Buttons */}
                        <div className="flex items-center gap-2">
                            <Tooltip text="Undo">
                                <button
                                    onClick={onUndo}
                                    disabled={!history.hasUndo}
                                    className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Undo className="w-4 h-4"/>
                                </button>
                            </Tooltip>

                            <Tooltip text="Redo">
                                <button
                                    onClick={onRedo}
                                    disabled={!history.hasRedo}
                                    className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Redo className="w-4 h-4"/>
                                </button>
                            </Tooltip>
                        </div>

                        {/* Vertical Separator 1 */}
                        <div className="w-px h-6 bg-gray-300"/>

                        {/* Code Button */}
                        <Tooltip text="View in IDE">
                            <button
                                onClick={onOpenIDE}
                                className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 flex items-center justify-center">
                                <Code className="w-4 h-4"/>
                            </button>
                        </Tooltip>

                        {/* Vertical Separator 2 */}
                        <div className="w-px h-6 bg-gray-300"/>

                        {/* Optional message */}
                        {message && (
                            <>
                                <div className="px-2 py-1 text-sm leading-tight text-gray-700">{message}</div>
                                <div className="w-px h-6 bg-gray-300"/>
                            </>
                        )}

                        {/* Switch */}
                        <Switch.Root
                            checked={controllerEnabled}
                            onCheckedChange={() => onControllerToggle(!controllerEnabled)}
                            className="w-10 h-5 bg-gray-200 rounded-md relative data-[state=checked]:bg-green-500 outline-none cursor-pointer transition-colors duration-200 shadow-inner"
                        >
                            <Switch.Thumb
                                className="block w-4 h-4 bg-white rounded-sm transition-transform duration-200 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[20px] shadow-lg ring-1 ring-gray-900/5"/>
                        </Switch.Root>

                        {/* Menu Button */}
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button
                                    className="w-10 h-10 rounded-full bg-transparent hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 hover:scale-105 flex items-center justify-center">
                                    <EllipsisVertical className="w-4 h-4"/>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal container={getDivInShadowRoot("ui")}>
                                <DropdownMenu.Content
                                    className="bg-popover rounded-md p-1 shadow-md border border-border w-fit"
                                    sideOffset={5}
                                >
                                    <DropdownMenu.Item
                                        asChild
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer outline-none text-foreground"
                                    >
                                        <a href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full h-full">
                                            <Bug className="size-4 text-muted-foreground" />
                                            Report an Issue
                                        </a>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        asChild
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer outline-none text-foreground"
                                    >
                                        <a href={GITHUB_DISCUSSIONS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full h-full">
                                            <Lightbulb className="size-4 text-muted-foreground" />
                                            Request a Feature
                                        </a>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item
                                        asChild
                                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer outline-none text-foreground"
                                    >
                                        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full h-full">
                                            <Star className="size-4 text-yellow-400" />
                                            Give us a GitHub Star
                                        </a>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </div>
            </div>
        </div>
    )
}
