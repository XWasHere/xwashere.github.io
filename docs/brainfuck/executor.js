let i;

async function exec(module) {
    let m =  await WebAssembly.instantiate(module, {
        vm: {
            putc: (c) => {
                postMessage(["PUTC",c])
            },
            getc: () => {
                let c = i[0];
                i = i.substr(1)
                if (c) return c.charCodeAt(0)
                else return 0;
            }
        }
    });
    
    m.instance.exports.main();
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