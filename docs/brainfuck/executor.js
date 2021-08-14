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