build: docs/brainfuck/index.wat
	wat2wasm docs/brainfuck/index.wat -r -v --no-check -o docs/brainfuck/index.wasm

archive: build
	zip hi.zip -u -r out