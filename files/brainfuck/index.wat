(module $template
    (global $dp (mut i32) (i32.const 0    )) ;; data pointer
    (global $ml (mut i32) (i32.const 30000))

    (func)
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

    (func $main (export "main")

    )

    (memory $mem 0)
)