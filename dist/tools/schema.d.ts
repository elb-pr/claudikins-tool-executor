import type { GetToolSchemaInput } from "../schemas.js";
/**
 * Get full inputSchema for a specific tool
 */
export declare function handleGetToolSchema(params: GetToolSchemaInput): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    isError: boolean;
    structuredContent?: undefined;
} | {
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: {
        name: string;
        server: string;
        description: string;
        inputSchema: object;
        example: string;
        notes: string | undefined;
    };
    isError?: undefined;
}>;
