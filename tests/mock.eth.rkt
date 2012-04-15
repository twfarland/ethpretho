(:= layout d ->
  
  [['!doctype "html"]
   ['html {lang "en"}
          
          ['head ['title d.myblog]
                 (css "site.css")]
          
          ['body ['h1 d.pageTitle]
                 ['p d.article]
                 
                 (scripts "jquery"
                          ($ (->
                               
                                 (. ($ "a") on "click" (-> (log ($ @))))
                               
                               )))]]])

