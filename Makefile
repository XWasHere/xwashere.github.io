build: files/brainfuck/index.wat
	wat2wasm files/brainfuck/index.wat -r -v --no-check -o files/brainfuck/index.wasm

archive: build
	zip hi.zip -u -r out