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

(()=>{
	let a = document.createElement("span");
	a.style.fontFamily = "monospace";
	a.textContent = "a";
	document.body.appendChild(a);
	
	let b = a.getBoundingClientRect();
	globalThis.monospace_size = {h: b.height, w: b.width};

	a.remove();
})();

class CJSTextAreaElement extends HTMLElement {
	__value = "";
	
	input;
	linec;
	caretc;
	hlc;

	drag;
	drag_s;
	drag_e;
	
	lnos;
	lines = [];
	cursor_pos = 0;
	cursor_mark = null;

	get value() {
		return this.__value;
	}

	set value(x) {
		this.__value = x;
		this.stylize();
	}

	set_line_numbers(n) {
		if (this.lnos.childElementCount < n) {
			while (this.lnos.childElementCount < n) {
				let lno = document.createElement("div");
				lno.textContent = this.lnos.childElementCount + 1;
				this.lnos.appendChild(lno);
			}
		} else if (this.lnos.childElementCount > n) {
			while (this.lnos.childElementCount > n) {
				if (this.lnos.childElementCount > 0) {
					this.lnos.children[this.lnos.childElementCount - 1].remove();
				}
			}
		}
	}

	chit(sx, sy) {
		let br = this.text_area.getBoundingClientRect();
		
		let x = Math.floor((sx - br.x) / monospace_size.w);
		let y = Math.floor((sy - br.y) / monospace_size.h);
		
		let cx = 0;
		let cy = 0;
		let np = 0;
		
		for (let i = 0; i <= this.__value.length && !(cx == x + 1 && cy == y) && !(cy > y); i++) {
			if (this.__value[i] == "\n") {
				cy++;
				cx = 0;
			} else {
				cx++;
			}
			np = i;
		}

		return np;
	}
	
