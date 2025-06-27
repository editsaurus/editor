import type {PlateElementProps} from '@udecode/plate/react';

import {PlateElement} from '@udecode/plate/react';

import {cn} from '@/components/ui/lib/utils.ts';

export function ParagraphElement(props: PlateElementProps) {
    return (
        // <PlateElement {...props} className={cn('m-0 px-0 py-1')}>
            <PlateElement {...props} className={cn('')}>
            {props.children}
        </PlateElement>
    );
}
