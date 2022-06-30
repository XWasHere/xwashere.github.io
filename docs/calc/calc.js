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
			function baseline_reg() {	
				let thing = code.code[i++];

				if ((thing & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_REG) {
					let reg = code.code[i++];

					if ((thing & CJS_OPRAND_SIZE) == CJS_OPRAND_SIZE_INT) {
						if (reg == CJS_REG_IP) {
							return `%ip`;
						} else if (reg == CJS_REG_SP) {
							return `%sp`;
						} else if (reg == CJS_REG_BP) {
							return `%bp`;
						} else if (reg == CJS_REG_AX) {
							return `%ax`;
						} else if (reg == CJS_REG_BX) {
							return `%bx`;
						} else if (reg >= CJS_REG_G_) {
							return `%r${reg}`;
						}
					}
					
					return `%?${reg}`;
				} else if ((thing & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_MEM) {
					let has_offset = thing & CJS_OPRAND_HAS_OFFSET
					
					let addr = baseline_reg();

					if (has_offset) {
						let offset = baseline_reg();
						addr = `${offset}(${addr})`;
					}
					
					return addr;
				} else if ((thing & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_CONST) {
					if ((thing & CJS_OPRAND_SIZE) == CJS_OPRAND_SIZE_INT) {
						let value = i32_dc(code.code, i);
						i += 4;

						return `${value}`;
					}
				}
				
				return `?${thing}?`;
			}
			
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
			} else if (code.code[i] == CJS_OP_LDI32) {
				i++;

				let reg = baseline_reg();
				let value = i32_dc(code.code, i);

				i += 4;

				disassembly += `ldi32 $${value}, ${reg}`
			} else if (code.code[i] == CJS_OP_ADD) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `add ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_SUB) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `sub ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_MUL) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `mul ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_DIV) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `div ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_MOD) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `mod ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_LGAND) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `lgand ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_LGOR) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `lgor ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_EQ) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `eq ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_NEQ) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `neq ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_GT) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `gt ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_LT) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `lt ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_GE) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `ge ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_PWR) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `pwr ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_LE) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `le ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_LGNOT) {
				i++;

				let r1 = baseline_reg();
				
				disassembly += `lgnot ${r1}`;
			} else if (code.code[i] == CJS_OP_NEG) {
				i++;

				let r1 = baseline_reg()
				
				disassembly += `neg ${r1}`;
			} else if (code.code[i] == CJS_OP_SVAR) {
				i++;

				let reg = baseline_reg();
				
				let name = "";
				for (; code.code[i] != 0; i++) name += String.fromCharCode(code.code[i]);
				i++;
				
				disassembly += `svar ${reg}, "${name}"`
			} else if (code.code[i] == CJS_OP_GVAR) {
				i++;

				let reg = baseline_reg();
				
				let name = "";
				for (; code.code[i] != 0; i++) name += String.fromCharCode(code.code[i]);
				i++;
				
				disassembly += `gvar "${name}", ${reg}`
			} else if (code.code[i] == CJS_OP_JMP) {
				i++;

				let addr = i32_dc(code.code, i);

				i+= 4;

				disassembly += `jmp $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_JT) {
				i++;

				let reg = baseline_reg();
				let addr = i32_dc(code.code, i);

				i += 4;

				disassembly += `jt ${reg}, $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_JF) {
				i++;

				let reg = baseline_reg();
				let addr = i32_dc(code.code, i);

				i += 4;

				disassembly += `jf ${reg}, $0x${addr.toString(16).padStart(2, "0")}`
			} else if (code.code[i] == CJS_OP_PUSH) {
				i++;

				let reg = baseline_reg();

				disassembly += `push ${reg}`;
			} else if (code.code[i] == CJS_OP_POP) {
				i++;

				let reg = baseline_reg();

				disassembly += `pop ${reg}`;
			} else if (code.code[i] == CJS_OP_MOV) {
				i++;

				let r1 = baseline_reg();
				let r2 = baseline_reg();

				disassembly += `mov ${r2}, ${r1}`;
			} else if (code.code[i] == CJS_OP_CALL) {
				i++;

				let addr = i32_dc(code.code, i);

				i+= 4;

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
			} else if (code.code[i] == CJS_OP_ICONVF) {
				i++;

				let reg = baseline_reg();

				disassembly += `iconvf ${reg}`;
			} else {
				i++;
				
				disassembly += `invalid $0x${code.code[i - 1].toString(16).padStart(2, "0")}`
			}
			disassembly += "\n";
		}
		
		return `stuff:\n\ttier: baseline (1)\n\tcode length: ${code.code.length}\n\tdisassembly:\n${disassembly}`;
	}
}

