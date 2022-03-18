/*
    X's thing
    Copyright (C) 2022 XWasHere 
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

var calc_root;
var input_container;
var input_thing;
var output_container;
var output_thing;

const OVERLOAD_OP       = 1;
const OVERLOAD_FUNCTION = 2;

function mangle(args) {
	let m = args.name;
	return m;
}

export function disassemble(code) {
	if (code.tier == 1) {
		let ppad = code.code.length.toString(16).length;
		
		let disassembly = "";
		for (let i = 0; i < code.code.length;) {
			disassembly += `\t\t0x${i.toString(16).padStart(ppad, "0")} `;
			if (code.code[i] == CJS_OP_NOOP) {
				i++;
				
				disassembly += "noop";
			} else if (code.code[i] == CJS_OP_DVAR) {
				i++;
				
				let type = "";
				for (; code.code[i] != 0 && i < code.code.length; i++) type += String.fromCharCode(code.code[i]);
				i++;
				
				let name = ""
				for (; code.code[i] != 0 && i < code.code.length; i++) name += String.fromCharCode(code.code[i]);
				i++;

				disassembly += `dvar "${type}", "${name}"`;
			} else if (code.code[i] == CJS_OP_LDI64) {
				i++;

				let reg = code.code[i++];
				let value = i64_dc(code.code, i);

				i += 8;

				disassembly += `ldi64 $${value}, %r${reg}`
			} else if (code.code[i] == CJS_OP_ADD) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `add %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_SUB) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `sub %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_MUL) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `mul %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_DIV) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `div %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_MOD) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `mod %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_LGAND) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `lgand %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_LGOR) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `lgor %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_EQ) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `eq %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_NEQ) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `neq %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_GT) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `gt %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_LT) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `lt %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_GE) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `ge %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_LE) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `le %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_LGNOT) {
				i++;

				disassembly += `lgnot %${code.code[i++]}`;
			} else if (code.code[i] == CJS_OP_NEG) {
				i++;

				disassembly += `neg %${code.code[i++]}`;
			} else if (code.code[i] == CJS_OP_SVAR) {
				i++;

				let reg = code.code[i++];
				let name = "";
				for (; code.code[i] != 0; i++) name += String.fromCharCode(code.code[i]);
				i++;
				
				disassembly += `svar %${reg}, "${name}"`
			} else if (code.code[i] == CJS_OP_GVAR) {
				i++;

				let reg = code.code[i++];
				let name = "";
				for (; code.code[i] != 0; i++) name += String.fromCharCode(code.code[i]);
				i++;
				
				disassembly += `gvar "${name}", %${reg}`
			} else if (code.code[i] == CJS_OP_JMP) {
				i++;

				let addr = i64_dc(code.code, i);

				i+= 8;

				disassembly += `jmp $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_JT) {
				i++;

				let reg = code.code[i++];
				let addr = i64_dc(code.code, i);

				i += 8;

				disassembly += `jt %r${reg}, $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_JF) {
				i++;

				let reg = code.code[i++];
				let addr = i64_dc(code.code, i);

				i += 8;

				disassembly += `jf %r${reg}, $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_PUSH) {
				i++;

				let reg = code.code[i++];

				disassembly += `push %${reg}`;
			} else if (code.code[i] == CJS_OP_POP) {
				i++;

				let reg = code.code[i++];

				disassembly += `pop %${reg}`;
			} else if (code.code[i] == CJS_OP_MOV) {
				i++;

				let r1 = code.code[i++];
				let r2 = code.code[i++];

				disassembly += `mov %${r2}, %${r1}`;
			} else if (code.code[i] == CJS_OP_CALL) {
				i++;

				let addr = i64_dc(code.code, i);

				i+= 8;

				disassembly += `call 0x0${addr.toString(16).padStart(ppad, "0")}`;
			} else if (code.code[i] == CJS_OP_HCALL) {
				i++;

				let nm = "";
				for (; code.code[i] != 0 && i < code.code.length; i++) nm += String.fromCharCode(code.code[i]);
				i++;

				disassembly += `hcall ${nm}`;
			} else if (code.code[i] == CJS_OP_RET) {
				i++;

				disassembly += `ret`;
			} else {
				i++;
				
				disassembly += `invalid $0x${code.code[i - 1].toString(16).padStart(2, "0")}`
			}
			disassembly += "\n";
		}
		
		return `stuff:\n\ttier: baseline (1)\n\tcode length: ${code.code.length}\n\tdisassembly:\n${disassembly}`;
	}
}

function i64_dc(buf, pos) {
	pos = pos ?? 0;
	
	return (
		0 |
		0 |
		0 |
		0 |
		buf[pos + 4] >> 24 |
		buf[pos + 5] >> 16 |
		buf[pos + 6] >> 8  |
		buf[pos + 7]
	);
}

export class CJSType {
	is_primitave = false;
	tr;
	
	methods = {};
	
	constructor() {
		
	}

	cast(x) {
		if (x.type.ops[this.type.tr]) {
			return x.type.ops[this.type.tr].call([x]);
		}
	}

	bind_method(n, f) {
		if (!this.methods[n]) {
			this.methods[n] = [];
		}

		this.methods[n].push(f);
	}
	
	exec_op(x, o, y) {
		let op = this.ops[o];

		if (op) {
			let o1 = op[x.type.tr];
			if (o1) {
				let o2 = o1[y.type.tr];
				if (o2) {
					return o2.call([x, y]);
				}
			}
		}
	}

	static exec_op(x, o, y) {
		let r;

		if (r = x.type.exec_op(x, o, y)) {
			return r;
		} else if (r = y.type.exec_op(x, o, y)) {
			return r;
		} else {
			let cy = x.type.cast(y)
			if (cy) {
				if (r = x.type.exec_op(x, o, cy)) {
					return r;
				}
			}
			
			let cx = y.type.cast(x);
			if (cx) {
				if (r = y.type.exec_op(cx, o, y)) {
					return r;
				}
			}
		}
	}
}

export class CJSValue {
	type;
	value;
}

export class CJSBoundFunction {
	args;
	retv;
	handler;
	
	static bind(a, r, h) {
		let f = new CJSBoundFunction();

		f.args = a;
		f.retv = r;
		f.handler = h;
		
		return f;
	}
	
	call(args) {
		let nargs = [];

		args.forEach((a, i) => {
			if (a.type.tr != this.args[i].tr) {
				let v;
				
				let m = a.type.methods["operatorcast"];

				for (let i = 0; i < m.length; i++) {
					if (m[i].retv.tr == this.args[i].tr) {
						v = m[i].call([a]);
						break;
					}
				}

				if (v) {
					nargs.push(v);
				} else {
					throw `[!VM{type error, ${a.type.tr.description} -> ${this.args[i].tr.description}}]`;
				}
			} else {
				nargs.push(a)
			}
		})
		
		return this.handler(...nargs);
	}
}

export class CJSContext {
	parent  = null;
	vars    = {}; // TODO: merge into syms
	funcs   = {}; // TODO: merge into syms
	types   = {}; // TODO: merge into syms
	syms    = {};
	trapd   = false;
	trapv   = "";

	getv(n) {
		if (this.vars[n]) {
			return this.vars[n];
		} else {
			if (this.parent) {
				return this.parent.getv(n);
			}
		}
	}

	getf(n) {
		if (this.funcs[n]) {
			return this.funcs[n];
		} else {
			if (this.parent) {
				return this.parent.getf(n);
			}
		}
	}

	gett(n) {
		if (this.types[n]) {
			return this.types[n];
		} else {
			if (this.parent) {
				return this.parent.gett(n);
			}
		}
	}

	gets(n) {
		if (this.syms[n]) {
			return this.syms[n];
		} else {
			if (this.parent) {
				return this.parent.gets(n);
			}
		}
	}
	
	bindf(n, a, r, h) {
		let f = new CJSBoundFunction();

		f.args = a;
		f.retv = r;
		f.handler = h;

		if (this.funcs[n] == undefined) this.funcs[n] = []; 
		this.funcs[n].push(f);
	}
}

export class CJSIdentifier {
	name;

	exec(i, context) {
		return context.getv(this.name);
	}

	static parse(p) {
		let r = new CJSIdentifier();
		let t;

		if (/[\p{ID_Start}_]/u.test(p.src[p.pos])) {
			r.name = p.src[p.pos];
			p.pos++;
			
			while (/\p{ID_Continue}/u.test(p.src[p.pos]) && p.src[p.pos] != undefined) {
				r.name += p.src[p.pos];
				p.pos++;
			}
			
			return r;
		}
	}
}

export class CJSNumber {
	value;

	exec(i, context) {
		let v = new CJSValue();

		v.type  = context.gett("int");
		v.value = this.value;
		
		return v;
	}
	
	static parse(p) {
		let r = new CJSNumber();
		let t;

		let nm = undefined;
		
		while (/[0123456789]/.test(p.src[p.pos])) {
			if (nm == undefined) nm = 0;
			
			nm *= 10;
			nm += new Number(p.src[p.pos]);
			
			p.pos++;
		}

		r.value = nm;

		if (nm != undefined) {
			return r;
		}
	}
}

export class CJSParenExpr {
	expr;
	
	exec(i, context) {
		return i.exec(this.expr);
	}
	
	static parse(p) {
		let t;
		let r = new CJSParenExpr();
		
		if (p.src[p.pos] == "(") {
			p.pos++;
			p.eat_ws();
			t = p.parse(CJSConditional);
			if (t) {
				p.eat_ws();
				if (p.src[p.pos] == ")") {
					p.pos++;
					r.expr = t;
					return r;
				}
			}
		}
	}
}

export class CJSVarDeclaration {
	name;
	type;
	init;
	
	exec(i, context) {
		let v = new CJSValue();

		v.type = context.gett(this.type);

		if (context.vars[this.name] == undefined) {
			context.vars[this.name] = v;
		} else i.trap(`${this.name} already declared`);

		if (this.init) {
			let res = i.exec(this.init);
			i.exec_overload(context, OVERLOAD_OP, "operator=", [v, res]);
		}
	}
	
	static parse(p) {
		let r = new CJSVarDeclaration();
		let t;

		if (t = p.parse(CJSIdentifier)) {
			r.type = t.name;
			if (p.src[p.pos] == " ") {
				p.pos++;
				p.eat_ws();
				if (t = p.parse(CJSIdentifier)) {
					r.name = t.name;
					p.eat_ws();
					if (p.src[p.pos] == "=") {
						p.pos++;
						p.eat_ws();
						if (t = p.parse(CJSAssignment)) {
							r.init = t;
						} else {
							return;
						}
					}
					p.eat_ws();
					if (p.src[p.pos] == ';') {
						p.pos++;
						return r;
					}
				}
			}
		}
	}
}

export class CJSPrimary {
	a;

	exec(i, context) {
		return i.exec(this.a);
	}
	
	static parse(p) {
		let r = new CJSPrimary();
 		let t;

		if (t = p.parse(CJSNumber)) {
			r.a = t;
			return r;
		}
		
		if (t = p.parse(CJSParenExpr)) {
			r.a = t;
			return r;
		}

		if (t = p.parse(CJSCall)) {
			r.a = t;
			return r;
		}

		if (t = p.parse(CJSIdentifier)) {
			r.a = t;
			return r;
		} 
	}
}

export class CJSUnary {
	type;
	a;

	exec(i, context) {
		if (this.type == "-") {
			let a = i.exec(this.a);
			let r = new CJSValue();

			console.log(a);
			
			if (a.type.tr.description == "int" || a.type.tr.description == "float") {
				r.type  = a.type;
				r.value = -a.value;
			} else {
				r.type  = context.gett("int");
				r.value = -0;
			}

			return r;
		} else if (this.type) {
			let a = i.exec(this.a);

			let r = i.exec_overload(context, OVERLOAD_OP, `operator${this.type}`, [a]);

			if (r) {
				return r;
			} else {
				i.trap(`cant execute op  ${this.type} ${a.type.tr.description}`);
			}
		} else {
			return i.exec(this.a);
		}
	}
	
	static parse(p) {
		let t, r = new CJSUnary();

		if (t = p.parse(CJSPrimary)) {
			r.a = t;
			return r;
		}

		if (p.src[p.pos] == "-" || p.src[p.pos] == "!") {
			r.type = p.src[p.pos];
			p.pos++;
			p.eat_ws();
			if (t = p.parse(CJSUnary)) {
				r.a = t;
				return r;
			}
		}
	}
}

export class CJSExponent {
	a;
	b;

	exec(i, context) {
		if (this.b) {
			let a = i.exec(this.a);
			let b = i.exec(this.b);

			let r = i.exec_overload(context, OVERLOAD_OP, "operator**", [a, b]);

			if (r) {
				return r;
			} else {
				i.trap(`cant execute op ${a.type.tr.description} ^ ${a.type.tr.description}`);
			}
		} else {
			return i.exec(this.a);
		}
	}
	
	static parse(p) {
		let r = new CJSExponent();
		let t;

		if (t = p.parse(CJSUnary)) {
			r.a = t;
			p.eat_ws();
			if (p.src[p.pos] == "*" && p.src[p.pos+1] == "*") {
				p.pos++;
				if (p.src[p.pos] == "*") {
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSExponent)) {
						r.b = t;
						return r;
					}
				}
			} else {
				return r;
			}
		}
	}
}

export class CJSMultiplicitave {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type) {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = i.exec_overload(context, OVERLOAD_OP, `operator${this.type}`, [a, b]);
				
				if (r) {
					return r;
				} else {
					i.trap(`cant execute op ${a.type.tr.description} ${this.type} ${a.type.tr.description}`);
				}
			}
		} else {
			return i.exec(this.b);
		}
	}
	
	static parse(p) {
		let r = new CJSMultiplicitave();
		let t;

		if (t = p.parse(CJSExponent)) {
			r.b = t;

			while (true) {
				p.eat_ws();
				if (/[*/%]/.test(p.src[p.pos])) {
					let type = p.src[p.pos];
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSExponent)) {
						let o = r;
						r = new CJSMultiplicitave();
						r.type = type;
						r.a = o;
						r.b = t;
					}
				} else {
					return r;
				}
			}
		}
	}
}

