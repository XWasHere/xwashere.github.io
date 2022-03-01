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

customElements.define("cjs-textarea", class extends HTMLElement {
	ta;
	
	get value() {
		return this.ta.value;
	}

	set value(x) {
		this.ta.value = x; 
	}
	
	constructor() {
		super();
		
		this.ta = document.createElement("textarea");
		this.appendChild(this.ta);

		this.ta.style.height  = "calc(100% - 6px)";
		this.ta.style.width   = "calc(100% - 6px)";
		this.ta.style.resize  = "none";
		this.ta.style.border  = "1px";
		this.ta.style.padding = "2px";

		this.ta.addEventListener("input", () => {
			this.dispatchEvent(new InputEvent("input", {}));
		})
	}
})
