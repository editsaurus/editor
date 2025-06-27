import * as React from 'react';

import type {TSlashInputElement} from '@udecode/plate-slash-command';
import {BlockquotePlugin} from '@udecode/plate-block-quote/react';
// import {CalloutPlugin} from '@udecode/plate-callout/react';
// import {CodeBlockPlugin} from '@udecode/plate-code-block/react';
import {HEADING_KEYS} from '@udecode/plate-heading';
import {INDENT_LIST_KEYS, ListStyleType} from '@udecode/plate-indent-list';
// import {TablePlugin} from '@udecode/plate-table/react';
import {ParagraphPlugin, type PlateEditor, PlateElement, type PlateElementProps,} from '@udecode/plate/react';
import {
    // ChevronRightIcon,
    // Code2,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    Heading4Icon,
    Heading5Icon,
    Heading6Icon,
    // LightbulbIcon,
    ListIcon,
    ListOrdered,
    TypeIcon,
    Quote,
    Square,
    // Table,
} from 'lucide-react';

import {insertBlock,} from '@/components/editor/transforms.ts';

import {
    InlineCombobox,
    InlineComboboxContent,
    InlineComboboxEmpty,
    InlineComboboxGroup,
    InlineComboboxGroupLabel,
    InlineComboboxInput,
    InlineComboboxItem,
} from './inline-combobox.tsx';

type Group = {
    group: string;
    items: Item[];
};

interface Item {
    icon: React.ReactNode;
    value: string;
    onSelect: (editor: PlateEditor, value: string) => void;
    className?: string;
    focusEditor?: boolean;
    keywords?: string[];
    label?: string;
}

const groups: Group[] = [
    // {
    //   group: 'AI',
    //   items: [
    //     {
    //       focusEditor: false,
    //       icon: <SparklesIcon />,
    //       value: 'AI',
    //       onSelect: (editor) => {
    //         editor.getApi(AIChatPlugin).aiChat.show();
    //       },
    //     },
    //   ],
    // },
    {
        group: 'Basic blocks',
        items: [
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
                icon: <ListOrdered/>,
                keywords: ['ordered', 'ol', '1'],
                label: 'Numbered list',
                value: ListStyleType.Decimal,
            },
            {
                icon: <Square/>,
                keywords: ['checklist', 'task', 'checkbox', '[]'],
                label: 'To-do list',
                value: INDENT_LIST_KEYS.todo,
            },
            // {
            //     icon: <Code2/>,
            //     keywords: ['```'],
            //     label: 'Code Block',
            //     value: CodeBlockPlugin.key,
            // },
            // {
            //     icon: <Table/>,
            //     label: 'Table',
            //     value: TablePlugin.key,
            // },
            {
                icon: <Quote/>,
                keywords: ['citation', 'blockquote', 'quote', '>'],
                label: 'Blockquote',
                value: BlockquotePlugin.key,
            },
            // {
            //     description: 'Insert a highlighted block.',
            //     icon: <LightbulbIcon/>,
            //     keywords: ['note'],
            //     label: 'Callout',
            //     value: CalloutPlugin.key,
            // },
        ].map((item) => ({
            ...item,
            onSelect: (editor, value) => {
                insertBlock(editor, value);
            },
        })),
    },
    // {
    //   group: 'Advanced blocks',
    //   items: [
    //     {
    //       icon: <TableOfContentsIcon />,
    //       keywords: ['toc'],
    //       label: 'Table of contents',
    //       value: TocPlugin.key,
    //     },
    //     {
    //       icon: <Columns3Icon />,
    //       label: '3 columns',
    //       value: 'action_three_columns',
    //     },
    //     {
    //       focusEditor: false,
    //       icon: <RadicalIcon />,
    //       label: 'Equation',
    //       value: EquationPlugin.key,
    //     },
    //   ].map((item) => ({
    //     ...item,
    //     onSelect: (editor, value) => {
    //       insertBlock(editor, value);
    //     },
    //   })),
    // },
    // {
    //   group: 'Inline',
    //   items: [
    //     {
    //       focusEditor: true,
    //       icon: <CalendarIcon />,
    //       keywords: ['time'],
    //       label: 'Date',
    //       value: DatePlugin.key,
    //     },
    //     {
    //       focusEditor: false,
    //       icon: <RadicalIcon />,
    //       label: 'Inline Equation',
    //       value: InlineEquationPlugin.key,
    //     },
    //   ].map((item) => ({
    //     ...item,
    //     onSelect: (editor, value) => {
    //       insertInlineElement(editor, value);
    //     },
    //   })),
    // },
];

export function SlashInputElement(
    props: PlateElementProps<TSlashInputElement>
) {
    const {editor, element} = props;

    return (
        <PlateElement {...props} as="span" data-slate-value={element.value}>
            <InlineCombobox element={element} trigger="/">
                <InlineComboboxInput/>

                <InlineComboboxContent>
                    <InlineComboboxEmpty>No results</InlineComboboxEmpty>

                    {groups.map(({group, items}) => (
                        <InlineComboboxGroup key={group}>
                            <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>

                            {items.map(
                                ({focusEditor, icon, keywords, label, value, onSelect}) => (
                                    <InlineComboboxItem
                                        key={value}
                                        value={value}
                                        onClick={() => onSelect(editor, value)}
                                        label={label}
                                        focusEditor={focusEditor}
                                        group={group}
                                        keywords={keywords}
                                    >
                                        <div className="mr-2 text-muted-foreground">{icon}</div>
                                        {label ?? value}
                                    </InlineComboboxItem>
                                )
                            )}
                        </InlineComboboxGroup>
                    ))}
                </InlineComboboxContent>
            </InlineCombobox>

            {props.children}
        </PlateElement>
    );
}
