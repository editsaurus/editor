#!/usr/bin/env node

// src/proxy/proxy.ts
import express from "express";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import bodyParser from "body-parser";
import cors from "cors";

// src/actions/openEditor.ts
import launch from "launch-editor";
function openEditor(location) {
  const fileName = location.fileNamePath;
  const lineNumber = location?.lineStart ?? 0;
  const columnNumber = 0;
  try {
    launch(
      // filename:line:column
      // both line and column are optional
      `${fileName}:${lineNumber}:${columnNumber}`
    );
    return {
      success: true
    };
  } catch (e) {
    return {
      success: false
    };
  }
}

// src/actions/serverUrl.ts
function getServerUrl(path4) {
  return process.env.CODECLICK_DEV_LOCAL ? `http://localhost:3009${path4}` : `https://codeclick-adhylvkgva-uc.a.run.app${path4}`;
}
async function fetchServer(url, body) {
  const serverUrl = getServerUrl(url);
  try {
    const response = await fetch(serverUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
  }
}

// src/parsing/fileUtils.ts
import path from "path";
import fs from "fs";
function detectFileFullPath(projectPath2, routePath) {
  const pathWithoutExtension = findRelativePathNew(routePath, path.join(projectPath2, ".docusaurus", "globalData.json"));
  const mdFile = path.join(projectPath2, pathWithoutExtension + ".md");
  const mdxFile = path.join(projectPath2, pathWithoutExtension + ".mdx");
  if (fs.existsSync(mdFile)) {
    return mdFile;
  } else if (fs.existsSync(mdxFile)) {
    return mdxFile;
  }
}
function findRelativePathNew(route, jsonFilePath) {
  const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  const content = data["docusaurus-plugin-content-docs"];
  for (const rootKey in content) {
    const rootPath = content[rootKey].path;
    for (const version of content[rootKey].versions) {
      for (const doc of version.docs) {
        if (doc.path === route) {
          if (rootKey !== "default") {
            return doc.path.replace(rootPath, rootKey);
          } else {
            return doc.path.replace(rootPath, "/docs");
          }
        }
      }
    }
  }
}

// src/actions/info.ts
import fs3 from "fs";
import { remark } from "remark";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

// src/fileWatcher/historyController.ts
import chokidar from "chokidar";
import fs2 from "fs";
var fileHistory = {};
var currentIndex = {};
var disabled = {};
var lastUpdatedFile = null;
function watchFile(filePath) {
  if (fileHistory[filePath]) {
    return;
  }
  const initialData = fs2.readFileSync(filePath, "utf-8");
  fileHistory[filePath] = [initialData];
  currentIndex[filePath] = 0;
  const watcher = chokidar.watch(filePath, {
    persistent: true
  });
  watcher.on("change", (path4) => {
    if (disabled[path4]) {
      disabled[path4] = false;
      return;
    }
    if (fileHistory[filePath].length > currentIndex[filePath] + 1) {
      fileHistory[filePath] = fileHistory[filePath].slice(0, currentIndex[filePath] + 1);
    }
    const data = fs2.readFileSync(path4, "utf-8");
    fileHistory[filePath].push(data);
    currentIndex[filePath] = fileHistory[filePath].length - 1;
    lastUpdatedFile = filePath;
  });
}
function hasHistory(filePath) {
  const fileData = fileHistory[filePath];
  if (!fileData || fileData.length === 0) {
    return {
      hasUndo: false,
      hasRedo: false
    };
  }
  const index = currentIndex[filePath] || 0;
  const hasUndo = index > 0;
  const hasRedo = index < fileData.length - 1;
  return {
    hasUndo,
    hasRedo
  };
}
async function updateFileWithHistoryUpdate(filePath, content) {
  const watcher = chokidar.watch(filePath, {
    persistent: true
  });
  return new Promise((resolve) => {
    const innerCallback = async () => {
      const historyStatus = hasHistory(filePath);
      resolve(historyStatus);
      watcher.off("change", innerCallback);
    };
    watcher.on("change", innerCallback);
    fs2.writeFileSync(filePath, content);
  });
}
async function undo(filePath) {
  const index = currentIndex[filePath] || 0;
  if (index === 0) {
    return hasHistory(filePath);
  }
  currentIndex[filePath] = index - 1;
  const undoContent = fileHistory[filePath][currentIndex[filePath]];
  disabled[filePath] = true;
  return updateFileWithHistoryUpdate(filePath, undoContent);
}
async function redo(filePath) {
  const index = currentIndex[filePath] || 0;
  if (index === fileHistory[filePath].length - 1) {
    return hasHistory(filePath);
  }
  currentIndex[filePath] = index + 1;
  const redoContent = fileHistory[filePath][currentIndex[filePath]];
  disabled[filePath] = true;
  return updateFileWithHistoryUpdate(filePath, redoContent);
}

// src/actions/info.ts
import remarkMdx from "remark-mdx";
import { toString } from "mdast-util-to-string";
import stringSimilarity from "string-similarity";
function fileInfoAction(projectPath2, sourceName) {
  const isDev = sourceName === "editsaurus-testing";
  const filePath = isDev ? `${projectPath2}/src/example.md` : detectFileFullPath(projectPath2, sourceName);
  if (!filePath) {
    return {
      success: false,
      message: "Can't find file",
      // @ts-expect-error
      payload: null
    };
  }
  watchFile(filePath);
  const history = hasHistory(filePath);
  return {
    success: true,
    payload: {
      filePath,
      ...history
    }
  };
}
function sectionInfoAction(sectionContext) {
  const detected = detectMarkdownSource(sectionContext);
  if (detected) {
    return {
      success: true,
      payload: detected
    };
  }
  return {
    success: false,
    message: "failed to analyze the markdown file",
    // @ts-expect-error
    payload: null
  };
}
function detectMarkdownSource(sectionContext) {
  const { filePath, sectionIndex, htmlTag, outerText } = sectionContext;
  const fileContent = removeMarkdownComments(fs3.readFileSync(filePath, "utf-8"));
  const fixedFileContent = fixAdmonitionContent(fileContent);
  const processor = remark().use(remarkMdx).use(remarkFrontmatter, ["yaml"]).use(remarkMdxFrontmatter).use(remarkDirective);
  const parsedTree = processor.parse(fixedFileContent);
  const nodes = parsedTree.children.filter((node) => node.type !== "mdxjsEsm");
  const indicesToCheck = [sectionIndex - 1, sectionIndex, sectionIndex + 1];
  for (const index of indicesToCheck) {
    if (index < 0 || index >= nodes.length) continue;
    const node = nodes[index];
    const nodeText = toString(node);
    const similarity = stringSimilarity.compareTwoStrings(nodeText, outerText);
    const tagToNodeType = {
      "h1": "paragraph",
      "h2": "paragraph",
      "h3": "paragraph",
      "h4": "paragraph",
      "h5": "paragraph",
      "h6": "paragraph",
      "p": "heading",
      "ul": "list",
      "ol": "list",
      "li": "listItem",
      "blockquote": "blockquote"
    };
    const expectedNodeType = tagToNodeType[htmlTag];
    const isCorrectType = expectedNodeType ? node.type === expectedNodeType : true;
    const unsupported = node.type === "mdxJsxFlowElement" || node.type === "code" || node.type === "containerDirective";
    if (similarity > 0.2 && isCorrectType) {
      const position = node.position;
      const lines = fileContent.split("\n");
      const md = lines.slice(position.start.line - 1, position.end.line).join("\n");
      return {
        markdown: md,
        type: node.type,
        unsupported,
        location: {
          fileNamePath: filePath,
          lineStart: position.start.line,
          lineEnd: position.end.line
        }
      };
    }
  }
  return void 0;
}
function fixAdmonitionContent(fileContent) {
  const ADMONITION_TYPES = ["note", "tip", "info", "warning", "danger"];
  const lines = fileContent.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const type of ADMONITION_TYPES) {
      const prefix = `:::${type} `;
      if (line.startsWith(prefix) && line.charAt(prefix.length - 1) === " ") {
        const title = line.substring(prefix.length).trim();
        if (title) {
          lines[i] = `:::${type}{title="${title}"}`;
        }
        break;
      }
    }
  }
  return lines.join("\n");
}
function removeMarkdownComments(content) {
  return content.replace(/<!--([\s\S]*?)-->/g, "");
}