export class CJSAdditive {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type) {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = i.exec_overload(context, OVERLOAD_OP, `operator${this.type}`, [a, b]);
	
				if (r) {
					return r;
				} else {
					i.trap(`cant execute op ${a.type.tr.description} ${this.type} ${a.type.tr.description}`);
				}
			}
		} else {
			return i.exec(this.b);
		}
	}
	
	static parse(p) {
		let r = new CJSAdditive();
		let t;

		if (t = p.parse(CJSMultiplicitave)) {
			r.b = t;

			while (true) {
				p.eat_ws();
				if (p.src[p.pos] == "+" || p.src[p.pos] == "-") {
					let type = p.src[p.pos];
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSMultiplicitave)) {
						let o = r;
						r = new CJSAdditive();
						r.type = type;
						r.a = o;
						r.b = t;
					}
				} else {
					return r;
				}
			}
		}
	}
}

export class CJSRelational {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type) {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = i.exec_overload(context, OVERLOAD_OP, `operator${this.type}`, [a, b]);
	
				if (r) {
					return r;
				} else {
					i.trap(`cant execute op ${a.type.tr.description} ${this.type} ${a.type.tr.description}`);
				}
			}
		} else {
			return i.exec(this.b);
		}
	}
	
	static parse(p) {
		let t, r = new CJSRelational();

		if (t = p.parse(CJSAdditive)) {
			r.b = t;

			while (true) {
				p.eat_ws();
				if (p.src[p.pos] == "<" && p.src[p.pos+1] == '=') {
					p.pos += 2;
					p.eat_ws();
					if (t = p.parse(CJSAdditive)) {
						let o = r;
						r = new CJSRelational();
						r.type = "<=";
						r.a = o;
						r.b = t;
					}
				} else if (p.src[p.pos] == ">" && p.src[p.pos+1] == '=') {
					p.pos += 2;
					p.eat_ws();
					if (t = p.parse(CJSAdditive)) {
						let o = r;
						r = new CJSRelational();
						r.type = ">=";
						r.a = o;
						r.b = t;
					}
				} else if (p.src[p.pos] == ">") {
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSAdditive)) {
						let o = r;
						r = new CJSRelational();
						r.type = ">";
						r.a = o;
						r.b = t;
					}
				} else if (p.src[p.pos] == "<") {
					p.pos += 1;
					p.eat_ws();
					if (t = p.parse(CJSAdditive)) {
						let o = r;
						r = new CJSRelational();
						r.type = "<";
						r.a = o;
						r.b = t;
					}
				} else {
					return r;
				}
			}
		}
	}
}

export class CJSEquality {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type) {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = i.exec_overload(context, OVERLOAD_OP, `operator${this.type}`, [a, b]);
	
				if (r) {
					return r;
				} else {
					i.trap(`cant execute op ${a.type.tr.description} ${this.type} ${a.type.tr.description}`);
				}
			}
		} else {
			return i.exec(this.b);
		}
	}
	
	static parse(p) {
		let t, r = new CJSEquality();

		if (t = p.parse(CJSRelational)) {
			r.b = t;

			while (true) {
				p.eat_ws();
				if (p.src[p.pos] == "=" && p.src[p.pos+1] == '=') {
					p.pos += 2;
					p.eat_ws();
					if (t = p.parse(CJSRelational)) {
						let o = r;
						r = new CJSEquality();
						r.type = "==";
						r.a = o;
						r.b = t;
					}
				} else if (p.src[p.pos] == "!" && p.src[p.pos+1] == '=') {
					p.pos += 2;
					p.eat_ws();
					if (t = p.parse(CJSRelational)) {
						let o = r;
						r = new CJSEquality();
						r.type = "!=";
						r.a = o;
						r.b = t;
					}
				} else {
					return r;
				}
			}
		}
	}
}

export class CJSLogicalAND {
	a;
	b;

	exec(i, context) {
		if (this.b) {
			let a = i.exec(this.a);
			let b = i.exec(this.b);

			let r = i.exec_overload(context, OVERLOAD_OP, "operator&&", [a, b]);

			if (r) {
				return r;
			} else {
				i.trap(`cant execute op ${a.type.tr.description} && ${a.type.tr.description}`);
			}
		} else {
			return i.exec(this.a);
		}
	}
	
	static parse(p) {
		let r = new CJSLogicalAND();
		let t;

		if (t = p.parse(CJSEquality)) {
			r.a = t;
			p.eat_ws();
			if (p.src[p.pos] == "&") {
				p.pos++;
				if (p.src[p.pos] == "&") {
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSLogicalAND)) {
						r.b = t;
						return r;
					}
				}
			} else {
				return r;
			}
		}
	}
}

export class CJSLogicalOR {
	a;
	b;

	exec(i, context) {
		if (this.b) {
			let a = i.exec(this.a);
			let b = i.exec(this.b);

			let r = i.exec_overload(context, OVERLOAD_OP, "operator||", [a, b]);

			if (r) {
				return r;
			} else {
				i.trap(`cant execute op ${a.type.tr.description} || ${a.type.tr.description}`);
			}
		} else {
			return i.exec(this.a);
		}
	}
	
	static parse(p) {
		let r = new CJSLogicalOR();
		let t;

		if (t = p.parse(CJSLogicalAND)) {
			r.a = t;
			p.eat_ws();
			if (p.src[p.pos] == "|") {
				p.pos++;
				if (p.src[p.pos] == '|') {
					p.pos++;
					p.eat_ws();
					if (t = p.parse(CJSLogicalOR)) {
						r.b = t;
						return r;
					}
				}
			} else {
				return r;
			}
		}
	}
}

export class CJSConditional {
	a;
	b;
	c;

