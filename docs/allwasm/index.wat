(;
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
;)
(module
    (; DAPI ;)
    (func $DAPI.getThis (import "DAPI" "getThis") (result i32))
    (func $DAPI.getObject (import "DAPI" "getObject") (param i32 i32) (result i32))
    (func $DAPI.deleteHandle (import "DAPI" "deleteHandle") (param i32))

    (func $DAPI.isUndefined (import "DAPI" "isUndefined") (param i32) (result i32))

    (func $DAPI.createString (import "DAPI" "createString") (param i32) (result i32))
    (func $DAPI.createInt32  (import "DAPI" "createi32")    (param i32) (result i32))

    (func $DAPI.setProperty (import "DAPI" "setProperty") (param i32 i32 i32))

    (func $DAPI.addArg (import "DAPI" "addObjArgument") (param i32))
    (func $DAPI.callFunction (import "DAPI" "callFunction") (param i32 i32) (result i32))

    (; VIRTUAL REGISTERS ;)
    (; IGNORE RR AND WR THEY ARENT SUPPORTED ;)
    (global $VR.maxVirtualRegisters i32 i32.const 8)
    (global $VR.virtualRegisterCount (mut i32) i32.const 0)
    (func $VR.initVirtualRegisters (param $count i32)
        global.get $VR.maxVirtualRegisters
        local.get $count
        i32.lt_u
        
        if
            unreachable
        end
        
        local.get $count
        global.set $VR.virtualRegisterCount

        return
    )
    (func $VR.RR (param $target i32) (result i32)
        i32.const 0
        return
    )
    (func $VR.RER (param $target i32) (result i32)
        (i32.load (i32.mul (i32.const 8) (local.get $target)))
        return
    )
    (func $VR.RRR (param $target i32) (result i64)
        (i64.load (i32.mul (i32.const 8) (local.get $target)))
        return
    )
    (func $VR.WR (param $target i32) (param $value i32)
        return
    )
    (func $VR.WER (param $target i32) (param $value i32)
        (i32.store (i32.mul (i32.const 8) (local.get $target)) (local.get $value))
        return
    )
    (func $VR.WRR (param $target i32) (param $value i64)
        (i64.store (i32.mul (i32.const 8) (local.get $target)) (local.get $value))
        return
    )

    (func $init
        (call $VR.initVirtualRegisters (i32.const 8))
        return
    )
    
    (func $main (export "main")
        call $init
        
        (call $VR.WER (i32.const 0) (call $DAPI.getThis))
        (call $VR.WER (i32.const 1) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x40)))
        (call $VR.WER (i32.const 2) (call $DAPI.createString (i32.const 0x4C)))
        
        (call $DAPI.addArg (call $VR.RER (i32.const 2)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x48))
        
        (call $DAPI.addArg (call $VR.RER (i32.const 1)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x48))

        (call $VR.WER (i32.const 2) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x58)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject (call $VR.RER (i32.const 2)) (i32.const 0x61)))
        (call $VR.WER (i32.const 4) (call $DAPI.createString (i32.const 0x72)))
        (call $DAPI.addArg (call $VR.RER (i32.const 4)))
        (call $VR.WER (i32.const 5) (call $DAPI.callFunction (call $VR.RER (i32.const 2)) (i32.const 0x74)))

        (call $VR.WER (i32.const 6) (call $DAPI.createString (i32.const 0x8E)))
        
        (call $DAPI.setProperty (call $VR.RER (i32.const 6)) (call $VR.RER (i32.const 5)) (i32.const 0x82))
        (call $DAPI.addArg (call $VR.RER (i32.const 5)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 3)) (i32.const 0x66))

        (call $VR.WER (i32.const 2) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x58)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject (call $VR.RER (i32.const 2)) (i32.const 0x61)))
        (call $VR.WER (i32.const 4) (call $DAPI.createString (i32.const 0x72)))
        (call $DAPI.addArg (call $VR.RER (i32.const 4)))
        (call $VR.WER (i32.const 5) (call $DAPI.callFunction (call $VR.RER (i32.const 2)) (i32.const 0x74)))

        (call $VR.WER (i32.const 6) (call $DAPI.createString (i32.const 0xB6)))
        
        (call $DAPI.setProperty (call $VR.RER (i32.const 6)) (call $VR.RER (i32.const 5)) (i32.const 0x82))
        (call $DAPI.addArg (call $VR.RER (i32.const 5)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 3)) (i32.const 0x66))

        (call $VR.WER (i32.const 2) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x58)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject (call $VR.RER (i32.const 2)) (i32.const 0x61)))
        (call $VR.WER (i32.const 4) (call $DAPI.createString (i32.const 0xBF)))
        (call $DAPI.addArg (call $VR.RER (i32.const 4)))
        (call $VR.WER (i32.const 5) (call $DAPI.callFunction (call $VR.RER (i32.const 2)) (i32.const 0x74)))

        (call $VR.WER (i32.const 6) (call $DAPI.createString (i32.const 0xE3)))
        (call $VR.WER (i32.const 7) (call $DAPI.createString (i32.const 0xDB)))
        (call $DAPI.addArg (call $VR.RER (i32.const 7)))
        (call $DAPI.addArg (call $VR.RER (i32.const 6)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 5)) (i32.const 0x10F))

        (call $VR.WER (i32.const 6) (call $DAPI.createString (i32.const 0xC6)))
        (call $DAPI.setProperty (call $VR.RER (i32.const 6)) (call $VR.RER (i32.const 5)) (i32.const 0x82))
    
        (call $DAPI.addArg (call $VR.RER (i32.const 5)))
        (call $DAPI.callFunction (call $VR.RER (i32.const 3)) (i32.const 0x66))

        return
    )

    (func $atos (export "atos") (param $buf i32) (result i32)
        (call $VR.WER (i32.const 2) (call $DAPI.getThis))
        (call $VR.WER (i32.const 1) (call $DAPI.getObject    (call $VR.RER (i32.const 2)) (i32.const 0x130)))
        (call $VR.WER (i32.const 2) (call $DAPI.getObject    (call $VR.RER (i32.const 2)) (i32.const 0x145)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject    (call $VR.RER (i32.const 2)) (i32.const 0x150)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject    (call $VR.RER (i32.const 3)) (i32.const 0x154)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject    (call $VR.RER (i32.const 3)) (i32.const 0x15D)))
        (call $VR.WER (i32.const 3) (call $DAPI.getObject    (call $VR.RER (i32.const 3)) (i32.const 0x165)))
        (call $VR.WER (i32.const 4) (call $DAPI.getObject    (call $VR.RER (i32.const 2)) (i32.const 0x171)))
        (call $DAPI.addArg                                   (call $VR.RER (i32.const 2)))
        (call $DAPI.addArg                                   (call $VR.RER (i32.const 3)))
        (call $VR.WER (i32.const 4) (call $DAPI.callFunction (call $VR.RER (i32.const 4)) (i32.const 0x16c)))
        (call $DAPI.addArg (local.get $buf))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x136)))
        (call $DAPI.addArg                                   (call $VR.RER (i32.const 4)))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x13B)))
        (call $VR.WER (i32.const 2) (call $DAPI.createString                              (i32.const 0x143)))
        (call $DAPI.addArg                                   (call $VR.RER (i32.const 2)))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x13F)))
        (call $VR.WER (i32.const 2) (call $DAPI.createInt32               (i32.const 1)))
        (call $DAPI.addArg                                   (call $VR.RER (i32.const 1)))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x17C)))
        (return (call $VR.RER (i32.const 1)))
    )

    (func $atos_1 (export "atos_1") (param $char i32) (result i32)
        (call $VR.WER (i32.const 1) (call $DAPI.getThis))
        (call $VR.WER (i32.const 1) (call $DAPI.getObject (call $VR.RER (i32.const 1)) (i32.const 0x11C)))
        (call $DAPI.addArg (local.get $char))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x123)))
        (return (call $VR.RER (i32.const 1)))
    )

    (func $download (export "download")
        (call $VR.WER (i32.const 0) (call $DAPI.getThis))
        (call $VR.WER (i32.const 1) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x1BB)))
        (call $VR.WER (i32.const 7) (call $VR.RER (i32.const 1)))
        (call $VR.WER (i32.const 1) (call $atos (call $VR.RER (i32.const 1))))
        (call $DAPI.addArg (call $VR.RER (i32.const 1)))
        (call $VR.WER (i32.const 1) (call $DAPI.callFunction (call $VR.RER (i32.const 0)) (i32.const 0x1C4)))
        (call $VR.WER (i32.const 2) (call $DAPI.createString (i32.const 0x18A)))
        (call $DAPI.addArg (call $VR.RER (i32.const 1)))
        (call $VR.WER (i32.const 2) (call $DAPI.callFunction (call $VR.RER (i32.const 2)) (i32.const 0x183)))
        (call $VR.WER (i32.const 1) (call $DAPI.getObject (call $VR.RER (i32.const 0)) (i32.const 0x58)))
        (call $VR.WER (i32.const 4) (call $DAPI.createString (i32.const 0x72)))
        (call $DAPI.addArg (call $VR.RER (i32.const 4)))
        (call $VR.WER (i32.const 4) (call $DAPI.callFunction (call $VR.RER (i32.const 1)) (i32.const 0x74)))
        (call $DAPI.setProperty (call $VR.RER (i32.const 2)) (call $VR.RER (i32.const 4)) (i32.const 0x1A2))
        (call $VR.WER (i32.const 5) (call $DAPI.createString (i32.const 0x1B0)))
        (call $DAPI.setProperty (call $VR.RER (i32.const 5)) (call $VR.RER (i32.const 4)) (i32.const 0x1A7))
        (call $DAPI.callFunction (call $VR.RER (i32.const 4)) (i32.const 0x1BE))
        (return)
    )

    (memory $mem (export "DAPI_MEMORY") 1)
    (data (memory $mem) (i32.const 0)    "thisiswheretheregistersshouldgo.") ;; 0x00 - 0x3F
    (data (memory $mem) (i32.const 0x40) "console\00log\00hello world\00document\00body\00appendChild\00a\00createElement\00textContent\00This website was written in WebAssembly\00(Mostly)\00button\00Download WebAssembly\00onclick\00MainModule.mod.instance.exports.download();\00setAttribute\00String\00fromCharCode\00Array\00from\00map\00join\00\00MainModule\00mod\00instance\00exports\00atos_1\00bind\00execMethod\00substr\00concat\00data:text/plain;base64,\00href\00download\00thing.wasm\00MM\00click\00btoa\00")
)