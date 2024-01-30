.PHONY: all
all: nasmfmt.wasm script.js

nasmfmt.wasm: go.sum $(wildcard cmd/nasmfmt-wasm/*.go)
	tinygo build -o $@ -target wasm $(TINYGOFLAGS) ./cmd/nasmfmt-wasm

script.js: wasm_exec.js $(shell find . -name '*.ts')
	deno bundle -q script.ts $@

wasm_exec.js:
	cp $(shell tinygo env TINYGOROOT)/targets/wasm_exec.js $@
