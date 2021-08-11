/*
    X's Thing

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

class DAPI {
    static ObjectHandle = class {
        static DISPOSED = Symbol("DISPOSED");
        constructor(target) {
            this.getter = target;
        }
        
        get obj() {
            return this.getter();
        }
    }

    static Executor = class {
        constructor(module, thisobj, args) {
            this.objHandles = [];
            this.callArgs = [];
            this.thisobj = thisobj;
            this.mod     = undefined;
            let executor = this;
            return new Promise(async (res, rej) => {
                executor.mod = await WebAssembly.instantiate(module, {
                    ...args,
                    DAPI: {
                        getThis: this.getThis.bind(this),
                        getObject: this.getObject.bind(this),
                        createString: this.createString.bind(this),
                        createi32: this.createi32.bind(this),
                        addObjArgument: this.addObjArgument.bind(this),
                        deleteHandle: this.deleteObjectHandle.bind(this),
                        isUndefined: this.isUndefined.bind(this),
                        callFunction: this.callFunction.bind(this),
                        setProperty: this.setProperty.bind(this),
                    }
                });
                res(this);
            })
        }

        get memory() {
            return this.mod.instance.exports.DAPI_MEMORY;
        }

        get memory8() {
            return new Uint8Array(this.memory.buffer)
        }

        execMethod(m, ...args) {
            let argHandles = [];
            args.forEach((x) => {argHandles.push(this.createObjectHandle(()=>{return x}))})
            let r = m(...argHandles);
            if (typeof r == "number") {
                return this.objHandles[r].obj;
            }
        }

        setProperty(sourceHandle, targetHandle, property) {
            this.objHandles[targetHandle].obj[this.readString(property)] = this.objHandles[sourceHandle].obj;
        }

        createObjectHandle(target) {
            let oh = new DAPI.ObjectHandle(target);
            return this.objHandles.push(oh) - 1;
        }

        deleteObjectHandle(handle) {
            this.objHandles[handle] = DAPI.ObjectHandle.DISPOSED;
            return
        }

        getThis() {
            return this.createObjectHandle(() => {
                return globalThis;
            });
        }

        getObject(from, p) {
            let prop = this.readString(p);
            return this.createObjectHandle(() => {
                return this.objHandles[from].obj[prop];
            });
        }

        createString(p) {
            return this.createObjectHandle(() => {
                return this.readString(p);
            });
        }

        createi32(i) {
            return this.createObjectHandle(() => {
                return i
            });
        }

        addObjArgument(handle) {
            this.callArgs.push(this.objHandles[handle]);
        }

        callFunction(handle, p) {
            let ca = this.callArgs;
            this.callArgs = [];
            let r = this.objHandles[handle].obj[this.readString(p)](...(ca.map((v) => {return v.obj})));

            return this.createObjectHandle(() => {
                return r;
            });
        }

        isUndefined(handle) {
            return (this.objHandles[handle].obj == undefined);
        }

        readString(o) {
            let offset = o;
            let m = this.memory8;
            let s = "";
            while (m[offset]) {
                s += String.fromCharCode(m[offset]);
                offset++;
            }
            return s;
        }
    }
}

var MainModule;
var MM;

function atos(a) {
    return Array.from(new Uint8Array(a)).map((x)=>String.fromCharCode(x)).join('');
}

fetch("http://localhost:8080/index.wasm", {mode:"no-cors"})
    .then(m => {
        return m.arrayBuffer()
    })
    .then(m => {
        console.debug(m)
        console.debug(atos(m));
        MM = new Uint8Array(m);
        return new DAPI.Executor(m, globalThis, {});
    })
    .then(m => {
        MainModule = m;
        console.debug(MainModule)
        m.mod.instance.exports.main();
    })