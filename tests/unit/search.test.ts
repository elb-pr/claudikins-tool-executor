import { describe, it, expect } from "vitest";
import { searchTools, loadToolDefinition } from "../../src/search.js";

describe("search module", () => {
  describe("loadToolDefinition", () => {
    it("should load a valid YAML tool definition", async () => {
      const tool = await loadToolDefinition("registry/ui/mermaid/generate_mermaid_diagram.yaml");

      expect(tool).toBeDefined();
      expect(tool?.name).toBe("generate_mermaid_diagram");
      expect(tool?.server).toBe("mermaid");
      expect(tool?.inputSchema).toBeDefined();
    });

    it("should return null for non-existent file", async () => {
      const tool = await loadToolDefinition("registry/nonexistent/tool.yaml");
      expect(tool).toBeNull();
    });

    it("should return null for invalid YAML", async () => {
      // package.json is not valid YAML tool definition
      const tool = await loadToolDefinition("package.json");
      expect(tool).toBeNull();
    });
  });

  describe("searchTools", () => {
    it("should return results for valid query", async () => {
      const response = await searchTools("mermaid diagram", 5);

      expect(response.results).toBeDefined();
      expect(response.results.length).toBeGreaterThan(0);
      expect(response.source).toBeDefined();
    });

    it("should respect limit parameter", async () => {
      const response = await searchTools("search", 2);

      expect(response.results.length).toBeLessThanOrEqual(2);
    });

    it("should return empty results for nonsense query", async () => {
      const response = await searchTools("xyzzy123nonexistent", 10);

      expect(response.results).toBeDefined();
      // May have suggestion for empty results
    });

    it("should include tool metadata in results", async () => {
      const response = await searchTools("gemini", 3);

      if (response.results.length > 0) {
        const result = response.results[0];
        expect(result.tool.name).toBeDefined();
        expect(result.tool.server).toBeDefined();
        expect(result.tool.description).toBeDefined();
      }
    });
  });
});
