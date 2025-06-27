import {createRoot} from "react-dom/client";
import {Editsaurus} from "./Editsaurus.tsx";

setTimeout(() => {
    const root = document.getElementById("__editsaurus");

    if (root) {
        createRoot(root).render(<Editsaurus/>);
    } else {
        console.error("No root found!");
    }
}, 1000);
