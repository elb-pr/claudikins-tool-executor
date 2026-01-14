import { readFile, writeFile, appendFile, unlink, readdir, mkdir as fsMkdir, stat as fsStat } from "node:fs/promises";
import { join, resolve, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { glob as globFs } from "glob";
import { MCP_RESULTS_DIR } from "../constants.js";
// Resolve workspace relative to module location (not cwd) for plugin portability
const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..", "workspace");
/**
 * Resolve a path within the workspace, blocking traversal attacks
 */
function resolvePath(relativePath) {
    const normalized = normalize(relativePath);
    // Block absolute paths and traversal
    if (normalized.startsWith("/") || normalized.startsWith("..") || normalized.includes("/../")) {
        throw new Error(`Path traversal blocked: ${relativePath}`);
    }
    const fullPath = resolve(WORKSPACE_ROOT, normalized);
    // Double-check the resolved path is within workspace
    if (!fullPath.startsWith(WORKSPACE_ROOT)) {
        throw new Error(`Path traversal blocked: ${relativePath}`);
    }
    return fullPath;
}
/**
 * Clean up old MCP results (older than maxAge ms)
 * Default: 1 hour (3600000ms)
 */
async function cleanupMcpResults(maxAgeMs = 3600000) {
    const dir = join(WORKSPACE_ROOT, MCP_RESULTS_DIR);
    try {
        const files = await readdir(dir);
        const now = Date.now();
        let deleted = 0;
        for (const file of files) {
            const filepath = join(dir, file);
            const stats = await fsStat(filepath);
            if (now - stats.mtimeMs > maxAgeMs) {
                await unlink(filepath);
                deleted++;
            }
        }
        return deleted;
    }
    catch (err) {
        // ENOENT is expected if directory doesn't exist yet
        if (err.code === "ENOENT") {
            return 0;
        }
        // Log unexpected errors (permissions, disk full, etc.)
        console.error("cleanupMcpResults failed:", err);
        return 0;
    }
}
/**
 * Workspace API - all file operations scoped to ./workspace/
 */
export const workspace = {
    // Core operations
    async read(path) {
        const fullPath = resolvePath(path);
        return readFile(fullPath, "utf-8");
    },
    async write(path, data) {
        const fullPath = resolvePath(path);
        await writeFile(fullPath, data, "utf-8");
    },
    async append(path, data) {
        const fullPath = resolvePath(path);
        await appendFile(fullPath, data, "utf-8");
    },
    async delete(path) {
        const fullPath = resolvePath(path);
        await unlink(fullPath);
    },
    // JSON operations
    async readJSON(path) {
        const content = await workspace.read(path);
        return JSON.parse(content);
    },
    async writeJSON(path, data) {
        await workspace.write(path, JSON.stringify(data, null, 2));
    },
    // Binary operations
    async readBuffer(path) {
        const fullPath = resolvePath(path);
        return readFile(fullPath);
    },
    async writeBuffer(path, data) {
        const fullPath = resolvePath(path);
        await writeFile(fullPath, data);
    },
    // Directory operations
    async list(path = ".") {
        const fullPath = resolvePath(path);
        return readdir(fullPath);
    },
    async glob(pattern) {
        // Block dangerous patterns
        if (pattern.includes("..")) {
            throw new Error(`Glob traversal blocked: ${pattern}`);
        }
        const matches = await globFs(pattern, {
            cwd: WORKSPACE_ROOT,
            nodir: false,
        });
        return matches;
    },
    async mkdir(path) {
        const fullPath = resolvePath(path);
        await fsMkdir(fullPath, { recursive: true });
    },
    async exists(path) {
        try {
            const fullPath = resolvePath(path);
            await fsStat(fullPath);
            return true;
        }
        catch (err) {
            // ENOENT means file doesn't exist - expected
            if (err.code === "ENOENT") {
                return false;
            }
            // Rethrow unexpected errors (permissions, etc.)
            throw err;
        }
    },
    // Metadata
    async stat(path) {
        const fullPath = resolvePath(path);
        const stats = await fsStat(fullPath);
        return {
            size: stats.size,
            mtime: stats.mtime,
            isDir: stats.isDirectory(),
        };
    },
    // MCP results management
    cleanupMcpResults,
};