// src/actions/submit.ts
import MagicString from "magic-string";
import fs4 from "fs";
async function submitAction(infoDetails) {
  const location = infoDetails.location;
  const content = infoDetails.markdown;
  const fileContent = fs4.readFileSync(location.fileNamePath, "utf8");
  const s = new MagicString(fileContent);
  const lines = fileContent.split("\n");
  const startLine = location.lineStart - 1;
  const endLine = location.lineEnd - 1;
  lines.splice(startLine, endLine - startLine + 1, content);
  const updatedContent = lines.join("\n");
  s.overwrite(0, fileContent.length, updatedContent);
  const history = await updateFileWithHistoryUpdate(location.fileNamePath, s.toString());
  return {
    success: true,
    payload: history
  };
}

// src/actions/history.ts
async function undoAction(filePath) {
  return undo(filePath);
}
function redoAction(filePath) {
  return redo(filePath);
}

// src/actions/actionsMapping.ts
async function callToAction(url, body) {
  if (url.includes("/info")) {
    return processGetFileInfoRequest(body.name);
  } else if (url.includes("/section-info")) {
    return processGetSectionInfoRequest(body);
  } else if (url.includes("/submit")) {
    return submitAction(body);
  } else if (url.includes("/open")) {
    return openEditor(body);
  } else if (url.includes("/undo")) {
    return undoAction(body.filePath);
  } else if (url.includes("/redo")) {
    return redoAction(body.filePath);
  }
}
async function processGetSectionInfoRequest(sectionContext) {
  return sectionInfoAction(sectionContext);
}
async function processGetFileInfoRequest(sourceName) {
  return fileInfoAction(projectCwd, sourceName);
}

