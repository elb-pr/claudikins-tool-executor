import { z } from "zod";
/**
 * Input schema for search_tools
 */
export declare const SearchToolsInputSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type SearchToolsInput = z.infer<typeof SearchToolsInputSchema>;
/**
 * Input schema for get_tool_schema
 */
export declare const GetToolSchemaInputSchema: z.ZodObject<{
    name: z.ZodString;
}, z.core.$strict>;
export type GetToolSchemaInput = z.infer<typeof GetToolSchemaInputSchema>;
/**
 * Input schema for execute_code
 */
export declare const ExecuteCodeInputSchema: z.ZodObject<{
    code: z.ZodString;
    timeout: z.ZodDefault<z.ZodNumber>;
}, z.core.$strict>;
export type ExecuteCodeInput = z.infer<typeof ExecuteCodeInputSchema>;
