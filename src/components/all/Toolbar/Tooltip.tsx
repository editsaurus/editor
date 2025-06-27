import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import {getDivInShadowRoot} from "@/components/all/ShadowDom/shadowDomUtils.ts";

type TooltipProps = {
    children: React.ReactNode;
    text: string;
};

export function Tooltip({children, text}: TooltipProps) {
    return (
        <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root delayDuration={500}>
                <TooltipPrimitive.Trigger asChild>
                    {children}
                </TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal container={getDivInShadowRoot("ui")}>
                    <TooltipPrimitive.Content
                        className="z-50 overflow-hidden rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                        sideOffset={5}
                    >
                        {text}
                        <TooltipPrimitive.Arrow className="fill-gray-800"/>
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}
