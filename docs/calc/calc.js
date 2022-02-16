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

class CJSType {
	is_primitave = false;
	tr;
	
	casts = { t: {}, f: {} };
	ops   = {};
	
	constructor() {
		
	}

	cast(x) {
		if (this.casts.f[x.type.tr]) {
			return this.casts.f[x.type.tr].call([x]);
		} else if (x.type.casts.t[this.tr]) {
			return x.type.casts.t[this.tr].call([x]);
		}
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

class CJSValue {
	type;
	value;
}

class CJSBoundFunction {
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
				if (v = this.args[i].cast(a)) {
					nargs.push(v);
				} else {
					throw "t";
				}
			} else {
				nargs.push(a)
			}
		})

		return this.handler(...args);
	}
}

class CJSContext {
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

class CJSIdentifier {
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

class CJSNumber {
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

class CJSParenExpr {
	expr;
	
	exec(i, context) {
		return i.exec(this.expr);
	}
	
	static parse(p) {
		let t;
		let r = new CJSParenExpr();
		
		if (p.src[p.pos] == "(") {
			p.pos++;
			t = p.parse(CJSConditional);
			if (t) {
				if (p.src[p.pos] == ")") {
					p.pos++;
					r.expr = t;
					return r;
				}
			}
		}
	}
}

class CJSVarDeclaration {
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
				if (t = p.parse(CJSIdentifier)) {
					r.name = t.name;
					return r;
				}
			}
		}
	}
}

class CJSPrimary {
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

class CJSExponent {
	a;
	b;

	exec(i, context) {
		if (this.b) {
			let a = i.exec(this.a);
			let b = i.exec(this.b);

			let r = CJSType.exec_op(a, "^", b);

			if (r) {
				return r;
			} else {
				context.trapd = true;
				context.trapv = `cant execute op ${a.type.tr.description} ^ ${a.type.tr.description}`;
				throw context.trapv;
			}
		} else {
			return i.exec(this.a);
		}
	}
	
	static parse(p) {
		let r = new CJSExponent();
		let t;

		if (t = p.parse(CJSPrimary)) {
			r.a = t;
			if (p.src[p.pos] == "^") {
				p.pos++;
				if (t = p.parse(CJSExponent)) {
					r.b = t;
					return r;
				}
			} else {
				return r;
			}
		}
	}
}

class CJSMultiplicitave {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type == "*") {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = CJSType.exec_op(a, "*", b);

				if (r) {
					return r;
				} else {
					context.trapd = true;
					context.trapv = `cant execute op ${a.type.tr.description} * ${a.type.tr.description}`;
					throw context.trapv;
				}
			} else if (this.type == "/") {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = CJSType.exec_op(a, "/", b);
	
				if (r) {
					return r;
				} else {
					context.trapd = true;
					context.trapv = `cant execute op ${a.type.tr.description} / ${a.type.tr.description}`;
					throw context.trapv;
				}
			} else if (this.type == "%") {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = CJSType.exec_op(a, "%", b);
	
				if (r) {
					return r;
				} else {
					context.trapd = true;
					context.trapv = `cant execute op ${a.type.tr.description} % ${a.type.tr.description}`;
					throw context.trapv;
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
				if (/[*/%]/.test(p.src[p.pos])) {
					let type = p.src[p.pos];
					p.pos++;
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

class CJSAdditive {
	a;
	b;
	type;

	exec(i, context) {
		if (this.a) {
			if (this.type == "+") {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = CJSType.exec_op(a, "+", b);
	
				if (r) {
					return r;
				} else {
					context.trapd = true;
					context.trapv = `cant execute op ${a.type.tr.description} + ${a.type.tr.description}`;
					throw context.trapv;
				}
			} else if (this.type == "-") {
				let a = i.exec(this.a);
				let b = i.exec(this.b);
	
				let r = CJSType.exec_op(a, "-", b);
	
				if (r) {
					return r;
				} else {
					context.trapd = true;
					context.trapv = `cant execute op ${a.type.tr.description} - ${a.type.tr.description}`;
					throw context.trapv;
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
				if (p.src[p.pos] == "+" || p.src[p.pos] == "-") {
					let type = p.src[p.pos];
					p.pos++;
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

class CJSConditional {
	a;
	b;
	c;

	exec(i, context) {
		if (this.b) {
			if (this.a.exec(context)) {
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

		if (t = p.parse(CJSAdditive)) {
			r.a = t;
			if (p.src[p.pos] == "?") {
				p.pos++;
				if (t = p.parse(CJSAssignment)) {
					r.b = t;
					if (p.src[p.pos] == ":") {
						p.pos++;
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

class CJSAssignment {
	a;
	b;

	exec(i, context) {
		if (this.a) {
			return context.getv(this.a).value = i.exec(this.b).value;
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
			if (p.src[p.pos] == "=") {
				p.pos++;
				if (t = p.parse(CJSConditional)) {
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

class CJSExpr {
	expr;

	exec(i, context) {
		return i.exec(this.expr);
	}
	
	static parse(p) {
		let r = new CJSExpr();
		let t;

		if (t = p.parse(CJSAssignment)) {
			if (p.src[p.pos] == ";") {
				while (p.src[p.pos] == "\n") p.pos++;
				
				p.pos++;
				r.expr = t;
				return r;
			}
		}
	}
}

class CJSExprList {
	ins = [];

	exec(i, context) {
		let res = 0;
		
		this.ins.forEach((e) => {
			res = i.exec(e);
		});

		return res;
	}
	
	static parse(p) {
		let r = new CJSExprList();
		let t;

		while (t = p.parse(CJSExpr)) {
			r.ins.push(t);
		}

		return r;
	}
}

class CJSCallArguments {
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

class CJSCall {
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
			throw "a";
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

class CJSParser {
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

class CJSInterpreter {
	world = [];
	
	push_context(c) {
		c = c || new CJSContext();

		this.world.unshift(c);
	}

	pop_context() {
		return this.world.shift();
	}
	
	exec(c) {
		try {
			let res = c.exec(this, this.world[0])

			if (this.world[0].trapd) {
				throw this.world[0].trapv;
			}
			
			return res;
		} catch (e) {
			if (e == this.world[0].trapv) {
				throw this.world[0].trapv;
			} else {
				throw e;
			}
		}
	}
	
	exec_script(script) {
		let globals = new CJSContext();

		// uh, types
		let int_t =   new CJSType();
		let float_t = new CJSType();
		
		int_t.tr   = Symbol("int");
		float_t.tr = Symbol("float");

		int_t.ops = {
			'^': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();

						r.type  = int_t;
						r.value = x.value ** y.value;

						return r;
					})
				}
			},
			'*': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();

						r.type = int_t;
						r.value = x.value * y.value;

						return r;
					})
				}
			},
			'/': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();
	
						if (b.value == 0) {
							throw "[!VM{divide by zero}]";
						}

						r.type = int_t;
						r.value = Math.floor(x.value / y.value);

						return r;
					})
				}
			},
			'%': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();

						r.type = int_t;
						r.value = x.value % y.value;

						return r;
					})
				}
			},
			'+': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();

						r.type = int_t;
						r.value = x.value + y.value;

						return r;
					})
				}
			},
			'-': {
				[int_t.tr]: {
					[int_t.tr]: CJSBoundFunction.bind([int_t, int_t], int_t, (x, y) => {
						let r = new CJSValue();

						r.type = int_t;
						r.value = x.value - y.value;

						return r;
					})
				}
			}
		}

		float_t.ops = {
			'^': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();

						r.type  = float_t;
						r.value = x.value ** y.value;

						return r;
					})
				}
			},
			'*': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();

						r.type = float_t;
						r.value = x.value * y.value;

						return r;
					})
				}
			},
			'/': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();
	
