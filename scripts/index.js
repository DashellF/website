import {
  _ as $,
  m,
  q as g,
  s as l,
  d as k,
  r as S,
  F as W,
  B as A,
  C as T,
  t as I,
  K as X,
  L as P,
  o as D,
  v as x,
} from "./entry.js";

/**
 * Scroll arrow SVG component (unchanged)
 */
const se = {};
const ae = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 10 10",
  version: "1.1",
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "xml:space": "preserve",
  "xmlns:serif": "http://www.serif.com/",
};
const re = l(
  "path",
  {
    d: "M2,5 L5,8 L 8,5",
  },
  null,
  -1
);
const ne = [re];
function oe(e, t) {
  return m(), g("svg", ae, ne);
}
const de = $(se, [["render", oe]]);

/**
 * Academic prizes cards component (kept, but text randomized)
 */
const ce = { class: "prize-container" };
const le = { class: "card" };
const ue = { class: "side front" };
const he = { class: "info" };

const fe = k({
  __name: "AcademicPrizes",
  setup() {
    function t(i) {
      switch (i) {
        case 1:
          return "1st";
        case 2:
          return "2nd";
        case 3:
          return "3rd";
        default:
          return `${i}th`;
      }
    }

    // Random/placeholder text as requested
    const s = S([
      ["Placeholder prize item A", "Placeholder prize item B", "Placeholder prize item C"],
      ["Placeholder prize item A", "Placeholder prize item B"],
      ["Placeholder prize item A"],
    ]);

    return (i, a) => (
      m(),
      g("div", ce, [
        (m(!0),
        g(
          W,
          null,
          A(T(s), (r, n) => (
            m(),
            g(
              "div",
              {
                key: n,
                class: "card-container",
              },
              [
                l("span", le, [
                  l("div", ue, [
                    l("div", he, [
                      l("h2", null, I(t(n + 1)) + " place", 1),
                      l("p", null, [
                        l("ul", null, [
                          (m(!0),
                          g(
                            W,
                            null,
                            A(r, (o) => (
                              m(),
                              g(
                                "li",
                                {
                                  key: o,
                                },
                                I(o),
                                1
                              )
                            )),
                            128
                          )),
                        ]),
                      ]),
                    ]),
                  ]),
                ]),
              ]
            )
          )),
          128
        )),
      ])
    );
  },
});

const ve = $(fe, [["__scopeId", "data-v-f7f5a91e"]]);

/**
 * Page constants / static sections
 */
const Ue = { class: "page-container" };
const Ve = { class: "three-animation" };

// Hero block on first screen
const Hero = P(
  '<div class="hero-block" data-v-dd43eb17>' +
    '<div class="text-block" data-v-dd43eb17>' +
      '<h2 data-v-dd43eb17>Dashell Finn</h2>' +
      '<p data-v-dd43eb17>Hi, my name is Dashell Finn and I am an aspiring a career in cybersecurity/software engineering!</p>' +
    "</div>" +
  "</div>",
  1
);

// Your new “blank text box” sections + Academic division header
const Sections = P(
  '<div class="three-animation" data-v-dd43eb17></div>' +

  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>About</h2>' +
    '<p data-v-dd43eb17>Placeholder bio text. Replace with your real introduction.</p>' +
    '<p data-v-dd43eb17>Second paragraph placeholder for extra details (what you\'re learning, goals, interests).</p>' +
  '</div></div>' +

  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Projects</h2>' +
    '<p data-v-dd43eb17>Placeholder projects text. Add a few projects, writeups, or labs you\'ve done.</p>' +
  '</div></div>' +

  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Skills</h2>' +
    '<p data-v-dd43eb17>Placeholder skills text. Add languages, tools, and security areas you\'re focusing on.</p>' +
  '</div></div>' +

  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Experience</h2>' +
    '<p data-v-dd43eb17>Placeholder experience text. Add clubs, internships, competitions, certifications, etc.</p>' +
  '</div></div>' +

  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Contact</h2>' +
    '<p data-v-dd43eb17>Placeholder contact text. Add your email, GitHub, LinkedIn, etc.</p>' +
  '</div></div>' +

  '<div class="three-animation" data-v-dd43eb17></div>' +
  '<div class="three-animation" data-v-dd43eb17></div>' +

  '<div class="our-sponsors" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Prizes: Academic division</h2>' +
  '</div>',
  9
);

// Notes block (random text)
const Notes = P(
  '<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17>' +
    '<h2 data-v-dd43eb17>Notes: Academic division</h2>' +
    '<p data-v-dd43eb17>Placeholder notes text. Replace with whatever details you want to show here.</p>' +
  "</div></div>",
  1
);

// Spacer blocks + footer credit (kept)
const Tail = P(
  '<div class="three-animation" data-v-dd43eb17></div>' +
  '<div class="three-animation" data-v-dd43eb17></div>' +
  '<footer data-v-dd43eb17>' +
    '<a id="los-link" href="https://losfuzzys.net/" target="_blank" data-v-dd43eb17></a>' +
    '<p class="author" data-v-dd43eb17>design and code by<br data-v-dd43eb17>' +
      '<a class="link" href="https://github.com/simonefranza" data-v-dd43eb17>simonefranza</a>' +
    "</p>" +
  "</footer>",
  3
);

const Qe = 30;

/**
 * Main page component
 * - Removes the "scroll" word (keeps arrow)
 * - Replaces GlacierCTF text with your sections
 * - Keeps Academic division prize cards (random text)
 * - Removes sponsors (not rendered at all)
 * - Keeps footer credit
 */
const Xe = k({
  __name: "index",
  setup() {
    const t = S(!1);
    const s = S();

    const i = () => {
      t.value = s.value ? s.value.scrollTop > Qe : !1;
    };

    D(() => {
      s.value = document.querySelector("#__nuxt");
      i();
      s.value.addEventListener("scroll", () => i());
    });

    return (a, r) => {
      const Arrow = de;
      const Academic = ve;

      return (
        m(),
        g("div", Ue, [
          // First screen: hero + arrow indicator
          l("div", Ve, [
            Hero,
            l(
              "div",
              {
                id: "scroll-text",
                class: X([{ hidden: T(t) }]),
              },
              [x(Arrow, { id: "scroll-arrow" })],
              2
            ),
          ]),

          // Your new sections + academic header
          Sections,

          // Academic prize cards
          x(Academic),

          // Notes
          Notes,

          // Footer + spacers
          Tail,
        ])
      );
    };
  },
});

const it = $(Xe, [["__scopeId", "data-v-dd43eb17"]]);
export { it as default };