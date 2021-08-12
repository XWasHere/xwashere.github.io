/*
    WASM Brainfuck

    Copyright (C) 2021 XWasHere 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

let template = {};

async function init() {
    console.debug("Getting template");
    const mod = await fetch("index.wasm");
    let a = await mod.arrayBuffer();
    const tb = new Uint8Array(a);

    template = window.wasm.decompile(tb);
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
    const RIGHT    = template.linking.symbols.funcs.right.index.value;
    const LEFT     = template.linking.symbols.funcs.left.index.value;
    const MAIN     = template.linking.symbols.funcs.main.index.value - 2; // wtf
    const DOT      = template.linking.symbols.funcs.dot.index.value;
    const COMMA    = template.linking.symbols.funcs.comma.index.value;

    const BRACKET  = template.funcs[template.linking.symbols.funcs.brackets.index.value - 2].body
    const SEP      = template.linking.symbols.funcs.sep.index.value;
    let BRACKET_SPLIT = BRACKET.findIndex((v, i, a) => {
        if (a.slice(i,i+6).join()==[0x10,0x80+SEP,0x80,0x80,0x80,0].join()) {
            return true
        }
    })
    const LBRACKET = BRACKET.slice(0, BRACKET_SPLIT);
    const RBRACKET = BRACKET.slice(BRACKET_SPLIT,BRACKET.length-1);

    f.push(0x10, INIT_MEM); // call $init_mem
    
    for (srcptr = 0; srcptr < source.length; srcptr++) {
        switch (source[srcptr]) {
            case '+':
                f.push(0x10, PLUS);  // call $plus
                break;
            case '-':
                f.push(0x10, MINUS); // call $minus
                break;
            case '>':
                f.push(0x10, RIGHT); // call $right
                break;
            case '<':
                f.push(0x10, LEFT);  // call $left
                break;
            case '[':
                f.push(...LBRACKET)
                break;
            case ']':
                f.push(...RBRACKET)
                break;
            case '.':
                f.push(0x10, DOT);
                break;
            case ',':
                f.push(0x10, COMMA);
                break;
            default:
        }
    }

    f.push(0x0B); // end

    output.funcs[MAIN].body = f;

    let i = document.getElementById("stdin").value
    let o = document.getElementById("stdout")

    /*let mod = await WebAssembly.instantiate(output.encode(), {
        // not a vm but youknow

        vm: {
            putc: (c) => {
                o.textContent = o.textContent + String.fromCharCode(c);
            },
            getc: () => {
                let c = i[0];
                i = i.substr(1)
                if (c) return c.charCodeAt(0)
                else return 0;
            }
        }
    });
    
    console.log(mod.instance.exports)
    mod.instance.exports.main();
    */
    return output.encode();
}

async function load() {
    document.getElementById("stdout").textContent = ""
    let t = document.getElementById("src").value;
    compile(t);
}

//init().then(()=>{
    //compile("++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.")})

init();

let stdout = document.getElementById("stdout");
let stdin  = document.getElementById("stdin");

var executor;

async function run() {
    stdout.textContent = ""
    executor = new Worker("executor.js");
    executor.onmessage = (ev) => {
        let op = ev.data;
        console.log(ev)
        switch (op[0]) {
            case "PUTC":
                stdout.textContent = stdout.textContent + String.fromCharCode(op[1]);
        }
    }
    let c = document.getElementById("src").value;
    let mod = await compile(c)
    executor.postMessage(["EXEC", mod, stdin.value])
}

async function kill() {
    executor.terminate();
}

//});