						if (b.value == 0) {
							throw "[!VM{divide by zero}]";
						}

						r.type = float_t;
						r.value = x.value / y.value;

						return r;
					})
				}
			},
			'%': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();

						r.type = float_t;
						r.value = x.value % y.value;

						return r;
					})
				}
			},
			'+': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();

						r.type = float_t;
						r.value = x.value + y.value;

						return r;
					})
				}
			},
			'-': {
				[float_t.tr]: {
					[float_t.tr]: CJSBoundFunction.bind([float_t, float_t], float_t, (x, y) => {
						let r = new CJSValue();

						r.type = float_t;
						r.value = x.value - y.value;

						return r;
					})
				}
			}
		}

		int_t.casts = {
			t: {
				[float_t.tr]: CJSBoundFunction.bind([int_t], float_t, (x) => {
					let r = new CJSValue();
		
					r.type = float_t;
					r.value = x.value;
		
					return r;
				})
			},
			f: {
				
			}
		};

		float_t.casts = {
			t: {
				[int_t.tr]: CJSBoundFunction.bind([float_t], int_t, (x) => {
					let r = new CJSValue();
			
					r.type = int_t;
					r.value = Math.trunc(x.value);
		
					return r;
				})
			},
			f: {
				
			}
		};
		
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

function parse(e) {
	let p = new CJSParser(e);
	
	let data = e;

	let stack = [];
	let pos   = 0;
	
	return p.parse(CJSExprList);
}

async function exec() {
	let res = parse(input_thing.value);

	if (!res) {
		return;
	}

	console.log(res);

	let int = new CJSInterpreter();

	try {
		res = int.exec_script(res);
	} catch (e) {
		if (int.world[0]?.trapd) {
			res = `VM TRAP - "${e}"`;
		} else {
			throw e;
		}
	}
	
	console.log(res);

	output_thing.textContent = res.value + "";
}

async function main() {
	// thigns
	calc_root = document.createElement("div");
	document.body.appendChild(calc_root);

	input_container = document.createElement("div");
	calc_root.appendChild(input_container);

	input_thing = document.createElement("input");

	input_thing.addEventListener("input", exec);
	
	input_container.appendChild(input_thing);

	output_container = document.createElement("div");
	calc_root.appendChild(output_container);

	output_thing = document.createTextNode("");
	output_container.appendChild(output_thing);

	// test
	input_thing.value = 
`int a;
int b;
b=0;
a=1;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
a=a*2;
b=b+a;
b;`;

	await exec();

	// ready
	input_thing.value = "";

	await exec();
}

document.addEventListener("DOMContentLoaded", main)
