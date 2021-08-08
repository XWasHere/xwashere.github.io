// Library for webassembly manipulation, Copyright XWasHere 2021

function encode_uint(N, value) {
    let o = []
    
    // let a = value.toString(2)
    //     .padStart(Math.ceil(value.toString(2).length/7)*7,"0")
    //     .split(/(.{7})/)
    //     .join(" ")
    //     .trimStart()
    //     .replaceAll("  ","1")
    //     .replace(/^/, "0")
    //     .split(/(.{8})/)
    //     .join(" ")
    //     .replaceAll("  ", " ")
    //     .trimStart()
    //     .trimEnd()
    //     .split(" ")
    //     .map((v) => Number.parseInt(v, 2))
    //     .reverse();
    // return a;

    do {
        let b = value & 0x7f
        value >>=7;
        if (value != 0) o.push(b | 0x80)
        else o.push(b)
    } while (value != 0)
    return o
}

function atos(a) {
    return Array.from(new Uint8Array(a)).map((x)=>String.fromCharCode(x)).join('');
}

const Vector = Array; // shhhhhh.........

/**
 * it's literally a byte.
 */
class byte {
    constructor(v) {
        this.value = v || 0x00;
    }
}

class u {
    constructor(N, value) {
        this.width = N     || 32;
        this.value = value || 0;
    }
}

class s {
    constructor(N, value) {
        this.width = N     || 32;
        this.value = value || 0;
    }
}

/**
 * ...
 */
class i {
    constructor(N, value) {
        this.width = N;
        this.value = new u(N, value);
    }
}

class Name {
    constructor(value) {
        this.value = value;
    }
}

const numtype = {
    i32: Symbol("i32"), i64: Symbol("i64"), f32: Symbol("f32"), f64: Symbol("f64")
};

const reftype = {
    funcref: Symbol("funcref"), externref: Symbol("externref")
};

const valtype = {
    ...numtype, ...reftype
};

const mut = {
    const: Symbol("const"),
    var: Symbol("var")
}
class ResultType {
    constructor(value) {
        this.value = new Vector(...value);
    }
}

class FuncType {
    constructor(params, result) {
        this.params = new ResultType(params);
        this.result = new ResultType(result);
    }
}

class Limits {
    constructor(min, max) {
        this.min = new u(32, min);
        this.max = new u(32, max);
    }
}

class MemType {
    constructor(min, max) {
        this.limits = new Limits(min, max);
    }
}

class tabletype {
    constructor(type, min, max) {
        this.limits = new Limits(min, max);
        this.type = type;
    }
}

class GlobalType {
    constructor(mut, type) {
        this.mutable = mut;
        this.type    = type;
    }
}

class externtype {
    constructor(value) {

    }
}

class Expr {
    constructor() {
        this.ins = null;
    } 
}

class Module {
    constructor() {
        this.types =  [];
        this.funcs =  [];
        this.tables = [];
        this.mems   = [];
        this.globals= [];
        this.elems=   [];
        this.datas=   [];
        this.start=   undefined;
        this.imports= [];
        this.exports= [];
    }