	exec(i, context) {
		if (this.b) {
			if (i.exec(this.a)) {
				return i.exec(this.b);
			} else {
				return i.exec(this.c);
			}
		} else {
			return i.exec(this.a);
		}
	}

	static parse(p) {
		let r = new CJSConditional();
		let t;

		if (t = p.parse(CJSLogicalOR)) {
			r.a = t;
			p.eat_ws();
			if (p.src[p.pos] == "?") {
				p.pos++;
				p.eat_ws();
				if (t = p.parse(CJSAssignment)) {
					r.b = t;
					p.eat_ws();
					if (p.src[p.pos] == ":") {
						p.pos++;
						p.eat_ws();
						if (t = p.parse(CJSAssignment)) {
							r.c = t;
							return r;
						}
					}
				}
			} else {
				return r;
			}
		}
	}
}

export class CJSAssignment {
	a;
	b;

	exec(i, context) {
		if (this.a) {
			let a = context.getv(this.a);
			let b = i.exec(this.b);
			
			let r = i.exec_overload(context, OVERLOAD_OP, 'operator=', [a, b]);
			
			if (r) {
				return r;
			} else {
				i.trap(`cant execute op ${a.type.tr.description} = ${a.type.tr.description}`);
			}
		} else {
			return i.exec(this.b);
		}
	}
	
	static parse(p) {
		let r = new CJSAssignment();
		let t;

		p.push();
		if (t = p.parse(CJSIdentifier)) {
			r.a = t.name;
			p.eat_ws();
			if (p.src[p.pos] == "=") {
				p.pos++;
				p.eat_ws();
				if (t = p.parse(CJSAssignment)) {
					r.b = t;
					p.drop();
					return r;
				}
			}
			r.a = undefined;
		}
		p.pop();
		
		if (t = p.parse(CJSConditional)) {
			r.b = t;
			return r;
		}
	}
}

export class CJSBlock {
	expr;

	exec(i, context) {
		return i.exec(this.expr);
	}
	
	static parse(p) {
		let t, r = new CJSBlock();

		if (p.src[p.pos] == '{') {
			p.pos++;
			p.eat_ws();
			if (r.expr = p.parse(CJSStatementList)) {
				p.eat_ws();
				if (p.src[p.pos] == '}') {
					p.pos++;
					return r;
				}
			}
		}
	}
}

export class CJSBlockStatement {
	block;

	exec(i, context) {
		i.push_context();
		i.exec(this.block);
		i.pop_context();
	}
	
	static parse(p) {
		let t, r = new CJSBlockStatement();

		if (t = p.parse(CJSBlock)) {
			r.block = t;
			return r;
		}
	}
}

export class CJSIfStatement {
	expr;
	ifs;
	elses;

	exec(i, context) {
		let er = i.exec(this.expr);

		if (er.value) {
			i.exec(this.ifs);
		} else if (this.elses) {
			i.exec(this.elses);
		}
	}
	
	static parse(p) {
		let r = new CJSIfStatement();

		p.eat_ws();
		if (p.src[p.pos] == 'i') {
			p.pos++;
			if (p.src[p.pos] == 'f') {
				p.pos++;
				p.eat_ws();
				if (p.src[p.pos] == '(') {
					p.pos++;
					p.eat_ws();
					if (r.expr = p.parse(CJSAssignment)) {
						p.eat_ws();
						if (p.src[p.pos] == ')') {
							p.pos++;
							p.eat_ws();
							if (r.ifs = p.parse(CJSStatement)) {
								p.push()
								p.eat_ws();
								if (p.src[p.pos] == 'e') {
									p.pos++;
									if (p.src[p.pos] == 'l') {
										p.pos++;
										if (p.src[p.pos] == 's') {
											p.pos++;
											if (p.src[p.pos] == 'e') {
												p.pos++;
												p.eat_ws();
												if (r.elses = p.parse(CJSStatement)) {
													p.drop();
													return r;
												}
											}
										}
									}
								}
								p.pop();
								return r;
							}
						}
					}					
				}
			}
		}
	}
}

export class CJSWhileStatement {
	expr;
	things;

	exec(i, context) {
		while (1) {
			if (!i.exec(this.expr).value) break;
			i.exec(this.things);
		}
	}
	
