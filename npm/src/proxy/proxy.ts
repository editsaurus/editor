import express from "express";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import bodyParser from "body-parser";
import cors from "cors";
// import address from "address";
import { openEditor } from "../actions/openEditor";
import { fetchServer } from "../actions/serverUrl";
import { callToAction } from "../actions/actionsMapping";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());


import { fileURLToPath } from "url";
import { dirname } from "path";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const isBuilt = __dirname.includes('dist');


const createResponseModifier = () => {
    return (responseString: any) => {
        return responseString;
    };
};

const createActionProcessor = () => {
    return async (url: string, body: any) => {
        return await callToAction(url, body);
    };
};

const createFileContentRetriever = () => {
    return async (req: any) => {
        if (isBuilt) {
            const url = `https://editsaurus-614d2.web.app/editor/${req.url}`;
            const response = await fetch(url);
            return await response.text();
        } else {
            const pathToFile = path.join(__dirname, "..", "..", "..", "dist", req.url);
            return fs.readFileSync(pathToFile, "utf8");
        }
    };
};

const createRequestValidator = () => {
    return (req: any) => {
        return req.headers["x-zorik-token"];
    };
};

const createResponseHandler = () => {
    return (res: any, content: string, req: any) => {
        res.writeHead(200, {
            "Content-Type": req.url.includes(".js") ? "application/javascript" : "text/css",
            "Cache-Control": "public, max-age=60"
        });
        res.end(content);
    };
};

const createErrorHandler = () => {
    return (error: any, res: any) => {
        console.error("Error processing action:", error);
        return res.status(500).send({
            success: false,
            error: "Failed to process action"
        });
    };
};

const createMiddlewareChain = () => {
    return () => {
        return async (req: any, res: any, next: any) => {
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
                            const result = await processor(req.url, req.body);
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

const createStaticFileHandler = () => {
    return (req: any, res: any, next: any) => {
        const contentRetriever = createFileContentRetriever();
        const responseHandler = createResponseHandler();

        if ((req.url.includes("editsaurus"))) {
            contentRetriever(req).then((content) => {
                responseHandler(res, content, req);
            });
            return;
        }
        next();
    };
};

export function startProxyServer(proxyServerPort: number, interceptPort: number, useDirectAddress: boolean = false, skipRedirect: boolean = false) {
    app.disable("x-powered-by");

    app.use(bodyParser.json());

    const middlewareChain = createMiddlewareChain();
    app.use(middlewareChain());

    if (!skipRedirect) {
        const staticFileHandler = createStaticFileHandler();
        app.use("/", staticFileHandler);

        console.log("starting server on port ", proxyServerPort);
        app.listen(proxyServerPort);
    } else {
        console.log("starting server on port ", proxyServerPort);
        app.listen(proxyServerPort);
    }
}