    /**
     * @param {Uint8Array} data
     */
    decode(data) {
        console.group("module")
        let bstack = [];
        let i = 0;
        let linking;

        function RF_START(t) {
            //console.groupCollapsed(t);
            bstack.push(i);
        }

        function RF_END(t) {
            let b = bstack.pop();
            //console.debug("[accept " + t + " (" + atos(data.subarray(b, i)) + ")]")
            //console.groupEnd();
        }

        function RF_FAIL(t) {
            let oldi = i;
            i = bstack.pop();
            //console.debug("[fail " + t + " (" + atos(data.subarray(i, oldi)) + ")]");
            //console.groupEnd();
        }

        function read_vec(type) {
            RF_START("vector");
            let len = read_uint(32);
            let v = new Vector();
            while (len.value > 0) {
                v.push(type());
                len.value--;
            }
            RF_END("vector");
            return v;
        }

        function read_numtype() {
            RF_START("numtype");
            let v = read_byte();
            if (v == 0x7F) {
                RF_END("numtype")
                return numtype.i32;
            }
            if (v == 0x7E) {
                RF_END("numtype")
                return numtype.i64;
            }
            if (v == 0x7D) {
                RF_END("numtype")
                return numtype.f32;
            }
            if (v == 0x7C) {
                RF_END("numtype")
                return numtype.f64;
            }
            RF_FAIL("numtype");
        }

        function read_reftype() {
            RF_START("reftype");
            let v = read_byte();
            if (v == 0x70) {
                RF_END("reftype");
                return reftype.funcref;
            }
            if (v == 0x6F) {
                RF_END("reftype");
                return reftype.externref;
            }
            RF_FAIL("reftype")
        }

        function read_valtype() {
            RF_START("valtype");
            let v;
            if (v = read_numtype()) {
                RF_END("valtype");
                return v;
            }
            if (v = read_reftype()) {
                RF_END("valtype");
                return v;
            }
            RF_FAIL("valtype");
        }

        function read_resulttype() {
            RF_START("resulttype");
            let r = read_vec(read_valtype);
            RF_END("resulttype");
            return r;
        }

        function read_functype() {
            RF_START("functype");
            let f = new FuncType([],[]);
            if (read_byte()!=0x60) {
                RF_FAIL("functype");
                return;
            }
            f.params = read_resulttype();
            f.result = read_resulttype();
            RF_END("functype");
            return f
        }

        function read_byte() {
            RF_START("byte")
            let l = data[i]
            i++;
            RF_END("byte")
            return l;
        }

        function read_uint(N) {
            RF_START("u"+N);
            let n = read_byte();
            if ((n<(2**7))&&(n<(2**N))) {
                RF_END("u"+N);
                return new u(N,n);
            }
            let m = read_uint(N-7);
            if ((n >= (2**7))&&(N>7)) {
                RF_END("u"+N);
                return new u(N,((2**7)*m.value) + (n-(2**7)))
            }
            RF_FAIL("u"+N);
        }

        function read_section(id, type) {
            RF_START("section");
            let N = read_byte();
            if (N != id) {
                RF_FAIL("section");
                return
            }
            let size = read_uint(32).value;
            let cont = type(size);
            RF_END("section")
            return cont;
        }

        function read_customsec() {
            RF_START("customsec");
            let d;
            if (!(d=read_section(0, read_custom))) {
                RF_FAIL("customsec");
                return;
            }
            RF_END("customsec");
            return true;
        }

        function read_custom(len) {
            RF_START("custom");
            let j = len;
            let name = atos(read_name().value);
            if (name == "linking") {
                console.debug("found special non-standard section: LINKING (result: evaluating)")
                linking = read_linkingsec();
                RF_END("custom");
                return true;
            }
            else {
                i = j;
                RF_END("custom");
                return true;
            }
        }

        function read_typesec() {
            RF_START("typesec");
            let t = read_section(1,read_vec.bind(this,read_functype));
            RF_END("typesec");
            return t;
        }

        function read_typeidx() {
            RF_START("typeidx");
            let x = read_uint(32);
            RF_END("typeidx")
            return x;
        }

        function read_funcsec() {
            RF_START("funcsec");
            let f = read_section(3,read_vec.bind(this,read_typeidx));
            RF_END("funcsec");
            return f;
        }

        function read_limits() {
            RF_START("limits");
            let b = read_byte()
            let l = new Limits();
            if (b == 0) {
                let n = read_uint(32);
                l.min = n;
                RF_END("limits");
                return l
            }
            else if (b == 1) {
                let n = read_uint(32);
                let m = read_uint(32);
                l.min = n;
                l.max = m;
                RF_END("limits");
                return l;
            }

            RF_FAIL("limits");
        }

        function read_memtype() {
            RF_START("memtype");
            let l = read_limits();
            RF_END("memtype");
            return l;
        }

        function read_mem() {
            RF_START("mem")
            let mt = read_memtype();
            let m = new Mem();
            m.type.limits = mt;
            RF_END("mem")
            return m;
        }

        function read_memsec() {
            RF_START("memsec");
            let m = read_section(5,read_vec.bind(this,read_mem));
            RF_END("memsec")
            return m;
        }

        function read_mut() {
            RF_START("mut");
            let b = read_byte()
            if (b == 0) {
                RF_END("mut");
                return mut.const;
            }
            else if (b == 1) {
                RF_END("mut")
                return mut.var;
            }
            RF_FAIL("mut");
        }

        function read_globaltype() {
            RF_START("globaltype")
            let t = read_valtype();
            let m = read_mut();
            let gt = new GlobalType();
            gt.mutable = m;
            gt.type = t;
            RF_END("globaltype")
            return gt
        }

        function read_instr() {
            
        }

        function read_expr() {
            RF_START("expr")
            let o = i;
            let oi = i;
            let done = false;
            let depth = 1;
            while (depth > 0) {
                let ins = data[o];
                if (ins == 0xFC) {
                    o++;
                }
                else {
                    if (ins == 0x0B) {
                        depth--;
                    }
                    else if ([0x02, 0x03, 0x04].includes(ins)) {
                        depth++;
                    }
                }
                o++;
            }
            RF_END("expr")
            i = o;
            let e = data.subarray(oi,i);
            return e;
        }

        function read_global() {
            RF_START("global");
            let gt = read_globaltype();
            let e  = read_expr();
            let g  = new Global()
            g.type = gt;
            g.init = e;
            RF_END("global");
            return g
        }

        function read_globalsec() {
            RF_START("globalsec");
            let g = read_section(6,read_vec.bind(this,read_global));
            RF_END("globalsec");
            return g;
        }

        function read_name() {
            RF_START("name")
            let n = read_vec(read_byte);
            RF_END("name")
            let nm= new Name()
            nm.value = n;
            return nm;
        }

        function read_exportdesc() {
            RF_START("exportdesc")
            let d = new ExportDesc();
            let type= read_byte();
            d.type  = type
            d.index = read_uint(32);
            RF_END("exportdesc")
            return d;
        }

        function read_export() {
            RF_START("export")
            let nm = read_name();
            let d  = read_exportdesc();
            let e  = new Export();
            e.name = nm;
            e.desc = d;
            RF_END("export")
            return e
        }

        function read_exportsec() {
            RF_START("exportsec")
            let e = read_section(7,read_vec.bind(this,read_export))
            RF_END("exportsec")
            return e;
        }

        function read_locals() {
            RF_START("locals")
            let n = read_uint(32);
            let t = read_valtype();
            RF_END("locals")
            let r = [];
            while (n.value > 0) {
                r.push(t);
            }
            return r
        }

        function read_func() {
            RF_START("func")
            let t = read_vec(read_locals);
            let e = read_expr();
            RF_END("func")
            let l = []
            t.forEach((a) => {
                l.push(...a)
            });
            return {l, e}
        }

        function read_code() {
            RF_START("code")
            let s = read_uint(32);
            let code = read_func();
            RF_END("code")
            return code;
        }

        function read_codesec() {
            RF_START("codesec")
            let c = read_section(10, read_vec.bind(this, read_code));
            RF_END("codesec")
            return c;
        }

        function read_linkingsec() {
            RF_START("linking")
            let l = {}
            let version = read_byte();
            let what    = read_byte();
            if (what == 8) {
                RF_START("symbol table")
                let symbols = {globals:{},funcs:{}}
                let size = read_uint(32);
                let count = read_uint(32);
                while (count.value>0) {
                    count.value--;
                    let symbol = {}
                    symbol.type = read_byte();
                    symbol.flags= read_uint(32);
                    symbol.index= read_uint(32);
                    symbol.name = read_name();
                    if (symbol.type == 0x00) {
                        symbols.funcs[atos(symbol.name.value)] = symbol;
                    }
                    else if (symbol.type == 0x02) {
                        symbols.globals[atos(symbol.name.value)] = symbol
                    }
                }
                l.symbols = symbols
                RF_END("symbol table")
            }
            RF_END("linking")
            return l
        }

        if (![...(data.subarray(0, 8).values())].join()==[0x00,0x61,0x73,0x6D,0x01,0x00,0x00,0x00].join()) {
            return
        }

        i = 8;
        while (read_customsec()) {};
        let functype = read_typesec();
        while (read_customsec()) {};
        let imports;
        while (read_customsec()) {};
        let typeidx = read_funcsec();
        while (read_customsec()) {};
        let table;
        while (read_customsec()) {};
        let mem = read_memsec();
        while (read_customsec()) {};
        let global = read_globalsec();
        while (read_customsec()) {};
        let exports= read_exportsec();
        while (read_customsec()) {};
        let start;
        while (read_customsec()) {};
        let elems;
        while (read_customsec()) {};
        let m;
        while (read_customsec()) {};
        let code   = read_codesec();
        while (read_customsec()) {};
        let mdata;
        while (read_customsec()) {};

        this.types = functype;
        this.mems  = mem;
        this.globals=global;
        this.exports=exports;
        this.funcs  =new Vector();
        this.linking=linking;
        code.forEach((c, i) => {
            let f = new Func();
            f.type = typeidx[i].value
            f.locals = c.l;
            f.body = c.e;
            this.funcs.push(f)
        })
        console.groupEnd();
    }

