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
  L as P,
  o as D,
  v as x,
} from "./entry.js";

/* =========================================================
   Projects cards (formerly AcademicPrizes)
   ========================================================= */
const ce = { class: "prize-container" };
const le = { class: "card" };
const ue = { class: "side front" };
const he = { class: "info" };

const fe = k({
  __name: "AcademicPrizes",
  setup() {
    // 5 cards (added 2 more like the 1st and 2nd)
    const s = S([
      ["Placeholder prize item A", "Placeholder prize item B", "Placeholder prize item C"],
      ["Placeholder prize item A", "Placeholder prize item B"],
      ["Placeholder prize item A"],
      ["Placeholder prize item A", "Placeholder prize item B", "Placeholder prize item C"],
      ["Placeholder prize item A", "Placeholder prize item B"],
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
            g("div", { key: n, class: "card-container" }, [
              l("span", le, [
                l("div", ue, [
                  l("div", he, [
                    l("h2", null, "Project " + I(n + 1), 1),
                    l("p", null, [
                      l("ul", null, [
                        (m(!0),
                        g(
                          W,
                          null,
                          A(r, (o) => (m(), g("li", { key: o }, I(o), 1))),
                          128
                        )),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ])
          )),
          128
        )),
      ])
    );
  },
});
const ve = fe;

/* =========================================================
   Page constants / static sections
   ========================================================= */
const Ue = { class: "page-container" };
const Ve = { class: "three-animation" };

/* Hero block */
const Hero = P(
  '<div class="hero-block">' +
    '<div class="text-block">' +
      "<h2>Hi!</h2>" +
      "<p>Hi, my name is Dashell Finn and I am aspiring for a career in cybersecurity/software engineering!</p>" +
    "</div>" +
  "</div>",
  1
);

/* Scroll hint */
const ScrollHint = P(
  '<div id="scroll-text" class="">' +
    "<p>scroll</p>" +
    '<svg width="100%" height="100%" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" id="scroll-arrow">' +
      '<path d="M2,5 L5,8 L 8,5"></path>' +
    "</svg>" +
  "</div>",
  1
);

/* Top sections (About + Projects heading) */
const SectionsTop = P(
  '<div class="three-animation"></div>' +

  '<div class="main-block"><div class="text-block">' +
    "<h2>About Me</h2>" +
    "<p>I'm currently a freshman in college studying computer science.</p>" +
    "<p>I do a lot of cybersecurity competitions including ccdc, cptc, and lots of ctfs.</p>" +
    "<p>I also like being active, running, and coding in general.</p>" +
    "<p>If you are interested in some of my ctf writups, click to the right.</p>" +
  "</div></div>" +

  '<div class="section-heading">' +
    "<h2>Projects</h2>" +
  "</div>",
  3
);

/* Bottom sections (everything after Projects cards) */
const SectionsBottom = P(
  '<div class="main-block"><div class="text-block">' +
    "<h2>Skills</h2>" +
    "<p>Placeholder skills text. Add languages, tools, and security areas you're focusing on.</p>" +
  "</div></div>" +

  '<div class="main-block"><div class="text-block">' +
    "<h2>Experience</h2>" +
    "<p>Placeholder experience text. Add clubs, internships, competitions, certifications, etc.</p>" +
  "</div></div>" +

  '<div class="main-block"><div class="text-block">' +
    "<h2>Contact</h2>" +
    "<p>To contact me, email me at djf1517@gmail.com or shoot me a dm on discord (dashel1)</p>" +
    "<p>I\\'ll usually respond within 1-3 days by email and a couple hours by discord</p>" +
  "</div></div>" +

  '<div class="three-animation"></div>',
  4
);

/* Footer (id for CSS/JS) */
const Tail = P(
  '<div class="three-animation"></div>' +
  '<div class="three-animation"></div>' +
  '<footer id="site-footer">' +
    '<p class="author">' +
      '<span class="madeby">This website was made by ' +
        '<a class="link" href="https://github.com/dashellf/website" target="_blank" rel="noopener noreferrer">me!</a>' +
      "</span>" +
      "<br>" +
      '<span class="inspo">Inspiration from ' +
        '<a class="link" href="https://glacierctf.com" target="_blank" rel="noopener noreferrer">glacierctf.com</a>' +
      "</span>" +
    "</p>" +
  "</footer>",
  3
);

const Qe = 30;

const Xe = k({
  __name: "index",
  setup() {
    D(() => {
      const scroller =
        document.querySelector("#__nuxt") ||
        document.scrollingElement ||
        document.documentElement ||
        document.body;

      const hint = document.getElementById("scroll-text");
      const footer = document.getElementById("site-footer");

      const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

      const FOOTER_RANGE = 1200; // bigger = appears earlier & slower (try 1200–2000)
      const FOOTER_LERP = 0.025; // smaller = slower easing both directions (try 0.015–0.04)

      // smooth state
      let footerTarget = 0;
      let footerCurrent = 0;
      let animating = false;

      const getTop = () =>
        scroller && typeof scroller.scrollTop === "number"
          ? scroller.scrollTop
          : (window.scrollY || 0);

      const getHeight = () => {
        if (
          scroller &&
          scroller !== document.documentElement &&
          scroller !== document.body &&
          scroller !== document.scrollingElement
        ) {
          return scroller.clientHeight;
        }
        return window.innerHeight || document.documentElement.clientHeight;
      };

      const getScrollHeight = () =>
        scroller && typeof scroller.scrollHeight === "number"
          ? scroller.scrollHeight
          : document.documentElement.scrollHeight;

      const smoothstep = (t) => t * t * (3 - 2 * t);

      const animate = () => {
        if (!footer) return;

        footerCurrent = footerCurrent + (footerTarget - footerCurrent) * FOOTER_LERP;

        // snap tiny diffs
        if (Math.abs(footerTarget - footerCurrent) < 0.0015) {
          footerCurrent = footerTarget;
        }

        footer.style.setProperty("--reveal", String(footerCurrent));

        if (footerCurrent !== footerTarget) {
          requestAnimationFrame(animate);
        } else {
          animating = false;
        }
      };

      let raf = 0;
      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      };

      const update = () => {
        // --- scroll hint (unchanged)
        if (hint) {
          const top = getTop();
          if (top > Qe) hint.classList.add("hidden");
          else hint.classList.remove("hidden");
        }

        if (footer) {
          footer.classList.add("footer-reveal");

          const remaining = getScrollHeight() - (getTop() + getHeight());
          const raw = clamp01(1 - remaining / FOOTER_RANGE);
          footerTarget = smoothstep(raw);

          if (!animating) {
            animating = true;
            requestAnimationFrame(animate);
          }
        }
      };

      // initial
      schedule();

      if (scroller) scroller.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule, { passive: true });
    });

    return () => {
      const Academic = ve;

      return (
        m(),
        g("div", Ue, [
          l("div", Ve, [Hero]),
          ScrollHint,
          SectionsTop,
          x(Academic),
          SectionsBottom,
          Tail,
        ])
      );
    };
  },
});

const it = Xe;
export { it as default };