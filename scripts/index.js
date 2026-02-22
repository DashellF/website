import {_ as $, m, q as g, s as l, d as k, r as S, F as W, B as A, C as T, t as I, h as C, D as J, E, p as Y, G as O, H as Z, I as N, J as K, l as R, c as y, o as D, g as Q, v as x, K as X, L as P, z as ee, A as te} from "./entry.js";
import {u as ie} from "./vue.js";
const se = {}
  , ae = {
    width: "100%",
    height: "100%",
    viewBox: "0 0 10 10",
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    "xmlns:xlink": "http://www.w3.org/1999/xlink",
    "xml:space": "preserve",
    "xmlns:serif": "http://www.serif.com/"
}
  , re = l("path", {
    d: "M2,5 L5,8 L 8,5"
}, null, -1)
  , ne = [re];
function oe(e, t) {
    return m(),
    g("svg", ae, ne)
}
const de = $(se, [["render", oe]])
  , ce = {
    class: "prize-container"
}
  , le = {
    class: "card"
}
  , ue = {
    class: "side front"
}
  , he = {
    class: "info"
}
  , fe = k({
    __name: "AcademicPrizes",
    setup(e) {
        function t(i) {
            switch (i) {
            case 1:
                return "1st";
            case 2:
                return "2nd";
            case 3:
                return "3rd";
            default:
                return `${i}th`
            }
        }
        const s = S([["ISEC Travel Grant for Graz Security Week 2026**"], ["ISEC Travel Grant for Graz Security Week 2026**"], ["ISEC Travel Grant for Graz Security Week 2026**"]]);
        return (i, a) => (m(),
        g("div", ce, [(m(!0),
        g(W, null, A(T(s), (r, n) => (m(),
        g("div", {
            key: n,
            class: "card-container"
        }, [l("span", le, [l("div", ue, [l("div", he, [l("h2", null, I(t(n + 1)) + " place", 1), l("p", null, [l("ul", null, [(m(!0),
        g(W, null, A(r, o => (m(),
        g("li", {
            key: o
        }, I(o), 1))), 128))])])])])])]))), 128))]))
    }
});
const ve = $(fe, [["__scopeId", "data-v-f7f5a91e"]]);
async function me(e, t) {
    return await ge(t).catch(i => (console.error("Failed to get image meta for " + t, i + ""),
    {
        width: 0,
        height: 0,
        ratio: 0
    }))
}
async function ge(e) {
    if (typeof Image > "u")
        throw new TypeError("Image not supported");
    return new Promise( (t, s) => {
        const i = new Image;
        i.onload = () => {
            const a = {
                width: i.width,
                height: i.height,
                ratio: i.width / i.height
            };
            t(a)
        }
        ,
        i.onerror = a => s(a),
        i.src = e
    }
    )
}
function q(e) {
    return t => t ? e[t] || t : e.missingValue
}
function pe({formatter: e, keyMap: t, joinWith: s="/", valueMap: i}={}) {
    e || (e = (r, n) => `${r}=${n}`),
    t && typeof t != "function" && (t = q(t));
    const a = i || {};
    return Object.keys(a).forEach(r => {
        typeof a[r] != "function" && (a[r] = q(a[r]))
    }
    ),
    (r={}) => Object.entries(r).filter( ([o,c]) => typeof c < "u").map( ([o,c]) => {
        const u = a[o];
        return typeof u == "function" && (c = u(r[o])),
        o = typeof t == "function" ? t(o) : o,
        e(o, c)
    }
    ).join(s)
}
function p(e="") {
    if (typeof e == "number")
        return e;
    if (typeof e == "string" && e.replace("px", "").match(/^\d+$/g))
        return parseInt(e, 10)
}
function _e(e="") {
    if (e === void 0 || !e.length)
        return [];
    const t = new Set;
    for (const s of e.split(" ")) {
        const i = parseInt(s.replace("x", ""));
        i && t.add(i)
    }
    return Array.from(t)
}
function be(e) {
    if (e.length === 0)
        throw new Error("`densities` must not be empty, configure to `1` to render regular size only (DPR 1.0)")
}
function ye(e) {
    const t = {};
    if (typeof e == "string")
        for (const s of e.split(/[\s,]+/).filter(i => i)) {
            const i = s.split(":");
            i.length !== 2 ? t["1px"] = i[0].trim() : t[i[0].trim()] = i[1].trim()
        }
    else
        Object.assign(t, e);
    return t
}
function we(e) {
    const t = {
        options: e
    }
      , s = (a, r={}) => H(t, a, r)
      , i = (a, r={}, n={}) => s(a, {
        ...n,
        modifiers: O(r, n.modifiers || {})
    }).url;
    for (const a in e.presets)
        i[a] = (r, n, o) => i(r, n, {
            ...e.presets[a],
            ...o
        });
    return i.options = e,
    i.getImage = s,
    i.getMeta = (a, r) => Se(t, a, r),
    i.getSizes = (a, r) => Ie(t, a, r),
    t.$img = i,
    i
}
async function Se(e, t, s) {
    const i = H(e, t, {
        ...s
    });
    return typeof i.getMeta == "function" ? await i.getMeta() : await me(e, i.url)
}
function H(e, t, s) {
    var u, h;
    if (typeof t != "string" || t === "")
        throw new TypeError(`input must be a string (received ${typeof t}: ${JSON.stringify(t)})`);
    if (t.startsWith("data:"))
        return {
            url: t
        };
    const {provider: i, defaults: a} = ze(e, s.provider || e.options.provider)
      , r = xe(e, s.preset);
    if (t = C(t) ? t : J(t),
    !i.supportsAlias)
        for (const _ in e.options.alias)
            t.startsWith(_) && (t = E(e.options.alias[_], t.substr(_.length)));
    if (i.validateDomains && C(t)) {
        const _ = Y(t).host;
        if (!e.options.domains.find(z => z === _))
            return {
                url: t
            }
    }
    const n = O(s, r, a);
    n.modifiers = {
        ...n.modifiers
    };
    const o = n.modifiers.format;
    (u = n.modifiers) != null && u.width && (n.modifiers.width = p(n.modifiers.width)),
    (h = n.modifiers) != null && h.height && (n.modifiers.height = p(n.modifiers.height));
    const c = i.getImage(t, n, e);
    return c.format = c.format || o || "",
    c
}
function ze(e, t) {
    const s = e.options.providers[t];
    if (!s)
        throw new Error("Unknown provider: " + t);
    return s
}
function xe(e, t) {
    if (!t)
        return {};
    if (!e.options.presets[t])
        throw new Error("Unknown preset: " + t);
    return e.options.presets[t]
}
function Ie(e, t, s) {
    var v, j, G, L, M;
    const i = p((v = s.modifiers) == null ? void 0 : v.width)
      , a = p((j = s.modifiers) == null ? void 0 : j.height)
      , r = ye(s.sizes)
      , n = (G = s.densities) != null && G.trim() ? _e(s.densities.trim()) : e.options.densities;
    be(n);
    const o = i && a ? a / i : 0
      , c = []
      , u = [];
    if (Object.keys(r).length >= 1) {
        for (const f in r) {
            const b = B(f, String(r[f]), a, o, e);
            if (b !== void 0) {
                c.push({
                    size: b.size,
                    screenMaxWidth: b.screenMaxWidth,
                    media: `(max-width: ${b.screenMaxWidth}px)`
                });
                for (const w of n)
                    u.push({
                        width: b._cWidth * w,
                        src: F(e, t, s, b, w)
                    })
            }
        }
        $e(c)
    } else
        for (const f of n) {
            const b = Object.keys(r)[0];
            let w = B(b, String(r[b]), a, o, e);
            w === void 0 && (w = {
                size: "",
                screenMaxWidth: 0,
                _cWidth: (L = s.modifiers) == null ? void 0 : L.width,
                _cHeight: (M = s.modifiers) == null ? void 0 : M.height
            }),
            u.push({
                width: f,
                src: F(e, t, s, w, f)
            })
        }
    ke(u);
    const h = u[u.length - 1]
      , _ = c.length ? c.map(f => `${f.media ? f.media + " " : ""}${f.size}`).join(", ") : void 0
      , z = _ ? "w" : "x"
      , d = u.map(f => `${f.src} ${f.width}${z}`).join(", ");
    return {
        sizes: _,
        srcset: d,
        src: h == null ? void 0 : h.src
    }
}
function B(e, t, s, i, a) {
    const r = a.options.screens && a.options.screens[e] || parseInt(e)
      , n = t.endsWith("vw");
    if (!n && /^\d+$/.test(t) && (t = t + "px"),
    !n && !t.endsWith("px"))
        return;
    let o = parseInt(t);
    if (!r || !o)
        return;
    n && (o = Math.round(o / 100 * r));
    const c = i ? Math.round(o * i) : s;
    return {
        size: t,
        screenMaxWidth: r,
        _cWidth: o,
        _cHeight: c
    }
}
function F(e, t, s, i, a) {
    return e.$img(t, {
        ...s.modifiers,
        width: i._cWidth ? i._cWidth * a : void 0,
        height: i._cHeight ? i._cHeight * a : void 0
    }, s)
}
function $e(e) {
    var s;
    e.sort( (i, a) => i.screenMaxWidth - a.screenMaxWidth);
    let t = null;
    for (let i = e.length - 1; i >= 0; i--) {
        const a = e[i];
        a.media === t && e.splice(i, 1),
        t = a.media
    }
    for (let i = 0; i < e.length; i++)
        e[i].media = ((s = e[i + 1]) == null ? void 0 : s.media) || ""
}
function ke(e) {
    e.sort( (s, i) => s.width - i.width);
    let t = null;
    for (let s = e.length - 1; s >= 0; s--) {
        const i = e[s];
        i.width === t && e.splice(s, 1),
        t = i.width
    }
}
const We = pe({
    keyMap: {
        format: "f",
        fit: "fit",
        width: "w",
        height: "h",
        resize: "s",
        quality: "q",
        background: "b"
    },
    joinWith: "&",
    formatter: (e, t) => N(e) + "_" + N(t)
})
  , Ae = (e, {modifiers: t={}, baseURL: s}={}, i) => {
    t.width && t.height && (t.resize = `${t.width}x${t.height}`,
    delete t.width,
    delete t.height);
    const a = We(t) || "_";
    return s || (s = E(i.options.nuxt.baseURL, "/_ipx")),
    {
        url: E(s, a, Z(e))
    }
}
  , Ee = !0
  , Te = !0
  , Pe = Object.freeze(Object.defineProperty({
    __proto__: null,
    getImage: Ae,
    supportsAlias: Te,
    validateDomains: Ee
}, Symbol.toStringTag, {
    value: "Module"
}))
  , U = {
    screens: {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        xxl: 1536,
        "2xl": 1536
    },
    presets: {},
    provider: "ipxStatic",
    domains: [],
    alias: {},
    densities: [1, 2],
    format: ["webp"]
};
U.providers = {
    ipxStatic: {
        provider: Pe,
        defaults: void 0
    }
};
const V = () => {
    const e = K()
      , t = R();
    return t.$img || t._img || (t._img = we({
        ...U,
        nuxt: {
            baseURL: e.app.baseURL
        }
    }))
}
  , je = {
    src: {
        type: String,
        required: !0
    },
    format: {
        type: String,
        default: void 0
    },
    quality: {
        type: [Number, String],
        default: void 0
    },
    background: {
        type: String,
        default: void 0
    },
    fit: {
        type: String,
        default: void 0
    },
    modifiers: {
        type: Object,
        default: void 0
    },
    preset: {
        type: String,
        default: void 0
    },
    provider: {
        type: String,
        default: void 0
    },
    sizes: {
        type: [Object, String],
        default: void 0
    },
    densities: {
        type: String,
        default: void 0
    },
    preload: {
        type: Boolean,
        default: void 0
    },
    width: {
        type: [String, Number],
        default: void 0
    },
    height: {
        type: [String, Number],
        default: void 0
    },
    alt: {
        type: String,
        default: void 0
    },
    referrerpolicy: {
        type: String,
        default: void 0
    },
    usemap: {
        type: String,
        default: void 0
    },
    longdesc: {
        type: String,
        default: void 0
    },
    ismap: {
        type: Boolean,
        default: void 0
    },
    loading: {
        type: String,
        default: void 0
    },
    crossorigin: {
        type: [Boolean, String],
        default: void 0,
        validator: e => ["anonymous", "use-credentials", "", !0, !1].includes(e)
    },
    decoding: {
        type: String,
        default: void 0,
        validator: e => ["async", "auto", "sync"].includes(e)
    }
}
  , Ge = e => {
    const t = y( () => ({
        provider: e.provider,
        preset: e.preset
    }))
      , s = y( () => ({
        width: p(e.width),
        height: p(e.height),
        alt: e.alt,
        referrerpolicy: e.referrerpolicy,
        usemap: e.usemap,
        longdesc: e.longdesc,
        ismap: e.ismap,
        crossorigin: e.crossorigin === !0 ? "anonymous" : e.crossorigin || void 0,
        loading: e.loading,
        decoding: e.decoding
    }))
      , i = V()
      , a = y( () => ({
        ...e.modifiers,
        width: p(e.width),
        height: p(e.height),
        format: e.format,
        quality: e.quality || i.options.quality,
        background: e.background,
        fit: e.fit
    }));
    return {
        options: t,
        attrs: s,
        modifiers: a
    }
}
  , Le = {
    ...je,
    placeholder: {
        type: [Boolean, String, Number, Array],
        default: void 0
    }
}
  , Me = k({
    name: "NuxtImg",
    props: Le,
    emits: ["load", "error"],
    setup: (e, t) => {
        const s = V()
          , i = Ge(e)
          , a = S(!1)
          , r = y( () => s.getSizes(e.src, {
            ...i.options.value,
            sizes: e.sizes,
            densities: e.densities,
            modifiers: {
                ...i.modifiers.value,
                width: p(e.width),
                height: p(e.height)
            }
        }))
          , n = y( () => {
            const d = {
                ...i.attrs.value,
                "data-nuxt-img": ""
            };
            return (!e.placeholder || a.value) && (d.sizes = r.value.sizes,
            d.srcset = r.value.srcset),
            d
        }
        )
          , o = y( () => {
            let d = e.placeholder;
            if (d === "" && (d = !0),
            !d || a.value)
                return !1;
            if (typeof d == "string")
                return d;
            const v = Array.isArray(d) ? d : typeof d == "number" ? [d, d] : [10, 10];
            return s(e.src, {
                ...i.modifiers.value,
                width: v[0],
                height: v[1],
                quality: v[2] || 50,
                blur: v[3] || 3
            }, i.options.value)
        }
        )
          , c = y( () => e.sizes ? r.value.src : s(e.src, i.modifiers.value, i.options.value))
          , u = y( () => o.value ? o.value : c.value);
        if (e.preload) {
            const d = Object.values(r.value).every(v => v);
            ie({
                link: [{
                    rel: "preload",
                    as: "image",
                    ...d ? {
                        href: r.value.src,
                        imagesizes: r.value.sizes,
                        imagesrcset: r.value.srcset
                    } : {
                        href: u.value
                    }
                }]
            })
        }
        const h = S()
          , z = R().isHydrating;
        return D( () => {
            if (o.value) {
                const d = new Image;
                d.src = c.value,
                e.sizes && (d.sizes = r.value.sizes || "",
                d.srcset = r.value.srcset),
                d.onload = v => {
                    a.value = !0,
                    t.emit("load", v)
                }
                ;
                return
            }
            h.value && (h.value.complete && z && (h.value.getAttribute("data-error") ? t.emit("error", new Event("error")) : t.emit("load", new Event("load"))),
            h.value.onload = d => {
                t.emit("load", d)
            }
            ,
            h.value.onerror = d => {
                t.emit("error", d)
            }
            )
        }
        ),
        () => Q("img", {
            ref: h,
            src: u.value,
            ...n.value,
            ...t.attrs
        })
    }
})
  , Ce = {
    class: "sponsor-container"
}
  , Ne = {
    class: "card-el"
}
  , qe = ["href"]
  , Be = {
    class: "side-front"
}
  , Fe = {
    class: "sponsor-image"
}
  , Oe = {
    class: "info"
}
  , Re = k({
    __name: "Sponsors",
    setup(e) {
        const t = S([{
            src: "/images/sponsors/tug.png",
            href: "https://www.isec.tugraz.at/",
            title: "ISec @ TU Graz",
            desc: `We research Cybersecurity and teach future experts to create secure 
        technologies for everyone.`
        }, {
            src: "/images/sponsors/google.png",
            href: "https://services.google.com/fb/forms/ctfsponsorship/",
            title: "Google",
            desc: "Infra sponsored by goo.gle/ctfsponsorship."
        }, {
            src: "/images/sponsors/hex_rays_sa_logo.jpeg",
            href: "https://hex-rays.com/",
            title: "Hex-Rays",
            desc: "Professional binary analysis with IDA Pro disassembler and decompiler. Tools for reverse engineering, malware analysis, and vulnerability research."
        }]);
        return (s, i) => {
            const a = Me;
            return m(),
            g("div", Ce, [(m(!0),
            g(W, null, A(T(t), r => (m(),
            g("div", {
                key: r.title,
                class: "card-container"
            }, [l("div", Ne, [l("a", {
                class: "card",
                href: r.href
            }, [l("div", Be, [l("div", Fe, [x(a, {
                alt: r.title,
                src: r.src
            }, null, 8, ["alt", "src"])]), l("div", Oe, [l("h2", null, I(r.title), 1), l("p", null, I(r.desc), 1)])])], 8, qe)])]))), 128))])
        }
    }
});
const De = $(Re, [["__scopeId", "data-v-a88121a0"]])
  , He = e => (ee("data-v-dd43eb17"),
e = e(),
te(),
e)
  , Ue = {
    class: "page-container"
}
  , Ve = {
    class: "three-animation"
}
  , Je = He( () => l("p", null, "scroll", -1))
  , Ye = P('<div class="three-animation" data-v-dd43eb17></div><div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17><h2 data-v-dd43eb17>GlacierCTF 2025</h2><p data-v-dd43eb17> We&#39;re excited to announce GlacierCTF 2025 for its fourth edition, organized by <a class="link" href="https://losfuzzys.net/" data-v-dd43eb17>LosFuzzys</a>. <br data-v-dd43eb17><br data-v-dd43eb17> Join us for a 24-hour <b data-v-dd43eb17>jeopardy-style</b> CTF where players of all skill levels are warmly welcomed. Experience an engaging range of challenges, including pwn, rev, web, crypto, smart contracts, and misc.<br data-v-dd43eb17><br data-v-dd43eb17> GlacierCTF 2025 is your opportunity to dive into the world of cybersecurity and enjoy a friendly competition with fellow enthusiasts. Get ready for an exciting weekend of hacking and problem-solving!<br data-v-dd43eb17><br data-v-dd43eb17></p></div></div><div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17><h2 data-v-dd43eb17>Prizes</h2></div></div><div class="three-animation" data-v-dd43eb17></div><div class="three-animation" data-v-dd43eb17></div><div class="our-sponsors" data-v-dd43eb17><h2 data-v-dd43eb17>Prizes: Academic division</h2></div>', 6)
  , Ze = P('<div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17><h2 data-v-dd43eb17>Notes: Academic division</h2><h3 data-v-dd43eb17>**The ISEC travel grant includes the following:</h3><p data-v-dd43eb17> The travel grant covers up to EUR 1,500.00 for attending Graz Security Week 2026 in total. The actual split of the grant between the team members is up to the winners. The payment of the travel grant is done as reimbursement. Hence, the winners register for Graz security week 2026 and after attendance all receipts have to be submitted to <a class="link" href="mailto:team@losfuzzys.net" data-v-dd43eb17>team@losfuzzys.net</a>. The costs for registration, travel, and hotel will then be reimbursed </p><br data-v-dd43eb17><br data-v-dd43eb17><br data-v-dd43eb17><p data-v-dd43eb17>Academic teams are also eligible for the open category prizes.</p></div></div><div class="main-block" data-v-dd43eb17><div class="text-block" data-v-dd43eb17><h2 data-v-dd43eb17>Information</h2><h3 data-v-dd43eb17>PRIZE ELIGIBILITY</h3><p data-v-dd43eb17>Only teams whose members are enrolled in a school or university are eligible to win the student category prizes. Teams from countries that are sanctioned by the Austrian government or the European Union are exempt from receiving any prizes. To ensure this policy, in case of a team placing in the top 3, it&#39;s registered members will have to provide proof of citizenship or enrolment at a university.</p><h3 data-v-dd43eb17>RULES</h3><p data-v-dd43eb17> During the competition, any of the following behaviours will result in immediate disqualification: <ul data-v-dd43eb17><li data-v-dd43eb17>Any behaviour that affects the fairness of the competition</li><li data-v-dd43eb17>Posting, sharing task solutions or flags</li><li data-v-dd43eb17>Each team may register only once, and a person may belong to only one team</li><li data-v-dd43eb17>Intentionally prevent other teams from scoring flags</li><li data-v-dd43eb17>Attacking personnel, including participants and non-participants, or the competition system itself</li><li data-v-dd43eb17>Violation of the Code of Conduct</li></ul></p></div></div>', 3)
  , Ke = P('<div class="three-animation" data-v-dd43eb17></div><div class="three-animation" data-v-dd43eb17></div>', 3)
  , Qe = 30
  , Xe = k({
    __name: "index",
    setup(e) {
        const t = S(!1)
          , s = S()
          , i = () => {
            t.value = s.value ? s.value.scrollTop > Qe : !1
        }
        ;
        return D( () => {
            s.value = document.querySelector("#__nuxt"),
            i(),
            s.value.addEventListener("scroll", () => i())
        }
        ),
        (a, r) => {
            const n = de
              , o = ve
              , c = {render(){return null}};
            return m(),
            g("div", Ue, [l("div", Ve, [l("div", {
                id: "scroll-text",
                class: X([{
                    hidden: T(t)
                }])
            }, [Je, x(n, {
                id: "scroll-arrow"
            })], 2)]), Ye, x(o), Ze, x(c), Ke])
        }
    }
});
const it = $(Xe, [["__scopeId", "data-v-dd43eb17"]]);
export {it as default};
