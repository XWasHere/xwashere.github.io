let worker = new Worker("worker.js");

window.testbool = true;
window.teststring = "hello world!";
window.testnum = 42;
window.testobj = {testval: 84};

let server = new WorkerProxy.Server(worker, this);