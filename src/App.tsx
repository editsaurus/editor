// import {ContentEditor} from "@/components/editor/ContentEditor.tsx";
// import {FixedToolbar} from "@/components/all/Toolbar/FixedToolbar.tsx";


import Example from './example.md';
import {Editsaurus} from "@/Editsaurus.tsx";

export default function App() {
    return (
        <>
            <div id={"__docusaurus"}>
                <div className="markdown" style={{padding: "100px", width: "600px", textAlign: "left"}}>
                    <Example/>
                </div>
                <Editsaurus/>
            </div>
        </>
    )
}
