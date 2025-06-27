'use client';

import * as React from 'react';

import {ParagraphPlugin} from '@udecode/plate/react';
import {
    type PlaceholderProps,
    createNodeHOC,
    createNodesHOC,
    usePlaceholderState,
} from '@udecode/plate/react';

import {cn} from '@/components/ui/lib/utils.ts';
import {HEADING_KEYS} from "@udecode/plate-heading";

export const Placeholder = (props: PlaceholderProps) => {
    const {attributes, children, placeholder} = props;

    const {enabled} = usePlaceholderState(props);

    return React.Children.map(children, (child) => {
        return React.cloneElement(child, {
            attributes: {
                ...attributes,
                className: cn(
                    attributes.className,
                    enabled &&
                    'before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]'
                ),
                placeholder,
            },
        });
    });
};

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

export const withPlaceholders = (components: any) =>
    withPlaceholdersPrimitive(components, [
        {
            key: ParagraphPlugin.key,
            hideOnBlur: true,
            placeholder: 'Type your text here...',
            query: {
                maxLevel: 1,
            },
        },
        {
            key: HEADING_KEYS.h1,
            hideOnBlur: false,
            placeholder: 'Type your title...',
        },
        {
            key: HEADING_KEYS.h2,
            hideOnBlur: false,
            placeholder: 'Type your section...',
        },
        {
            key: HEADING_KEYS.h3,
            hideOnBlur: false,
            placeholder: 'Type your subsection...',
        },
        {
            key: HEADING_KEYS.h4,
            hideOnBlur: false,
            placeholder: 'Type your minor section...',
        },
        {
            key: HEADING_KEYS.h5,
            hideOnBlur: false,
            placeholder: 'Type your subsection...',
        },
        {
            key: HEADING_KEYS.h6,
            hideOnBlur: false,
            placeholder: 'Type your minor subsection...',
        },
    ]);
