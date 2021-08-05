class GC1 {};
class GC2 {
    constructor() {
        this.protect = this;
    }
};
class GC3 {
    constructor() {
        this.protect = this;
        this.no = () => {setTimeout(this.no, 100)};
    }
};

window.refs = new WeakSet([new GC1(), new GC2(), new GC3()]);