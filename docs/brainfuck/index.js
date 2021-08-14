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

const DEBUG_CHAR = '#'

let template = {};

async function init() {
    const mod = await fetch("index.wasm");
    let a = await mod.arrayBuffer();
    const tb = new Uint8Array(a);

    template = window.wasm.decompile(tb);
    //gen_module_parse_tree(tb);
};

async function compile(config) {
    let src    = config.src;
    let inline = config.args.inline || false;
    let debug  = config.args.debug  || false;

    function growBuffer(bytes) {
        let newbuf = new ArrayBuffer(output.byteLength + bytes);
        let newOutput = new Uint8Array(newbuf);
        newOutput.set(output);
        output = newOutput;
    }

    function inline_method(index) {
        let real_index    = index - IMPORT_C;
        let input         = output.funcs[real_index].body;
        let out           = [];

        out = Array.from(input);
        out.pop();

        return out;
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

    const IMPORT_C = template.imports.length;

    const INIT_MEM = template.linking.symbols.funcs.init_mem.index.value;
    const PLUS     = template.linking.symbols.funcs.plus.index.value;
    const MINUS    = template.linking.symbols.funcs.minus.index.value;
    const RIGHT    = template.linking.symbols.funcs.right.index.value;
    const LEFT     = template.linking.symbols.funcs.left.index.value;
    const MAIN     = template.linking.symbols.funcs.main.index.value - IMPORT_C; // wtf
    const DOT      = template.linking.symbols.funcs.dot.index.value;
    const COMMA    = template.linking.symbols.funcs.comma.index.value;
    const DEBUG    = template.linking.symbols.funcs.debugger.index.value;
    const BRACKET  = template.funcs[template.linking.symbols.funcs.brackets.index.value - 2].body
    const SEP      = template.linking.symbols.funcs.sep.index.value;

    let BRACKET_SPLIT = BRACKET.findIndex((v, i, a) => {
        if (a.slice(i,i+6).join()==[0x10,0x80+SEP,0x80,0x80,0x80,0].join()) {
            return true
        }
    })
    
    const LBRACKET = BRACKET.slice(0, BRACKET_SPLIT);
    const RBRACKET = BRACKET.slice(BRACKET_SPLIT,BRACKET.length-1);

    if (inline) {
        f.push(...inline_method(INIT_MEM));
        //f.push(...template)
    }
    else f.push(0x10, INIT_MEM); // call $init_mem

    for (srcptr = 0; srcptr < source.length; srcptr++) {
        switch (source[srcptr]) {
            case '+':
                if (inline) f.push(...inline_method(PLUS))
                else f.push(0x10, PLUS);
                break;
            case '-':
                if (inline) f.push(...inline_method(MINUS))
                else f.push(0x10, MINUS); // call $minus
                break;
            case '>':
                if (inline) f.push(...inline_method(RIGHT))
                else f.push(0x10, RIGHT); // call $right
                break;
            case '<':
                if (inline) f.push(...inline_method(LEFT))
                else f.push(0x10, LEFT);  // call $left
                break;
            case '[':
                f.push(...LBRACKET)
                break;
            case ']':
                f.push(...RBRACKET)
                break;
            case '.':
                if (inline) f.push(...inline_method(DOT))
                else f.push(0x10, DOT);
                break;
            case ',':
                if (inline) f.push(...inline_method(COMMA))
                else f.push(0x10, COMMA);
                break;
            case DEBUG_CHAR:
                if (debug) {
                    if (inline) f.push(...inline_method(DEBUG))
                    else f.push(0x10, DEBUG);
                }
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

if (false)
init().then(()=>{
    return compile({
        src: "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.",
        args: {
            inline: true
        }
    })})
    .then(d => {return WebAssembly.instantiate(d,{vm:{putc:(c)=>{stdout.textContent=stdout.textContent+String.fromCharCode(c);},getc:()=>{}}})})
    .then(m=>{console.log(m);m.instance.exports.main()}, console.error)
    .then(console.log, console.error)
else {init()}

let stdout = document.getElementById("stdout");
let stdin  = document.getElementById("stdin");

var executor;

async function run() {
    stdout.textContent = ""
    executor = new Worker("executor.js");
    executor.onmessage = (ev, t) => {
        let op = ev.data;
        switch (op[0]) {
            case "PUTC":
                stdout.textContent = stdout.textContent + String.fromCharCode(op[1]);
            case "DUMP":
                console.log(ev)
                debugger;
        }
    }

    let c = document.getElementById("src").value;
    let doInline = document.getElementById("inline").checked;
    let doDebug  = document.getElementById("debug") .checked;
    let mod = await compile({src: c, args: {
        inline: doInline,
        debug:  doDebug,
    }});

    executor.postMessage(["EXEC", mod, stdin.value])
}

async function kill() {
    executor.terminate();
}

//});