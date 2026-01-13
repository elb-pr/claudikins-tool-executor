import { searchTools, SearchResponse } from "../search.js";
import type { SearchToolsInput } from "../schemas.js";

/**
 * Search for MCP tools across all wrapped servers
 */
export async function handleSearchTools(params: SearchToolsInput) {
  const response: SearchResponse = await searchTools(params.query, params.limit, params.offset);

  const output = {
    results: response.results.map((r) => ({
      name: r.tool.name,
      server: r.tool.server,
      description: r.tool.description,
      example: r.tool.example,
    })),
    // Pagination metadata (MCP best practice)
    count: response.results.length,
    limit: params.limit,
    offset: params.offset,
    totalCount: response.totalCount,
    has_more: (params.offset + response.results.length) < (response.totalCount || 0),
    // Source info
    source: response.source,
    ...(response.fallbackReason && { fallbackReason: response.fallbackReason }),
    ...(response.suggestion && { suggestion: response.suggestion }),
  };

  return {
    content: [{ type: "text" as const, text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
  };
}
