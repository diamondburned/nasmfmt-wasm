package main

import (
	"fmt"
	"runtime/debug"
	"syscall/js"
)

func promisifyFunc(fn func(js.Value, []js.Value) (any, error)) js.Func {
	return js.FuncOf(func(this js.Value, args []js.Value) any {
		handler := js.FuncOf(func(_ js.Value, promiseArgs []js.Value) any {
			resolve := promiseArgs[0]
			reject := promiseArgs[1]
			go func() {
				defer func() {
					if err := recover(); err != nil {
						jsError := js.Global().Get("Error").New(fmt.Sprintf(
							"panic occured: %v\nstack: %s", err, string(debug.Stack()),
						))
						reject.Invoke(jsError)
					}
				}()
				result, err := fn(this, args)
				if err != nil {
					jsError := js.Global().Get("Error").New(err.Error())
					reject.Invoke(jsError)
				} else {
					resolve.Invoke(result)
				}
			}()
			return nil
		})
		return js.Global().Get("Promise").New(handler)
	})
}
