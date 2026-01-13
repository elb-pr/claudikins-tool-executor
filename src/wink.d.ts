declare module "wink-bm25-text-search" {
  interface BM25Engine {
    defineConfig(config: { fldWeights: Record<string, number> }): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    definePrepTasks(tasks: any[]): void;
    addDoc(doc: Record<string, string>, id: number): void;
    consolidate(): void;
    search(query: string, limit?: number): number[];
  }

  function bm25(): BM25Engine;
  export default bm25;
}

declare module "wink-nlp-utils" {
  const nlp: {
    string: {
      lowerCase: unknown;
      tokenize0: unknown;
    };
    tokens: {
      removeWords: unknown;
      stem: unknown;
    };
  };
  export default nlp;
}
