(try e y)

1
"string"
symbol
1234.50
/regex/g
; comment
[1 2 3]
{a 1 b 2}
{"a b" 1 "x y" 2}
(-> (n) (* n 2))
((-> () ))

(+ 1 2)
(- 1)
(++ x)
(+ 1 (- 2 -1))
(+ "a" "b" "c")

(:= x 1)
(= x 2)

(:= (d n) (* n 2))
(:= (d n) (= n (+ n 1)) (* n 2))

(, x y z)
(? x y z)

(if x y)
(if x y z)
(if x y a b)
(if x y a b c)
(if x (, y z) (, a b))
(if x (, y z) y (, a b) (, c d))

(switch x a b)
(switch x a b c)
(switch x a b c d e)

(-> () (if x y))
(-> () (if x y z))
(-> () (if x (, y z) a))
(-> () (++ x) (if x (, y z) (, a b)))
(-> () (if x y z a) x)

(+ 1 (if x y z))
(+ 1 (if x (, y z) a))
(+ 1 (switch a x y (, a b)))
 
 
;for, nested, infunc

;while

;try/catch

;membership variations

