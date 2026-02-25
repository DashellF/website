// index.js (full file, patched)

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

import Writups from "./writups.js";

const ce = { class: "prize-container" };
const le = { class: "card" };
const ue = { class: "side front" };
const he = { class: "info" };

const fe = k({
  __name: "Projects",
  setup() {
    const s = S([
      {
        name: `Trash Detection App (<a class="link" href="https://github.com/WilyHyperion/RandomForestHacks/tree/main/backend" target="_blank" rel="noopener noreferrer">Scrapboard</a>)`,
        items: [
          "custom trained AI model",
          "ngrok connected backend",
          "expo go app configuration",
          "mongodb login sql database",
        ],
      },
      {
        name: `Emotion Recognition App (<a class="link" href="https://github.com/DashellF/Sparkhub-Hackathon-Facial-Recognition-App" target="_blank" rel="noopener noreferrer">Emoti</a>)`,
        items: [
          "custom trained AI model",
          "mongodb",
          "can run as a website, IOS app, and Android app",
        ],
      },
      {
        name: `<a class="link" href="https://github.com/DashellF/space-project" target="_blank" rel="noopener noreferrer">Space Simulator</a>`,
        items: [
          "godot game engine",
          "runs as an app on android and on any computer",
          "Includes a rocket orbit/travel simulator impementing Hauffman Transfers",
        ],
      },
      {
        name: `<a class="link" href="https://github.com/AV-FactChecker/AV-ai-FactChecker" target="_blank" rel="noopener noreferrer">Real-time Fact Checker</a>`,
        items: [
          "real time audio tracking with whisper",
          "uses gpt api",
          "runs a website database for long term runs",
        ],
      },
      {
        name: "Windows Hardening Script",
        items: [
          "dc script that secures the whole network",
          "uses pingcastle and hardeningkitty for further safety",
          "audits all ports and services across all machines",
        ],
      },
      {
        name: "Raspberry Pis",
        items: ["several escape room puzzles", "custom mousepad with conductive paper", "Use of breadboards, motors, and many types of sensors"],
      },
      {
        name: `<a class="link" href="https://github.com/DashellF/website" target="_blank" rel="noopener noreferrer">This Website!</a>`,
        items: [
          "surprisingly lightweight!",
          "no imports required!",
          "uses vue.js and nuxt framework to render 3d objects.",
          "implements random generation for trees, path, leaves, and more"
        ],
      },
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
                    l("h2", { innerHTML: r.name }, null, 8, ["innerHTML"]),
                    l("p", null, [
                      l("ul", null, [
                        (m(!0),
                        g(
                          W,
                          null,
                          A(r.items, (o) => (m(), g("li", { key: o }, I(o), 1))),
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

const Ue = { class: "page-container" };
const Ve = { class: "three-animation" };

const Hero = P(
  '<div class="hero-block">' +
    '<div class="text-block">' +
    "<h2>Hi there!</h2>" +
    "<p>Hi, my name is Dashell Finn and I am aspiring for a career in cybersecurity/software engineering!</p>" +
    "</div>" +
    "</div>",
  1
);

const ScrollHint = P(
  '<div id="scroll-text" class="">' +
    "<p>scroll</p>" +
    '<svg width="100%" height="100%" viewBox="0 0 10 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" id="scroll-arrow">' +
    '<path d="M2,5 L5,8 L 8,5"></path>' +
    "</svg>" +
    "</div>",
  1
);

const SectionsTop = P(
  '<div class="three-animation"></div>' +
    '<div class="main-block" id="about-me"><div class="text-block">' +
    "<h2>About Me</h2>" +
    "<p>I'm currently a freshman in college studying computer science.</p>" +
    "<p>I do a lot of cybersecurity competitions including ccdc, cptc, and lots of ctfs.</p>" +
    "<p>I also like being active, running, and coding in general.</p>" +
    "<p>If you are interested in reading some of my ctf writups, click to the right.</p>" +
    "</div></div>" +
    '<div class="section-heading">' +
    "<h2>Projects</h2>" +
    "</div>",
  3
);

const SectionsBottom = P(
  '<div class="main-block"><div class="text-block">' +
    "<h2>Experience</h2>" +
    "<p>I was on my high school's cyber competition team my senior year, participating in many ctfs and Cyberpatriot.</p>" +
    "<p>I did/am doing cptc and ccdc my freshman year at SDSU.</p>" +
    "<p>I've also been doing ctfs every week for about a year now (currently 5th in the US on <a class=\"link\" href=\"https://ctftime.org/team/419145\" target=\"_blank\" rel=\"noopener noreferrer\">CTFTime</a>).</p>" +
    "</div></div>" +
    '<div class="main-block"><div class="text-block">' +
    "<h2>Skills</h2>" +
    "<p>For ctfs, I usually do really well in <strong>rev</strong>, <strong>osint</strong>, and <strong>crypto</strong>. I usually play solo, so I've still gotten pretty good at web, misc, android, and forensics challs.</p>" +
    "<p>I really enjoy tweaking, hardening, and breaking into windows machines. Hardening scripts are also fun to make, and are decent in competitions.</p>" +
    "<p>I am affluent with many developer tools such as git, expo go, React, MongoDB, ngrok, Godot, Raspberry Pis, and GDB.</p>" +
    "<p>Here is my <a class=\"link\" href=\"/resume.pdf\">resume</a>, including a lot of this and more!</p>" +
    "</div></div>" +
    '<div class="main-block"><div class="text-block">' +
    "<h2>Contact</h2>" +
    "<p>To contact me, email me at djf1517@gmail.com or shoot me a dm on discord (dashel1).</p>" +
    "<p>I'll usually respond within 1-2 days by email and a couple hours by discord.</p>" +
    "</div></div>" +
    '<div class="three-animation"></div>',
  4
);

const Tail = P(
  '<div class="three-animation"></div>' +
    '<div class="three-animation"></div>' +
    '<footer id="site-footer">' +
    '<p class="author">' +
    '<span class="madeby">This website was made by ' +
    '<a class="link" href="https://github.com/DashellF/website" target="_blank" rel="noopener noreferrer">me!</a>' +
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

// footer + scroll hint fade + writups view rotator
const Xe = k({
  __name: "index",
  setup() {
    const initialState = (() => {
      try {
        const sp = new URLSearchParams(window.location.search);
        const weird = sp.get("") === "writups";
        const view = sp.get("view") || (weird ? "writups" : null);
        const w = sp.get("w") || sp.get("writeup");
        return { view: view || (w ? "writups" : null), w };
      } catch (_) {
        return { view: null, w: null };
      }
    })();

    const isWritups = S(initialState.view === "writups");
    const noAnim = S(initialState.view === "writups");

    // wired up in onMounted (D)
    let resetFooterInstant = () => {};
    // NEW: wired up in onMounted to prevent scroll-hint flicker on programmatic scroll
    let suppressScrollHint = (_ms) => {};

    const scrollIndexTop = () => {
      const indexScroller = document.getElementById("index-scroll");
      if (indexScroller && typeof indexScroller.scrollTop === "number") {
        indexScroller.scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    };

    const ABOUT_NUDGE_PX = 0; //needed to adjust one time, keep.

    const scrollIndexToEl = (el, smooth) => {
      if (!el) return;

      const scroller = document.getElementById("index-scroll");

      if (scroller && scroller.contains(el)) {
        let top =
          el.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop;

        top = Math.max(0, top - ABOUT_NUDGE_PX);

        scroller.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
        return;
      }

      el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    };

    const applyRotatorFallback = () => {
      const rot = document.querySelector(".view-rotator");
      const scene = rot?.parentElement || document.querySelector(".scene");
      if (!rot || !scene) return;

      scene.classList.add("scene");
      scene.classList.toggle("is-writups", !!isWritups.value);
      scene.classList.toggle("no-anim", !!noAnim.value);

      const depthRaw = getComputedStyle(scene).getPropertyValue("--depth").trim() || "50vw";

      let depthPx = window.innerWidth * 0.5;
      const n = parseFloat(depthRaw);
      if (Number.isFinite(n)) {
        if (depthRaw.endsWith("vw")) depthPx = window.innerWidth * (n / 100);
        else if (depthRaw.endsWith("px")) depthPx = n;
      }

      rot.style.transform = `rotateY(${isWritups.value ? "90deg" : "0deg"})`;
    };

    const parseUrl = () => {
      const sp = new URLSearchParams(window.location.search);
      const weird = sp.get("") === "writups";
      const view = sp.get("view") || (weird ? "writups" : null);
      const w = sp.get("w") || sp.get("writeup");
      return { view: view || (w ? "writups" : null), w };
    };

    const setUrl = (view, w) => {
      const url = new URL(window.location.href);
      if (view === "writups") url.searchParams.set("view", "writups");
      else url.searchParams.delete("view");
      if (w) url.searchParams.set("w", w);
      else url.searchParams.delete("w");
      history.pushState({}, "", url);
    };

    const replaceUrl = (view, w) => {
      const url = new URL(window.location.href);
      if (view === "writups") url.searchParams.set("view", "writups");
      else url.searchParams.delete("view");
      if (w) url.searchParams.set("w", w);
      else url.searchParams.delete("w");
      history.replaceState({}, "", url);
    };

    // UPDATED: writups button ALWAYS goes to top of writups scroll
    const goWritups = (w) => {
      document.getElementById("writups-switch")?.classList.add("hidden");

      const ws = document.getElementById("writups-scroll");
      if (ws && typeof ws.scrollTop === "number") {
        ws.scrollTop = 0;
        ws.scrollTo?.({ top: 0, behavior: "auto" });
        // do it again after the flip starts to be extra sure
        requestAnimationFrame(() => {
          ws.scrollTop = 0;
          ws.scrollTo?.({ top: 0, behavior: "auto" });
        });
      }

      isWritups.value = true;
      setUrl("writups", w);
      applyRotatorFallback();
      requestAnimationFrame(() => applyRotatorFallback());

      if (w) {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent("writups:open", { detail: { id: w } }));
        });
      }
    };

    const goAboutMe = () => {
      // prevent footer from flashing on view swap
      resetFooterInstant();
      // NEW: prevent scroll-hint flicker while we programmatically scroll to About Me
      suppressScrollHint(1600);

      // close any open writeup card
      window.dispatchEvent(new CustomEvent("writups:close"));

      isWritups.value = false;
      replaceUrl(null, null);
      applyRotatorFallback();
      requestAnimationFrame(() => applyRotatorFallback());

      requestAnimationFrame(() => {
        const aboutMe = document.getElementById("about-me");
        if (aboutMe) scrollIndexToEl(aboutMe, true);
        else scrollIndexTop();
      });
    };

    D(() => {
      try {
        history.scrollRestoration = "manual";
      } catch (_) {}

      const indexScroller = document.getElementById("index-scroll");
      const hint = document.getElementById("scroll-text");
      const footer = document.getElementById("site-footer");
      const writupsSwitch = document.getElementById("writups-switch");
      const aboutMe = document.getElementById("about-me");

      const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

      const FOOTER_RANGE = 1200;
      const FOOTER_LERP = 0.025;

      let footerTarget = 0;
      let footerCurrent = 0;
      let animating = false;

      const getTop = () =>
        indexScroller && typeof indexScroller.scrollTop === "number"
          ? indexScroller.scrollTop
          : window.scrollY || 0;

      const getHeight = () => {
        if (indexScroller) return indexScroller.clientHeight;
        return window.innerHeight || document.documentElement.clientHeight;
      };

      const getScrollHeight = () =>
        indexScroller && typeof indexScroller.scrollHeight === "number"
          ? indexScroller.scrollHeight
          : document.documentElement.scrollHeight;

      const smoothstep = (t) => t * t * (3 - 2 * t);

      const animate = () => {
        if (!footer) return;

        footerCurrent = footerCurrent + (footerTarget - footerCurrent) * FOOTER_LERP;

        if (Math.abs(footerTarget - footerCurrent) < 0.0015) {
          footerCurrent = footerTarget;
        }

        footer.style.setProperty("--reveal", String(footerCurrent));

        if (footerCurrent !== footerTarget) requestAnimationFrame(animate);
        else animating = false;
      };

      // instant hide (no lerp) — used when leaving/entering views
      resetFooterInstant = () => {
        if (!footer) return;
        footerTarget = 0;
        footerCurrent = 0;
        animating = false;
        footer.classList.add("footer-reveal");
        footer.style.setProperty("--reveal", "0");
      };

      // NEW: scroll-hint suppression window (prevents 1-frame flash on programmatic scroll)
      const now = () =>
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();

      let suppressHintUntil = 0;
      suppressScrollHint = (ms = 1200) => {
        suppressHintUntil = now() + ms;
        hint?.classList.add("hidden");
      };

      let raf = 0;
      const schedule = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
      };

      let nearAbout = false;

      if (aboutMe && indexScroller && "IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            nearAbout = !!entries?.[0]?.isIntersecting;
            schedule();
          },
          { root: indexScroller, threshold: 0.55 }
        );
        io.observe(aboutMe);
      }

      const fallbackNearAbout = () => {
        if (!aboutMe) return false;
        const r = aboutMe.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const screenMid = window.innerHeight / 2;
        return Math.abs(mid - screenMid) < 220;
      };

      const update = () => {
        if (hint) {
          const top = getTop();
          if (now() < suppressHintUntil) hint.classList.add("hidden");
          else if (top > Qe) hint.classList.add("hidden");
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

        if (writupsSwitch) {
          const ok =
            !isWritups.value &&
            (nearAbout || (!("IntersectionObserver" in window) && fallbackNearAbout()));
          if (ok) writupsSwitch.classList.remove("hidden");
          else writupsSwitch.classList.add("hidden");
        }
      };

      const initial = initialState;
      if (initial.view === "writups") {
        applyRotatorFallback();
        requestAnimationFrame(() => {
          noAnim.value = false;
          applyRotatorFallback();
          if (initial.w) {
            window.dispatchEvent(new CustomEvent("writups:open", { detail: { id: initial.w } }));
          }
        });
      } else {
        applyRotatorFallback();
        requestAnimationFrame(() => {
          if (indexScroller && typeof indexScroller.scrollTop === "number") indexScroller.scrollTop = 0;
          else window.scrollTo(0, 0);
          applyRotatorFallback();
        });
      }

      window.addEventListener("popstate", () => {
        const s = parseUrl();
        isWritups.value = s.view === "writups";
        requestAnimationFrame(() => applyRotatorFallback());

        if (isWritups.value && s.w) {
          requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent("writups:open", { detail: { id: s.w } }));
          });
        }

        if (!isWritups.value) {
          // also avoid footer flash + ensure writups are closed on back nav
          resetFooterInstant();
          window.dispatchEvent(new CustomEvent("writups:close"));

          requestAnimationFrame(() => {
            scrollIndexTop();
          });
        }

        schedule();
      });

      schedule();

      indexScroller?.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener(
        "resize",
        () => {
          schedule();
          requestAnimationFrame(() => applyRotatorFallback());
        },
        { passive: true }
      );
    });

    return () => {
      const Academic = ve;

      const sceneClass =
        "scene" + (isWritups.value ? " is-writups" : "") + (noAnim.value ? " no-anim" : "");

      return (
        m(),
        g("div", { class: sceneClass }, [
          l("div", { class: "view-rotator" }, [
            l("section", { class: "view index-view" }, [
              l("div", { id: "index-scroll", class: "view-scroll" }, [
                g("div", Ue, [
                  l("div", Ve, [Hero]),
                  ScrollHint,
                  SectionsTop,
                  x(Academic),
                  SectionsBottom,
                  Tail,
                ]),
              ]),
            ]),
            l("section", { class: "view writups-view" }, [
              l("div", { id: "writups-scroll", class: "view-scroll" }, [x(Writups)]),
            ]),
          ]),

          l(
            "div",
            {
              id: "writups-switch",
              class: "hidden",
              onClick: () => goWritups(),
            },
            [
              l("p", null, "writups"),
              l(
                "svg",
                {
                  width: "100%",
                  height: "100%",
                  viewBox: "0 0 10 10",
                  xmlns: "http://www.w3.org/2000/svg",
                  id: "writups-arrow",
                },
                [l("path", { d: "M5,2 L8,5 L5,8" })]
              ),
            ]
          ),

          l(
            "div",
            {
              id: "back-about",
              onClick: () => goAboutMe(),
            },
            [
              l(
                "svg",
                {
                  width: "100%",
                  height: "100%",
                  viewBox: "0 0 10 10",
                  xmlns: "http://www.w3.org/2000/svg",
                  id: "back-arrow",
                },
                [l("path", { d: "M5,2 L2,5 L5,8" })]
              ),
              l("p", null, "about me"),
            ]
          ),
        ])
      );
    };
  },
});

const it = Xe;
export { it as default };