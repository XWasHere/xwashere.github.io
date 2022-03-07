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

const OVERLOAD_OP = 1;

function mangle(args) {
	let m = args.name;
	return m;
}

export class CJSType {
	is_primitave = false;
	tr;
	
//	casts = { t: {}, f: {} };
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
	vars    = {};
	funcs   = {};
	types   = {};
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

	bindf(n, a, r, h) {
		let f = new CJSBoundFunction();

		f.args = a;
		f.retv = r;
		f.handler = h;

		this.funcs[n] = f;
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

		if (/\p{ID_Start}/u.test(p.src[p.pos])) {
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

	exec(i, context) {
		let v = new CJSValue();

		v.type = context.gett(this.type);
		
		context.vars[this.name] = v;
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
					return r;
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
		
		if (t = p.parse(CJSVarDeclaration)) {
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
		i.exec(this.block);
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
		
		if (t = p.parse(CJSExpressionStatement)) {
			p.eat_ws();
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

			while (p.src[p.pos] == ",") {
				p.pos++;

				if (t = p.parse(CJSAssignment)) {
					r.args.push(t);
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
		if (f = context.getf(this.target.name)) {
			let args = [];

			this.args.args.forEach((a) => {
				args.push(a.exec(i, context));
			});
			
			return f.call(args);
		} else {
			i.trap(`${this.target.name} is not a function`);
		}
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

export class CJSInterpreter {
	world = [];
	
	push_context(c) {
		c = c || new CJSContext();

		this.world.unshift(c);
	}

	pop_context() {
		return this.world.shift();
	}

	trap(m) {
		throw `[!VM{${m}}]`;
	}

	exec(c) {
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
		
		globals.types["int"]   = int_t;
		globals.types["float"] = float_t;
		
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
		
		this.push_context(globals); 
		
		return this.exec(script);
	}
}