    // im so sorry...
    encode() {
        let data = [0x00,0x61,0x73,0x6D,0x01,0x00,0x00,0x00];

        // types
        data.push(0x01);
        
        let temp = data.length;        
        let count = 0;
        
        this.types.forEach((t) => {
            data.push(0x60);
            count++;
            (()=>{
                let temp = data.length;
                let count = 0;
                
                t.params.forEach((p)=>{
                    switch (p) {
                        case valtype.i32:
                            data.push(0x7F);
                            break;
                        case valtype.i64:
                            data.push(0x7E);
                            break;
                        case valtype.f32:
                            data.push(0x7D);
                            break;
                        case valtype.f64:
                            data.push(0x7C);
                            break;
                        case valtype.funcref:
                            data.push(0x70);
                            break;
                        case valtype.externref:
                            data.push(0x6F);
                            break;
                    }
                    count++
                })

                data.splice(temp,0,...encode_uint(32,count))       
            })();
            (()=>{
                let temp = data.length;
                let count = 0;
                
                t.result.forEach((r)=>{
                    switch (r) {
                        case valtype.i32:
                            data.push(0x7F);
                            break;
                        case valtype.i64:
                            data.push(0x7E);
                            break;
                        case valtype.f32:
                            data.push(0x7D);
                            break;
                        case valtype.f64:
                            data.push(0x7C);
                            break;
                        case valtype.funcref:
                            data.push(0x70);
                            break;
                        case valtype.externref:
                            data.push(0x6F);
                            break;
                    }
                    count++
                })

                data.splice(temp,0,...encode_uint(32,count))       
            })()
        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))
        
        // functions
        data.push(0x03);
        
        temp = data.length;
        count= 0;

        let types = this.funcs.map((v) => {return v.type})
        
        types.forEach((t) => {
            data.push(...encode_uint(32,t))
            count++;
        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))
        
        // memories
        data.push(0x05);

        temp = data.length;
        count= 0;

        this.mems.forEach((m) => {
            let min = m.type.limits.min.value;
            let max = m.type.limits.max.value;
            if (max) {data.push(0x01)} else {data.push(0x00)}
            data.push(...encode_uint(min))
            if (max) {data.push(...encode_uint(min))};
            count++
        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))
        
        // globals
        data.push(0x06);

        temp = data.length;
        count= 0;

        this.globals.forEach((m) => {
            switch (m.type.type) {
                case valtype.i32:
                    data.push(0x7F);
                    break;
                case valtype.i64:
                    data.push(0x7E);
                    break;
                case valtype.f32:
                    data.push(0x7D);
                    break;
                case valtype.f64:
                    data.push(0x7C);
                    break;
                case valtype.funcref:
                    data.push(0x70);
                    break;
                case valtype.externref:
                    data.push(0x6F);
                    break;
            }
            switch (m.type.mutable) {
                case mut.const:
                    data.push(0x00);
                    break;
                case mut.var:
                    data.push(0x01);
                    break;
            }
            data.push(...m.init)
            count++
        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))

        // exports
        data.push(0x07);

        temp = data.length;
        count= 0;

        this.exports.forEach((e) => {
            count++;
            (()=>{
                let temp = data.length;
                data.push(...e.name.value)
                data.splice(temp,0,...encode_uint(32,data.length-temp))
            })()
            data.push(e.desc.type)
            data.push(...encode_uint(32,e.desc.index.value))
        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))

        // code
        data.push(0xA);

        temp = data.length;
        count= 0;

        this.funcs.forEach((c) => {
            count++
            (()=>{
                let temp = data.length;
                (()=>{
                    let temp = data.length;
                    let count= 0;
                    c.locals.forEach(()=>{})
                    data.splice(temp,0,...encode_uint(32,count))
                })()
                c.body.forEach((i) => {
                    data.push(i);
                })
                data.splice(temp,0,...encode_uint(32,data.length-temp))
            })()

        })

        data.splice(temp,0,...encode_uint(32,count))
        data.splice(temp,0,...encode_uint(32,data.length-temp))

        return Uint8Array.from(data);
    }
}

class funcidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class TypeIdx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class tableidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class memidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class globalidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class elemidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class dataidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class localidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class labelidx {
    constructor(index) {
        this.value = new u(32,index)
    }
}

class Func {
    constructor(type, locals, body) {
        this.type = type;
        this.locals = locals;
        this.body = body;
    }
}

class table {
    constructor(type) {
        this.type = type
    }
}

class Mem {
    constructor(type) {
        this.type = new MemType();
    }
}

class Global {
    constructor(type, init) {
        this.type = type;
        this.init = init;
    }
}

class elem {
    constructor(type, init, mode) {
        this.type = type;
        this.init = init;
        this.mode = mode;
    }
}

class elemmode {
    static passive     = Symbol("passive");
    static active      = Symbol("active");
    static declarative = Symbol("declarative");

    constructor(type, table, offset) {
        this.type = type;
        this.table = table;
        this.offset = offset;
    }
}

class Data {
    constructor(init, mode) {
        this.init = init;
        this.mode = mode;
    }
}

class datamode {
    static passive = Symbol("passive");
    static active  = Symbol("active");

    constructor(mode, memory, offset) {
        this.mode   = mode;
        this.memory = memory;
        this.offset = offset;
    }
}

class start {
    constructor(func) {
        this.func = func;
    }
}

class Export {
    constructor(name, desc) {
        this.name = name;
        this.desc = desc;
    }
}

class ExportDesc {
    constructor(index) {
        this.index = index;
    }
}

class Import {
    constructor(module, name, desc) {
        this.module = module;
        this.name = name;
        this.desc = desc;
    }
}

class ImportDesc {
    constructor(thing) {
        this.func = thing;
        this.table = thing;
        this.mem = thing;
        this.global = thing;
    }
}
/**
 * doesn't really decompile i don't know what the fuck i am doing
 */
function decompile(mod) {
    let m = new Module();
    m.decode(mod);
    console.log(m)
    return m
}

window.wasm = {decompile, Module, encode_uint};