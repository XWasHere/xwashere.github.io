(module $brainfuck
    ;; globals
    (global $memsize (mut i32) (i32.const 30000)) ;; memory size
    (global $inssize (mut i32) (i32.const 0))     ;; code size
    (global $pc      (mut i32) (i32.const 0))     ;; program counter
    (global $dc      (mut i32) (i32.const 0))     ;; data 

    ;; exports
    (export "memsize" (global $memsize))
    (export "inssize" (global $inssize))
    (export "pc"      (global $pc))
    (export "dc"      (global $dc))
)