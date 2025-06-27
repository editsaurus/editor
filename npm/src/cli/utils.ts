import os from "os";
import * as pty from 'node-pty';


// import stripAnsi from 'strip-ansi-cjs';
import {BuildToolInfo} from "./analyze/analyze";
// import {prepareForNextProcess} from "./next/next";
// import {getPortPromise} from "portfinder";
// import {prepareForNextProcess} from "./next/next";

// function hasPortPattern(str: string, port: number) {
//     const pattern = /localhost:(\d+)\//;
//     const stropped = stripAnsi(str);
//     const match = pattern.exec(stripAnsi(str));
//
//     if (match) {
//         return Number.parseInt(match[1]);
//     } else {
//         return null;
//     }
// }


export const zopa = "asdasd";



function replacePortInUrl(input: string, originalPort: number, newPort: number): string {
    // Regular expression to match URLs with the specified port, considering ANSI escape codes
    const urlPattern = new RegExp(`http://[^\\s:]+:${originalPort}(?=[^0-9]|$)`, 'g');

    // Function to replace the matched URL with the new port
    const replaceUrl = (match: string): string => {
        // Extract the part of the URL before the port
        const prefix = match.slice(0, -String(originalPort).length);
        return `${prefix}${newPort}`;
    };

    // Replace all occurrences in the input string
    return input.replace(urlPattern, replaceUrl);
}


function updatePort(inputString: string, fromIndex: number, oldPort: number, newPort: number): [string, number] {
    // Step 1: Check if inputString starts with ":${oldPort}"
    const startIndex = inputString.indexOf(`${oldPort}`, fromIndex);
    if (startIndex === -1) {
        // If not found, return the original string
        return [inputString, inputString.length];
    }

    // Step 2: Find the closest occurrence of "http://" after the start index of oldPort
    let httpIndex = inputString.indexOf("http", startIndex - 30);
    if (httpIndex === -1) {
        // If "http://" was not found, return the original string
        return [inputString, inputString.length];
    }

    const asChars = [...inputString];

    const newPortString = newPort.toString();
    asChars[startIndex] = newPortString[0];
    asChars[startIndex + 1] = newPortString[1];
    asChars[startIndex + 2] = newPortString[2];
    asChars[startIndex + 3] = newPortString[3];

    return [asChars.join(''), startIndex];
}

function updateAllPortsInString(input: string, originalPort: number, newPort: number): string {
    let fromIndex = 0
    let changedString = input
    while (fromIndex < input.length) {
        const [newChangedString, nextIndex] = updatePort(changedString, fromIndex, originalPort, newPort);
        fromIndex = nextIndex;
        changedString = newChangedString;
    }
    return changedString;
}

export function executeProcessWithOutputManipulation(command: string, cwd: string, originalPort: number, changedBuildToolPort: number) {
    const shell2 = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    const ptyProcess = pty.spawn(shell2, ['-c', command], {
        handleFlowControl: false,
        name: 'xterm-color',
        cwd,
        // env: process.env
    });

    ptyProcess.onData((data) => {
        const lines = data.split(/\r?\n/);

        if (lines.every(line => line === "")) {
            return;
        }

        process.stdout.write(updateAllPortsInString(data, changedBuildToolPort, originalPort));
    });

    ptyProcess.onExit(code => {
        // console.log(`Child process exited with code: ${code}`);
        process.exit();
    });

    function handleUserInput(data: string) {
        ptyProcess.write(data);
    }

    process.stdin.on('data', handleUserInput);


    // // Function to handle child process output with colors
    // function handleOutput(data: Buffer) {
    //
    //     const port = hasPortPattern(data.toString());
    //     data.toString().replace(`${port}`, `${replacePort}`)
    //     process.stdout.write(data.toString());
    // }
    //
    // // Spawn the child process with inherited stdio
    // const child = spawn("npx", command.split(" "), { stdio: 'inherit', cwd } as const);
    //
    // // Pipe child process output to the function
    // child.stdout?.on('data', handleOutput);
    // child.stderr?.on('data', handleOutput);
    //
    // // Handle errors (optional)
    // child.on('error', (err: Error) => {
    //     console.error('Error spawning child process:', err);
    // });
    //
    // // Handle child process exit
    // child.on('exit', (code: number) => {
    //     console.log(`Child process exited with code: ${code}`);
    // });
}