	static parse(p) {
		let t, r = new CJSWhileStatement();

		if (p.src[p.pos] == 'w') {
			p.pos++;
			if (p.src[p.pos] == 'h') {
				p.pos++;
				if (p.src[p.pos] == 'i') {
					p.pos++;
					if (p.src[p.pos] == 'l') {
						p.pos++;
						if (p.src[p.pos] == 'e') {
							p.pos++;
							p.eat_ws();
							if (p.src[p.pos] == '(') {
								p.pos++;
								p.eat_ws();
								if (t = p.parse(CJSAssignment)) {
									r.expr = t;
									p.eat_ws();
									if (p.src[p.pos] == ')') {
										p.pos++;
										p.eat_ws();
										if (t = p.parse(CJSStatement)) {
											r.things = t;
											return r;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

export class CJSExpressionStatement {
	expr;

	exec(i, context) {
		return i.exec(this.expr);
	}

	static parse(p) {
		let t;
		let r = new CJSExpressionStatement();
		
		if (t = p.parse(CJSAssignment)) {
			if (p.src[p.pos] == ";") {
				p.pos++;
				p.eat_ws();
				r.expr = t;
				return r;
			}
		}
	}
}

export class CJSReturnStatement {
	expr = null;

	exec(i, context) {
		
	}
	
	static parse(p) {
		let t, r = new CJSReturnStatement();

		if (p.src[p.pos] == 'r') {
			p.pos++;
			if (p.src[p.pos] == 'e') {
				p.pos++;
				if (p.src[p.pos] == 't') {
					p.pos++;
					if (p.src[p.pos] == 'u') {
						p.pos++;
						if (p.src[p.pos] == 'r') {
							p.pos++;
							if (p.src[p.pos] == 'n') {
								p.pos++;
								if (p.src[p.pos] == ' ') {
									p.pos++;
									p.eat_ws();
									if (t = p.parse(CJSAssignment)) {
										r.expr = t;
										p.eat_ws();
										if (p.src[p.pos] == ';') {
											p.pos++;
											return r;
										}
									} else {
										if (p.src[p.pos] == ';') {
											p.pos++;
											return r;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

export class CJSHostDeclaration {
	stuff;
	
	static parse(p) {
		let t, r = new CJSHostDeclaration();

		if (p.src[p.pos++] == 'h') {
			if (p.src[p.pos++] == 'o') {
				if (p.src[p.pos++] == 's') {
					if (p.src[p.pos++] == 't') {
						p.eat_ws();
						if (r.stuff = p.parse(CJSFunctionDeclaration)) return r;
					}
				}
			}
		}
	}
}

export class CJSFunctionDeclaration {
	retv;
	identifier;
	atypes = [];
	code;
	fc;
	
	exec(i, context) {
		let rtype = context.gett(this.retv.name);
		
		let types = [];
		for (let i = 0; i < this.atypes.length; i++)
			types.push(context.gett(this.atypes[i].type.name));

		context.bindf(this.identifier.name, types, rtype, (...args) => {
			let ctx = new CJSContext();
			
			for (let i = 0; i < types.length; i++) {
				let arg = new CJSValue();

				arg.type  = types[i];
				arg.value = args[i];

				ctx.vars[this.atypes[i].identifier.name] = arg;
			}

			ctx.parent = context;
			
			i.push_context(ctx);
			let rv = i.exec(this.code);
			i.pop_context();
			
			return rv;
		});
	}
	
	static parse(p) {
		let t, r = new CJSFunctionDeclaration();

		if (t = p.parse(CJSIdentifier)) {
			r.retv = t;
			p.eat_ws();
			if (t = p.parse(CJSIdentifier)) {
				r.identifier = t;
				p.eat_ws();
				if (p.src[p.pos] == '(') {
					p.pos++;
					p.eat_ws();
					while (1) {
						let a = {};
					  	if (t = p.parse(CJSIdentifier)) {
							a.type = t;
							p.eat_ws();
							if (t = p.parse(CJSIdentifier)) {
								a.identifier = t;
								p.eat_ws();
								r.atypes.push(a);
								if (p.src[p.pos] == ",") {
									p.pos++;
									p.eat_ws();
									continue;
								} else {
									p.eat_ws();
								}
							}
						}
						break;
					}
					
					if (p.src[p.pos] == ')') {
						p.pos++;
						p.eat_ws();
						if (t = p.parse(CJSBlock)) {
							r.code = t;
							console.log(r);
							return r;
						} else if (p.src[p.pos++] == ';') {
							r.code = null;
							return r;
						}
					}
				}
			}
		}
	}
}

export class CJSStatement {
	expr;

	exec(i, context) {
		return i.exec(this.expr);
	}
	
	static parse(p) {
		let r = new CJSStatement();
		let t;
		
		p.eat_ws();
		if (t = p.parse(CJSIfStatement)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}
		
		if (t = p.parse(CJSWhileStatement)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}

		if (t = p.parse(CJSReturnStatement)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}
		
		if (t = p.parse(CJSFunctionDeclaration)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}

		if (t = p.parse(CJSHostDeclaration)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}
		
		if (t = p.parse(CJSExpressionStatement)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}

		if (t = p.parse(CJSVarDeclaration)) {
			r.expr = t;
			return r;
		}

		if (t = p.parse(CJSBlockStatement)) {
			p.eat_ws();
			r.expr = t;
			return r;
		}

	}
}

export class CJSStatementList {
	ins = [];

	exec(i, context) {
		let res = 0;
		
		this.ins.forEach((e) => {
			res = i.exec(e);
		});

		return res;
	}
	
	static parse(p) {
		let r = new CJSStatementList();
		let t;

		while (t = p.parse(CJSStatement)) {
			p.eat_ws();
			r.ins.push(t);
		}

		return r;
	}
}

export class CJSCallArguments {
	args = [];

	static parse(p) {
		let r = new CJSCallArguments();
		let t;

		if (t = p.parse(CJSAssignment)) {
			r.args.push(t);
			p.eat_ws();
			
			while (p.src[p.pos] == ",") {
				p.pos++;
				p.eat_ws();
				
				if (t = p.parse(CJSAssignment)) {
					r.args.push(t);
					p.eat_ws();
				}
			}
		}
		
		return r;
	}
}

export class CJSCall {
	target = null;
	args   = [];

	exec(i, context) {
		let f;
		
		let args = [];

		console.log(this.args)
		for (let j = 0; j < this.args.args.length; j++) {
			args.push(i.exec(this.args.args[j]))
		}
		console.log(args)
		
		return i.exec_overload(context, OVERLOAD_FUNCTION, this.target.name, args);
	}
	
	static parse(p) {
		let r = new CJSCall();
		let t;

		if (t = p.parse(CJSIdentifier)) {
			r.target = t;
			if (p.src[p.pos] == "(") {
				p.pos++;
				if (t = p.parse(CJSCallArguments)) {
					r.args = t;
					if (p.src[p.pos] == ")") {
						p.pos++;
						return r;
					}
				}
			}
		}
	}
}

export class CJSParser {
	src   = "";
	stack = [];
	pos   = 0;

	constructor(data) {
		this.src = data;
	}

	push() {
		this.stack.unshift({
			pos: this.pos
		});
	}

	pop() {
		let f = this.stack.shift();

		this.pos = f.pos;
	}

	drop() {
		this.stack.shift();
	}

	eat_ws() {
		while (/[ \r\n\t]/.test(this.src[this.pos])) {
			this.pos++;
		}
	}
	
	parse(c) {
		this.push();

		let t = c.parse(this);

		if (t) {
			this.drop();
			return t;
		} else {
			this.pop();
		}
	}
}

export class CJSCode {
	tier = 0;
	code = null;

	constructor(data) {
		this.tier = 0;
		this.code = data;
	}

	exec(i) {
		i.exec(this.code);
	}
}

export const CJS_OP_NOOP  = 0x00;
export const CJS_OP_DVAR  = 0x01;
export const CJS_OP_LDI64 = 0x02;
export const CJS_OP_ADD   = 0x03;
export const CJS_OP_SUB   = 0x04;
export const CJS_OP_MUL   = 0x05;
export const CJS_OP_DIV   = 0x06;
export const CJS_OP_MOD   = 0x07;
export const CJS_OP_LGAND = 0x08;
export const CJS_OP_LGNOT = 0x09;
export const CJS_OP_LGOR  = 0x0a;
export const CJS_OP_EQ    = 0x0b;
export const CJS_OP_NEQ   = 0x0c;
export const CJS_OP_LT    = 0x0d;
export const CJS_OP_GT    = 0x0e;
export const CJS_OP_LE    = 0x0f;
export const CJS_OP_GE    = 0x10;
export const CJS_OP_NEG   = 0x11;
export const CJS_OP_SVAR  = 0x12;
export const CJS_OP_GVAR  = 0x13;
export const CJS_OP_JMP   = 0x14;
export const CJS_OP_JT    = 0x15;
export const CJS_OP_JF    = 0x16;
export const CJS_OP_PUSH  = 0x17;
export const CJS_OP_POP   = 0x18;
export const CJS_OP_MOV   = 0x19;
export const CJS_OP_CALL  = 0x1a;
export const CJS_OP_HCALL = 0x1b;
export const CJS_OP_RET   = 0x1c;

export const CJS_INT_INVALID_OP      = 0x00;
export const CJS_INT_DOUBLE_FAULT    = 0x01;
export const CJS_INT_TRIPLE_FAULT    = 0x02;
export const CJS_INT_ALREADY_DEFINED = 0x03;
export const CJS_INT_INVALID_TYPE    = 0x04;
export const CJS_INT_REFERENCE_ERROR = 0x05;

export const CJS_REG_IP = 0x00;
export const CJS_REG_AX = 0x01;
export const CJS_REG_BX = 0x02;
export const CJS_REG_G_ = 0x03;

function cjs_mangle(s) {
	let name   = s.name   ?? "INVALID";
	let rtype  = s.rtype  ?? "int";
	let atypes = s.atypes ?? [];
	
	let nm = `_Z${name.length}${name}`;

	if (rtype instanceof CJSType)
		rtype = rtype.tr.description;

	for (let i = 0; i < atypes.length; i++)
		if (atypes[i] instanceof CJSType)
			atypes[i] = atypes[i].tr.description;
	
	if      (rtype == "int")   nm += 'i';
	else if (rtype == "float") nm += 'f';
	else               		   nm += `h${rtype.length}${rtype}`;

	for (let i = 0; i < atypes.length; i++) {
		if      (atypes[i] == "int")   nm += 'i';
		else if (atypes[i] == "float") nm += 'f';
		else                           nm += `h${atypes[i].length}${atypes[i]}`;
	}
	
	return nm;
}

export class CJSInterpreter {
	world     = [];
	memory    = [];
	stack     = [];
	registers = [];
	
	handlers  = [];
	
	code      = [];
	hmtds     = {};

	int_t     = null;
	float_t   = null;

	on_stdout = console.log;
	
	constructor() {
		this.handlers[CJS_INT_INVALID_OP] = () => {
			this.interupt(CJS_INT_DOUBLE_FAULT);
		};
		
		this.handlers[CJS_INT_DOUBLE_FAULT] = () => {
			this.interupt(CJS_INT_TRIPLE_FAULT);
		};
		
		this.handlers[CJS_INT_TRIPLE_FAULT] = () => {
			throw new Error(`triple fault in CJS vm, unable to continue running\n\tIP: 0x${this.registers[CJS_REG_IP].value.toString(16).padStart(2, "0")} [0x${this.code.code[this.registers[CJS_REG_IP].value].toString(16).padStart(2, "0")}]`);
		};

		this.handlers[CJS_INT_ALREADY_DEFINED] = () => {
			this.interupt(CJS_INT_DOUBLE_FAULT);
		}
		
		this.handlers[CJS_INT_INVALID_TYPE] = () => {
			this.interupt(CJS_INT_DOUBLE_FAULT);
		}

		this.handlers[CJS_INT_REFERENCE_ERROR] = () => {
			this.interupt(CJS_INT_DOUBLE_FAULT);
		}
		
		let globals = new CJSContext();

		// uh, types
		let int_t =     new CJSType();
		let float_t =   new CJSType();
		let invalid_t = new CJSType();
		
		int_t.tr     = Symbol("int");
		float_t.tr   = Symbol("float");
		invalid_t.tr = Symbol("invalid");
		
		int_t.bind_method("operatorcast", CJSBoundFunction.bind([int_t], float_t, (x) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value;

			return r;
		}));

		int_t.bind_method("operator**", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type  = int_t;
			r.value = x.value ** y.value;

			return r;
		}));
		
		int_t.bind_method("operator*", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value * y.value;

			return r;
		}));

		int_t.bind_method("operator/", CJSBoundFunction.bind([int_t, int_t], float_t, (x, y) => {
			let r = new CJSValue();

			if (y.value == 0) {
				this.trap("divide by zero");
			}

			r.type = float_t;
			r.value = x.value / y.value;

			return r;
		}));

		int_t.bind_method("operator%", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value % y.value;

			return r;
		}))
		
		int_t.bind_method("operator+", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value + y.value;

			return r;
		}));

		int_t.bind_method("operator-", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value - y.value;

			return r;
		}));

		int_t.bind_method("operator=", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value = y.value;

			console.log(x, y);
			
			return r;
		}));

		int_t.bind_method("operator==", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value == y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator!=", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value != y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator<", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value < y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator>", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value > y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator<=", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value <= y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator>=", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value >= y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator&&", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value && y.value ? 1 : 0;

			return r;
		}));

		int_t.bind_method("operator||", CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value || y.value ? 1 : 0;

			return r;
		})); // i have typed this stupid fucking int_t.bind_method over and over why the fuck did i do this

		int_t.bind_method("operator!", CJSBoundFunction.bind([int_t], int_t, (x) => {
			let r = new CJSValue();
	
			r.type = int_t;
			r.value = !x.value ? 1 : 0;
	
			return r;
		}));

		float_t.bind_method("operatorcast", CJSBoundFunction.bind([float_t], int_t, (x) => {
			let r = new CJSValue();
	
			r.type  = int_t;
			r.value = Math.trunc(x.value);
	
			return r;
		}));

		float_t.bind_method("operator**", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type  = float_t;
			r.value = x.value ** y.value;

			return r;
		}));

		float_t.bind_method("operator*", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value * y.value;

			return r;
		}))

		float_t.bind_method("operator/", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			if (b.value == 0) {
				this.trap("divide by zero");
			}

			r.type = float_t;
			r.value = x.value / y.value;

			return r;
		}));

