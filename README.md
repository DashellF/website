# Website
---

This website is viewable at: ___ (will update soon!).

If you make your own website from this source code, a small "inspired by" note at the bottom would be nice :)
 

Go nuts!

--- 




no requirements or installs necessary :)

run with  
`python3 -m http.server 8080 --bind 0.0.0.0`

Its supprisingly lightweight, most of the lifting comes from the user viewing the page.  
Note: Leaf count is by far the biggest contributer to lag...




the code format:

- index.html: combines everything into one page, no viewable text is made here.
- images/:
    - none of the stuff here is required for the website to run, all of it is custom stuff I reference in the 3d model segment of entry.js.
- fonts/:  
    - self explanatory, this is where I stored the font.
- scripts/:
  - index.js + index.css: where you can find the text you get from scrolling.
  - vue.js: ui that renders the 3d background
  - entry.js + entry.css:
    - Lines 1-8892: Vue renderer
    - Lines 8893-32171: Three.js renderer, shader chunks, loaders, basically the compiler for 3d rendering.
    - Lines 32172-33208: The custom stuff I made for the 3d background (trees, path, leaves, etc). This is the stuff you would edit if you want to make your own website.
    - Lines 33209-33520: Mount and export with Nuxt.