	stylize() {
		let caret  = this.caretc; //document.createElement("div");
		let careti = this.caretr;
		let line   = document.createElement("div");
		let token  = document.createElement("span");
		let hlgt   = this.hlc;
		let nlines = [];
		
		caret.className = "caret_container";
		hlgt.className  = "highlight_container";
		token.className = "token_generic";
		
		let cx = 0;
		let cy = 0;

		let tokens = [];
		let ct = { type: "generic", data: "", line: 0 }
		let ldta = "";

		let hlgts = [];
		let hlb, hle;
		let hpb, hpe;
		if (this.cursor_mark != null) {
			if (this.cursor_mark < this.cursor_pos) {
				hlb = this.cursor_mark - 1;
				hle = this.cursor_pos - 1;
			} else {
				hlb = this.cursor_pos - 1;
				hle = this.cursor_mark - 1;
			}
		}

		let rx = 0, ry = 0;
		for (let i = 0; i < this.__value.length; i++) {
			ldta += this.__value[i];
			
			if (this.__value[i] == '\n') {
				rx = 0;
				ry++;
			} else {
				rx++;
			}
			
			if (i < this.cursor_pos) {
				cx = rx;
				cy = ry;
			}

			if (hlb != null) {
				if (hlb < i && i <= hle) {
					hlgts.push({ sx: rx, sy: ry, w: 1 });
				}
			}
			
			if (/[ \t\r]/.test(this.__value[i])) {
				if (ct.type == "whitespace") {
					ct.data += this.__value[i];
				} else {
					tokens.push(ct);
					ct = { type: "whitespace", data: this.__value[i], line: cy };
				}
			} else if (/\n/.test(this.value[i])) {
				tokens.push(ct);
				tokens.push({type: "newline", data: "", line: cy});
				ct = {type: "generic", data: "", line: cy};
				nlines.push(ldta);
				ldta = "";
			} else if (/[;+-/*()?:<>%=]/.test(this.__value[i])) {
				tokens.push(ct);
				tokens.push({type: "generic", data: this.__value[i], line: cy});
				ct = { type: "generic", data: "", line: cy };
			} else if (/[0123456789]/.test(this.__value[i]) && ct.type != "identifier") {
				if (ct.type == "number") {
					ct.data += this.__value[i];
				} else {
					tokens.push(ct);
					ct = { type: "number", data: this.__value[i], line: cy };
				}
			} else if (/\p{ID_Start}/u.test(this.__value[i]) && ct.type != "identifier") {
				tokens.push(ct);
				ct = { type: "identifier", data: this.__value[i], line: cy };
			} else if (/\p{ID_Continue}/u.test(this.__value[i]) && ct.type == "identifier") {
				ct.data += this.__value[i];
			} else {
				if (ct.type == "generic") {
					ct.data += this.__value[i];
				} else {
					tokens.push(ct);
					ct = { type: "generic", data: this.__value[i], line: cy };
				}
			}
		}
		
		nlines.push(ldta);
		tokens.push(ct);

		let llno = -1;
		let line_numbers = 1;
		for (let i = 0; i < tokens.length; i++) {
			if (tokens[i].type == "newline") {
				if (this.lines[line_numbers - 1] != nlines[line_numbers - 1] || this.lines[line_numbers - 1] == undefined) {
					line.appendChild(document.createElement("br"));				
				}
				line_numbers++;
			} 
			if (this.lines[line_numbers - 1] != nlines[line_numbers - 1] || this.lines[line_numbers - 1] == undefined) {
				if (llno != line_numbers - 1) {
					line = document.createElement("div");
	
					if (this.linec.children[line_numbers - 1]) {
						this.linec.children[line_numbers - 1].replaceWith(line);
					} else {
						this.linec.appendChild(line);
					}
				}
				llno = line_numbers - 1;
				if (tokens[i].type == "identifier") {
					let t = document.createElement("span");
					if (tokens[i + 1]?.type == "whitespace" && tokens[i + 2]?.type == "identifier") {
						t.className = "token_class_identifier";
					} else if (tokens[i + 1]?.data == '(') {
						t.className = "token_function_identifier";
					} else {
						t.className = "token_identifier";
					}
					t.textContent = tokens[i].data;
					line.appendChild(t);
				} else if (tokens[i].type == "number") {
					let t = document.createElement("span");
					t.className = "token_number";
					t.textContent = tokens[i].data;
					line.appendChild(t);
				} else {
					let t = document.createElement("span");
					t.className = "token_generic";
					t.textContent = tokens[i].data;
					line.appendChild(t);
				}
				if (tokens[i+1]?.line != line_numbers - 1) {
					console.log(tokens[i+1]);
				}
			}
		}

		hlgt.replaceChildren(document.createElement("span"));
		for (let i = 0; i < hlgts.length; i++) {
			let h = document.createElement("div");
			let hc = document.createElement("div");
			
			h.style.height = `${monospace_size.h}px`;
			h.style.width  = `${monospace_size.w * hlgts[i].w}px`;
			h.style.top  = `${hlgts[i].sy * monospace_size.h}px`;
			h.style.left = `${(hlgts[i].sx - 1) * monospace_size.w}px`;

			hc.appendChild(h);
			hlgt.appendChild(hc);
		}
		
		this.set_line_numbers(line_numbers);
		
		this.lines = nlines;

		while (this.linec.childElementCount > this.lines.length) {
			this.linec.children[this.linec.childElementCount - 1].remove();
		}
		
		careti.style.left   = `${cx * monospace_size.w}px`;
		careti.style.top    = `${cy * monospace_size.h}px`;
		careti.style.height = `${monospace_size.h}px`;
	}
	
	constructor() {
		super();

		this.setAttribute("role", "textbox");
		this.setAttribute("aria-multiline", "true");
		
		let shadow = this.attachShadow({ mode: "open" });

		let root = document.createElement("div");
		let style = document.createElement("link");
		let main = document.createElement("div");
		let tarea = document.createElement("div");
		let tiarea = this.text_area = document.createElement("div");
		let tiareac = document.createElement("div");
		let lines = this.linec = document.createElement("div");
		let caret = this.caretc = document.createElement("div");
		let caretr = this.caretr = document.createElement("div");
		let hl = this.hlc = document.createElement("div");
		let trarea = document.createElement("textarea");
		let lnos = this.lnos = document.createElement("div");
		
		root.className = "root";
		main.className = "main";
		tarea.className = "input";
		tiarea.className = "content";
		tiareac.className = "content_container";
		lnos.className = "linenos";
		caret.className = "caret_container";
		hl.className = "highlight_container";
		
		style.href = "./cjshl.css";
		style.rel  = "stylesheet";
		
		tiarea.contentEditable = true;
		tiarea.spellcheck = false; // inconsistent naming
		
		tiarea.addEventListener("beforeinput", (e) => {
			e.preventDefault();

			let thing = 1;
			
			if (/insert(Text|Paragraph|FromPaste)|deleteContent(Backward|Forward)/.test(e.inputType)) {
				if (this.cursor_mark != null) {
					let a, b;

					if (this.cursor_mark < this.cursor_pos) {
						a = this.cursor_mark;
						b = this.cursor_pos;
					} else {
						a = this.cursor_pos;
						b = this.cursor_mark;
					}
					
					this.__value = `${this.__value.slice(0, a)}${this.__value.slice(b)}`;
					this.cursor_pos = a;
					this.cursor_mark = null;

					if (/deleteContent(Backward|Forward)/.test(e.inputType)) {
						thing = 0;
					}
				}
			}

			if (thing) {
				if (e.inputType == "insertText") {
					this.__value = `${this.__value.slice(0, this.cursor_pos)}${e.data}${this.__value.slice(this.cursor_pos)}`;
					this.cursor_pos++;
				} else if (e.inputType == "insertParagraph") {
					this.__value = `${this.__value.slice(0, this.cursor_pos)}\n${this.__value.slice(this.cursor_pos)}`;
					this.cursor_pos++;
				} else if (e.inputType == "deleteContentBackward") {
					if (this.cursor_pos != 0) {
						this.__value = `${this.__value.slice(0, this.cursor_pos - 1)}${this.__value.slice(this.cursor_pos)}`;
						this.cursor_pos--;
					}
				} else if (e.inputType == "insertFromPaste") {
					if (e.dataTransfer.types.includes("text/plain")) {
						for (let i = 0; i < e.dataTransfer.items.length; i++) {
							if (e.dataTransfer.items[i].type == "text/plain") {
								e.dataTransfer.items[i].getAsString((data) => {
									data = data.replaceAll("\r\n", "\n");
									this.__value = `${this.__value.slice(0, this.cursor_pos)}${data}${this.__value.slice(this.cursor_pos)}`;
									this.cursor_pos += data.length;
									this.stylize();
									let di = new InputEvent("input");
									this.dispatchEvent(di)
								})
								
								return;
							}
						}
					}
				}
			}
			
			this.stylize();

			// i dont actually know how to set up events and i cant access mdn on this device so this will have to do
			let di = new InputEvent("input");
			this.dispatchEvent(di)
		});

		tiarea.addEventListener("keydown", (e) => {
			if (/Arrow(Right|Left|Up|Down)/.test(e.code)) {
				if (e.shiftKey) {
					if (this.cursor_mark == null) {
						this.cursor_mark = this.cursor_pos;
					}
				} else {
					this.cursor_mark = null;
				}
			}
			
			if (e.code == "ArrowRight") {
				if (this.cursor_pos < this.value.length) {
					this.cursor_pos++;
				}
			} else if (e.code == "ArrowLeft") {
				if (this.cursor_pos != 0) {
					this.cursor_pos--;
				}
			} else if (e.code == "ArrowUp" || e.code == "ArrowDown") {
				let l = 0;

				for (let i = this.cursor_pos; this.__value[i] != '\n' && i != 0; i--) l++;

				if (e.code == "ArrowUp") {
					for (let i = this.cursor_pos; this.__value[i] != '\n' && i != 0; i--) this.cursor_pos--;
					if (this.cursor_pos) this.cursor_pos--;
					for (let i = this.cursor_pos; this.__value[i] != '\n' && i != 0; i--) this.cursor_pos--;
	
					for (let i = 0; i < l; i++) {
						this.cursor_pos++;
						if (this.__value[this.cursor_pos] == '\n') {
							this.stylize();
							return;
						}
					}
	
					if (this.cursor_pos) this.cursor_pos--;
				} else if (e.code == "ArrowDown") {
					for (let i = this.cursor_pos; this.__value[i] != '\n' && i <= this.value.__length; i++) this.cursor_pos++;
					this.cursor_pos++;
					for (let i = 0; this.__value[i] != '\n' && i < l && i < this.__value.length; i++) this.cursor_pos++;
				}
			} else if ((e.code == "KeyC" || e.code == "KeyX") && e.ctrlKey) {
				let a, b;

				if (this.cursor_mark < this.cursor_pos) {
					a = this.cursor_mark;
					b = this.cursor_pos;
				} else {
					a = this.cursor_pos;
					b = this.cursor_mark;
				}

				navigator.clipboard.writeText(this.__value.slice(a, b));
				if (e.code == "KeyX") {
					this.__value = `${this.__value.slice(0, a)}${this.__value.slice(b)}`;
				}
			} else {
				return;
			}

			this.stylize();
		});

		tiarea.addEventListener("mousedown", (e) => {
			if (e.button == 0) {
				this.cursor_mark = null;
				this.drag_s = this.drag_e = this.cursor_pos = this.chit(e.clientX, e.clientY);
				this.drag = 1;
				
				this.stylize();
			}
		});

		tiarea.addEventListener("mousemove", (e) => {
			if (this.drag) {
				e.preventDefault();
			
				this.drag_e = this.cursor_pos = this.chit(e.clientX, e.clientY);
				
				if (this.drag_s != this.drag_e) {
					this.cursor_mark = this.drag_s;
				}
				
				this.stylize();
			}
		});

		tiarea.addEventListener("mouseout", (e) => {
			if (this.drag && !(e.buttons & 1)) {
				this.drag = 0;
			}
		});

		tiarea.addEventListener("mousein", (e) => {
			if (this.drag && !(e.buttons & 1)) {
				this.drag = 0;
			}
		});
		
		tiarea.addEventListener("mouseup", (e) => {
			this.drag = this.drag_e = this.drag_s = 0;

			this.stylize();
		});

		tiarea.addEventListener("dblclick", (e) => {
			let sp = this.chit(e.clientX, e.clientY);
			let ep = sp;

			for (; !(/[ \n\t\r;<>*()%/\-+?:=]/.test(this.__value[sp - 1])) && sp > 0; sp--) ;
			for (; !(/[ \n\t\r;<>*()%/\-+?:=]/.test(this.__value[ep])) && ep < this.__value.length; ep++) ;

			this.cursor_mark = sp;
			this.cursor_pos  = ep;

			this.stylize();
		});
		
		shadow.appendChild(root);
		root.appendChild(style);
		root.appendChild(main);
		main.appendChild(tarea);
		tarea.appendChild(this.lnos);
		tarea.appendChild(tiarea);
		tiarea.appendChild(this.caretc);
		this.caretc.appendChild(this.caretr);
		tiarea.appendChild(this.hlc);
		tiarea.appendChild(this.linec);

		this.lnos.setAttribute("aria-hidden", "true");
		
		this.stylize();
	}
}

customElements.define("cjs-textarea", CJSTextAreaElement);
