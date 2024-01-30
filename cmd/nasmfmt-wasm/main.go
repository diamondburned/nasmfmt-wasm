package main

import (
	"fmt"
	"strings"
	"syscall/js"

	"github.com/diamondburned/nasmfmt/v2/nasmfmt"
)

func main() {
	global := js.Global()
	global.Set("nasmfmt", map[string]any{
		"format": promisifyFunc(format),
	})

	select {}
}

func format(this js.Value, p []js.Value) (any, error) {
	if len(p) != 2 {
		return nil, fmt.Errorf("expected 2 arguments, got %d", len(p))
	}
	if p[0].Type() != js.TypeString {
		return nil, fmt.Errorf("p[0]: expected string, got %s", p[0].Type())
	}
	if p[1].Type() != js.TypeObject {
		return nil, fmt.Errorf("p[1]: expected object, got %s", p[1].Type())
	}

	var dst strings.Builder
	src := strings.NewReader(p[0].String())

	formatConfig := nasmfmt.FormatConfig{
		InstructionIndent: p[1].Get("instructionIndent").Int(),
		CommentIndent:     p[1].Get("commentIndent").Int(),
	}

	if err := nasmfmt.Format(&dst, src, nasmfmt.FormatConfig(formatConfig)); err != nil {
		return nil, err
	}

	return dst.String(), nil
}
