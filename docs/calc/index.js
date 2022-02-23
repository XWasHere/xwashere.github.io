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

var cjs, cjshl;

function parse(e) {
	let p = new cjs.CJSParser(e);
	
	return p.parse(cjs.CJSExprList);
}

function exec(src) {
	console.log(src.split(""))
	let res = parse(src);

	if (!res) {
		return;
	}

	console.log(res);

	let int = new cjs.CJSInterpreter();

	try {
		res = int.exec_script(res);
	} catch (e) {
		if (/^\[!VM{/.test(e)) {
			res = {value:e};
			console.log(res);
		} else {
			throw e;
		}
	}

	if (res) {
		console.log(res);

		return res.value + "";
	}
}

async function main() {
	cjs   = await import("./calc.js");
	cjshl = await import("./cjshl.js");

	console.log(cjs);
	input_thing = document.getElementById("src");
	input_thing.addEventListener("input", () => {
		output_thing.textContent = exec(input_thing.value);
	});
	
	output_thing = document.getElementById("output");
	
	// test
	// exec(`int a;int b;b=0;a=1;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;a=a*2;b=b+a;0?1:b;`);
}

main();
