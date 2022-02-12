/*
    WorkerProxy

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

"use strict";

var WorkerProxy = {
    ProxyObject: class {
        constructor(client, id) {
            this.id     = id;
            this.client = client;

            this.proxy  = new Proxy({real: this}, {
                get(target, p) {
                    // For internal reasons :<
                    if (p == "then") return;
                    return client.get_property(p, id);
                },
                ownKeys() {
                    return client.get_keys(id);
                },

                apply(t, thisarg, args) {
                    return client.call_function(id, thisarg, args)
                }
            })

            return this.proxy;
        }
    },
    
    Client: class {
        constructor(serverConnection) {
            this.connection = serverConnection;
            this.root       = undefined;
            this.waiting    = {};

            this.listener   = (ev) => {
                let msg = ev.data;
                switch(msg[0]) {
                    case "HANDSHAKE":
                        this.fire_waiting("HANDSHAKE", msg);
                        break;
                    case "READY":
                        this.fire_waiting("READY", msg);
                        break;
                    case "OBJECT":
                        this.fire_waiting("OBJECT", msg);
                        break;
                    case "KEYS":
                        this.fire_waiting("KEYS", msg);
                        break;
                    case "VALUE":
                        this.fire_waiting("VALUE", msg)
                        break;
                    default:
                        break;
                }
            };

            this.connection.addEventListener("message", this.listener);
        }

        async init() {
            let server = await this.probe_servers();
            this.connection.postMessage(["HANDSHAKE"]);
            await this.wait_for_msg("READY");
            this.root =  await this.get_root();
            return this.root;
        }

        async proxy_object(obj) {
            return new WorkerProxy.ProxyObject(this, obj);
        }

        async fire_waiting(type, msg) {
            if (this.waiting[type]) {
                let i;
                for (i in this.waiting[type]) {
                    if (this.waiting[type][i]) {
                        await this.waiting[type][i](msg);
                        await this.remove_waiting(type, i);
                    }
                }
            }
        }

        async add_waiting(type, callback) {
            if (!this.waiting[type]) this.waiting[type] = [];
            return this.waiting[type].push(callback) - 1;
        }

        async remove_waiting(type, index) {
            this.waiting[type].splice(index, 1);
        }

        wait_for_msg(type, timeout) {
            return new Promise((res, rej) => {
                let t = undefined;
                if (timeout) t = setTimeout(() => {
                    this.remove_waiting(type, i)
                    rej("wait for \"" + type + "\" timed out.");
                }, timeout);
                let i = this.add_waiting(type, (msg) => {
                    if (timeout) clearTimeout(t);
                    res(msg)
                });
            });
        }

        probe_servers() {
            return new Promise(async (res, rej) => {
                let l = true;
                while (l) {
                    this.connection.postMessage(["PROBE"]);
                    await this.wait_for_msg("HANDSHAKE", 1000)
                        .then((msg) => {
                            l = false;
                            res(msg)
                        }, () => {
                            l = true
                        })
                }
            })
        }

        async get_root(timeout) {
            this.connection.postMessage(["GET","ROOT"]);
            let root = await (await this.wait_for_msg("OBJECT", timeout || 1000))[1];
            let proxy = await this.proxy_object(root);
            return proxy;
        }

        async get_keys(ref, timeout) {
            this.connection.postMessage(["GET","KEYS",ref]);
            let keys = await this.wait_for_msg("KEYS", timeout || 1000);
            return keys[1]
        }

        async get_property(p, from, timeout) {
            this.connection.postMessage(["GET","PROPERTY",p,from]);
            let prop = await this.wait_for_msg("VALUE", timeout || 1000);
            switch (prop[1]) {
                case "UNDEFINED":
                    return undefined;
                case "FUNCTION":
                case "OBJECT":
                    let p = await new WorkerProxy.ProxyObject(this, prop[2]);
                    return p;
                case "BOOLEAN":
                case "STRING":
                case "NUMBER":
                    return prop[2];
                default:
                    console.warn("type not implemented: ", prop[1])
                    break;
            }
            let proxy = await this.proxy_object(prop[2]);
            return proxy;
        }

        async call_function() {

        }
    },

    Server: class {
        constructor(clientConnection, proxiedObject) {
            this.connection = clientConnection;
            this.proxied    = proxiedObject;
            this.refs       = [];
            
            this.listener   = (ev) => {
                let msg = ev.data;
                switch (msg[0]) {
                    case "PROBE":
                        this.ib_probe(msg);
                        break;
                    case "HANDSHAKE":
                        this.ib_handshake(msg);
                        break;
                    case "GET":
                        this.ib_get(msg);
                        break;
                    default:
                        break;
                }
            };

            this.connection.addEventListener("message", this.listener)
        }

        create_ref(obj) {
            return this.refs.push(obj) - 1;
        }

        ib_probe(msg) {
            this.connection.postMessage(["HANDSHAKE"])
        }

        ib_handshake(msg) {
            this.connection.postMessage(["READY"]);
        }

        ib_get(msg) {
            switch (msg[1]) {
                case "ROOT":
                    this.connection.postMessage(["OBJECT", this.create_ref(this.proxied)]);
                    break;
                case "KEYS":
                    this.connection.postMessage(["KEYS", Reflect.ownKeys(this.refs[msg[2]])]);
                    break;
                case "PROPERTY":
                    let p = Reflect.get(this.refs[msg[3]], msg[2]);
                    switch (typeof p) {
                        case "undefined":
                            this.connection.postMessage(["VALUE", "UNDEFINED"])
                            break;
                        case "number":
                            this.connection.postMessage(["VALUE", "NUMBER", p])
                            break
                        case "string":
                            this.connection.postMessage(["VALUE", "STRING", p]);
                            break;
                        case "boolean":
                            this.connection.postMessage(["VALUE", "BOOLEAN", p]);
                            break;
                        case "function":
                            this.connection.postMessage(["VALUE", "FUNCTION", this.create_ref(p)]);
                            break;
                        case "object":
                            this.connection.postMessage(["VALUE", "OBJECT", this.create_ref(p)])
                            break;
                        default:
                            console.warn("type not implemented: " + typeof p);
                    }
                    break;
                default:
                    console.warn("Invalid request " + msg);
                    break;
            }
        }
    },

    [Symbol.toStringTag]: "WorkerProxy",
}