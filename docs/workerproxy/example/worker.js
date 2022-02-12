importScripts("../WorkerProxy.js");

async function main() {
    let client = new WorkerProxy.Client(self);

    var root = await client.init();

    console.log("testbool:        " + (await root.testbool));
    console.log("teststr:         " + (await root.teststr));
    console.log("testnum:         " + (await root.testnum));
    console.log("testobj.testval: " + (await (await root.testobj).testval));

    close();
}

main();