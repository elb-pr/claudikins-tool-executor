import type { ExecuteCodeInput } from "../schemas.js";
/**
 * Execute TypeScript/JavaScript code in sandbox
 */
export declare function handleExecuteCode(params: ExecuteCodeInput): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: {
        logs: unknown[];
        error?: string;
        stack?: string;
    };
    isError: boolean;
}>;
