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

const { require } = await import("./loader.js");
const   style     = (await require("./menu.css", {assert:{type:"css"}})).default;

function ctns(a, b) {
	while (b) {
		b = b.parentNode || b.host || null;
		if (a == b) return true;
	}
	return false;
}

export class XUtilsMenuElement extends HTMLElement {
	type;

	build() {
		if (this.type == "toolbar") {
			let root = document.createElement("div");
			let crap = document.createElement("slot");
			
			this.shadowRoot.appendChild(root);
			root.appendChild(crap);
		}
	}
	
	constructor() {
		super();

		this.type = this.attributes.type.value || "toolbar";
		let shadow = this.attachShadow({mode:"open"});

		shadow.adoptedStyleSheets = [style];
		
		this.build();
	}
}

export class XUtilsMenuItemElement extends HTMLElement {
	_value;

	get value() {
		if (this.type == "button") {
			return undefined;
		} else if (this.type == "toggle") {
			if (this.getAttribute("value") == "true") {
				return true;
			} else {
				return false;
			}
		}
	}

	set value(x) {
		this.setAttribute("value", x);
	}

	get type() {
		return this.getAttribute("type") || "button";
	}

	set type(x) {
		this.setAttribute("type", x);
	}
	
	build() {
		if (this.type == "button") {
			let root = document.createElement("div");
			let button = document.createElement("button");
			let bcontent = document.createElement("slot");

			root.part = "root";

			this.shadowRoot.appendChild(root);
			root.appendChild(button);
			button.appendChild(bcontent);
		} else if (this.type == "toggle") {
			let root = document.createElement("div");
			let text = document.createElement("button");
			let content = document.createElement("slot");
			
			let check = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			let l1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
			let l2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
			
			this.shadowRoot.appendChild(root);
			root.appendChild(text);
			text.appendChild(check);
			check.appendChild(l1);
			check.appendChild(l2);
			text.appendChild(content);

			check.setAttribute("width", 15);
			check.setAttribute("height", 15);
			l1.setAttribute("x1", 2);
			l1.setAttribute("y1", 9);
			l1.setAttribute("x2", 5);
			l1.setAttribute("y2", 12);
			l2.setAttribute("x1", 5);
			l2.setAttribute("y1", 12);
			l2.setAttribute("x2", 13);
			l2.setAttribute("y2", 4);
			
			console.dir(check);
			
			text.addEventListener("click", (e) => {
				this.value = !this.value;
				this.dispatchEvent(new Event("changed", {
					
				}));
			})
		}
	}
	
	constructor() {
		super();

		let shadow = this.attachShadow({mode:"open"});
		shadow.adoptedStyleSheets = [style];
		
		this.build();
	}
}

export class XUtilsSubmenuElement extends HTMLElement {
	get open() { return this.getAttribute("open") == "true"; }

	set open(x) {
		console.log(x);
		this.setAttribute("open", x);
		this.rec_sizes();
	}

	rec_sizes() {
		console.lo
		if (this.open) this.root.style.marginRight = `-${this.content.getBoundingClientRect().width - this.button.getBoundingClientRect().width}px`
		else  		   this.root.style.marginRight = "0px";
		this.root.style.height = "21px";
		this.style.height = "21px";		
	}
	
	build() {
		this.root = document.createElement("div");
		this.button = document.createElement("button");
		this.content = document.createElement("slot");

		this.button.id = "button";
		this.content.id = "content";
		
		if (this.attributes.name) {
			this.button.textContent = this.attributes.name.value;
		}

		this.shadowRoot.appendChild(this.root);
		this.root.appendChild(this.button);
		this.root.appendChild(this.content);

		this.rec_sizes();
		
		function mout(e) {
			if (e.toElement)
				if (ctns(this, e.toElement))
					return;
			this.open = false;
		}
		
		this.button.addEventListener("mouseout",  mout.bind(this));
		this.content.addEventListener("mouseout", mout.bind(this));

		this.button.addEventListener("click", () => {
			this.open = true;
		})
	}
	
	constructor() {
		super();

		let shadow = this.attachShadow({mode:"open"});
		shadow.adoptedStyleSheets = [style];	

		this.build();
	}
}

customElements.define("xu-menu", XUtilsMenuElement);
customElements.define("xu-menuitem", XUtilsMenuItemElement);
customElements.define("xu-submenu", XUtilsSubmenuElement);
