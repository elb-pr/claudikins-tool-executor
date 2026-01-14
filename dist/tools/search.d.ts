import type { SearchToolsInput } from "../schemas.js";
/**
 * Search for MCP tools across all wrapped servers
 * Returns MINIMAL results - just enough to identify and call the tool
 */
export declare function handleSearchTools(params: SearchToolsInput): Promise<{
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: {
        suggestion?: string | undefined;
        fallbackReason?: string | undefined;
        results: {
            name: string;
            server: string;
            description: string;
        }[];
        count: number;
        limit: number;
        offset: number;
        totalCount: number | undefined;
        has_more: boolean;
        source: "serena" | "local";
    };
}>;
