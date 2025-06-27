import {useLayoutEffect, useState} from 'react';

import {Plate} from '@udecode/plate/react';

import {Editor, EditorContainer} from "@/components/ui/editor.tsx";
import {FloatingToolbar} from "@/components/ui/floating-toolbar.tsx";
import {TurnIntoDropdownMenu} from "@/components/ui/turn-into-dropdown-menu.tsx";
import {MarkToolbarButton} from "@/components/ui/mark-toolbar-button.tsx";
import {
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    UnderlinePlugin
} from "@udecode/plate-basic-marks/react";
import {BoldIcon, Code2Icon, ItalicIcon, StrikethroughIcon, UnderlineIcon} from "lucide-react";
import {LinkToolbarButton} from "@/components/ui/link-toolbar-button.tsx";
import {useCreateEditor} from "@/components/editor/useCreateEditor.tsx";
import {ShadowDomPortal} from "@/components/all/ShadowDom/ShadowDomPortal.tsx";
// import type { TElement, TText } from '@udecode/plate';


export type CreateEditorOptions = {
    disableFloatingToolbar?: boolean;
}

const defaultOptions: CreateEditorOptions = {
    disableFloatingToolbar: false
}

type Props = {
    markdown: string;
    editorOptions?: CreateEditorOptions;
    onChange: (markdown: string) => void;
}

export function ContentEditor({markdown, editorOptions = defaultOptions, onChange}: Props) {
    const editor = useCreateEditor();

    const [initCompleted, setInitCompleted] = useState(false);

    useLayoutEffect(() => {
        const newValue = editor.api.markdown.deserialize(markdown);
        editor.tf.setValue(newValue);
        setInitCompleted(true);
    }, [editor.api.markdown, editor.tf, markdown]);

    return (
        <Plate editor={editor} onValueChange={() => {
            if (initCompleted) {
                // const value = editor.children as TElement[];

                // check all nodes for consecutive empty blocks
                // for (let i = 0; i < value.length - 1; i++) {
                //     const currentNode = value[i];
                //     const nextNode = value[i + 1];
                //
                //     if (currentNode && nextNode &&
                //         (!currentNode.children?.[0]?.text || (currentNode.children[0] as TText).text === '') &&
                //         (!nextNode.children?.[0]?.text || (nextNode.children[0] as TText).text === '')) {
                //         // remove the second empty block
                //         editor.tf.removeNodes({ at: [i + 1] });
                //         break; // exit after removing one pair to let the next onChange handle any other pairs
                //     }
                // }
                onChange(editor.api.markdown.serialize());
            }
        }}>
            <EditorContainer>         {/* Styles the editor area */}
                <Editor variant="none" placeholder="Type your amazing content here..."/>

                {!editorOptions?.disableFloatingToolbar && <ShadowDomPortal targetId="ui">
                    <FloatingToolbar>
                        <TurnIntoDropdownMenu/>
                        <div className="w-2"></div>

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

                        <LinkToolbarButton/>
                    </FloatingToolbar>
                </ShadowDomPortal>}

            </EditorContainer>
        </Plate>

    );
}