// src/proxy/proxy.ts
import fs5 from "fs";
import path2 from "path";
import PQueue from "p-queue";
import { fileURLToPath } from "url";
import { dirname } from "path";
var app = express();
app.use(cors());
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var isBuilt = __dirname.includes("dist");
var actionQueue = new PQueue({
  concurrency: 1,
  autoStart: true,
  timeout: 1e3
});
var createResponseModifier = () => {
  return (responseString) => {
    return responseString;
  };
};
var createActionProcessor = () => {
  return async (url, body) => {
    return await callToAction(url, body);
  };
};
var createFileContentRetriever = () => {
  return async (req) => {
    if (isBuilt) {
      const url = `https://editsaurus-614d2.web.app/editor/${req.url}`;
      const response = await fetch(url);
      return await response.text();
    } else {
      const pathToFile = path2.join(__dirname, "..", "..", "..", "dist", req.url);
      return fs5.readFileSync(pathToFile, "utf8");
    }
  };
};
var createRequestValidator = () => {
  return (req) => {
    return req.headers["x-zorik-token"];
  };
};
var createResponseHandler = () => {
  return (res, content, req) => {
    res.writeHead(200, {
      "Content-Type": req.url.includes(".js") ? "application/javascript" : "text/css",
      "Cache-Control": "public, max-age=60"
    });
    res.end(content);
  };
};
var createErrorHandler = () => {
  return (error, res) => {
    console.error("Error processing action:", error);
    return res.status(500).send({
      success: false,
      error: "Failed to process action"
    });
  };
};
var createServerInitializer = () => {
  return (proxyServerPort, interceptPort) => {
    const localAddress = "localhost";
    const target = `ws://${localAddress}:${interceptPort}/`;
    const wsProxy = createProxyMiddleware({
      target,
      ws: true,
      changeOrigin: false,
      selfHandleResponse: true,
      on: {
        proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
          const contentEncoding = proxyRes.headers["content-encoding"];
          if (proxyRes.headers["content-type"]?.includes("text/html")) {
            const response = responseBuffer.toString("utf8");
            if (contentEncoding === "br") {
              const decompressedData = response;
              const modifiedResponse = createResponseModifier()(decompressedData.toString());
              return modifiedResponse;
            } else {
              return createResponseModifier()(response);
            }
          }
          return responseBuffer;
        })
      }
    });
    app.use(wsProxy);
    const startServer = () => {
      try {
        const server = app.listen(proxyServerPort);
        server.on("upgrade", wsProxy.upgrade);
      } catch (err) {
        console.error("Server crashed:", err);
        setTimeout(startServer, 0);
      }
    };
    startServer();
  };
};
var createMiddlewareChain = () => {
  return (actionQueue2) => {
    return async (req, res, next) => {
      const validator = createRequestValidator();
      const processor = createActionProcessor();
      const errorHandler = createErrorHandler();
      if (validator(req)) {
        try {
          if (req.url.startsWith("/open")) {
            openEditor(req.body);
            return res.status(200).send({
              success: true
            });
          } else if (["/info", "/section-info", "/submit", "/undo", "/redo"].includes(req.url)) {
            try {
              const result = await actionQueue2.add(() => processor(req.url, req.body));
              return res.status(200).send(result);
            } catch (error) {
              return errorHandler(error, res);
            }
          } else if (["/user"].includes(req.url)) {
            return res.status(200).send(await fetchServer(req.url, req.body));
          } else {
            next();
            return;
          }
        } catch (error) {
          console.error("Error in request processing:", error);
          return res.status(500).send({
            success: false,
            error: "Internal server error"
          });
        }
      }
      next();
    };
  };
};
var createStaticFileHandler = () => {
  return (req, res, next) => {
    const contentRetriever = createFileContentRetriever();
    const responseHandler = createResponseHandler();
    if (req.url.includes("editsaurus")) {
      contentRetriever(req).then((content) => {
        responseHandler(res, content, req);
      });
      return;
    }
    next();
  };
};
function startProxyServer(proxyServerPort, interceptPort, useDirectAddress = false, skipRedirect = false) {
  app.disable("x-powered-by");
  app.use(bodyParser.json());
  const middlewareChain = createMiddlewareChain();
  app.use(middlewareChain(actionQueue));
  if (!skipRedirect) {
    const staticFileHandler = createStaticFileHandler();
    app.use("/", staticFileHandler);
    const serverInitializer = createServerInitializer();
    serverInitializer(proxyServerPort, interceptPort);
  } else {
    console.log("starting server on port ", proxyServerPort);
    app.listen(proxyServerPort);
  }
}

