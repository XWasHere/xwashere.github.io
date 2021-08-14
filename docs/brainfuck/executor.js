/*
    WASM Brainfuck

    Copyright (C) 2021 XWasHere 

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

console.log ("Executor Started.");

let i;

async function exec(module) {
    function dump() {
        var mem = m.instance.exports.mem.buffer;
    }

    let m = await WebAssembly.instantiate(module, {
        vm: {
            putc: (c) => {
                postMessage(["PUTC",c])
            },
            getc: () => {
                let c = i[0];
                i = i.substr(1)
                if (c) return c.charCodeAt(0)
                else return 0;
            },
            debug: () => {
                debugger;
            }
        }
    });
    
    m.instance.exports.main();
    dump();
    postMessage(["EXIT"]);
    self.close();
}

onmessage = (m) => {
    let r = m.data;
    switch (r[0]) {
        case "EXEC":
            i = r[2];
            exec(r[1]);
            break
    }
}

postMessage("ready")