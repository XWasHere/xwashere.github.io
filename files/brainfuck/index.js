const template = {};

async function init() {
    console.debug("Getting template");
    const mod = await fetch("index.wasm");
    let a = await mod.arrayBuffer();
    const tb = new Uint8Array(a);
    
    console.debug(window.wasm.decompile(tb));
    //gen_module_parse_tree(tb);
};

async function compile(src) {
    function growBuffer(bytes) {
        let newbuf = new ArrayBuffer(output.byteLength + bytes);
        let newOutput = new Uint8Array(newbuf);
        newOutput.set(output);
        output = newOutput;
    }
    let source = src.split('');
    let output = []; //new Uint8Array();
    let srcptr = 0;
    let cmpptr = 0;

    // add magic and version;
    //growBuffer(8);
    //output.set([0, 97, 115, 109, ...WEBASSEMBLY_VERSION], 0);
    output = [
        0x00, 0x61, 0x73, 0x6D, // WASM MAGIC
        0x01, 0x00, 0x00, 0x00, // WASM VERSION
    ]

    for (srcptr = 0; srcptr < source.length; srcptr++) {
        console.debug(source[srcptr]);
    }

    let mod = await WebAssembly.instantiate(Uint8Array.from(output));
    return mod;
}

async function load() {
    let t = document.getElementById("src").value;
    let o = await compile(t);
    console.log(o)
}

init().then(()=>{compile("+")});