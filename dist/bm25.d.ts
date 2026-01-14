import { ToolDefinition } from "./types.js";
/**
 * Initialize the BM25 search engine with tool definitions
 */
export declare function initBM25(tools: ToolDefinition[]): void;
/**
 * Search tools using BM25
 * wink-bm25 returns [[docId: string, score: number], ...] tuples
 */
export declare function searchBM25(query: string, limit: number): ToolDefinition[];
/**
 * Check if BM25 engine is ready
 */
export declare function isBM25Ready(): boolean;
/**
 * Reset BM25 engine (for testing)
 */
export declare function resetBM25(): void;