		float_t.bind_method("operator%", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value % y.value;

			return r;
		}));

		float_t.bind_method("operator+", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value + y.value;

			return r;
		}));

		float_t.bind_method("operator-", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value - y.value;

			return r;
		}));

		float_t.bind_method("operator=", CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = x.value = y.value;

			return r;
		}));

		float_t.bind_method("operator==", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value == y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator!=", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value != y.value ? 1 : 0;

			return r;
		})); // dont you love it when shitty teachers flood you with work and a skit every 2 weeks.

		float_t.bind_method("operator>", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value > y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator<", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value < y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator>=", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value >= y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator<=", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value <= y.value ? 1 : 0;

			return r;
		}));
		
		float_t.bind_method("operator&&", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value && y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator||", CJSBoundFunction.bind([float_t, float_t], int_t, (x, y) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = x.value || y.value ? 1 : 0;

			return r;
		}));

		float_t.bind_method("operator!", CJSBoundFunction.bind([float_t], int_t, (x) => {
			let r = new CJSValue();

			r.type = int_t;
			r.value = !x.value;

			return r;
		}));
		
		this.int_t   = globals.syms["int"]   = int_t;
		this.float_t = globals.syms["float"] = float_t;
		
		// bindings
		globals.bindf("sin", [float_t], float_t, (x) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = Math.sin(x.value);

			return r;
		});
		
		globals.bindf("cos", [float_t], float_t, (x) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = Math.cos(x.value);

			return r;
		});
		
		globals.bindf("tan", [float_t], float_t, (x) => {
			let r = new CJSValue();

			r.type = float_t;
			r.value = Math.tan(x.value);

			return r;
		});

		// TODO(X): remove when varadic args are done and printf is added
		this.register_host_method("_private_put", [int_t], int_t, (i) => {
			let vl = i.stack.pop();

			if (this.on_stdout) this.on_stdout(vl.value.toString())
		});
		
		// TODO(X): remove when varadic args are done and printf is added
		this.register_host_method("_private_put", [float_t], int_t, (i) => {
			let vl = i.stack.pop();

			if (this.on_stdout) this.on_stdout(vl.value.toString())
		});
		
		this.push_context(globals); 
	}

	register_host_method(name, args, rtype, handler) {
		let mn = cjs_mangle({
			name:   name,
			rtype:  rtype,
			atypes: args
		});

		this.hmtds[mn] = handler;
	}
	
	compile_baseline(code) {
		let inp = code.code;

		//#region c1 flatten
		function c1_identifier(s) {
			return {
				type: "get_var",
				name: s.name
			};
		}
		
		function c1_number(s) {
			return {
				type:  "decimal",
				value: s.value
			};
		}

		function c1_call(s) {
			let args = [];

			for (let i = 0; i < s.args.args.length; i++) {
				args.push(c1_assignment(s.args.args[i]));
			}
			
			return {
				type: "call",
				name: s.target.name,
				args: args
			};
		}
		
		function c1_primary(s) {
			if (s.a instanceof CJSNumber) {
				return c1_number(s.a);
			} else if (s.a instanceof CJSIdentifier) {
				return c1_identifier(s.a);
			} else if (s.a instanceof CJSCall) {
				return c1_call(s.a);
			} else {
				console.log("C1-INV", s);
			}
		}

		function c1_unary(s) {
			if (s.type == "-") {
				return {
					type: "negate",
					a:    c1_unary(s.a)
				};
			} else if (s.type == "!") {
				return {
					type: "logical_not",
					a:    c1_unary(s.a)
				};
			} else {
				return c1_primary(s.a);
			}
		}
		
		function c1_exponent(s) {
			if (s.b) {
				return {
					type: "power",
					a:    c1_unary(s.a),
					b:    c1_exponent(s.b)
				}
			} else {
				return c1_unary(s.a);
			}
		}
		
		function c1_multiplicitave(s) {
			if (s.type == "/") {
				return {
					type: "divide",
					a:    c1_multiplicitave(s.a),
					b:    c1_exponent(s.b)
				};
			} else if (s.type == "*") {
				return {
					type: "multiply",
					a:    c1_multiplicitave(s.a),
					b:    c1_exponent(s.b)
				};
			} else if (s.type == "%") {
				return {
					type: "modulus",
					a:    c1_multiplicitave(s.a),
					b:    c1_exponent(s.b)
				};
			} else {
				return c1_exponent(s.b);
			}
		}
		
		function c1_additive(s) {
			if (s.type == "+") {
				return {
					type: "add",
					a:    c1_additive(s.a),
					b:    c1_multiplicitave(s.b)
				}
			} else if (s.type == "-") {
				return {
					type: "subtract",
					a:    c1_additive(s.a),
					b:    c1_multiplicitave(s.b)
				}
			} else {
				return c1_multiplicitave(s.b);
			}
		}
		
		function c1_relational(s) {
			if (s.type == ">") {
				return {
					type: "greater_than",
					a:    c1_relational(s.a),
					b:    c1_additive(s.b)
				};
			} else if (s.type == "<") {
				return {
					type: "less_than",
					a:    c1_relational(s.a),
					b:    c1_additive(s.b)
				};
			} else if (s.type == "<=") {
				return {
					type: "less_equal",
					a:    c1_relational(s.a),
					b:    c1_additive(s.b)
				};
			} else if (s.type == ">=") {
				return {
					type: "greater_equal",
					a:    c1_relational(s.a),
					b:    c1_additive(s.b)
				};
			} else {
				return c1_additive(s.b);
			}
		}
		
		function c1_equality(s) {
			if (s.type == "==") {
				return {
					type: "equal",
					a:    c1_equality(s.a),
					b:    c1_relational(s.b)
				}
			} else if (s.type == "!=") {
				return {
					type: "not_equal",
					a:    c1_equality(s.a),
					b:    c1_relational(s.b)
				}
			} else {
				return c1_relational(s.b);
			}
		}
		
		function c1_logical_and(s) {
			if (s.b) {
				return {
					type: "logical_and",
					a:    c1_equality(s.a),
					b:    c1_logical_and(s.b)
				};
			} else {
				return c1_equality(s.a);
			}
		}
		
		function c1_logical_or(s) {
			if (s.b) {
				return {
					type: "logical_or",
					a:    c1_logical_and(s.a),
					b:    c1_logical_or(s.b)
				}
			} else {
				return c1_logical_and(s.a)
			}
		}
		
		function c1_conditional(s) {
			if (s.b) {
				return {
					type: "conditional", // will need to extract this into an if thing in a later step
					expr: c1_logical_or(s.a),
					tval: c1_assignment(s.b),
					fval: c1_assignment(s.c)
				}
			} else {
				return c1_logical_or(s.a);
			}
		}
		
		function c1_assignment(s) {
			if (s.a) {
				return {
					type: "assign",
					name: s.a,
					value: c1_assignment(s.b)
				};
			} else {
				return c1_conditional(s.b);
			}
		}
		
		function c1_expression_statement(s) {
			return c1_assignment(s.expr);
		}
		
		function c1_var_declaration(s) {
			if (s.init) {
				return {
					type: "decl_var",
					name: s.name,
					vtype: s.type,
					init: c1_assignment(s.init)
				};
			} else {
				return {
					type: "decl_var",
					name: s.name,
					vtype: s.type,
					init: null
				};
			}
		}

		function c1_function_declaration(s) {
			console.log(s);
			
			let name  = s.identifier.name;
			let rtype = s.retv.name;
			let code  = c1_statement_list(s.code.expr);
			
			return {
				type: "decl_function",
				name: name,
				rtype: rtype,
				code: code
			};
		}

		function c1_if_statement(s) {
			if (s.elses) {
				return {
					type: "if_statement",
					expr: c1_assignment(s.expr),
					ifs:  c1_statement(s.ifs),
					elses: c1_statement(s.elses)
				}
			} else {
				return {
					type: "if_statement",
					expr: c1_assignment(s.expr),
					ifs:  c1_statement(s.ifs),
					elses: null
				}
			}
		}

		function c1_block_statement(s) {
			return c1_statement_list(s.block.expr);
		}

		function c1_host_declaration(s) {
			if (s.stuff instanceof CJSFunctionDeclaration) {
				let atypes = [];
				for (let i = 0; i < s.stuff.atypes.length; i++)
					atypes.push(s.stuff.atypes[i].type.name);
				
				return {
					type:   "decl_host_function",
					name:   s.stuff.identifier.name,
					rtype:  s.stuff.retv.name,
					atypes: atypes
				}
			}
		}

		function c1_return_statement(s) {
			return {
				type: "return",
				expr: s.expr?c1_assignment(s.expr):null
			};
		} 
		
		function c1_statement(s) {
			if (s.expr instanceof CJSExpressionStatement) {
				return c1_expression_statement(s.expr);
			} else if (s.expr instanceof CJSVarDeclaration) {
				return c1_var_declaration(s.expr);
			} else if (s.expr instanceof CJSFunctionDeclaration) {
				return c1_function_declaration(s.expr);
			} else if (s.expr instanceof CJSIfStatement) {
				return c1_if_statement(s.expr);
			} else if (s.expr instanceof CJSBlockStatement) {
				return c1_block_statement(s.expr);
			} else if (s.expr instanceof CJSHostDeclaration) {
				return c1_host_declaration(s.expr);
			} else if (s.expr instanceof CJSReturnStatement) {
				return c1_return_statement(s.expr);
			} else {
				console.log("C1-INV", s);
				return {
					type: "noop"
				};
			}
		}
		
		function c1_statement_list(s) {
			let e = [];
			
			for (let i = 0; i < s.ins.length; i++) {
				e.push(c1_statement(s.ins[i]));
			}

			return {
				type: "expression_list",
				exprs: e
			};
		}
		//#endregion
		//#region c2 extract
		let temp_id = 0;
		function c2(s) {
			if (s.type == "expression_list") {
				let e = [];

				for (let i = 0; i < s.exprs.length; i++) {
					e.push(...c2(s.exprs[i]));
				}

				return [{
					type: "expression_list",
					exprs: e
				}];
			} else if (s.type == "decl_var") {
				if (s.init) {
					return [{
						type: "decl_var",
						name: s.name,
						vtype: s.vtype
					}, {
						type:  "set_var",
						name:  s.name,
						value: c2(s.init)
					}];
				} else {
					return [{
						type: "decl_var",
						name: s.name,
						vtype: s.vtype
					}];
				}
			} else if (s.type == "assign") {
				let exps = [];

				for (let i = s; i.type == "assign"; i = i.value) {
					if (i.value.type == "assign") {
						exps.unshift({
							type:  "set_var",
							name:  i.name,
							value: [{
								type: "get_var",
								name: i.value.name
							}]
						});
					} else {
						exps.unshift({
							type: "set_var",
							name: i.name,
							value: c2(i.value)
						});
					}
				}
				
				return exps;
			} else if (s.type == "get_var") {
				return [s]
			} else if (s.type == "logical_or") {
				return [{
					type: "logical_or",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "logical_and") {
				return [{
					type: "logical_and",
					a:     c2(s.a),
					b:     c2(s.b)
				}]
			} else if (s.type == "logical_not") {
				return [{
					type: "logical_not",
					a:    c2(s.a)
				}]
			} else if (s.type == "add") {
				return [{
					type: "add",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "subtract") {
				return [{
					type: "subtract",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "multiply") {
				return [{
					type: "multiply",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "divide") {
				return [{
					type: "divide",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "equal") {
				return [{
					type: "equal",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "not_equal") {
				return [{
					type: "not_equal",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "less_than") {
				return [{
					type: "less_than",
					a:    c2(s.a),
					b:    c2(s.b)
				}]
			} else if (s.type == "negate") {
				return [{
					type: "negate",
					a:    c2(s.a)
				}]
			} else if (s.type == "decimal") {
				return [s]
			} else if (s.type == "decl_function") {
				return [{
					type: "decl_function",
					name: s.name,
					rtype: s.rtype,
					atypes: s.atypes,
					code: c2(s.code)[0]
				}]
			} else if (s.type == "decl_host_function") {
				return [s]
			} else if (s.type == "if_statement") {
				if (s.elses) {
					return [{
						type: "if_statement",
						expr: c2(s.expr),
						ifs:  c2(s.ifs),
						elses: c2(s.elses)
					}]
				} else {
					return [{
						type: "if_statement",
						expr: c2(s.expr),
						ifs:  c2(s.ifs),
						elses: null
					}]
				}
			} else if (s.type == "call") {
				let args = [];

				for (let i = 0; i < s.args.length; i++) {
					args.push(c2(s.args[i]));
				}
				
				return [{
					type: "call",
					name: s.name,
					args: args
				}];
			} else if (s.type == "conditional") {
				let tv = `__CT${temp_id++}__`;
				return [
					{
						type: "decl_var",
						name: tv,
						vtype: "any"
					}, {
						type:  "if_statement",
						expr:  c2(s.expr),
						ifs: [{
							type:  "set_var",
							name:  tv,
							value: c2(s.tval)
						}],
						elses: [{
							type:  "set_var",
							name:  tv,
							value: c2(s.fval)
						}]
					}, {
						type: "get_var",
						name: tv
					}
				];
			} else if (s.type == "return") {
				if (s.expr) {
					return [
						{
							type: "return",
							expr: c2(s.expr)
						}
					];
				} else {
					return [
						{
							type: "return",
							expr: null
						}
					]
				}
			} else {
				console.log("C2-INV", s);
				return [null];
			}
		}
		//#endregion
		//#region c3 extract2		
		function c3(s, c) {
			c = c ?? {
				parent: null,
				syms: []
			};

			if (s.type == "decl_var" ||
			   s.type == "decimal" ||
			   s.type == "decl_host_function" ||
			   s.type == "get_var") {
				return [s];
			} else if (s.type == "decl_function") {
				return [{
					type: "decl_function",
					name: s.name,
					rtype: s.rtype,
					atypes: s.atypes,
					code: c3(s.code, c)[0]
				}]
			} else if (s.type == "expression_list") {
				let e = [];

				for (let i = 0; i < s.exprs.length; i++) {
					e.push(...c3(s.exprs[i], c));
				}

				return [{
					type:  "expression_list",
					exprs: e, 
					context: c
				}];
			} else if (s.type == "set_var") {
				let value = [];

				for (let i = 0; i < s.value.length; i++) {
					value.push(...c3(s.value[i], c));
				}

				return [
					...value.slice(0, value.length - 1),
					{
						type:  "set_var",
						name:  s.name,
						value: value[value.length - 1]
					},
					{
						type: "get_var",
						name: s.name
					}
				]
			} else if (s.type == "if_statement") {
				let expr = [];
				for (let i = 0; i < s.expr.length; i++) {
					expr.push(...c3(s.expr[i], c));
				}

				let ifs = [];
				for (let i = 0; i < s.ifs.length; i++) {
					ifs.push(...c3(s.ifs[i], c));
				}

				let elses = [];
				if (s.elses) {
					for (let i = 0; i < s.elses.length; i++) {
						elses.push(...c3(s.elses[i], c))
					}
				}
				
				return [
					...expr.slice(0, expr.length - 1),
					{
						type:  "if_statement",
						expr:  expr[expr.length - 1],
						ifs: {
							type:  "expression_list",
							exprs: ifs
						},
						elses: {
							type: "expression_list",
							exprs: elses
						}
					}
				];
			} else if (s.type == "logical_or" ||
					  s.type == "logical_and" ||
					  s.type == "add" ||
					  s.type == "subtract" ||
					  s.type == "divide" ||
					  s.type == "modulus" ||
					  s.type == "multiply" ||
					  s.type == "equal" ||
					  s.type == "not_equal" ||
					  s.type == "greater_than" ||
					  s.type == "less_than" ||
					  s.type == "greater_equal" ||
					  s.type == "less_equal") {
				let a = [];
				for (let i = 0; i < s.a.length; i++) {
					a.push(...c3(s.a[i], c));
				}

				let b = [];
				for (let i = 0; i < s.b.length; i++) {
					b.push(...c3(s.b[i], c));
				}

				return [
					...a.slice(0, a.length - 1),
					...b.slice(0, b.length - 1),
					{
						type: s.type,
						a:    a[a.length - 1],
						b:    b[b.length - 1]
					}
				];
			} else if (s.type == "negate" ||
					  s.type == "logical_not") {
				let a = [];
				for (let i = 0; i < s.a.length; i++) {
					a.push(...c3(s.a[i], c));
				}

				return [
					...a.slice(0, a.length - 1),
					{
						type: s.type,
						a:    a[a.length - 1]
					}
				];
			} else if (s.type == "call") {
				let args = [];
				for (let i = 0; i < s.args.length; i++) {
					let arg = [];
					for (let ii = 0; ii < s.args[i].length; ii++) {
						arg.push(...c3(s.args[i][ii], c));
					}
					args.push(arg);
				}

				let rargs = [];
				for (let i = 0; i < args.length; i++) {
					rargs.push(args[i][args[i].length - 1]);
				}

				let pre = [];
				for (let i = 0; i < args.length; i++) {
					pre.push(...args[i].slice(0, args[i].length - 1));
				}
				
				return [
					...pre,
					{
						type: "call",
						name: s.name,
						args: rargs
					}
				];
			} else if (s.type == "return") {
				if (s.expr) {
					let expr = [];
					for (let i = 0; i < s.expr.length; i++) {
						expr.push(...c3(s.expr[i], c));
					}

					return [
						...expr.slice(0, expr.length - 1),
						{
							type: "return",
							expr: expr[expr.length - 1]
						}
					]
				}
			} else {
				console.log("C3-INV", s);
				return [null];
			}
		}
		//#endregion
		//#region c4 - clean
		function c4(s) {
			if (s.type == "expression_list") {
				let o = [];

				for (let i = 0; i < s.exprs.length; i++) {
					let e = s.exprs[i];

					if (e.type == "get_var" && i != s.exprs.length - 1) {
						continue;
					} else {
						o.push(c4(e));
					}
				}

				return {
					type: "expression_list",
					exprs: o
				};
			} else if (s.type == "if_statement") {
				return {
					type:  "if_statement",
					expr:  s.expr,
					ifs:   c4(s.ifs),
					elses: c4(s.elses)
				};
			} else {
				return s;
			}
		}
		//#endregion

		//#region cr - registers
		function cr(s, rs) {
			console.log("CR-INV", s);
			return s
		}
		//#endregion
		
		//#region cf - compile
		function cf_string(s) {
			let o = [];
			for (let i = 0; i < s.length; i++)
				o.push(s.charCodeAt(i));
			o.push(0);
			return o;
		}

		function cf_int(s) {
			return [0,0,0,0,(0xff000000&s)<<24,(0xff0000&s)<<16,(0xff00&s)<<8,0xff&s];
		}
		
		function cf_select_overload(c, mode, name, args) {
			function ovr_is_standard(t) {
				if (t == "int" || t == "float") return true;
				else return false;
			}
			
			let canidates = [];
		
			if (mode == OVERLOAD_OP) {
				if (args[0].type.methods[name]) 
					canidates.push(...args[0].type.methods[name]);
			} else if (mode == OVERLOAD_FUNCTION) {
				for (let i = c; i; i = c.parent)
					for (let ii = 0; ii < c.syms.length; ii++)
						if (c.syms[ii].name == name)
							canidates.push(c.syms[ii]);
			}
			for (let i = 0; i < canidates.length; i++) {
				out: do {
					// TODO: we cant deduce types yet
					/*if (f.args.length != args.length) {
						canidates.splice(i, 1);
						break;
					}
					_L2: for (let i = 1; i < args.length; i++) {
						if (f.args[i].tr != args[i].type.tr) {
							if (args[i].type.methods["operatorcast"]) {
								let methods = args[i].type.methods["operatorcast"];
								for (let ii = 0; ii < methods.length; ii++) {
									if (methods[ii].retv.tr == f.args[i].tr) {
										continue _L2;
									}
								}
							}
							canidates.splice(i, 1);
							break out;
						}
					}*/
				} while (false);
			}
			console.log(canidates)
			let best  = null;
			for (let i = 0; i < canidates.length; i++) {
				do {
					if (best == null) {
						best = canidates[i];
					} else {
						let f1 = canidates[i];
						let f2 = best;

						let bt = 1;
						
						for (let i = 0; i < f1.atypes.length; i++) {
							let a1 = f1.atypes[i];
							let a2 = f2.atypes[i];
							let at = args[i];

							if (a1 != at) {
								bt = 0;
								break;
							}
						}

						if (bt) best = canidates[i];
					}
				} while (false);
			}

			console.log(best);
			
			return best;
		}

		function cf_resolv_vtype(ctx, name) {
			for (let c = ctx; c; c = c.parent)
				for (let i = 0; i < c.syms.length; i++)
					if (c.syms[i].name == name)
						return c.syms[i].type;
		}
		let funcs = {};
		let nlb = 0;
		function cf(s, nr, c) {
			c  = c ?? {
				parent: null,
				syms: []
			};
			
			nr = nr ?? CJS_REG_G_;
			if (s.type == "expression_list") {
				let o = [];

				for (let i = 0; i < s.exprs.length; i++) {
					o.push(...cf(s.exprs[i], nr, c).o);
				}

				return {o:o};
			} else if (s.type == "decl_var") {
				console.log(c);
				c.syms.push({ type: "variable", vtype: s.vtype, name: s.name });
				return {o: [
					CJS_OP_DVAR, ...cf_string(s.vtype), ...cf_string(s.name)
				]};
			} else if (s.type == "set_var") {
				let v = cf(s.value, nr, c)
				console.log(v);
				return {
					o: [
						...v.o, 
						CJS_OP_SVAR, v.rr, ...cf_string(s.name)
					],
					rr: -1
				}
			} else if (s.type == "get_var") {
				return {
					o:  [
						CJS_OP_GVAR, nr, ...cf_string(s.name)
					],
					rr: nr,
					rt: cf_resolv_vtype(c, s.name)
				}
			} else if (s.type == "logical_or") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_LGOR, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "logical_and") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_LGAND, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "logical_not") {
				let a = cf(s.a, nr, c);

				return {
					o: [
						...a.o, 
						CJS_OP_LGNOT, a.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "add") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_ADD, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "subtract") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_SUB, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "multiply") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_MUL, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				};
			} else if (s.type == "divide") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);
				
				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_DIV, a.rr, b.rr
					],
					rr: a.rr,
					rt: "float"
				}
			} else if (s.type == "modulus") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_MOD, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "equal") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_EQ, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "not_equal") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_NEQ, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "greater_than") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_GT, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "less_than") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_LT, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "greater_equal") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_GE, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "less_equal") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_LE, a.rr, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "negate") {
				let a = cf(s.a, nr, c);

				return {
					o: [
						...a.o, 
						CJS_OP_NEG, a.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "decimal") {
				return {
					o: [
						CJS_OP_LDI64, nr, ...cf_int(s.value)
					],
					rr: nr,
					rt: "int"
				}
			} else if (s.type == "if_statement") {
				let e = cf(s.expr,  nr, c);
				let t = cf(s.ifs,   e.rr + 2, c);
				let f = cf(s.elses, e.rr + 2, c);
				
				console.log(s, e, t, f);

				return {
					o: [
						...e.o,
						CJS_OP_LDI64, e.rr + 1, ...cf_int(0),
						CJS_OP_NEQ, e.rr, e.rr + 1,
						CJS_OP_JF, e.rr, { type: "labelref", name: `__${nlb++}` },
						...t.o,
						CJS_OP_JMP, { type: "labelref", name: `__${nlb++}` },
						{ type: "label", name: `__${nlb - 2}`},
						...f.o,
						//CJS_OP_NOOP, // workaround for empty else creating an infinite loop. @XWasHere please implement an actual fix lazy ass
						{ type: "label", name: `__${nlb - 1}`}
					],
					rr: -1
				};
			} else if (s.type == "call") {
				let code = [];
				let args = [];

				console.log(c.syms, args);

				for (let i = 0; i < s.args.length; i++) {
					let cd = cf(s.args[i], nr + i, c);

					args.push(cd.rt);
					code.push(...cd.o,
							  CJS_OP_PUSH, cd.rr);
				}

				code.push(CJS_OP_CALL,  { type: "fref", name: s.name, ctx: c, ftype: OVERLOAD_FUNCTION, atypes: args, ins_off: 0 });
				
//				code.push(CJS_OP_CALL);
//				for (let i = 0; i < s.name.length; i++) code.push(s.name.charCodeAt(i));
//				code.push(0);
				
				code.push(CJS_OP_MOV, nr, CJS_REG_AX);
				
				return {o:code, rr: nr};
			} else if (s.type == "decl_function") {
//				console.log(s);
//				console.log(c);

				let fname = cjs_mangle({
					name: s.name,
					rtype: s.rtype
				});
				
				let plb = `__JPF${fname}`;

				c.syms.push({ type: "method", name: s.name, mname: fname, rtype: s.rtype, atypes: s.atypes });
				
				return {o:[
					CJS_OP_JMP, { type: "labelref", name: plb },
					{ 
						type: "fentry",
						name: s.name,
						rtype: s.rtype,
						mname: fname 
					},
					...cf(s.code, nr, c).o,
					{ type: "label", name: plb }
				]};
			} else if (s.type == "decl_host_function") {
				console.log(s);
				
				let fname = cjs_mangle({
					name: s.name,
					rtype: s.rtype,
					atypes: s.atypes
				});

				c.syms.push({ type: "hostmethod", name: s.name, mname: fname, rtype: s.rtype, atypes: s.atypes });

				return {o:[]};
			} else if (s.type == "return") {
				let v = s.expr?cf(s.expr):null;

				if (v) {
					return {
						o: [
							...v.o,
							CJS_OP_MOV, CJS_REG_AX, v.rr, 
							CJS_OP_RET
						]
					}
				} else {
					return {
						o: [CJS_OP_RET]
					}
				}
			} else {
				console.log("CF-INV", s);
				return {o:[CJS_OP_NOOP]};
			}
		}
		//#endregion

		//#region cl - labels
		function cl(s) {
			let o = [];

			for (let i = 0; i < s.length; i++) {
				if (typeof s[i] == "object") {
					if (s[i].type == "fref") {
						console.log(s[i])
						let ov = cf_select_overload(s[i].ctx, s[i].ftype, s[i].name, s[i].atypes);
						if (!ov) throw new Error(`"${s[i].name}" is not a function`);
						
						if (ov.type == "hostmethod") {
							if (o[o.length - 1 + s[i].ins_off] == CJS_OP_CALL) {
								o[o.length - 1 + s[i].ins_off] = CJS_OP_HCALL;
								for (let i = 0; i < ov.mname.length; i++) o.push(ov.mname.charCodeAt(i));
								o.push(0);
							}
							console.log(o[o.length + ov.ins_off], CJS_OP_CALL);
						} else {
							let p = 0;
							for (let ii = 0; ii < s.length; ii++) {
								if (typeof s[ii] == "object") {
									if (s[ii].type == "labelref" || s[ii].type == "fref") {
										p += 8;
									} else if (s[ii].type == "fentry") {
										if (s[ii].mname == ov.mname) break;
									}
								} else {
									p++;
								}
							}
							o.push(...cf_int(p));
						} 
					} else {
						o.push(s[i]);
					}
				} else {
					o.push(s[i]);
				}
			}

			let o2 = [];
			for (let i = 0; i < o.length; i++) {
				if (typeof o[i] == "object") {
					if (o[i].type == "labelref") {
						let p = 0;
						for (let ii = 0; ii < o.length; ii++) {
							if (typeof o[ii] == "object") {
								if (o[ii].type == "labelref" || o[ii].type == "fref") {
									p += 8;
								} else if (o[ii].type == "label") {
									if (o[ii].name == o[i].name) break;
								}
							} else {
								p++;
							}
						}
						o2.push(...cf_int(p));
					}
				} else {
					o2.push(o[i]);
				}
			}
			
			return o2;
		}
		//#endregion
		
		console.log("input", inp);
		inp = c1_statement_list(inp);
		console.log("flatten", inp);
		inp = c2(inp)[0];
		console.log("extract", inp);
		inp = c3(inp)[0];
		console.log("extract2", inp);
		inp = c4(inp);
		console.log("clean", inp);
		inp = cr(inp);
		console.log("registers", inp);
		inp = cf(inp).o;
		console.log("compile", inp);
		inp = cl(inp);
		console.log("labels", inp);
		
		console.log(JSON.stringify(inp));
		console.log(inp.flatMap((a)=>{return String.fromCharCode(a)}).join(""));

		code.code = inp;
		code.tier = 1;
	}
	
	push_context(c) {
		c = c || new CJSContext();
		if (this.world[0]) c.parent = this.world[0];
		this.world.unshift(c);
	}

	pop_context() {
		return this.world.shift();
	}

	trap(m) {
		throw `[!VM{${m}}]`;
	}

	exec(c) {
//		console.log(c)
		
		try {
			let res = c.exec(this, this.world[0])
			
			return res;
		} catch (e) {
			if (/^\[!VM{.*}]$/.test(e)) {
				// should handle traps
				throw e;
			} else {
				throw e;
			}
		}
	}

	exec_overload(c, mode, name, args) {
		let canidates = [];

//		console.group(`resolve ${name}(${args.flatMap((a)=>{return a.type.tr.description;})})`);
//		console.group(`find canidates`);
//		console.group(`search members of`, args[0].type);

		if (mode == OVERLOAD_OP) {
			if (args[0].type.methods[name]) 
				canidates.push(...args[0].type.methods[name]);
		} else if (mode == OVERLOAD_FUNCTION) {
			for (let i = c; i; i = c.parent)
				if (i.syms[name])
					canidates.push(...i.syms[name]);
		}
//		console.groupEnd();
//		console.groupEnd();
//		console.group(`prune non-viable from`, canidates);
		for (let i = 0; i < canidates.length; i++) {
//			console.group(`check`, canidates[i]);
			out: do {
				let f = canidates[i];
				if (f.args.length != args.length) {
//					console.log(`argument count mismatch ${f.args.length} != 2`);
//					console.log(`drop`, f);
					canidates.splice(i, 1);
					break;
				}
				_L2: for (let i = 1; i < args.length; i++) {
					if (f.args[i].tr != args[i].type.tr) {
//						console.group(`find implicit conversion for argument 1 `, args[i].type, `->`, f.args[i]);
						if (args[i].type.methods["operatorcast"]) {
							let methods = args[i].type.methods["operatorcast"];
							for (let ii = 0; ii < methods.length; ii++) {
//								console.log(methods[ii].retv.tr, f.args[i].tr)
								if (methods[ii].retv.tr == f.args[i].tr) {
//									console.log("found", methods[ii]);
//									console.groupEnd();
									continue _L2;
								}
							}
						}
//						console.log(`cast to`, f.args[i], `not found`);
//						console.log(`drop`, f);
//						console.groupEnd();
						canidates.splice(i, 1);
						break out;
					}
				}
//				console.log(`keep`, f)
			} while (false);
//			console.groupEnd();
		}
//		console.groupEnd();
//		console.group(`select best canidate from`, canidates)
		let best  = null;
		for (let i = 0; i < canidates.length; i++) {
//			console.group(`compare`, best, canidates[i]);
			do {
				if (best == null) {
//					console.log(`no best,`, canidates[i], `is automatically better`);
					best = canidates[i];
				} else {
//					console.group(`compare`, a, b);
					let bt, o, n = o = bt = 0;
					if (b.type.tr == best.args[1].tr) {
//						console.log(`best - no conversion, exact match`)
						o = 3;
					} else {
//						console.log(`best - non-standard`)
						o = 0;
					}
					if (b.type.tr == canidates[i].args[1].tr) {
//						console.log(`this - no conversion, exact match`);
						n = 3;
					} else {
//						console.log(`this - non-standard`);
						n = 0;
					}
					do {
						if (n > 0) {
							if (b == 0) {
//								console.log("this ranked higher than best");
								bt = 1;
								break;
							}
						}
						if (n > 0 && b > 0) {
							if (n > b) {
//								console.log("this ranked higher than best");
								bt = 1;
								break;
							}
						}
					} while (false);
					if (bt) {
						best = canidates[i]
//						console.log(`new best is`, best);
					} else {
//						console.log(canidates[i], `worse than`, best);	
					}
//					console.groupEnd();
				}
			} while (false);
//			console.groupEnd();
		}
		
//		console.groupEnd();
		if (!best) {
			this.trap("type error");
		}
//		console.groupEnd();
//		console.groupEnd();

		return best.call(args);
	}

	exec_script(script) {
		let code = new CJSCode(script);
		// this.compile_baseline(code);

		this.code = code;

		let rip = new CJSValue();
		rip.type = this.int_t;
		rip.value = 0;
		this.registers[CJS_REG_IP] = rip;

		let rax = new CJSValue();
		rax.type = this.int_t;
		rax.value = 0;
		this.registers[CJS_REG_AX] = rax;

		let rbx = new CJSValue();
		rbx.type = this.int_t;
		rbx.value = 0;
		this.registers[CJS_REG_BX] = rbx;
		
		this.stack = [];

		while (this.tick() == 0) {};
	}

	interupt(id) {
		if (!this.handlers[id]) {
			if (id == CJS_INT_DOUBLE_FAULT) {
				this.interupt(CJS_INT_TRIPLE_FAULT);
			} else if (id == CJS_INT_TRIPLE_FAULT) {
				throw new Error("error");
			} else {
				this.interupt(CJS_INT_DOUBLE_FAULT);
			}
		}
		
		this.handlers[id](this);
	}
	
	tick() {
		//console.log("interpreter tick");
		
		if (this.code.tier == 0) {
			console.log("tier up from source to baseline");
			this.compile_baseline(this.code);
		//	console.groupEnd();
			return 0;
		} else if (this.code.tier == 1) {
			//console.log(this.code.code[this.registers[CJS_REG_IP].value])
			if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_NOOP) {
				this.registers[CJS_REG_IP].value++;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_DVAR) {
				let type = "";
				let name = "";

				this.registers[CJS_REG_IP].value++;
				
				for (; this.code.code[this.registers[CJS_REG_IP].value] != 0; this.registers[CJS_REG_IP].value++) type += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP].value]);
				this.registers[CJS_REG_IP].value++;

				for (; this.code.code[this.registers[CJS_REG_IP].value] != 0; this.registers[CJS_REG_IP].value++) name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP].value]);
				this.registers[CJS_REG_IP].value++;

				console.log(this.world[0], name);
				if (this.world[0].syms[name]) {
					this.interupt(CJS_INT_ALREADY_DEFINED);
					return 1;
				}

				let tp;
				if (type == "any") {
					tp = null;
				} else {
					tp = this.world[0].gets(type);
					if (!tp) {
						this.interupt(CJS_INT_INVALID_TYPE);
						return 1;
					}
				}
				
				let vr = new CJSValue();

				vr.type  = tp;
				vr.value = null;

				this.world[0].syms[name] = vr;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LDI64) {
				let rn;
				let vl = new CJSValue();

				this.registers[CJS_REG_IP].value++;
				rn = this.code.code[this.registers[CJS_REG_IP].value];
				this.registers[CJS_REG_IP].value++;

				vl.type = this.world[0].gets("int");
				vl.value = i64_dc(this.code.code, this.registers[CJS_REG_IP].value);

				this.registers[CJS_REG_IP].value += 8;
				this.registers[rn] = vl;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_ADD) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator+", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_SUB) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator-", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_MUL) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator*", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_DIV) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator/", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_MOD) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator%", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LGOR) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator||", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LGAND) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator&&", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LGNOT) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator!", [av]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_EQ) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator==", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_NEQ) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator!=", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_GT) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator>", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LT) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator<", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_GE) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator>=", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_LE) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];
				let b = this.code.code[this.registers[CJS_REG_IP].value++];

				let av = this.registers[a];
				let bv = this.registers[b];
				let rv = this.exec_overload(this.world[0], OVERLOAD_OP, "operator<=", [av, bv]);
				
				this.registers[a] = rv;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_NEG) {
				this.registers[CJS_REG_IP].value++;
				let a = this.code.code[this.registers[CJS_REG_IP].value++];

				this.registers[a].value = -this.registers[a].value;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_SVAR) {
				this.registers[CJS_REG_IP].value++;

				let reg = this.code.code[this.registers[CJS_REG_IP].value++];
				
				let name = "";
				for (; this.code.code[this.registers[CJS_REG_IP].value] != 0; this.registers[CJS_REG_IP].value++)
					name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP].value]);
				this.registers[CJS_REG_IP].value++;
				
				let sym = this.world[0].gets(name);
				if (!sym) {
					this.interupt(CJS_INT_REFERENCE_ERROR);
					return 1;
				}

				if (sym.type == "any") {
					sym.type  = this.registers[reg].type
					sym.value = this.registers[reg].value
				} else {
					this.exec_overload(this.world[0], OVERLOAD_OP, "operator=", [sym, this.registers[reg]]);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_GVAR) {
				this.registers[CJS_REG_IP].value++;

				let reg = this.code.code[this.registers[CJS_REG_IP].value++];
				
				let name = "";
				for (; this.code.code[this.registers[CJS_REG_IP].value] != 0; this.registers[CJS_REG_IP].value++)
					name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP].value]);
				this.registers[CJS_REG_IP].value++;
				
				let sym = this.world[0].gets(name);
		//		console.log(reg, sym);

				this.registers[reg] = sym;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_JMP) {
				this.registers[CJS_REG_IP].value++;

				let addr = i64_dc(this.code.code, this.registers[CJS_REG_IP].value);
				this.registers[CJS_REG_IP].value += 8;

				this.registers[CJS_REG_IP].value = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_JT) {
				this.registers[CJS_REG_IP].value++;

				let reg = this.code.code[this.registers[CJS_REG_IP].value++];
				let addr = i64_dc(this.code.code, this.registers[CJS_REG_IP].value);
				this.registers[CJS_REG_IP].value += 8;

				if (this.registers[reg].value != 0)
					this.registers[CJS_REG_IP].value = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_JF) {
				this.registers[CJS_REG_IP].value++;

				let reg = this.code.code[this.registers[CJS_REG_IP].value++];
				let addr = i64_dc(this.code.code, this.registers[CJS_REG_IP].value);
				this.registers[CJS_REG_IP].value += 8;

				if (this.registers[reg].value == 0)
					this.registers[CJS_REG_IP].value = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_PUSH) {
				this.registers[CJS_REG_IP].value++;

				let reg = this.code.code[this.registers[CJS_REG_IP].value++];

				let v = new CJSValue();
				v.type = this.registers[reg].type;
				v.value = this.registers[reg].value;
				this.stack.push(v);
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_CALL) {
				this.registers[CJS_REG_IP].value++;

				let addr = i64_dc(this.code.code, this.registers[CJS_REG_IP].value);
				this.registers[CJS_REG_IP].value += 8;

				let v = new CJSValue();
				v.type = this.registers[CJS_REG_IP].type;
				v.value = this.registers[CJS_REG_IP].value;
				this.stack.push(v);
				
				this.registers[CJS_REG_IP].value = addr;

		//		console.log(this.stack)
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_MOV) {
				this.registers[CJS_REG_IP].value++

				let r1 = this.code.code[this.registers[CJS_REG_IP].value++];
				let r2 = this.code.code[this.registers[CJS_REG_IP].value++];

				this.registers[r1] = new CJSValue();
				this.registers[r1].type = this.registers[r2].type;
				this.registers[r1].value = this.registers[r2].value;
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_RET) {
				this.registers[CJS_REG_IP].value++;
				this.registers[CJS_REG_IP] = this.stack.pop();
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == CJS_OP_HCALL) {
				this.registers[CJS_REG_IP].value++;

				let nm = "";
				for (; this.code.code[this.registers[CJS_REG_IP].value] != 0; this.registers[CJS_REG_IP].value++) nm += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP].value]);
				this.registers[CJS_REG_IP].value++;

				if (!this.hmtds[nm]) {
					this.interupt(CJS_INT_REFERENCE_ERROR);
				}

				this.hmtds[nm](this);
			} else if (this.code.code[this.registers[CJS_REG_IP].value] == undefined) {
				return 2;
			} else {
				this.interupt(CJS_INT_INVALID_OP);
				//console.groupEnd();
				return 1;
			}

			//console.groupEnd();
			return 0;
		}
		
		console.groupEnd();
	}
}
