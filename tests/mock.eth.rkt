; keep js naming as much as possible 
; just write js in s-expressions. support much of js as primitives, not macros
; a couple of things I don't ever use left out (do while, with etc)
; recent js standards left out
; generate very readable, sane js - so carefully implemented primitives
; flexible core forms (if, ., .., ,, (func x), ->) - js is already dynamic so why not go with it

; plus implicit return and most things are expressions - only where needed
; plus hygenic, pattern-based macros - much more robust than writing js strings!
; parser, transformation stages seperate 
; so you can hack or do other program transformation
; no classes

; ability to extend js safely is really important because
; you can't wait for all browsers to catch up to standard

(:= number 42)
(:= opposite true)

(if opposite (= number -42))

(:= (square x) (* x x))

(:= list [1 2 3 4 5])

(:= math { root   Math.sqrt
           square square
           cube   (-> (x) (* x (square x))) })

(:= (race winner .. runners)
  (print winner runners))

(if elvis (alert "I knew it!"))

(:= cubes (forin list (num) (math.cube num)))

(= [x y] [1 2])
ref = [1 2]
x = ref[0]
y = ref[1]

(= {a [b c]} {1 [2 3]})
                                      
                                 
(case day
  ("mon" "wed") (go work)
  "tue"         (go relax)
  "fri"        (if (=== day bingoDay)
                   (go bingo)
                   (go dancing))
  (go work))
