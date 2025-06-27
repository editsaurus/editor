import path from "path";
import fs from "fs";


export function detectFileFullPath(projectPath: string, routePath: string): string | undefined {

    const pathWithoutExtension = findRelativePathNew(routePath, path.join(projectPath, ".editsaurus", "info.json"));

    const mdFile = path.join(projectPath, pathWithoutExtension + ".md");
    const mdxFile = path.join(projectPath, pathWithoutExtension + ".mdx");

    if (fs.existsSync(mdFile)) {
        return mdFile;
    } else if (fs.existsSync(mdxFile)) {
        return mdxFile;
    }
}

function findFile(folder: string, fileName: string): string | undefined {
    const files = fs.readdirSync(folder);
    for (const file of files) {
        const filePath = path.join(folder, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            const foundFile = findFile(filePath, fileName);
            if (foundFile) {
                return foundFile;
            }
        } else if (file === `${fileName}.md` || file === `${fileName}.mdx`) {
            return filePath;
        }
    }
}

function findRelativePathNew(route: string, jsonFilePath: string): string | undefined {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

    const content = data["docusaurus"];
    for (const rootKey in content) {
        const rootPath = content[rootKey].path; // Example: "/docs" or "/ui-components"
        for (const version of content[rootKey].versions) {
            for (const doc of version.docs) {
                if (doc.path === route) {
                    if (rootKey === "default") { // Logic inverted - should be !==
                        return doc.path.replace(rootPath, rootKey);
                    } else {
                        return doc.path.replace(rootPath, "/docs");
                    }
                }
            }
        }
    }
}
