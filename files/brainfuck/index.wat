(module $template
    (global $dp (mut i32) (i32.const 0    )) ;; data pointer
    (global $ml (mut i32) (i32.const 30000))

    (func $right

    )

    (func $left
    
    )

    (func $plus
        (if (i32.eq (i32.load8_u (global.get $dp)) (i32.const 255)) (then
            (i32.store8 (global.get $dp) (i32.const 0))
        ) (else
            (i32.store8 (global.get $dp) (i32.add (i32.load8_u (global.get $dp)) (i32.const 1)))
        ))
    )

    (func $minus
    
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