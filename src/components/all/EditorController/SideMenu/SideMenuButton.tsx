import {Menu, ExternalLink, Trash2} from "lucide-react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {getDivInShadowRoot} from "@/components/all/ShadowDom/shadowDomUtils.ts";
import type {EditorOperation} from "@/components/all/EditorController/EditorController.tsx";

type Props = {
    operations?: EditorOperation[];
};

export function SideMenuButton({operations}: Props) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'open':
                return <ExternalLink className="size-4 text-foreground"/>;
            case 'delete':
                return <Trash2 className="size-4 text-red-500"/>;
            default:
                return null;
        }
    };

    const getClassName = (type: string) => {
        return `flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer outline-none ${
            type === 'delete' ? 'text-red-600' : 'text-foreground'
        }`;
    };

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button
                    className="editsaurus-clickable flex items-center justify-center h-8 w-8 rounded-md border-none hover:bg-muted transition-colors"
                    aria-label="Menu Options"
                >
                    <Menu className="size-5 text-muted-foreground"/>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal container={getDivInShadowRoot("ui")}>
                <DropdownMenu.Content
                    className="bg-popover rounded-md p-1 shadow-md border border-border w-fit"
                    sideOffset={5}
                >
                    {operations?.map((operation, index) => (
                        <DropdownMenu.Item
                            key={index}
                            className={getClassName(operation.type)}
                            onClick={operation.action}
                        >
                            {getIcon(operation.type)}
                            {operation.type === 'open' ? 'View in IDE' : 'Delete'}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