function i32_dc(buf, pos) {
	pos = pos ?? 0;
	
	return (
		buf[pos + 0] << 24 |
		buf[pos + 1] << 16 |
		buf[pos + 2] << 8  |
		buf[pos + 3]
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

export const CJS_OP_NOOP   = 0x00;
export const CJS_OP_DVAR   = 0x01;
export const CJS_OP_LDI32  = 0x02;
export const CJS_OP_ADD    = 0x03;
export const CJS_OP_SUB    = 0x04;
export const CJS_OP_MUL    = 0x05;
export const CJS_OP_DIV    = 0x06;
export const CJS_OP_MOD    = 0x07;
export const CJS_OP_LGAND  = 0x08;
export const CJS_OP_LGNOT  = 0x09;
export const CJS_OP_LGOR   = 0x0a;
export const CJS_OP_EQ     = 0x0b;
export const CJS_OP_NEQ    = 0x0c;
export const CJS_OP_LT     = 0x0d;
export const CJS_OP_GT     = 0x0e;
export const CJS_OP_LE     = 0x0f;
export const CJS_OP_GE     = 0x10;
export const CJS_OP_NEG    = 0x11;
export const CJS_OP_SVAR   = 0x12;
export const CJS_OP_GVAR   = 0x13;
export const CJS_OP_JMP    = 0x14;
export const CJS_OP_JT     = 0x15;
export const CJS_OP_JF     = 0x16;
export const CJS_OP_PUSH   = 0x17;
export const CJS_OP_POP    = 0x18;
export const CJS_OP_MOV    = 0x19;
export const CJS_OP_CALL   = 0x1a;
export const CJS_OP_HCALL  = 0x1b;
export const CJS_OP_RET    = 0x1c;
export const CJS_OP_ICONVF = 0x1d;
export const CJS_OP_PWR    = 0x1e;

// 2 bit oprand type  (0 = reg, 1 = mem, 2 = const);
// 2 bit oprand size  (00 = 1 byte, 01 = 2 bytes, 10 = 4 bytes, 11 = 8 bytes)
// 1 bit oprand itype (0 = int, 1 = float);
// 1 bit has offset   (0 = no, 1 = yes) {only when type=mem}
export const CJS_OPRAND_TYPE        = 0b00000011;
export const CJS_OPRAND_SIZE        = 0b00001100;
export const CJS_OPRAND_ITYPE       = 0b00010000;

export const CJS_OPRAND_TYPE_REG    = 0b00000000;
export const CJS_OPRAND_TYPE_MEM    = 0b00000001;
export const CJS_OPRAND_TYPE_CONST  = 0b00000010;
export const CJS_OPRAND_SIZE_BYTE   = 0b00000000;
export const CJS_OPRAND_SIZE_SHORT  = 0b00000100;
export const CJS_OPRAND_SIZE_INT    = 0b00001000;
export const CJS_OPRAND_SIZE_LONG   = 0b00001100;
export const CJS_OPRAND_ITYPE_INT   = 0b00000000;
export const CJS_OPRAND_ITYPE_FLOAT = 0b00010000;
export const CJS_OPRAND_HAS_OFFSET  = 0b00100000;

export const CJS_INT_INVALID_OP      = 0x00;
export const CJS_INT_DOUBLE_FAULT    = 0x01;
export const CJS_INT_TRIPLE_FAULT    = 0x02;
export const CJS_INT_ALREADY_DEFINED = 0x03;
export const CJS_INT_INVALID_TYPE    = 0x04;
export const CJS_INT_REFERENCE_ERROR = 0x05;

export const CJS_REG_IP = 0x00;
export const CJS_REG_SP = 0x01;
export const CJS_REG_BP = 0x02;
export const CJS_REG_AX = 0x03;
export const CJS_REG_BX = 0x04;
export const CJS_REG_G_ = 0x05;

function cjs_mangle(s) {
	let name   = s.name   ?? "INVALID";
	let rtype  = s.rtype  ?? "int";
	let args   = s.args   ?? [];

	let nm = `_Z${name.length}${name}`;

	if (rtype instanceof CJSType)
		rtype = rtype.tr.description;

	for (let i = 0; i < args.length; i++)
		if (args[i] instanceof CJSType)
			args[i] = args[i].tr.description;
	
	if      (rtype == "int")   nm += 'i';
	else if (rtype == "float") nm += 'f';
	else               		   nm += `h${rtype.length}${rtype}`;

	for (let i = 0; i < args.length; i++) {
		if      (args[i].type == "int")   nm += 'i';
		else if (args[i].type == "float") nm += 'f';
		else                              nm += `h${args[i].type.length}${args[i].type}`;
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
			throw new Error(`triple fault in CJS vm, unable to continue running\n\tIP: 0x${this.registers[CJS_REG_IP].toString(16).padStart(2, "0")} [0x${this.code.code[this.registers[CJS_REG_IP]].toString(16).padStart(2, "0")}]`);
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
			let vl = i.memoryv.getInt32(i.registers[CJS_REG_SP]);

			// console.log(vl);

			if (this.on_stdout) this.on_stdout(vl.toString())
		});
		
		// TODO(X): remove when varadic args are done and printf is added
		this.register_host_method("_private_put", [float_t], int_t, (i) => {
			let vl = i.memoryv.getFloat32(i.registers[CJS_REG_SP]);

			if (this.on_stdout) this.on_stdout(vl.toString())
		});
		
		this.push_context(globals); 
	}

	register_host_method(name, args, rtype, handler) {
		let mn = cjs_mangle({
			name:   name,
			rtype:  rtype,
			args:   args.map((a)=>{return {type:a.tr.description}})
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

		function c1_paren_expr(s) {
			return c1_conditional(s.expr);
		}
		
		function c1_primary(s) {
			if (s.a instanceof CJSNumber) {
				return c1_number(s.a);
			} else if (s.a instanceof CJSIdentifier) {
				return c1_identifier(s.a);
			} else if (s.a instanceof CJSCall) {
				return c1_call(s.a);
			} else if (s.a instanceof CJSParenExpr) {
				return c1_paren_expr(s.a);
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
			let args  = [];

			for (let i = 0; i < s.atypes.length; i++) {
				args.push({
					type: s.atypes[i].type.name,
					identifier: s.atypes[i].identifier.name
				});
			}
			
			return {
				type: "decl_function",
				name: name,
				rtype: rtype,
				code: code,
				args: args
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
				let args  = [];

				for (let i = 0; i < s.stuff.atypes.length; i++) {
					args.push({
						type: s.stuff.atypes[i].type.name,
						identifier: s.stuff.atypes[i].identifier.name
					});
				}
			
				
				return {
					type:  "decl_host_function",
					name:  s.stuff.identifier.name,
					rtype: s.stuff.retv.name,
					args:  args
				}
			}
		}

		function c1_return_statement(s) {
			return {
				type: "return",
				expr: s.expr?c1_assignment(s.expr):null
			};
		} 

		function c1_while_statement(s) {
			return {
				type: "while",
				expr: c1_assignment(s.expr),
				code: c1_statement(s.things)
			}
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
			} else if (s.expr instanceof CJSWhileStatement) {
				return c1_while_statement(s.expr);
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
			} else if (s.type == "modulus") {
				return [{
					type: "modulus",
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
					args: s.args,
					code: c2(s.code)[0]
				}]
			} else if (s.type == "decl_host_function") {
				return [{
					type: "decl_host_function",
					name: s.name,
					rtype: s.rtype,
					args: s.args
				}]
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
			} else if (s.type == "power") {
				return [{
					type: "power",
					a: c2(s.a),
					b: c2(s.b)
				}];
			} else if (s.type == "while") {
				return [{
					type: "while",
					expr: c2(s.expr),
					code: c2(s.code)
				}]
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
					args: s.args,
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
			} else if (s.type == "while") {
				let expr = [];
				let code = [];

				for (let i = 0; i < s.expr.length; i++) {
					expr.push(...c3(s.expr[i], c));
				}

				for (let i = 0; i < s.code.length; i++) {
					code.push(...c3(s.code[i], c))
				}

				return [
					...expr.splice(0, expr.length - 1),
					{
						type: "while",
						expr: expr[expr.length - 1],
						code: {
							type:  "expression_list",
							exprs: code
						}
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
					  s.type == "less_equal" ||
					  s.type == "power") {
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

		//#region cs - symbols
		function cs(s, sc, ctx) {
			if (s.type == "expression_list") {
				s.scope = {
					parent: sc ?? null,
					symbols: [],
					global: 0,
					type: ctx
				};

				if (sc == undefined) {
					s.scope.global = 1;
				}

				for (let i = 0; i < s.exprs.length; i++) cs(s.exprs[i], s.scope);

				return s;
			} else if (s.type == "decl_var") {
				sc.symbols.push({
					type:   "variable",
					global: sc.global,
					name:   s.name,
					vtype:  s.vtype
				});
			} else if (s.type == "if_statement") {
				cs(s.expr, sc);
				cs(s.ifs, sc, "if");
				if (s.elses) cs(s.elses, sc, "if");
			} else if (s.type == "decl_function") {
				sc.symbols.push({
					type:  "function",
					name:  s.name,
					rtype: s.rtype,
					args:  s.args,
					mname: cjs_mangle({
						name:  s.name,
						rtype: s.rtype,
						args:  s.args
					})
				});

				cs(s.code, sc, "function");

				for (let i = 0; i < s.args.length; i++) {
					s.code.scope.symbols.push({
						type: "argument",
						name: s.args[i].identifier,
						vtype: s.args[i].type
					})
				}
			} else if (s.type == "decl_host_function") {
				sc.symbols.push({
					type:  "hfunction",
					name:  s.name,
					rtype: s.rtype,
					args:  s.args,
					mname: cjs_mangle({
						name:  s.name,
						rtype: s.rtype,
						args:  s.args
					})
				});
			} else if (s.type == "while") {
				cs(s.expr, sc);
				cs(s.code, sc, "while");
			} else {
				//console.log("CS-INV", s);
			}
		}
		//#endregion

		//#region ct - types
		function ct_resolv_var(nm, sc) {
			for (let i = sc; i; i = i.parent)
				for (let j = 0; j < i.symbols.length; j++)
					if (i.symbols[j].name == nm)
						return i.symbols[j];
		}

		function ct_is_std_type(t) {
			if (t == "int" || t == "float") return 1;
			return 0;
		}

		function ct_gen_conversions(a, b, sc) {
			function ct_gen_std_conversions(cvs) {
				let t1 = cvs[cvs.length - 1];

				if (t1.type == a) { 
					return [...cvs];
				}

				// we only do floating point conversions right now.
				if (t1.type == "float" && a == "int") {
					return [...cvs, {op: "float_trunc", type: "int"}];
				}

				if (t1.type == "int" && a == "float") {
					return [...cvs, {op: "int_conv_float", type: "float"}];
				}
			}

			let s1 = ct_gen_std_conversions([{op: "source", type: b}]);
			
			return s1;
		}

		function ct_rank_conversion(c) {
			if (c.op == "source") {
				return 2;
			} else if (false) {
				return 1;
			} else if (c.op == "float_trunc" || c.op == "int_conv_float") {
				return 0;
			} else {
				return -1;
			}
		}
		
		function ct_select_overload(c, mode, name, args) {
			let canidates = [];
			if (mode == OVERLOAD_OP) {
				if (name == "operator=") {
					canidates.push({
						name:  "std_ff_operator=",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator=",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator==") {
					canidates.push({
						name:  "std_ff_operator==",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator==",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator+") {
					canidates.push({
						name:  "std_ff_operator+",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator+",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator%") {
					canidates.push({
						name:  "std_ff_operator%",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator%",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator/") {
					canidates.push({
						name:  "std_ff_operator/",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator/",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator-") {
					canidates.push({
						name:  "std_ff_operator-",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator-",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator*") {
					canidates.push({
						name:  "std_ff_operator*",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator*",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator**") {
					canidates.push({
						name:  "std_ff_operator**",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator**",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator||") {
					canidates.push({
						name:  "std_ff_operator||",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator||",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator&&") {
					canidates.push({
						name:  "std_ff_operator&&",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator&&",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator!") {
					canidates.push({
						name:  "std_f_operator!",
						std:   1,
						args:  [{type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_i_operator!",
						std:   1,
						args:  [{type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator<") {
					canidates.push({
						name:  "std_ff_operator<",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator<",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				} else if (name == "operator>") {
					canidates.push({
						name:  "std_ff_operator>",
						std:   1,
						args:  [{type: "float"}, {type: "float"}],
						rtype: "float"
					});
					canidates.push({
						name:  "std_ii_operator>",
						std:   1,
						args:  [{type: "int"}, {type: "int"}],
						rtype: "int"
					});
				}
			} else if (mode == OVERLOAD_FUNCTION) {
				for (let i = c; i; i = i.parent) 
					for (let ii = 0; ii < i.symbols.length; ii++)
						if (i.symbols[ii].type == "hfunction" || i.symbols[ii].type == "function")
							if (i.symbols[ii].name == name) 
								canidates.push(i.symbols[ii]);
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
			//console.log(canidates)
			let best  = null;
			for (let i = 0; i < canidates.length; i++) {
				do {
					if (best == null) {
						let i1 = [];
						let f1 = canidates[i]
						for (let i = 0; i < f1.args.length; i++) {
							let cv = ct_gen_conversions(f1.args[i].type, args[i].type, c);

							let rank = 2;
							for (let i = 0; i < cv.length; i++) {
								rank = Math.min(rank, ct_rank_conversion(cv[i]));
							}
							
							i1.push({
								seq: cv,
								rank: rank
							});
						}
						best = { fn: f1, cv: i1 };
					} else {
						let f1 = canidates[i];
						let f2 = best.fn;
			
						let i1 = [];
						let i2 = [];

						for (let i = 0; i < f1.args.length; i++) {
							let cv = ct_gen_conversions(f1.args[i].type, args[i].type, c);

							let rank = 2;
							for (let i = 0; i < cv.length; i++) {
								rank = Math.min(rank, ct_rank_conversion(cv[i]));
							}
							
							i1.push({
								seq: cv,
								rank: rank
							});
						}
						
						for (let i = 0; i < f2.args.length; i++) {
							let cv = ct_gen_conversions(f2.args[i].type, args[i].type, c);

							let rank = 2;
							for (let i = 0; i < cv.length; i++) {
								rank = Math.min(rank, ct_rank_conversion(cv[i]));
							}

							i2.push({
								seq: cv,
								rank: rank
							});
						}

						let bt = 0;
						for (let i = 0; i < f1.args.length; i++) {
							if (i1[i].rank < i2[i].rank) {
								bt = 0;
								break;
							}
							
							let subseq = 0;
							ssq: for (let j = 0; j < i2[i].seq.length; j++) {
								for (let k = 0; k < i1[i].seq.length; k++) {
									if (i1[i].seq[k].op != i2[i].seq[j].op) continue ssq;
								}
								subseq = 1;
								break;
							}
							if (subseq) {
								bt = 1;
								continue;
							}

							if (i1[i].rank > i2[i].rank) {
								bt = 1;
								continue;
							}
						}

						if (bt) best = { fn: canidates[i], cv: i1 }
					}
				} while (false);
			}
	
			return best;
		}

		function ct_gen_conversion_ops(value, cv) {
			let val = value;

			for (let i = 0; i < cv.seq.length; i++) {
				if (cv.seq[i].op == "source") {
					val = val;
				} else if (cv.seq[i].op == "int_conv_float") {
					val = {
						type: "int_conv_float",
						otype: "float",
						value: val
					};
				} else {
					console.log("CVO-INV", cv.seq[i]);
				}
			}

			return val;
		}
		
		function ct(s, sc) {
			if (s.type == "expression_list") {
				for (let i = 0; i < s.exprs.length; i++) ct(s.exprs[i], s.scope);

				return s;
			} else if (s.type == "decl_function") {
				ct(s.code, sc);
			} else if (s.type == "if_statement") {
				ct(s.expr, sc);
				ct(s.ifs, sc);
				if (s.elses) ct(s.elses, sc);
			} else if (s.type == "while") {
				ct(s.expr, sc);
				ct(s.code, sc);
			} else if (s.type == "get_var") {
				let v = ct_resolv_var(s.name, sc);
				s.otype = v.vtype;
			} else if (s.type == "equal") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator==", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator==") {
					s.type = "equal_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator==") {
					s.type = "equal_int";
					s.otype = "int";
				}
			} else if (s.type == "decimal") {
				s.otype = "int";
			} else if (s.type == "decl_host_function" || s.type == "decl_var") {
				// ignore
			} else if (s.type == "call") {
				if (!s.tpdn) {
					let args = [];

					for (let i = 0; i < s.args.length; i++) {
						ct(s.args[i], sc);

						args.push({
							type: s.args[i].otype
						})
					}
					
					let ov = ct_select_overload(sc, OVERLOAD_FUNCTION, s.name, args);

//					console.log(sc)
//					console.log(s, ov);

					for (let i = 0; i < ov.cv.length; i++) {
						s.args[i] = ct_gen_conversion_ops(s.args[i], ov.cv[i])
					}
					
					s.sname = s.name;
					s.name  = ov.fn.mname;
					s.otype = ov.fn.rtype;
					s.tpdn  = 1;
				}
			} else if (s.type == "return") {
				ct(s.expr, sc);
			} else if (s.type == "set_var") {
				let v = ct_resolv_var(s.name, sc);
				
				ct(s.value, sc);

				let t1 = v.vtype;
				let t2 = s.value.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator=", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nv = ct_gen_conversion_ops(s.value, ov.cv[1]);

				s.value = nv;

				if (ov.fn.name == "std_ff_operator=") {
					s.type = "set_var_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator=") {
					s.type = "set_var_int";
					s.otype = "int";
				}
			} else if (s.type == "add") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator+", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator+") {
					s.type = "add_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator+") {
					s.type = "add_int";
					s.otype = "int";
				}
			} else if (s.type == "modulus") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator%", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator%") {
					s.type = "mod_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator%") {
					s.type = "mod_int";
					s.otype = "int";
				}
			} else if (s.type == "multiply") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator*", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator*") {
					s.type = "mul_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator*") {
					s.type = "mul_int";
					s.otype = "int";
				}
			} else if (s.type == "power") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator**", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator**") {
					s.type = "power_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator**") {
					s.type = "power_int";
					s.otype = "int";
				}
			} else if (s.type == "subtract") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator-", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator-") {
					s.type = "sub_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator-") {
					s.type = "sub_int";
					s.otype = "int";
				}
			} else if (s.type == "logical_and") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator&&", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator&&") {
					s.type = "logical_and_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator&&") {
					s.type = "logical_and_int";
					s.otype = "int";
				}
			} else if (s.type == "less_than") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator<", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator<") {
					s.type = "less_than_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator<") {
					s.type = "less_than_int";
					s.otype = "int";
				}
			} else if (s.type == "logical_not") {
				ct(s.a, sc);

				let t1 = s.a.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator!", [{type:t1}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);

				s.a = nva;

				if (ov.fn.name == "std_f_operator!") {
					s.type = "logical_not_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_i_operator!") {
					s.type = "logical_not_int";
					s.otype = "int";
				}
			} else if (s.type == "divide") {
				ct(s.a, sc);
				ct(s.b, sc);

				let t1 = s.a.otype;
				let t2 = s.b.otype;
				
				let ov = ct_select_overload(sc, OVERLOAD_OP, "operator/", [{type:t1}, {type:t2}]);
//				console.log(ov);

				let nva = ct_gen_conversion_ops(s.a, ov.cv[0]);
				let nvb = ct_gen_conversion_ops(s.b, ov.cv[1]);

				s.a = nva;
				s.b = nvb;

				if (ov.fn.name == "std_ff_operator/") {
					s.type = "div_float";
					s.otype = "float";
				} else if (ov.fn.name == "std_ii_operator/") {
					s.type = "div_int";
					s.otype = "int";
				}
			} else {
				console.log("CT-INV", s);
			}
		}
		//#endregion
		
		//#region cr - registers
		function cr(s, sc) {
			if (s.type == "expression_list") {
				s.scope.tstacksize = 0;
				s.scope.pstacksize = 0;

				for (let i = 0; i < s.scope.symbols.length; i++) {
					let sym = s.scope.symbols[i];

					if (sym.type == "argument") {
						if (sym.vtype == "int" || "float") {
							sym.size = 4;
							if (!sym.global) {
								sym.location = "stack";
								sym.spos = s.scope.pstacksize;
								s.scope.pstacksize += 4;
							}
						}
					}
				}
				
				for (let i = 0; i < s.scope.symbols.length; i++) {
					let sym = s.scope.symbols[i];

					if (sym.type == "variable") {
						if (sym.vtype == "int" || sym.vtype == "float") {
							sym.size = 4;
							if (!sym.global) {
								sym.location = "stack";
								sym.spos     = -s.scope.tstacksize - 4;
								s.scope.tstacksize += 4;
							}
						}
					}
				}
				
				for (let i = 0; i < s.exprs.length; i++) cr(s.exprs[i], s.scope);
				
				return s;
			} else if (s.type == "decl_host_function") {
				// ignore
			} else if (s.type == "decl_function") {
				cr(s.code, sc);
			} else {
				console.log("CR-INV", s);
				return s
			}
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
			return [(0xff000000&s)>>>24,(0xff0000&s)>>>16,(0xff00&s)>>>8,0xff&s];
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
			//console.log(canidates)
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

			//console.log(best);
			
			return best;
		}

		function cf_resolv_function(ctx, mname) {
			for (let c = ctx; c; c = c.parent)
				for (let i = 0; i < c.symbols.length; i++)
					if (c.symbols[i].mname == mname)
						return c.symbols[i];
		}
		
		function cf_resolv_vtype(ctx, name) {
			for (let c = ctx; c; c = c.parent)
				for (let i = 0; i < c.symbols.length; i++)
					if (c.symbols[i].name == name)
						return c.symbols[i].type;
		}

		function cf_calc_pss(ctx) {
			if (ctx.parent) {
				if (ctx.parent.type == "function") {
					return ctx.parent.pstacksize;
				} else return cf_calc_pss(ctx.parent) + (ctx.pstacksize??0);
			} else return ctx.pstacksize??0;
		}
		
		let funcs = {};
		let nlb = 0;
		function cf(s, nr, c, so) {
			nr = nr ?? CJS_REG_G_;
			if (s.type == "expression_list") {
				let o = [];

				for (let i = 0; i < s.exprs.length; i++) {
					o.push(...cf(s.exprs[i], nr, s.scope).o);
				}

				return {o: [
					CJS_OP_SUB, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_SP, CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, ...cf_int(s.scope.tstacksize),
					...o,
					CJS_OP_ADD, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_SP, CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, ...cf_int(s.scope.tstacksize)
				]};
			} else if (s.type == "decl_var") {
				let v = ct_resolv_var(s.name, c)
				//console.log(v);
				return {o: [
				
				]};
			} else if (s.type == "set_var" || s.type == "set_var_int" || s.type == "set_var_float") {
				let value = cf(s.value, nr, c);
				let v = ct_resolv_var(s.name, c);
				if (v.location == "stack") {
					let spos = v.spos;
					console.log(spos);
					if (v.vtype == "int") {
						return {
							o: [
								...value.o,
								CJS_OP_MOV, // mov [idx](%[base]), %[src]
								  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									  CJS_REG_BP, // %[base]
									CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									  ...cf_int(spos), // [idx]
								  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // %[src]
									nr, // [src]
							],
							rr: nr
						}
					} else if (v.vtype == "float") {
						return {
							o: [
								...value.o,
								CJS_OP_MOV, // mov %[dst], [idx](%[base])
								  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									  CJS_REG_BP, // %[base]
									CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									  ...cf_int(spos), // [idx]
								  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, // %[src]
									nr, // [src]
							],
							rr: nr
						}
					}
				}
				//console.log(v);
				//return {
				//	o: [
				//		...v.o, 
				//		CJS_OP_SVAR, v.rr, ...cf_string(s.name)
				//	],
				//	rr: -1
				//}
			} else if (s.type == "get_var") {
				console.log("C", c);
				let v = ct_resolv_var(s.name, c);
				console.log(s, v);
				if (v.type == "argument") {
					if (v.location == "stack") {
						// also + 4 because this is relative to ebp, which points to where ebp is in the stack so we need to skip it
						let spos = cf_calc_pss(c) - v.spos + 4;
						console.log(spos);
						if (v.vtype == "int") {
							return {
								o: [
									CJS_OP_MOV, // mov %[dst], [idx](%[base])
									  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // %[dst]
									    nr, // [dst]
									  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									    CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									      CJS_REG_BP, // %[base]
									    CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									      ...cf_int(spos) // [idx]
								],
								rr: nr
							}
						} else if (v.vtype == "float") {
							return {
								o: [
									CJS_OP_MOV, // mov %[dst], [idx](%[base])
									  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, // %[dst]
									    nr, // [dst]
									  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									    CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									      CJS_REG_BP, // %[base]
									    CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									      ...cf_int(spos) // [idx]
								],
								rr: nr
							}
						}
					}
				} else if (v.type == "variable") {
					if (v.location == "stack") {
//						console.log(-v.spos + 12);
						let spos = v.spos;
						console.log(spos);
						if (v.vtype == "int") {
							return {
								o: [
									CJS_OP_MOV, // mov %[dst], [idx](%[base])
									  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // %[dst]
									    nr, // [dst]
									  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									    CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									      CJS_REG_BP, // %[base]
									    CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									      ...cf_int(spos) // [idx]
								],
								rr: nr
							}
						} else if (v.vtype == "float") {
							return {
								o: [
									CJS_OP_MOV, // mov %[dst], [idx](%[base])
									  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, // %[dst]
									    nr, // [dst]
									  CJS_OPRAND_TYPE_MEM | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT | CJS_OPRAND_HAS_OFFSET, // [idx](%[base])
									    CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, // (%[base])
									      CJS_REG_BP, // %[base]
									    CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, // [idx]
									      ...cf_int(spos) // [idx]
								],
								rr: nr
							}
						}
					}
				}
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
						CJS_OP_LGOR, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_LGAND, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "logical_not") {
				let a = cf(s.a, nr, c);

				return {
					o: [
						...a.o, 
						CJS_OP_LGNOT, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "add" || s.type == "add_int" || s.type == "add_float") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_ADD, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "sub_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_SUB, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "mul_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_MUL, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				};
			} else if (s.type == "div_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);
				
				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_DIV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: "int"
				}
			} else if (s.type == "div_float") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);
				
				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_DIV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, b.rr
					],
					rr: a.rr,
					rt: "float"
				}
			} else if (s.type == "power_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_PWR, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "power_float") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_PWR, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "mod_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_MOD, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "equal_int") { //|| s.type == "equal_float") { // TODO(XWasHere): give floating point stuff their own instructions
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr+1, c);

				return {
					o: [
						...a.o, 
						...b.o, 
						CJS_OP_EQ, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_NEQ, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_GT, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_LT, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_GE, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
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
						CJS_OP_LE, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "negate") {
				let a = cf(s.a, nr, c);

				return {
					o: [
						...a.o, 
						CJS_OP_NEG, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr
					],
					rr: a.rr,
					rt: a.rt
				}
			} else if (s.type == "decimal") {
				return {
					o: [
						CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, nr, CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, ...cf_int(s.value)
					],
					rr: nr,
					rt: "int"
				}
			} else if (s.type == "if_statement") {
				let e = cf(s.expr,  nr, c);
				let t = cf(s.ifs,   e.rr + 2, c);
				let f = cf(s.elses, e.rr + 2, c);
				
				//console.log(s, e, t, f);

				return {
					o: [
						...e.o,
						CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, e.rr + 1, CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, ...cf_int(0),
						CJS_OP_NEQ, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, e.rr,     CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT,   e.rr + 1,
						CJS_OP_JF,  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, e.rr,     { type: "labelref", name: `__${nlb++}` },
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
				let alen = 0;

				let fn = cf_resolv_function(c, s.name)
				//console.log(fn, c)
				//console.log(c.syms, args);

				for (let i = 0; i < s.args.length; i++) {
					let cd = cf(s.args[i], nr + i, c);

					args.push(cd.rt);

					if (s.args[i].otype == "int") {
						code.push(...cd.o,
								  CJS_OP_PUSH, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, cd.rr);
					} else if (s.args[i].otype == "float") {
						code.push(...cd.o,
								  CJS_OP_PUSH, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | CJS_OPRAND_ITYPE_FLOAT, cd.rr);
					}
					
					alen += 4;
				}

				code.push(CJS_OP_CALL,  { type: "fref", name: s.name, ctx: c, ftype: OVERLOAD_FUNCTION, atypes: args, ins_off: 0, host: fn.type == "hfunction" });
				
//				code.push(CJS_OP_CALL);
//				for (let i = 0; i < s.name.length; i++) code.push(s.name.charCodeAt(i));
//				code.push(0);
				
				code.push(CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, nr,         CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT,   CJS_REG_AX);
				code.push(CJS_OP_ADD, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_SP, CJS_OPRAND_TYPE_CONST | CJS_OPRAND_SIZE_INT, ...cf_int(alen));
				return {o:code, rr: nr};
			} else if (s.type == "decl_function") {
				console.log(s);
//				console.log(c);

				let fname = cjs_mangle({
					name: s.name,
					rtype: s.rtype,
					args: s.args
				});
				
				let plb = `__JPF${fname}`;

				// c.syms.push({ type: "method", name: s.name, mname: fname, rtype: s.rtype, atypes: s.atypes });
				
				return {o:[
					CJS_OP_JMP, { type: "labelref", name: plb },
					{ 
						type: "fentry",
						name: s.name,
						rtype: s.rtype,
						mname: fname 
					},
					CJS_OP_PUSH, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP,
					CJS_OP_MOV,  CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP, CJS_OPRAND_TYPE_REG   | CJS_OPRAND_SIZE_INT, CJS_REG_SP,
					...cf(s.code, nr, c).o,
					{ type: "label", name: plb }
				]};
			} else if (s.type == "decl_host_function") {
				//console.log(s);
				
				let fname = cjs_mangle({
					name: s.name,
					rtype: s.rtype,
					atypes: s.atypes
				});

				// c.syms.push({ type: "hostmethod", name: s.name, mname: fname, rtype: s.rtype, atypes: s.atypes });

				return {o:[]};
			} else if (s.type == "return") {
				let v     = s.expr?cf(s.expr, nr, c):null;
				let itype;

				if (s.expr.otype == "int") {
					itype = CJS_OPRAND_ITYPE_INT;
				} else if (s.expr.otype == "float") {
					itype = CJS_OPRAND_ITYPE_FLOAT;
				}
				
				if (v) {
					return {
						o: [
							...v.o,
							CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | itype, CJS_REG_AX, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT | itype, v.rr, 
							CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_SP, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP,
							CJS_OP_POP, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP,
							CJS_OP_RET
						]
					}
				} else {
					return {
						o: [
							CJS_OP_MOV, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_SP, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP,
							CJS_OP_POP, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, CJS_REG_BP,
							CJS_OP_RET
						]
					}
				}
			} else if (s.type == "int_conv_float") {
				let v = cf(s.value, nr, c);
				
				return {
					o: [
						...v.o,
						CJS_OP_ICONVF, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, v.rr
					],
					rr: v.rr
				};
			} else if (s.type == "while") {
				let expr = cf(s.expr, nr, c);
				let code = cf(s.code, expr.rr + 1, c);

				let slb = `__W${nlb+1}_0`;
				let elb = `__W${nlb++}_1`;

				return {
					o: [
						{ type: "label", name: slb },
						...expr.o,
						CJS_OP_JF, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, expr.rr, { type: "labelref", name: elb },
						...code.o,
						CJS_OP_JMP, { type: "labelref", name: slb },
						{ type: "label", name: elb }
					]
				}
			} else if (s.type == "logical_and_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr + 1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_LGAND, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr
				};
			} else if (s.type == "less_than_int") {
				let a = cf(s.a, nr, c);
				let b = cf(s.b, a.rr + 1, c);

				return {
					o: [
						...a.o,
						...b.o,
						CJS_OP_LT, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, b.rr
					],
					rr: a.rr
				};
			} else if (s.type == "logical_not_int") {
				let a = cf(s.a, nr, c);
				
				return {
					o: [
						...a.o,
						CJS_OP_LGNOT, CJS_OPRAND_TYPE_REG | CJS_OPRAND_SIZE_INT, a.rr,
					],
					rr: a.rr
				};
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
						//console.log(s[i])
						let ov = s[i]
						if (!ov) throw new Error(`"${s[i].name}" is not a function`);

				//		console.log(ov)
						if (ov.host) {
							if (o[o.length - 1 + s[i].ins_off] == CJS_OP_CALL) {
								o[o.length - 1 + s[i].ins_off] = CJS_OP_HCALL;
								for (let i = 0; i < ov.name.length; i++) o.push(ov.name.charCodeAt(i));
								o.push(0);
							}
							//console.log(o[o.length + ov.ins_off], CJS_OP_CALL);
						} else {
							let p = 0;
							for (let ii = 0; ii < s.length; ii++) {
								if (typeof s[ii] == "object") {
									if (s[ii].type == "labelref" || s[ii].type == "fref") {
										if (s[ii].host) {
											p += s[ii].name.length + 1;
										} else {
											p += 4;
										}
									} else if (s[ii].type == "fentry") {
										// console.log(s[ii], ov);
										if (s[ii].mname == ov.name) break;
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
								if (o[ii].type == "labelref") {
									p += 4;
								} else if (o[ii].type == "fref") {
									p += 4;
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
		inp = cs(inp);
		console.log("syms", inp);
		inp = ct(inp);
		console.log("types", inp);
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

		console.log(disassemble(code))
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
		this.registers[CJS_REG_IP] = 0;

		let rsp = new CJSValue();
		rsp.type = this.int_t;
		rsp.value = 4096;
		this.registers[CJS_REG_SP] = 4096;

		let rbp = new CJSValue();
		rbp.type = this.int_t;
		rbp.value = 4096;
		this.registers[CJS_REG_BP] = 4096;
		
		let rax = new CJSValue();
		rax.type = this.int_t;
		rax.value = 0;
		this.registers[CJS_REG_AX] = 0;

		let rbx = new CJSValue();
		rbx.type = this.int_t;
		rbx.value = 0;
		this.registers[CJS_REG_BX] = 0;
		
		this.stack = [];
		this.memory = new ArrayBuffer(8192);
		this.memoryv = new DataView(this.memory);

		console.log(this);
		
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

	oprand_decode(consume) {
		let pos = this.registers[CJS_REG_IP];
		let args = this.code.code[pos++];

		if ((args & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_REG) {
			let itype = "";

			if ((args & CJS_OPRAND_ITYPE) == CJS_OPRAND_ITYPE_INT) {
				itype = "int";
			} else if ((args & CJS_OPRAND_ITYPE) == CJS_OPRAND_ITYPE_FLOAT) {
				itype = "float";
			} else {
				this.interupt(CJS_INT_INVALID_OP);
			}
			
			let reg = this.code.code[pos++];
			if (consume) this.registers[CJS_REG_IP] = pos;
			return {
				type:     "register",
				itype:    itype,
				register: reg
			};
		} else if ((args & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_MEM) {
			let base, offset, itype;

			if ((args & CJS_OPRAND_ITYPE) == CJS_OPRAND_ITYPE_INT) {
				itype = "int";
			} else if ((args & CJS_OPRAND_ITYPE) == CJS_OPRAND_ITYPE_FLOAT) {
				itype = "float";
			}
			
			let base_args = this.code.code[pos++];
			if ((base_args & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_REG) {
				base = {
					type:     "register",
					register: this.code.code[pos++]
				};
			}

			if (args & CJS_OPRAND_HAS_OFFSET) {
				let offset_args = this.code.code[pos++];
				if ((offset_args & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_CONST) {
					if ((offset_args & CJS_OPRAND_SIZE) == CJS_OPRAND_SIZE_INT) {
						offset = {
							type:  "const",
							value: i32_dc(this.code.code, pos)
						};
						pos += 4;
					} else {
						console.error(offset_args);
						this.interupt(CJS_INT_INVALID_OP);
					}
				} else {
					console.error(offset_args);
					this.interupt(CJS_INT_INVALID_OP);
				}
			} else {
				offset = {
					type:  "const",
					value: 0
				};
			}

			if (consume) this.registers[CJS_REG_IP] = pos;
			
			return {
				type: "memory",
				base: base,
				offset: offset,
				itype: itype
			};
		} else if ((args & CJS_OPRAND_TYPE) == CJS_OPRAND_TYPE_CONST) {
			if ((args & CJS_OPRAND_SIZE) == CJS_OPRAND_SIZE_INT) {
				let value = i32_dc(this.code.code, pos);
				pos += 4;
				if (consume) this.registers[CJS_REG_IP] = pos;
				return {
					type: "const",
					value: value
				}
			}
		}
		
		console.error(args);
		this.interupt(CJS_INT_INVALID_OP);
	}
	
	tick() {
		//console.log("interpreter tick", this.registers);
		if (this.code.tier == 0) {
			console.log("tier up from source to baseline");
			this.compile_baseline(this.code);
		//	console.groupEnd();
			return 0;
		} else if (this.code.tier == 1) {
			//console.log(this.code.code[this.registers[CJS_REG_IP].value])
			if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_NOOP) {
				this.registers[CJS_REG_IP]++;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_DVAR) {
				let type = "";
				let name = "";

				this.registers[CJS_REG_IP]++;
				
				for (; this.code.code[this.registers[CJS_REG_IP]] != 0; this.registers[CJS_REG_IP]++) type += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP]]);
				this.registers[CJS_REG_IP]++;

				for (; this.code.code[this.registers[CJS_REG_IP]] != 0; this.registers[CJS_REG_IP]++) name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP]]);
				this.registers[CJS_REG_IP]++;

//				console.log(this.world[0], name);
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
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LDI32) {
				let rn;
				
				this.registers[CJS_REG_IP]++;
				rn = this.code.code[this.registers[CJS_REG_IP]];
				this.registers[CJS_REG_IP]++;

				let vl = i32_dc(this.code.code, this.registers[CJS_REG_IP]);

				this.registers[CJS_REG_IP] += 4;
				this.registers[rn] = vl;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_ADD) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] + value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_SUB) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] - value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_MUL) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] * value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_DIV) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] / value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_MOD) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] % value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_PWR) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = this.registers[a1.register] ** value;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LGOR) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] || value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LGAND) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] && value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LGNOT) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);

				if (a1.type == "register") {
					this.registers[a1.register] = +!this.registers[a1.register];
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					this.memoryv.setInt32(addr, +!this.memoryv.getInt32(addr));
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_EQ) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] == value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_NEQ) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] != value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_GT) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] > value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LT) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] < value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_GE) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] >= value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_LE) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (a1.type == "register") {
//					console.log(this.registers, a1, a2);
					this.registers[a1.register] = +(this.registers[a1.register] <= value);
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_NEG) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);

				if (a1.type == "register") {
					this.registers[a1.register] = -this.registers[a1.register];
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					this.memoryv.setInt32(addr, -this.memoryv.getInt32(addr));
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_SVAR) {
				this.registers[CJS_REG_IP]++;

				let reg = this.code.code[this.registers[CJS_REG_IP]++];
				
				let name = "";
				for (; this.code.code[this.registers[CJS_REG_IP]] != 0; this.registers[CJS_REG_IP]++)
					name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP]]);
				this.registers[CJS_REG_IP]++;
				
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
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_GVAR) {
				this.registers[CJS_REG_IP]++;

				let reg = this.code.code[this.registers[CJS_REG_IP]++];
				
				let name = "";
				for (; this.code.code[this.registers[CJS_REG_IP]] != 0; this.registers[CJS_REG_IP]++)
					name += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP]]);
				this.registers[CJS_REG_IP]++;
				
				let sym = this.world[0].gets(name);

				this.registers[reg] = sym;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_JMP) {
				this.registers[CJS_REG_IP]++;

				let addr = i32_dc(this.code.code, this.registers[CJS_REG_IP]);
				this.registers[CJS_REG_IP] += 4;
				//console.log(addr);
				
				this.registers[CJS_REG_IP] = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_JT) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				
				let value;
				if (a1.type == "register") {
					value = this.registers[a1.register];
				} else if (a1.type == "const") {
					value = a1.value;
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				if (value != 0)
					this.registers[CJS_REG_IP] = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_JF) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let value;
				if (a1.type == "register") {
					value = this.registers[a1.register];
				} else if (a1.type == "const") {
					value = a1.value;
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					value = this.memoryv.getInt32(addr);
				}

				let addr = i32_dc(this.code.code, this.registers[CJS_REG_IP]);
				this.registers[CJS_REG_IP] += 4;

				if (value == 0)
					this.registers[CJS_REG_IP] = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_PUSH) {
				this.registers[CJS_REG_IP]++;

				let inp = this.oprand_decode(1);
	
				if (inp.type == "register") {
					this.registers[CJS_REG_SP] -= 4;
					let value = this.registers[inp.register];

					if (inp.itype == "int") {
						this.memoryv.setInt32(this.registers[CJS_REG_SP], value);
					} else if (inp.itype == "float") {
						this.memoryv.setFloat32(this.registers[CJS_REG_SP], value);
					}
				} 
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_POP) {
				this.registers[CJS_REG_IP]++;

				let out = this.oprand_decode(1);

				let sv = this.memoryv.getInt32(this.registers[CJS_REG_SP]);
				this.registers[CJS_REG_SP] += 4;
				
				if (out.type == "register") {
					this.registers[out.register] = sv;
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_CALL) {
				this.registers[CJS_REG_IP]++;

				let addr = i32_dc(this.code.code, this.registers[CJS_REG_IP]);
				this.registers[CJS_REG_IP] += 4;
				
				this.registers[CJS_REG_SP] -= 4;
				this.memoryv.setInt32(this.registers[CJS_REG_SP], this.registers[CJS_REG_IP]);
				
				this.registers[CJS_REG_IP] = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_MOV) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);
				let a2 = this.oprand_decode(1);

				let value;
				if (a2.type == "register") {
					value = this.registers[a2.register];
				} else if (a2.type == "const") {
					value = a2.value;
				} else if (a2.type == "memory") {
					let addr = 0;

					if (a2.base.type == "register") {
						addr = this.registers[a2.base.register];
					}

					if (a2.offset.type == "const") {
						addr += a2.offset.value;
					}

					if      (a2.itype == "int")   value = this.memoryv.getInt32(addr);
					else if (a2.itype == "float") value = this.memoryv.getFloat32(addr);
				}

				if (a1.type == "register") {
					this.registers[a1.register] = value;
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					if      (a1.itype == "int")   this.memoryv.setInt32(addr, value);
					else if (a1.itype == "float") this.memoryv.setFloat32(addr, value);
				}
				//this.registers[r1] = this.registers[r2];
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_RET) {
				this.registers[CJS_REG_IP]++;

				let addr = this.memoryv.getInt32(this.registers[CJS_REG_SP]);
				this.registers[CJS_REG_SP] += 4;
				
				this.registers[CJS_REG_IP] = addr;
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_HCALL) {
				this.registers[CJS_REG_IP]++;

				let nm = "";
				for (; this.code.code[this.registers[CJS_REG_IP]] != 0; this.registers[CJS_REG_IP]++) nm += String.fromCharCode(this.code.code[this.registers[CJS_REG_IP]]);
				this.registers[CJS_REG_IP]++;

				//console.log(this.hmtds)
				if (!this.hmtds[nm]) {
					this.interupt(CJS_INT_REFERENCE_ERROR);
				}

				this.hmtds[nm](this);
			} else if (this.code.code[this.registers[CJS_REG_IP]] == CJS_OP_ICONVF) {
				this.registers[CJS_REG_IP]++;

				let a1 = this.oprand_decode(1);

				if (a1.type == "register") {
					this.registers[a1.register] = this.registers[a1.register];
				} else if (a1.type == "memory") {
					let addr = 0;

					if (a1.base.type == "register") {
						addr = this.registers[a1.base.register];
					}

					if (a1.offset.type == "const") {
						addr += a1.offset.value;
					}

					this.memoryv.setFloat32(addr, this.memoryv.getInt32(addr));
				}
			} else if (this.code.code[this.registers[CJS_REG_IP]] == undefined) {
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
