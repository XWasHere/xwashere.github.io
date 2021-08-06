function main() {
    
}

fetch("/brainfuck/index.wasm")
    .then(m => m.arrayBuffer())
    .then(m => WebAssembly.instantiate(m, {

    }))
    .then(m => {
        window.brainfuck = m.instance.exports;
    });