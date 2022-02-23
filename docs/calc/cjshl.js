
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
	
	stylize() {
		let caret  = this.caretc; //document.createElement("div");
		let careti = this.caretr;
		let lines  = this.linec; //document.createElement("div");
		let line   = document.createElement("div");
		let linec  = document.createElement("span");
		let token  = document.createElement("span");
		let hlgt   = this.hlc; //document.createElement("div");
		let nlines = [];
		
		//let lnos   = document.createElement("div");

		caret.className = "caret_container";
		hlgt.className  = "highlight_container";
		token.className = "token_generic";
		
		let cx = 0;
		let cy = 0;
		let ch = 14;
		
		let nxl = 2;
		
		let hlb, hle;

		if (this.cursor_mark != null) {
			if (this.cursor_mark < this.cursor_pos) {
				hlb = this.cursor_mark - 1;
				hle = this.cursor_pos - 1;
			} else {
				hlb = this.cursor_pos - 1;
				hle = this.cursor_mark - 1;
			}
		}

		let l;
		let lhlb = null;
		let lhl = null;
		let lhlc = null; 
		let inid = 0;
		let lt = null;
		let ltt = null;
		let cl = 0;
		let rl = 0;
		let tokens = [];
		let ct = { type: "generic", data: "", line: 0 }
		let ldta = "";
		
		for (let i = 0; i < this.__value.length; i++) {
			ldta += this.__value[i];
			if (i < this.cursor_pos) {
				if (this.__value[i] == '\n') {
					cx = 0;
					cy++;
				} else {
					cx++;
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
				tokens.push({type: "newline", data: "\n", line: cy});
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
						t.className = "token_class";
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
					line.appendChild(document.createElement("br"));
				}
			}
		}

		this.set_line_numbers(line_numbers);

		this.lines = nlines;
		
		careti.style.left   = `${cx * monospace_size.w}px`;
		careti.style.top    = `${cy * monospace_size.h}px`;
		careti.style.height = `${monospace_size.h}px`;
	}
	
	constructor() {
		super();

		let shadow = this.attachShadow({ mode: "open" });

		let root = document.createElement("div");
		let style = document.createElement("style");
		let main = document.createElement("div");
		let tarea = document.createElement("div");
		let tiarea = this.text_area = document.createElement("div");
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
		lnos.className = "linenos";
		caret.className = "caret_container";
		hl.className = "highlight_container";
		
		style.innerHTML = `
@keyframes blinky_thing {
	0% {
		background-color: #b0b0b0;
	}
	50% {
		background-color: #00000000;
	}
}

.root {
	background-color: #000000;
	height: 100%;
	width: 100%;
}

.main {
	background-color #000000;
	height: 100%;
	width: 100%;
	font-family: monospace;
}

.input {
	background-color: #000000;
	height: 100%;
	width: 100%;
	display: flex;
}

.linenos {
	flex-grow: 0;
	flex-shrink: 0;
	width: 40px;
	color: #a0a0a0;
	border-right-width: 1px;
	border-right-color: #7f7f7f;
	border-right-style: solid;
}

.content {
	background-color: #1f1f1f;
	height: 100%;
	width: 100%;
	padding-left: 2px;
	caret-color: transparent;
}

.caret_container {
	height: 0px;
	width: 0px;
	overflow: visible;
}

.caret_container>div {
	width: 1px;
	position: relative;
	animation-name: blinky_thing;
	animation-duration: 1s;
	animation-iteration-count: infinite;
	animation-timing-function: step-end;
}

.highlight_container {
	height: 0px;
	width: 0px;
	overflow: visible;
}

.highlight_container>div {
	height: 0px;
	width: 0px;
	overflow: visible;
}

.highlight_container>div>div {
	position: relative;
	background-color: #ffffff40;
}

.token_generic {
	color: #a0a0a0;
}

.token_ws {
	white-space: pre;
}

.token_number {
	color: #c4ffc5;
}

.token_identifier {
	color: #bff3ff;
}

.token_function_identifier {
	color: #faffbb;
}

.token_class {
	color: #50dda2;
}
`;
		
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
					for (let i = this.cursor_pos; this.__value[i] != '\n' && i != this.value.__length; i++) this.cursor_pos++;
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

		this.stylize();
	}
}

customElements.define("cjs-textarea", CJSTextAreaElement);
