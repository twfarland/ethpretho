#lang racket

(define-syntax swap
  (syntax-rules ()
    ((swap x y) ((λ (tmp)
                   (set! x y)
                   (set! y tmp)) 
                 
                 x))))

((λ (tmp other)
   (swap tmp other)
   (list tmp other)) 
 
 5 6)

((λ (tmp other)

  ((λ (tmp_)
         (set! tmp other)
         (set! other tmp_)) tmp)
  (list tmp other))
  5 6)

(define-syntax-rule (x y ...) (list y ...))



; with splitting on elipse approach, don't need any 'until' checks

{ aft ["f" ["g" "..." "n"] "..." "h"]  }
{ aft  ["+" ["1" "2" "5"] ["3" "5"] "4"]  }
[  ["r" ["g" "..." "n"] "..." "h" "f"]  ]

{ aft [["g" "..." "n"] "..." "h"]  }    ; match the f (not followed by elipse)
{ aft [["1" "2" "5"] ["3" "5"] "4"]   }
[  ["r" ["g" "..." "n"] "..." "h"] {sub ["+"]}  ]

{ seq  [["g" "..." "n"]]  aft  ["h"] }           ; 2nd in patt was elipse, so split after it
{ seq  [["1" "2" "5"] ["3" "5"]] aft ["4"] }   ; and split source at -length of new patt[0]
[  ["r"] {seq ["g" "..." "n"] aft "h"} {sub ["+"]}  ]

(:= tosubst (extract patt.seq source.seq)

    (map extr ["g" "..." "n"]
              [["1" "2" "5"] ["3" "5"]]          
              
    (extr {seq ["g"]     aft ["n"] } ;elip
          {seq ["1" "2"] aft ["5"] }
          
; first,          
map all [g ... h] exprs, along with their corresponding source, to {seq g aft [h]} exprs

  
; dual-map (patt along with source) to {seq [] aft []} objects
; map template to {seq [] aft []} objects
; using these, map template to subst objects
; using substed template and environment, make a normal expr, safely replacing atoms.





