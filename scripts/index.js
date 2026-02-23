import {
  _ as exportHelper,
  m as openBlock,
  q as createElementBlock,
  s as createElementVNode,
  d as defineComponent,
  r as ref,
  F as Fragment,
  B as renderList,
  C as unref,
  t as toDisplayString,
  K as normalizeClass,
  L as createStaticVNode,
  o as onMounted,
  v as createVNode,
} from "./entry.js";

/**
 * Scroll arrow SVG component
 */
const ScrollArrow = {};
const scrollArrowSvgAttrs = {
  width: "100%",
  height: "100%",
  viewBox: "0 0 10 10",
  version: "1.1",
  xmlns: "http://www.w3.org/2000/svg",
  "xmlns:xlink": "http://www.w3.org/1999/xlink",
  "xml:space": "preserve",
  "xmlns:serif": "http://www.serif.com/",
};
const scrollArrowPath = createElementVNode("path", { d: "M2,5 L5,8 L 8,5" }, null, -1);

function renderScrollArrow() {
  return openBlock(), createElementBlock("svg", scrollArrowSvgAttrs, [scrollArrowPath]);
}

const ArrowIcon = exportHelper(ScrollArrow, [["render", renderScrollArrow]]);

/**
 * Academic prizes cards
 */
const AcademicPrizes = defineComponent({
  __name: "AcademicPrizes",
  setup() {
    const suffix = (n) => {
      switch (n) {
        case 1:
          return "1st";
        case 2:
          return "2nd";
        case 3:
          return "3rd";
        default:
          return `${n}th`;
      }
    };

    // Placeholder text (edit these whenever you want)
    const prizes = ref([
      ["Placeholder prize item A", "Placeholder prize item B", "Placeholder prize item C"],
      ["Placeholder prize item A", "Placeholder prize item B"],
      ["Placeholder prize item A"],
    ]);

    return () => (
      openBlock(),
      createElementBlock("div", { class: "prize-container" }, [
        (openBlock(true),
        createElementBlock(
          Fragment,
          null,
          renderList(unref(prizes), (items, idx) => (
            openBlock(),
            createElementBlock("div", { key: idx, class: "card-container" }, [
              createElementVNode("h2", null, toDisplayString(`${suffix(idx + 1)} place`), 1),
              createElementVNode("ul", null, [
                (openBlock(true),
                createElementBlock(
                  Fragment,
                  null,
                  renderList(items, (txt) => (
                    openBlock(),
                    createElementBlock("li", { key: txt }, toDisplayString(txt), 1)
                  )),
                  128
                )),
              ]),
            ])
          )),
          128
        )),
      ])
    );
  },
});

/**
 * Static page sections
 */
const HeroSection = createStaticVNode(
  `
  <div class="hero-block">
    <div class="text-block">
      <h2>Dashell Finn</h2>
      <p>Hi, my name is Dashell Finn and I am an aspiring a career in cybersecurity/software engineering!</p>
    </div>
  </div>
  `,
  1
);

const MainSections = createStaticVNode(
  `
  <div class="three-animation"></div>

  <div class="main-block">
    <div class="text-block">
      <h2>About</h2>
      <p>Placeholder bio text. Replace with your real introduction.</p>
      <p>Second paragraph placeholder for extra details (what you're learning, goals, interests).</p>
    </div>
  </div>

  <div class="main-block">
    <div class="text-block">
      <h2>Projects</h2>
      <p>Placeholder projects text. Add a few projects, writeups, or labs you've done.</p>
    </div>
  </div>

  <div class="main-block">
    <div class="text-block">
      <h2>Skills</h2>
      <p>Placeholder skills text. Add languages, tools, and security areas you're focusing on.</p>
    </div>
  </div>

  <div class="main-block">
    <div class="text-block">
      <h2>Experience</h2>
      <p>Placeholder experience text. Add clubs, internships, competitions, certifications, etc.</p>
    </div>
  </div>

  <div class="main-block">
    <div class="text-block">
      <h2>Contact</h2>
      <p>Placeholder contact text. Add your email, GitHub, LinkedIn, etc.</p>
    </div>
  </div>

  <div class="three-animation"></div>
  <div class="three-animation"></div>

  <div class="section-header">
    <h2>Prizes: Academic division</h2>
  </div>
  `,
  9
);

const NotesSection = createStaticVNode(
  `
  <div class="main-block">
    <div class="text-block">
      <h2>Notes: Academic division</h2>
      <p>Placeholder notes text. Replace with whatever details you want to show here.</p>
    </div>
  </div>
  `,
  1
);

const FooterSection = createStaticVNode(
  `
  <div class="three-animation"></div>
  <div class="three-animation"></div>

  <footer>
    <p class="author">
      This website was made by
      <a class="link" href="https://github.com/dashellf/website" target="_blank" rel="noopener noreferrer">me!</a>
      <br />
      Inspiration from
      <a class="link" href="https://glacierctf.com" target="_blank" rel="noopener noreferrer">glacierctf.com</a>
    </p>
  </footer>
  `,
  3
);

const SCROLL_ARROW_HIDE_AT_PX = 30;

/**
 * Main page component
 */
const IndexPage = defineComponent({
  __name: "index",
  setup() {
    const isScrollArrowHidden = ref(false);
    const scrollContainer = ref(null);

    const updateScrollArrowVisibility = () => {
      const el = scrollContainer.value;
      isScrollArrowHidden.value = el ? el.scrollTop > SCROLL_ARROW_HIDE_AT_PX : false;
    };

    onMounted(() => {
      scrollContainer.value = document.querySelector("#__nuxt");
      updateScrollArrowVisibility();
      scrollContainer.value?.addEventListener("scroll", updateScrollArrowVisibility);
    });

    return () => (
      openBlock(),
      createElementBlock("div", { class: "page-container" }, [
        createElementVNode("div", { class: "three-animation" }, [
          HeroSection,
          createElementVNode(
            "div",
            { id: "scroll-text", class: normalizeClass({ hidden: unref(isScrollArrowHidden) }) },
            [createVNode(ArrowIcon, { id: "scroll-arrow" })],
            2
          ),
        ]),

        MainSections,
        createVNode(AcademicPrizes),
        NotesSection,
        FooterSection,
      ])
    );
  },
});

export default exportHelper(IndexPage, [["__file", "pages/index.vue"]]);