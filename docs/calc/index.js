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

var cjs, cjshl, menu;

function parse(e) {
	let p = new cjs.CJSParser(e);
	
	return p.parse(cjs.CJSStatementList);
}

function exec(src, ob) {
	ob.textContent = "";
	
	console.log(src.split(""))
	let res = parse(src);

	if (!res) {
		return;
	}

	console.log(res);

	let int = new cjs.CJSInterpreter();
	int.on_stdout = (data) => {
		ob.textContent += data;
		//console.log(ob)
	}

	try {
		res = int.exec_script(res);
	} catch (e) {
		console.log(cjs.disassemble(int.code));
		throw e;
	}

	if (res) {
		console.log(res);

		return res.value + "";
	}
}

function load_config() {
	let src = JSON.parse(localStorage.getItem("config") ?? "{}");
	return {
		autoexec: src.autoexec ?? false
	};
}

function save_config(c) {
	localStorage.setItem("config", JSON.stringify(c));
}

async function main() {
	let autoexec = document.getElementById("cfg_auto_exec");
	let execbutton = document.getElementById("exec_button");
	
	await Promise.all([
		(async () => {
			menu = await import("./menu.js");
		})(),
		(async () => {
			cjs = await import("./calc.js");
		})(),
		(async () => {
			try {
				cjshl = await import("./cjshl.js");
			} catch (troll) {
				console.error(troll);
				cjshl = await import("./cjshl_fallback.js");
			}
		})()
	]);

	let config = load_config();

	autoexec.value = config.autoexec;
	autoexec.addEventListener("changed", (e) => {
		config.autoexec = autoexec.value;
		save_config(config);
	});
	
	input_thing = document.getElementById("src");
	input_thing.addEventListener("input", () => {
		if (autoexec.value) {
			exec(input_thing.value, output_thing);
		}
	});

	output_thing = document.getElementById("output");

	execbutton.addEventListener("click", () => {
		exec(input_thing.value, output_thing);
	})
}

main();
