let template = {};

async function init() {
    console.debug("Getting template");
    const mod = await fetch("index.wasm");
    let a = await mod.arrayBuffer();
    const tb = new Uint8Array(a);

    template = window.wasm.decompile(tb);
    WebAssembly.instantiate(template.encode());
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
    let output = template; //new Uint8Array();
    let srcptr = 0;
    let cmpptr = 0;

    // add magic and version;
    //growBuffer(8);
    //output.set([0, 97, 115, 109, ...WEBASSEMBLY_VERSION], 0);

    // get refs to functions we'll call in the template module
    let f = [];
    const INIT_MEM = template.linking.symbols.funcs.init_mem.index.value;
    const PLUS     = template.linking.symbols.funcs.plus.index.value;
    const MINUS    = template.linking.symbols.funcs.minus.index.value;
    const MAIN     = template.linking.symbols.funcs.main.index.value;

    f.push(0x10, INIT_MEM); // call $init_mem
    
    for (srcptr = 0; srcptr < source.length; srcptr++) {
        switch (source[srcptr]) {
            case '+':
                f.push(0x10, PLUS); //call $plus
                break;
            case '-':
                f.push(0x10, MINUS);
                break;
            default:
                console.debug("ignoring unknown character " + source[srcptr])
        }
    }

    f.push(0x0B); // end

    output.funcs[MAIN].body = f;

    console.log(output.encode())
    let mod = await WebAssembly.instantiate(output.encode());
    console.log(mod)
    mod.instance.exports.main();
    return mod;
}

async function load() {
    let t = document.getElementById("src").value;
    let o = await compile(t);
    console.log(o)
}

init().then(()=>{compile("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.")});