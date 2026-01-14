import { executeCode } from "../sandbox/runtime.js";
/**
 * Execute TypeScript/JavaScript code in sandbox
 */
export async function handleExecuteCode(params) {
    const result = await executeCode(params.code, params.timeout);
    return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: { ...result },
        isError: !!result.error,
    };
}