// src/cli.ts
import { getPortPromise } from "portfinder";
import path3 from "path";
import fs6 from "fs";

// src/utils.ts
import os from "os";
import * as pty from "node-pty";
import open from "open";
async function isUrlLoaded(url, timeout = 1e4, interval = 500) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        return true;
      }
    } catch (error) {
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}
function updatePort(inputString, fromIndex, oldPort, newPort) {
  const startIndex = inputString.indexOf(`${oldPort}`, fromIndex);
  if (startIndex === -1) {
    return [inputString, inputString.length];
  }
  let httpIndex = inputString.indexOf("http", startIndex - 30);
  if (httpIndex === -1) {
    return [inputString, inputString.length];
  }
  const asChars = [...inputString];
  const newPortString = newPort.toString();
  asChars[startIndex] = newPortString[0];
  asChars[startIndex + 1] = newPortString[1];
  asChars[startIndex + 2] = newPortString[2];
  asChars[startIndex + 3] = newPortString[3];
  return [asChars.join(""), startIndex];
}
function updateAllPortsInString(input, originalPort, newPort) {
  let fromIndex = 0;
  let changedString = input;
  while (fromIndex < input.length) {
    const [newChangedString, nextIndex] = updatePort(changedString, fromIndex, originalPort, newPort);
    fromIndex = nextIndex;
    changedString = newChangedString;
  }
  return changedString;
}
function executeProcessWithOutputManipulation(command, cwd, originalPort, changedBuildToolPort) {
  const shell2 = os.platform() === "win32" ? "powershell.exe" : "bash";
  const ptyProcess = pty.spawn(shell2, ["-c", command], {
    handleFlowControl: false,
    name: "xterm-color",
    cwd,
    cols: process.stdout.columns,
    rows: process.stdout.rows
  });
  ptyProcess.onData((data) => {
    const lines = data.split(/\r?\n/);
    if (lines.join("").includes("Docusaurus website is running")) {
      isUrlLoaded("http://localhost:" + changedBuildToolPort).then((loaded) => {
        if (loaded) {
          open("http://localhost:" + originalPort);
        }
      });
    }
    if (lines.every((line) => line === "")) {
      return;
    }
    process.stdout.write(updateAllPortsInString(data, changedBuildToolPort, originalPort));
  });
  ptyProcess.onExit((code) => {
    process.exit();
  });
  function handleUserInput(data) {
    ptyProcess.write(data);
  }
  process.stdin.on("data", handleUserInput);
}

