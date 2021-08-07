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

class name {
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
        
        function RF_START(t) {
            console.groupCollapsed(t);
            bstack.push(i);
        }

        function RF_END(t) {
            let b = bstack.pop();
            console.debug("[accept " + t + " (" + atos(data.subarray(b, i)) + ")]")
            console.groupEnd();
        }

        function RF_FAIL(t) {
            let oldi = i;
            i = bstack.pop();
            console.debug("[fail " + t + " (" + atos(data.subarray(i, oldi)) + ")]");
            console.groupEnd();
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
            if (!read_section(0, read_custom)) {
                RF_FAIL("customsec");
                return;
            }
            RF_END("customsec");

            return true;
        }

        function read_custom(len) {
            RF_START("custom");
            i += len;
            RF_END("custom");
            return true;
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
            while (!done) {
                let ins = data[o];
                if (ins == 0x0B) {
                    done = true;
                }
                else if ([0x02, 0x03, 0x04].includes(ins)) {
                    i = o;
                    read_expr();
                    o = i
                    i = oi
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

        this.types = functype;
        this.mems  = mem;
        this.globals=global;
        console.groupEnd();
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

class func {
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

class data {
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

window.wasm = {decompile};