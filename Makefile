build: server.js files/index.html files/index.js files/index.wat
	rm -rf out
	mkdir out
	mkdir out/files
	cp server.js out
	cp files/index.html out/files
	cp files/index.js   out/files
	
	wat2wasm files/index.wat -o out/files/index.wasm
	cp out/files/index.wasm files/index.wasm

archive: build
	zip hi.zip -u -r out