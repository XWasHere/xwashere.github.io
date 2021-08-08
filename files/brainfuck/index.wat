(module $template
    (import "console" "log" (func $console.log (param i32)))

    (global $dp (mut i32) (i32.const 0    )) ;; data pointer
    (global $ml (mut i32) (i32.const 30000))

    (func $sep)

    (func $dot
        global.get $dp
        i32.load8_u
        call $console.log
    )

    (func $brackets
        global.get $dp
        i32.load8_u
        if
            loop

            (call $sep)  ;; This splits the [ and ]
            
            global.get $dp
            i32.load8_u
            br_if 0
            end
        end
    )

    (func $right
        (if (i32.eq (global.get $dp) (global.get $ml)) (then
            (global.set $dp (i32.const 0))
        ) (else
            (global.set $dp (i32.add (global.get $dp) (i32.const 1)))
        ))
    )

    (func $left
        (if (i32.eq (global.get $dp) (i32.const 0)) (then
            (global.set $dp (global.get $ml))
        ) (else
            (global.set $dp (i32.sub (global.get $dp) (i32.const 1)))
        ))
    )

    (func $plus
        (if (i32.eq (i32.load8_u (global.get $dp)) (i32.const 255)) (then
            (i32.store8 (global.get $dp) (i32.const 0))
        ) (else
            (i32.store8 (global.get $dp) (i32.add (i32.load8_u (global.get $dp)) (i32.const 1)))
        ))
    )

    (func $minus
        (if (i32.eq (i32.load8_u (global.get $dp)) (i32.const 0)) (then
            (i32.store8 (global.get $dp) (i32.const 255))
        ) (else
            (i32.store8 (global.get $dp) (i32.sub (i32.load8_u (global.get $dp)) (i32.const 1)))
        ))
    )

    (func $out
    
    )

    (func $main

    )

    (func $init_mem
        (memory.grow (i32.trunc_f32_u (f32.ceil (f32.div (f32.convert_i32_u (global.get $ml)) (f32.const 65536)))))
        (return)
    )

    (memory $mem 0)

    (export "main" (func   $main))
    (export "mem"  (memory $mem))
)