// import {executeBuildTool} from "./cli/utils";


import {startProxyServer} from "./proxy/proxy";

console.log("Starting Livemark local dev proxy server (without redirect)");


// add to process env
process.env.CODECLICK_DEV_LOCAL = "1";

startProxyServer(3000, 3004, true);
