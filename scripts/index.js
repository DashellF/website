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

const ce = { class: "prize-container" };
const le = { class: "card" };
const ue = { class: "side front" };
const he = { class: "info" };

const fe = k({
  __name: "Projects",
  setup() {
    // Each project now has an editable name + bullet items
    const s = S([
      {
        // Add link to the Scrapboard word only
        name: `Trash Detection App (<a class="link" href="https://github.com/WilyHyperion/RandomForestHacks/tree/main/backend" target="_blank" rel="noopener noreferrer">Scrapboard</a>)`,
        items: [
          "custom trained AI model",
          "ngrok connected backend",
          "expo go app configuration",
          "mongodb login sql database",
        ],
      },
      {
        // Add link to the Emoti text
        name: `Emotion Recognition App (<a class="link" href="https://github.com/DashellF/Sparkhub-Hackathon-Facial-Recognition-App" target="_blank" rel="noopener noreferrer">Emoti</a>)`,
        items: [
          "custom trained AI model",
          "mongodb",
          "can run as a website, IOS app, and Android app",
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
        name: `<a class="link" href="https://github.com/AV-FactChecker/AV-ai-FactChecker" target="_blank" rel="noopener noreferrer">Real-time AI Fact Checker</a>`,
        items: [
          "real time audio tracking with whisper",
          "uses gpt api",
          "runs a website database for long term runs",
        ],
      },
      {
        // Add link to the title of the space project
        name: `<a class="link" href="https://github.com/DashellF/space-project" target="_blank" rel="noopener noreferrer">Space Simulator</a>`,
        items: ["godot game engine", "runs as an app on android and on computers"],
      },

      {
        name: "Raspberry Pis",
        items: ["several escape room puzzles", "custom mousepad with conductive paper"],
      },

      {
        // Add link to the "This Website!" text
        name: `<a class="link" href="https://github.com/DashellF/website" target="_blank" rel="noopener noreferrer">This Website!</a>`,
        items: [
          "surprisingly lightweight!",
          "no imports required!",
          "uses vue.js and nuxt framework to render 3d objects.",
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
                    // CHANGED: use innerHTML so the <a> tags render as real links
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

  '<div class="main-block"><div class="text-block">' +
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
    "<p>I\'ve also been doing ctfs every week for about a year now (currently 5th in the US on <a class=\"link\" href=\"https://ctftime.org/team/419145\" target=\"_blank\" rel=\"noopener noreferrer\">CTFTime</a>).</p>" +
  "</div></div>" +
  
  '<div class="main-block"><div class="text-block">' +
    "<h2>Skills</h2>" +
    "<p>For ctfs, I usually do really well in <strong>rev</strong>, <strong>osint</strong>, and <strong>crypto</strong>. I usually play solo, so I've still gotten pretty good at web, misc, android, and forensics challs.</p>" +    "<p>I really enjoy tweaking, hardening, and breaking into windows machines. Hardening scripts are also fun to make, and are decent in competitions.</p>" +
    "<p>I am afluent with many developer tools such as git, expogo, react, mongodb, ngrok, godot, raspberry pis, and gdb.</p>" +
    "<p>Here is my <a class=\"link\" href=\"/resume.pdf\">resume</a>, including a lot of this and more!</p>" +
  "</div></div>" +

  '<div class="main-block"><div class="text-block">' +
    "<h2>Contact</h2>" +
    "<p>To contact me, email me at djf1517@gmail.com or shoot me a dm on discord (dashel1).</p>" +
    "<p>I\'ll usually respond within 1-2 days by email and a couple hours by discord.</p>" +
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

//footer and scroll hint fade
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

      const FOOTER_RANGE = 1200;
      const FOOTER_LERP = 0.025;

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