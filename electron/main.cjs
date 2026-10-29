const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");

const isDev = !app.isPackaged;
const HOST = "127.0.0.1";
const PORT = 3000;
const FRONTEND_DEV_URL = "http://127.0.0.1:5173";
const FRONTEND_PROD_URL = `http://${HOST}:${PORT}`;

let mainWindow = null;
let backendProcess = null;
let ownsBackend = false;
let logFile = null;
let isQuitting = false;

const backendDir = isDev
    ? path.resolve(__dirname, "../../server")
    : path.join(process.resourcesPath, "server");

const nodeExecutable = isDev
    ? "node"
    : path.join(process.resourcesPath, "node.exe");

function log(message) {
    const line = `[${new Date().toISOString()}] [Marketer ID] ${message}`;

    console.log(line);

    if (logFile) {
        try {
            fs.appendFileSync(logFile, `${line}\n`, "utf8");
        } catch (error) {
            console.error("Failed to write log:", error.message);
        }
    }
}

function isPortOpen() {
    return new Promise((resolve) => {
        const socket = net.createConnection({
            host: HOST,
            port: PORT,
        });

        let settled = false;

        const finish = (result) => {
            if (settled) return;

            settled = true;
            socket.destroy();
            resolve(result);
        };

        socket.setTimeout(1000);
        socket.once("connect", () => finish(true));
        socket.once("error", () => finish(false));
        socket.once("timeout", () => finish(false));
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForBackend(timeoutMs = 60000) {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        if (
            backendProcess &&
            backendProcess.exitCode !== null
        ) {
            throw new Error(
                `Backend stopped unexpectedly (exit code ${backendProcess.exitCode}). Check the log file: ${logFile}`
            );
        }

        if (await isPortOpen()) {
            log(`Backend is listening on ${HOST}:${PORT}.`);
            return;
        }

        await delay(500);
    }

    throw new Error(
        `Backend startup timed out after ${timeoutMs / 1000} seconds. Check SQL Server and the backend logs: ${logFile}`
    );
}

async function startBackend() {
    if (await isPortOpen()) {
        log(
            `Port ${PORT} is already in use. Reusing the existing service.`
        );
        return;
    }

    if (!fs.existsSync(backendDir)) {
        throw new Error(
            `Backend directory not found: ${backendDir}`
        );
    }

    if (!isDev && !fs.existsSync(nodeExecutable)) {
        throw new Error(
            `Node executable not found: ${nodeExecutable}`
        );
    }

    const entryFile = path.join(
        backendDir,
        "src",
        "index.js"
    );

    if (!fs.existsSync(entryFile)) {
        throw new Error(
            `Backend entry file not found: ${entryFile}`
        );
    }

    const env = {
        ...process.env,
        PORT: String(PORT),
    };

    if (!isDev) {
        env.FRONTEND_DIST_PATH = path.join(
            process.resourcesPath,
            "dist"
        );
    }

    log(`Packaged application: ${app.isPackaged}`);
    log(`Resources path: ${process.resourcesPath}`);
    log(`Backend directory: ${backendDir}`);
    log(`Node executable: ${nodeExecutable}`);
    log(`Backend entry file: ${entryFile}`);

    backendProcess = spawn(
        nodeExecutable,
        ["src/index.js"],
        {
            cwd: backendDir,
            env,
            windowsHide: true,
            stdio: ["ignore", "pipe", "pipe"],
        }
    );

    ownsBackend = true;

    backendProcess.stdout.on("data", (data) => {
        log(`Backend: ${data.toString().trimEnd()}`);
    });

    backendProcess.stderr.on("data", (data) => {
        log(`Backend ERROR: ${data.toString().trimEnd()}`);
    });

    backendProcess.on("error", (error) => {
        log(
            `Failed to launch backend: ${error.stack || error.message}`
        );
    });

    backendProcess.on("exit", (code, signal) => {
        log(`Backend exited. Code: ${code}, signal: ${signal}`);
    });

    await waitForBackend();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 650,
        title: "Marketer ID",
        autoHideMenuBar: true,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
        },
    });

    const frontendUrl = isDev
        ? FRONTEND_DEV_URL
        : FRONTEND_PROD_URL;

    log(`Loading frontend: ${frontendUrl}`);

    mainWindow.loadURL(frontendUrl).catch((error) => {
        log(
            `Failed to load frontend: ${error.stack || error.message}`
        );

        dialog.showErrorBox(
            "Marketer ID - Frontend Error",
            `Could not load the frontend:\n${frontendUrl}\n\n${error.message}\n\nDiagnostic log:\n${logFile || "Unavailable"}`
        );
    });

    mainWindow.webContents.on(
        "did-fail-load",
        (_event, code, description, url) => {
            log(
                `Frontend load failed: ${code} - ${description} - ${url}`
            );
        }
    );

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        log(`Blocked new window request: ${url}`);
        return { action: "deny" };
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(async () => {
    try {
        const logDirectory = app.getPath("userData");

        fs.mkdirSync(logDirectory, { recursive: true });

        logFile = path.join(
            logDirectory,
            "backend-debug.log"
        );

        log("Application starting.");
        log(`Application version: ${app.getVersion()}`);
        log(`Packaged: ${app.isPackaged}`);
        log(`User data directory: ${logDirectory}`);

        await startBackend();
        createWindow();

        app.on("activate", () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    } catch (error) {
        log(error.stack || error.message);

        dialog.showErrorBox(
            "Marketer ID - Startup Error",
            `${error.message}\n\nDiagnostic log:\n${logFile || "Unavailable"}`
        );

        app.quit();
    }
});

app.on("before-quit", () => {
    isQuitting = true;

    if (
        ownsBackend &&
        backendProcess &&
        backendProcess.exitCode === null
    ) {
        log("Stopping backend before application exit.");
        backendProcess.kill();
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("will-quit", () => {
    if (!isQuitting) {
        log("Application is quitting.");
    }
});