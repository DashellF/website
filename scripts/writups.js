import {
  m,
  q as g,
  s as l,
  d as k,
  r as S,
  F as W,
  B as A,
  C as T,
  t as I,
  o as D,
} from "./entry.js";

const Root = { class: "page-container writups-container" };
const Spacer = { class: "three-animation" };
const Main = { class: "main-block" };
const Text = { class: "text-block" };
const Heading = { class: "section-heading" };
const List = { class: "writups-list" };

const Writups = k({
  __name: "Writups",
  setup() {
    const writeups = S([
      {
        id: "babycrypto",
        title: "BabyCrypto",
        subtitle: "GlacierCTF 2026 · warmup crypto — breaking a goofy XOR stream",
        body: `
          <p><strong>Goal:</strong> Recover the flag from a toy “encryption” scheme.</p>
          <p><strong>What I noticed:</strong> The keystream repeats every N bytes, so it’s vulnerable to crib-drag / known-plaintext.</p>
          <p><strong>Exploit:</strong></p>
          <ol>
            <li>Guess the prefix format (<code>glacier{</code>).</li>
            <li>XOR ciphertext with guessed plaintext to recover keystream bytes.</li>
            <li>Repeat keystream across the full ciphertext and XOR to decrypt.</li>
          </ol>
          <p><strong>Result:</strong> Full plaintext + flag.</p>
          <pre><code>// filler snippet
keystream = c[:8] XOR "glacier{"
plain[i] = c[i] XOR keystream[i % 8]
</code></pre>
        `,
      },
      {
        id: "webminisqli",
        title: "MiniSQLi",
        subtitle: "Weekly CTF · web — finding a boolean-based injection in a search filter",
        body: `
          <p><strong>Goal:</strong> Login as admin without credentials.</p>
          <p><strong>Recon:</strong> The <code>q</code> parameter is reflected in an SQL-backed search.</p>
          <p><strong>Exploit:</strong></p>
          <ol>
            <li>Test boolean: <code>' OR 1=1--</code> to confirm injection.</li>
            <li>Find column count via <code>ORDER BY</code> increment.</li>
            <li>UNION select to extract username/password hash.</li>
          </ol>
          <p><strong>Notes:</strong> The app filtered spaces, so I used <code>/**/</code> comments as separators.</p>
          <pre><code>// filler payload
'/**/UNION/**/SELECT/**/1,username,password/**/FROM/**/users--</code></pre>
        `,
      },
    ]);

    const openId = S(null);

    const scrollToWriteup = (id, smooth) => {
      const el = document.getElementById(`writeup-${id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    };

    const updateUrl = (idOrNull) => {
      const url = new URL(window.location.href);
      // Only manage the writeup id here. index.js owns the "view" param.
      if (idOrNull) url.searchParams.set("w", idOrNull);
      else url.searchParams.delete("w");

      history.replaceState({}, "", url);
    };

    const toggle = (id) => {
      openId.value = openId.value === id ? null : id;
      updateUrl(openId.value);

      if (openId.value) {
        requestAnimationFrame(() => scrollToWriteup(openId.value, true));
      }
    };

    const openFromUrl = (smooth) => {
      const sp = new URLSearchParams(window.location.search);
      const id = sp.get("w") || sp.get("writeup");
      if (!id) return;

      const exists = writeups.value.find((w) => w.id === id);
      if (!exists) return;

      openId.value = id;
      requestAnimationFrame(() => scrollToWriteup(id, !!smooth));
    };

    D(() => {
      // direct-link support
      openFromUrl(false);

      // cross-view event support (index -> writups)
      window.addEventListener("writups:open", (e) => {
        const id = e?.detail?.id;
        if (!id) return;

        const exists = writeups.value.find((w) => w.id === id);
        if (!exists) return;

        openId.value = id;
        requestAnimationFrame(() => scrollToWriteup(id, true));
      });
    });

    return (i, a) => (
      m(),
      g("div", Root, [
        // REMOVED: top Spacer

        l("div", Main, [
          l("div", Text, [
            l("h2", null, "CTF Writeups"),
            l("p", null, "Small cards expand on click. Links can open a specific writeup automatically."),
            l("p", null, [
              l("strong", null, "Example:"),
              l("span", null, " "),
              l("code", null, "/?view=writups&w=babycrypto"),
            ]),
          ]),
        ]),

        l("div", Heading, [l("h2", null, "Writeups")]),

        l("div", List, [
          (m(!0),
          g(
            W,
            null,
            A(T(writeups), (w) => (
              m(),
              g(
                "article",
                {
                  key: w.id,
                  id: `writeup-${w.id}`,
                  class: "writeup-card" + (openId.value === w.id ? " open" : ""),
                },
                [
                  l("header", { class: "writeup-head", onClick: () => toggle(w.id) }, [
                    l("h3", { class: "writeup-title" }, I(w.title), 1),
                    l("p", { class: "writeup-subtitle" }, I(w.subtitle), 1),
                  ]),
                  l(
                    "div",
                    {
                      class: "writeup-body",
                      innerHTML: openId.value === w.id ? w.body : "",
                      // FIX: don't use null here — always set a value so display:none clears correctly
                      style: openId.value === w.id ? "" : "display:none;",
                    },
                    null,
                    12,
                    ["innerHTML", "style"]
                  ),
                ]
              )
            )),
            128
          )),
        ]),

        l("div", Spacer),
      ])
    );
  },
});

export { Writups as default };