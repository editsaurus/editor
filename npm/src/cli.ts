import {startProxyServer} from "./proxy/proxy";
import {getPortPromise} from "portfinder";
import {BuildToolInfo} from "./cli/analyze/analyze";
import path from "path";
import fs from "fs";
import {executeProcessWithOutputManipulation} from "./utils";

// Configuration and constants
const CONFIG = {
    TOOL_NAME: "Editsaurus",
    DEFAULT_PROXY_PORT: 3055,
    MAX_PORT: 5000,
    SUPPORTED_BUILD_TOOLS: {
        DOCUSAURUS: {
            name: "docusaurus" as const,
            defaultPort: 3000,
            startCommand: "docusaurus start"
        }
    }
} as const;

// Types
interface CliArguments {
    projectPath?: string;
    originalPort?: number;
    proxyPort?: number;
}

interface ProjectConfig {
    buildTool: BuildToolInfo;
    originalPort: number;
    proxyPort: number;
    projectCwd: string;
}

// Utility functions
function log(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
    const colors = {
        info: '\x1b[36m',    // Cyan
        error: '\x1b[31m',   // Red
        success: '\x1b[32m'  // Green
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}${message}${reset}`);
}

function logHeader(): void {
    log(`Starting project with ${CONFIG.TOOL_NAME} visual editor enabled...`, 'info');
}

// Configuration parsing
function parseCliArguments(): CliArguments {
    const args = process.argv.slice(2);
    return {
        projectPath: args[0],
        originalPort: args[1] ? parseInt(args[1]) : undefined,
        proxyPort: args[2] ? parseInt(args[2]) : undefined
    };
}

function validatePort(port: number, name: string): number {
    if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid ${name} port: ${port}. Must be between 1 and 65535.`);
    }
    return port;
}

// Package.json analysis
function readPackageJson(projectPath: string): any {
    try {
        const packageJsonPath = path.join(projectPath, "package.json");
        const data = fs.readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Failed to read package.json at ${projectPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

function detectBuildTool(projectPath: string): BuildToolInfo | null {
    try {
        const packageJson = readPackageJson(projectPath);
        const scripts = packageJson.scripts || {};

        for (const [scriptName, scriptValue] of Object.entries(scripts)) {
            if (typeof scriptValue === 'string' && scriptValue.includes(CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.startCommand)) {
                return {
                    name: CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.name,
                    port: CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.defaultPort,
                    originalStartScript: scriptValue
                };
            }
        }

        return null;
    } catch (error) {
        throw new Error(`Failed to analyze package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Port management
async function findAvailablePort(startPort: number): Promise<number> {
    try {
        return await getPortPromise({
            port: startPort,
            stopPort: CONFIG.MAX_PORT
        });
    } catch (error) {
        throw new Error(`Failed to find available port starting from ${startPort}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Build tool execution
function executeBuildTool(buildTool: BuildToolInfo, projectCwd: string, originalPort: number, proxyPort: number): void {
    if (buildTool.name === CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.name) {
        const modifiedCommand = buildTool.originalStartScript.replace(
            CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.startCommand,
            `${CONFIG.SUPPORTED_BUILD_TOOLS.DOCUSAURUS.startCommand} --port ${proxyPort} --no-open`
        );
        
        log(`Starting Docusaurus on port ${proxyPort}...`, 'info');
        executeProcessWithOutputManipulation(`npm exec -c "${modifiedCommand}"`, projectCwd, originalPort, proxyPort);
    } else {
        throw new Error(`Unsupported build tool: ${buildTool.name}`);
    }
}

// Main configuration setup
async function createProjectConfig(): Promise<ProjectConfig> {
    const args = parseCliArguments();
    const projectCwd = args.projectPath || process.cwd();
    
    log(`Project directory: ${projectCwd}`, 'info');
    
    // Detect build tool
    const buildTool = detectBuildTool(projectCwd);
    if (!buildTool) {
        throw new Error(`No supported build tool found. Currently only Docusaurus is supported.`);
    }
    
    log(`Detected build tool: ${buildTool.name}`, 'success');
    
    // Determine ports
    const originalPort = validatePort(
        args.originalPort || buildTool.port,
        'original'
    );
    
    const proxyPort = validatePort(
        args.proxyPort || await findAvailablePort(CONFIG.DEFAULT_PROXY_PORT),
        'proxy'
    );
    
    log(`Original port: ${originalPort}, Proxy port: ${proxyPort}`, 'info');
    
    return {
        buildTool,
        originalPort,
        proxyPort,
        projectCwd
    };
}

// Main execution
async function run(): Promise<void> {
    try {
        logHeader();
        
        const config = await createProjectConfig();
        
        // Start proxy server
        log(`Starting proxy server on port ${config.proxyPort}...`, 'info');
        startProxyServer(config.originalPort, config.proxyPort);
        
        // Execute build tool
        executeBuildTool(config.buildTool, config.projectCwd, config.originalPort, config.proxyPort);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        log(`Error: ${errorMessage}`, 'error');
        process.exit(1);
    }
}

// Export for testing purposes
export { 
    CONFIG, 
    parseCliArguments, 
    detectBuildTool, 
    createProjectConfig,
    log 
};

// Start the application
run();