// src/cli.ts
var toolName = "Editsaurus";
console.log("\x1B[33m%s\x1B[0m", `Starting project with ${toolName} visual editor enabled...`);
function executeBuildTool(buildTool, cwd, originalPort, changedBuildToolPort) {
  if (buildTool.name === "docusaurus") {
    const newCommand = buildTool.originalStartScript.replace("docusaurus start", `docusaurus start --port ${changedBuildToolPort} --no-open`);
    executeProcessWithOutputManipulation(`npm exec -c "${newCommand}"`, cwd, originalPort, changedBuildToolPort);
  }
}
function readPackageJson(path4) {
  const data = fs6.readFileSync(path4, "utf8");
  return JSON.parse(data);
}
function analyzePackageJson22(projectPath2) {
  const json = readPackageJson(path3.join(projectPath2, "package.json"));
  const scripts = json.scripts;
  for (const key in scripts) {
    const scriptValue = scripts[key];
    if (scriptValue.includes("docusaurus start")) {
      return {
        name: "docusaurus",
        port: 3e3,
        originalStartScript: scriptValue
      };
    }
  }
  return void 0;
}
var argProjectDir = process.cwd();
var projectPath = process.argv[2];
var projectCwd = projectPath ? projectPath : argProjectDir;
async function run() {
  try {
    const buildTool = analyzePackageJson22(projectCwd);
    if (!buildTool) {
      console.log("Failed to find a way to start a project, make sure you project is docusaurus");
      return;
    }
    const freePort = await getPortPromise({
      port: 3055,
      stopPort: 5e3
    });
    const changedBuildToolPort = Number.parseInt(process.argv[4] ?? freePort);
    const originalPort = Number.parseInt(process.argv[3] ?? buildTool.port);
    if (buildTool) {
      startProxyServer(originalPort, changedBuildToolPort);
      executeBuildTool(buildTool, projectCwd, originalPort, changedBuildToolPort);
    } else {
      console.error("failed to analyze find supported build tool");
    }
  } catch (e) {
    console.error("Failed to analyze package.json at the project root.");
  }
}
run();
export {
  projectCwd,
  toolName
};
