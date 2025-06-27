// import {executeBuildTool} from "./cli/utils";

import {startProxyServer} from "./proxy/proxy";
import {getPortPromise} from "portfinder";


console.log("Starting Livemark local dev proxy server (without redirect)");


// add to process env
process.env.CODECLICK_DEV_LOCAL = "1";

startProxyServer(3000, 3004, true);


const argProjectDir = process.cwd();

// If no project directory is provided, use the current working directory

// if (!argProjectDir) {
//     console.error("Provide target project directory as the first argument");
// }

// Get the command to run from the second argument
const projectPath = process.argv[2];


const projectCwd = projectPath ? projectPath : argProjectDir;


async function run() {
    try {
        const buildTool = analyzePackageJson22(projectCwd);

        if (!buildTool) {
            console.log("Failed to find a way to start a project, make sure you project is docusaurus");
            // console.log("For an additional help, submit an issue at https://github.com/codeclick-dev/react/issues");
            return;
        }

        const freePort = await getPortPromise({
            port: 3055,    // minimum port
            stopPort: 5000 // maximum port
        });

        // the port that will run the original build tool (vite, next, ...) on
        const changedBuildToolPort = Number.parseInt(process.argv[4] ?? freePort);

        // this is the original port where users server is running, this will be also the port for the proxy
        const originalPort = Number.parseInt(process.argv[3] ?? buildTool.port);

        if (buildTool) {
            startProxyServer(originalPort, changedBuildToolPort);
            // executeBuildTool(buildTool, projectCwd, originalPort, changedBuildToolPort);
        } else {
            console.error("failed to analyze find supported build tool");
        }

    } catch (e) {
        console.error("Failed to analyze package.json at the project root.")
    }
}

run();
