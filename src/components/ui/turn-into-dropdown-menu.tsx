import type {DropdownMenuProps} from '@radix-ui/react-dropdown-menu';
import type {TElement} from '@udecode/plate';

import {DropdownMenuItemIndicator} from '@radix-ui/react-dropdown-menu';
import {BlockquotePlugin} from '@udecode/plate-block-quote/react';
// import {CodeBlockPlugin} from '@udecode/plate-code-block/react';
import {HEADING_KEYS} from '@udecode/plate-heading';
import {INDENT_LIST_KEYS, ListStyleType} from '@udecode/plate-indent-list';
import {
    ParagraphPlugin,
    useEditorRef,
    useSelectionFragmentProp,
} from '@udecode/plate/react';
import {
    CheckIcon,
    // FileCodeIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
    ListIcon,
    ListOrderedIcon,
    TypeIcon,
    QuoteIcon,
    SquareIcon,
} from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import {
    getBlockType,
    setBlockType,
    STRUCTURAL_TYPES,
} from '@/components/editor/transforms.ts';

import {ToolbarButton, ToolbarMenuGroup} from './toolbar.tsx';
import {useMemo, useState} from "react";

const turnIntoItems = [
    {
        icon: <TypeIcon/>,
        keywords: ['paragraph'],
        label: 'Text',
        value: ParagraphPlugin.key,
    },
    {
        icon: <Heading1Icon/>,
        keywords: ['title', 'h1'],
        label: 'Heading 1',
        value: HEADING_KEYS.h1,
    },
    {
        icon: <Heading2Icon/>,
        keywords: ['subtitle', 'h2'],
        label: 'Heading 2',
        value: HEADING_KEYS.h2,
    },
    {
        icon: <Heading3Icon/>,
        keywords: ['subtitle', 'h3'],
        label: 'Heading 3',
        value: HEADING_KEYS.h3,
    },
    {
        icon: <Heading4Icon/>,
        keywords: ['h4'],
        label: 'Heading 4',
        value: HEADING_KEYS.h4,
    },
    {
        icon: <Heading5Icon/>,
        keywords: ['h5'],
        label: 'Heading 5',
        value: HEADING_KEYS.h5,
    },
    {
        icon: <Heading6Icon/>,
        keywords: ['h6'],
        label: 'Heading 6',
        value: HEADING_KEYS.h6,
    },
    {
        icon: <ListIcon/>,
        keywords: ['unordered', 'ul', '-'],
        label: 'Bulleted list',
        value: ListStyleType.Disc,
    },
    {
        icon: <ListOrderedIcon/>,
        keywords: ['ordered', 'ol', '1'],
        label: 'Numbered list',
        value: ListStyleType.Decimal,
    },
    {
        icon: <SquareIcon/>,
        keywords: ['checklist', 'task', 'checkbox', '[]'],
        label: 'To-do list',
        value: INDENT_LIST_KEYS.todo,
    },
    // {
    //     icon: <FileCodeIcon/>,
    //     keywords: ['```'],
    //     label: 'Code',
    //     value: CodeBlockPlugin.key,
    // },
    {
        icon: <QuoteIcon/>,
        keywords: ['citation', 'blockquote', '>'],
        label: 'Quote',
        value: BlockquotePlugin.key,
    },
];

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
    const editor = useEditorRef();
    const [open, setOpen] = useState(false);

    const value = useSelectionFragmentProp({
        defaultValue: ParagraphPlugin.key,
        structuralTypes: STRUCTURAL_TYPES,
        getProp: (node) => getBlockType(node as TElement),
    });
    const selectedItem = useMemo(
        () =>
            turnIntoItems.find(
                (item) => item.value === (value ?? ParagraphPlugin.key)
            ) ?? turnIntoItems[0],
        [value]
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
            <DropdownMenuTrigger asChild>
                <ToolbarButton
                    className="min-w-[125px]"
                    pressed={open}
                    tooltip="Turn into"
                    isDropdown
                >
                    {selectedItem.label}
                </ToolbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="ignore-click-outside/toolbar min-w-0"
                onCloseAutoFocus={(e) => {
                    e.preventDefault();
                    editor.tf.focus();
                }}
                align="start"
            >
                <ToolbarMenuGroup
                    value={value}
                    onValueChange={(type) => {
                        setBlockType(editor, type);
                    }}
                    label="Turn into"
                >
                    {turnIntoItems.map(({icon, label, value: itemValue}) => (
                        <DropdownMenuRadioItem
                            key={itemValue}
                            className="min-w-[180px] pl-2 *:first:[span]:hidden"
                            value={itemValue}
                        >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon/>
                </DropdownMenuItemIndicator>
              </span>
                            {icon}
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </ToolbarMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
