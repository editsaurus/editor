import {
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    UnderlinePlugin,
} from '@udecode/plate-basic-marks/react';
import {useEditorReadOnly} from '@udecode/plate/react';
import {
    BoldIcon,
    Code2Icon,
    ItalicIcon,
    StrikethroughIcon,
    UnderlineIcon,
    WandSparklesIcon,
} from 'lucide-react';

import {AIToolbarButton} from './ai-toolbar-button.tsx';
import {CommentToolbarButton} from './comment-toolbar-button.tsx';
import {LinkToolbarButton} from './link-toolbar-button.tsx';
import {MarkToolbarButton} from './mark-toolbar-button.tsx';
import {MoreDropdownMenu} from './more-dropdown-menu.tsx';
import {SuggestionToolbarButton} from './suggestion-toolbar-button.tsx';
import {ToolbarGroup} from './toolbar.tsx';
import {TurnIntoDropdownMenu} from './turn-into-dropdown-menu.tsx';

export function FloatingToolbarButtons() {
    const readOnly = useEditorReadOnly();

    return (
        <>
            {!readOnly && (
                <>
                    <ToolbarGroup>
                        <AIToolbarButton tooltip="AI commands">
                            <WandSparklesIcon/>
                            Ask AI
                        </AIToolbarButton>
                    </ToolbarGroup>

                    <ToolbarGroup>
                        <TurnIntoDropdownMenu/>

                        <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
                            <BoldIcon/>
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={ItalicPlugin.key}
                            tooltip="Italic (⌘+I)"
                        >
                            <ItalicIcon/>
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={UnderlinePlugin.key}
                            tooltip="Underline (⌘+U)"
                        >
                            <UnderlineIcon/>
                        </MarkToolbarButton>

                        <MarkToolbarButton
                            nodeType={StrikethroughPlugin.key}
                            tooltip="Strikethrough (⌘+⇧+M)"
                        >
                            <StrikethroughIcon/>
                        </MarkToolbarButton>

                        <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code (⌘+E)">
                            <Code2Icon/>
                        </MarkToolbarButton>

                        {/*<InlineEquationToolbarButton/>*/}

                        <LinkToolbarButton/>
                    </ToolbarGroup>
                </>
            )}

            <ToolbarGroup>
                <CommentToolbarButton/>
                <SuggestionToolbarButton/>

                {!readOnly && <MoreDropdownMenu/>}
            </ToolbarGroup>
        </>
    );
}
