/**
 * Clean up old MCP results (older than maxAge ms)
 * Default: 1 hour (3600000ms)
 */
declare function cleanupMcpResults(maxAgeMs?: number): Promise<number>;
/**
 * Workspace API - all file operations scoped to ./workspace/
 */
export declare const workspace: {
    read(path: string): Promise<string>;
    write(path: string, data: string): Promise<void>;
    append(path: string, data: string): Promise<void>;
    delete(path: string): Promise<void>;
    readJSON<T = unknown>(path: string): Promise<T>;
    writeJSON(path: string, data: unknown): Promise<void>;
    readBuffer(path: string): Promise<Buffer>;
    writeBuffer(path: string, data: Buffer): Promise<void>;
    list(path?: string): Promise<string[]>;
    glob(pattern: string): Promise<string[]>;
    mkdir(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    stat(path: string): Promise<{
        size: number;
        mtime: Date;
        isDir: boolean;
    }>;
    cleanupMcpResults: typeof cleanupMcpResults;
};
export type Workspace = typeof workspace;
export {};
