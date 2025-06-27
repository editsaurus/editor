import { createPortal } from "react-dom";
import { useThemeObserver } from "../hooks/useThemeObserver.ts";

type Props = {
  children: React.ReactNode;
  targetId: string;
}

export function ShadowDomPortal({ targetId, children }: Props) {
  const theme = useThemeObserver();
  const host = document.getElementById("host");
  const shadowRoot = host?.shadowRoot; // must be open mode
  const portalDiv = shadowRoot?.getElementById(targetId);

  if (!portalDiv) {
    // console.error("cnanot find portal div", targetId);
    return;
  }

  // Update theme class whenever theme changes
  portalDiv.className = `theme-editsaurus-${theme}`;

  return createPortal(children, portalDiv);
}
