export type FormatConfig = {
  instructionIndent: number;
  commentIndent: number;
};

export interface nasmfmt {
  format: (input: string, config: FormatConfig) => Promise<string>;
}

declare global {
  interface Window {
    nasmfmt: nasmfmt;
    // deno-lint-ignore no-explicit-any
    Go: any;
  }
  const nasmfmt: nasmfmt;
}

const wasmPath = "/nasmfmt.wasm";

if (!window.Go) {
  throw new Error("wasm_exec.js could not be loaded.");
}

const go = new window.Go();
const obj = await WebAssembly.instantiateStreaming(fetch(wasmPath), go.importObject);
const wasm = obj.instance;

go.run(wasm).catch((err: Error) => {
  console.error(err);
  alert("nasmfmt failed to load. Please check the browser console for more information.");
});
