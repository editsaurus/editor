import {PlateElement, type PlateElementProps} from '@udecode/plate/react';
import {cn} from '@/components/ui/lib/utils.ts';

export function BlockquoteElement({
                                      className,
                                      children,
                                      ...props
                                  }: PlateElementProps) {
    return (
        <PlateElement
            className={cn(
                'border-l-2 border-muted-foreground/20 pl-6',
                className
            )}
            {...props}
        >
            <blockquote>{children}</blockquote>
        </PlateElement>
    );
}
