// writeups.js (full file, patched: deterministic offset scroll + robust direct-link + badges + measured-height + close button + code expand/collapse arrows)

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

const Root = { class: "page-container writeups-container" };
const Spacer = { class: "three-animation" };
const Main = { class: "main-block" };
const Text = { class: "text-block" };
const Heading = { class: "section-heading" };
const List = { class: "writeups-list" };

const Writeups = k({
    __name: "Writeups",
    setup() {
        const diffColorOf = (d) =>
            d === "brutal" ?
            "#7e22ce" :
            d === "hard" ?
            "#b91c1c" :
            d === "medium" ?
            "#f59e0b" :
            "#22c55e";

        const writeups = S([{
                id: "emoji_captcha",
                title: "Emoji CAPTCHA",
                subtitle: "srdnlen CTF 2026 · Bypassing a robot image classification authenticator",
                difficulty: "brutal",
                category: "misc",
                firstBlood: true,
                catColor: "#a855f7", // purple
                body: String.raw `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">misc</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~3-4 hours.
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>CAPTCHAs were invented to keep robots out and let humans in. We decided to reverse the rules.</p>
            <p>This is a remote challenge, you can connect to the service with:</p>
            <p><code>nc emoji.challs.srdnlen.it 1717</code></p>
          </blockquote>

          <hr />

          <p>As a preface to this writeup, AI was used to generate the scripts below, and was allowed per this CTF's rules. The ideas used were still very human, otherwise this challenge would not have had only 3 solves in 48 hours 😊.</p>

          <p>When we first connect the server, we are prompted with a nice banner and a menu.</p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/header.png" alt="Server header" width="800">

          <p>We learn more about the challenge when we look at the About page:</p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/about.png" alt="Server about page" width="800">
          <p>Note, this is an updated About page, the earlier page did not include that the images were created through pillow.</p>

          <p>Reading through these two pages, we learn how this challenge works. We are given a base64 encoded image with rotated emojis in it, and it's our job to respond to each base64 chunk with the unicode codepoints of each emoji. Looking at the sample image makes this a lot clearer.</p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/example.png" alt="Challenge Image example one" width="800">
          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/exampleOutput.png" alt="Example Image Output" width="800">

          <p>With this, we see the intended user input is the emoji unicode from left to right, then the next row left to right.
I was curious for more patterns, so I queried to start the challenge to gather a couple more example images. From these, a pattern emerges:</p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/example2.png" alt="Challenge Image example two" width="800">
          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/example3.png" alt="Challenge Image example three" width="800">

          <p>In every image sent out, we are given a 4x2 array of rotated emojis. This, as we will see later, will significantly simplify the work we need to do.</p>

          <p>To solve this challenge, I used an AI model trained to take in a cropped image of a rotated emoji and return the emoji it thought was in the image. Through that, I piped that outputted emoji into its unicode format and sent it back through to the server.</p>

          <p>To do this though, I needed 3 things. <br>
          1. A dataset to train the AI off of <br>
          2. A method of training the AI that would lead to the highest success rate <br>
          3. A script to take the AI's output and send it back through the server.</p>

          <p>I'll start with how I got the dataset.
To generate the dataset, I needed thousands of images to train this AI off of. since every outputted image was in a 4x2 format, all I needed the AI to do was to know how to take in one rotate emoji, not the entire image. This greatly reduced the number of images needed to successfully train the AI off of every emoji.</p>

          <p>To generate these emojis, I downloaded the emoji-list.txt file referenced in the about section of the challenge. I also downloaded the AppleColorEmoji-160px.ttc font file also mentioned in the about section. With these two files, creating the exact same images as found on the server would be possible.</p>

          <p>Then, I used this script to generate thousands of images where every emoji rotated to a random degree several times. Here is that code:</p>

          <pre><code class="language-python">#!/usr/bin/env python3
import argparse
import json
import subprocess
import uuid
from pathlib import Path

import numpy as np
from PIL import Image


def parse_emoji_test(emojis_txt: Path, only_fully_qualified: bool = True):
    """
    Parses Unicode emoji-test.txt style file and returns a list of emoji strings.
    """
    out = []
    for line in emojis_txt.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "#" not in line or ";" not in line:
            continue

        left, right = line.split("#", 1)
        left = left.strip()
        right = right.strip()

        # left: "1F600 ; fully-qualified". Some of the emojis in emoji-list.txt are not in the apple font.
        try:
            _, status = left.split(";", 1)
            status = status.strip()
        except ValueError:
            continue

        if only_fully_qualified and status != "fully-qualified":
            continue

        toks = right.split()
        if not toks:
            continue
        emoji = toks[0]
        out.append(emoji)
    return out


def ensure_labels(emojis):
    labels = {"next_id": len(emojis), "id_to_emoji": {}, "emoji_to_id": {}}
    for i, e in enumerate(emojis):
        labels["id_to_emoji"][str(i)] = e
        labels["emoji_to_id"][e] = i
    return labels


def render_with_pango(emoji: str, out_png: Path, font: str, px: int) -&gt; bool:
    cmd = [
        "pango-view",
        f"--text={emoji}",
        f"--font={font} {px}",
        "--output",
        str(out_png),
        "--no-display",
    ]
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return r.returncode == 0 and out_png.exists() and out_png.stat().st_size &gt; 0


def tight_crop_rgba(im: Image.Image, bg_thresh: int = 250, pad_frac: float = 0.08) -&gt; Image.Image:
    """
    Tight-crop around non-white pixels after compositing onto white.
    Input: RGBA
    Output: RGB
    """
    im = im.convert("RGBA")
    rgb = Image.new("RGB", im.size, (255, 255, 255))
    rgb.paste(im, mask=im.split()[-1])  # alpha mask
    arr = np.array(rgb)

    mask = np.any(arr &lt; bg_thresh, axis=2)
    if not mask.any():
        return rgb

    ys, xs = np.where(mask)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1

    bw, bh = x1 - x0, y1 - y0
    pad = int(round(max(bw, bh) * pad_frac))
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(arr.shape[1], x1 + pad)
    y1 = min(arr.shape[0], y1 + pad)

    return rgb.crop((x0, y0, x1, y1))


def square_pad_white(im: Image.Image) -&gt; Image.Image:
    im = im.convert("RGB")
    w, h = im.size
    s = max(w, h)
    out = Image.new("RGB", (s, s), (255, 255, 255))
    out.paste(im, ((s - w) // 2, (s - h) // 2))
    return out


def atomic_save_png(im: Image.Image, path: Path) -&gt; None:
    """
    save to a temp file that still ends in .png, then rename.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")  # e.g. .png.tmp
    im.save(tmp, format="PNG")
    tmp.replace(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--emojis_txt", default="emojis.txt")
    ap.add_argument("--out_dir", default="rot_dataset")
    ap.add_argument("--font", default="AppleColorEmoji")
    ap.add_argument("--render_px", type=int, default=160, help="Pango font size used for rendering")
    ap.add_argument("--img_size", type=int, default=128, help="Final training image size")
    ap.add_argument("--per_emoji", type=int, default=20, help="How many rotated samples per emoji")
    ap.add_argument("--min_angle", type=float, default=0.0)
    ap.add_argument("--max_angle", type=float, default=360.0)
    args = ap.parse_args()

    emojis = parse_emoji_test(Path(args.emojis_txt), only_fully_qualified=True)
    print("[*] emojis parsed:", len(emojis))

    out_dir = Path(args.out_dir)
    tmpl_dir = out_dir / "templates"
    crops_dir = out_dir / "crops"
    tmpl_dir.mkdir(parents=True, exist_ok=True)
    crops_dir.mkdir(parents=True, exist_ok=True)

    labels = ensure_labels(emojis)
    (out_dir / "labels.json").write_text(json.dumps(labels, ensure_ascii=False, indent=2), encoding="utf-8")

    rendered = 0
    failed = 0
    for i, e in enumerate(emojis):
        tpath = tmpl_dir / f"{i}.png"
        if tpath.exists() and tpath.stat().st_size &gt; 0:
            rendered += 1
            continue
        ok = render_with_pango(e, tpath, args.font, args.render_px)
        if ok:
            rendered += 1
        else:
            failed += 1
        if (i + 1) % 250 == 0:
            print(f"  templates: {i+1}/{len(emojis)} ok={rendered} fail={failed}")

    print(f"[+] templates done. ok={rendered} fail={failed} (fail means font can't render)")

    # 2) augment rotations into ImageFolder crops/&lt;class_id&gt;/
    made = 0
    skipped = 0
    for i in range(len(emojis)):
        tpath = tmpl_dir / f"{i}.png"
        if not tpath.exists() or tpath.stat().st_size == 0:
            skipped += 1
            continue

        class_dir = crops_dir / str(i)
        class_dir.mkdir(parents=True, exist_ok=True)

        base = Image.open(tpath).convert("RGBA")
        base = tight_crop_rgba(base)

        for k in range(args.per_emoji):
            ang = float(np.random.uniform(args.min_angle, args.max_angle))
            rot = base.rotate(ang, resample=Image.BICUBIC, expand=True, fillcolor=(255, 255, 255))
            rot = square_pad_white(rot)
            rot = rot.resize((args.img_size, args.img_size), Image.LANCZOS)

            out = class_dir / f"{i}_{k:04d}.png"
            atomic_save_png(rot, out)
            made += 1

        if (i + 1) % 250 == 0:
            print(f"  crops for {i+1}/{len(emojis)} (made={made}, skipped={skipped})")

    print(f"[+] dataset ready: {out_dir.resolve()}")
    print(f"    templates/: {rendered} files")
    print(f"    crops/: made={made} images, skipped classes={skipped}")


if __name__ == "__main__":
    main()</code></pre>

          <p>I ran this with the arguments:
          <code>python3 make_rot_dataset.py --emojis_txt emojis.txt --out_dir rot_dataset --per_emoji 25 --img_size 128 --render_px 160</code></p>

          <p>This code uses numpy, pillow, and pango-view to create a specified number of rotated emoji images to a specified output directory. I tried using pango-view at first because it has the ability to print images to the command line, but I found training the AI through user input would be far too slow and ended up just using it for rendering the emojis as pngs. Then I used Pillow to make those pngs into their rotated counterpart with the white background. I believe the intended solution was to use pillow entirely, but I found editing my earlier code to be faster than typing out new code.</p>

          <p>Something to note. I came across an issue where about 400 or so emojis were in emoji-list.txt but were not in the font file. I assumed they were not included in the generation and skipped them.</p>

          <hr />

          <p>Once I hade the training dataset, I tested a variety of training code. The one that did the best (and got me the flag) is below:</p>

          <pre><code class="language-python">#!/usr/bin/env python3
"""
train_emoji_model4.py

"""

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.utils.data import DataLoader, Subset, WeightedRandomSampler
from torchvision import transforms
from torchvision.datasets import ImageFolder
from torchvision.models import convnext_tiny, ConvNeXt_Tiny_Weights

try:
    from tqdm import tqdm
except Exception:
    tqdm = None


# parsing

def emoji_to_hex(emoji: str) -&gt; str:
    return "-".join(f"{ord(ch):X}" for ch in emoji)


def parse_emoji_test_meta(emojis_txt: Path, only_fully_qualified: bool = True):
    """
    Parse emoji-test.txt and return:
      meta[emoji] = {
        "codepoints": "1F1FA-1F1F8",
        "status": "fully-qualified",
        "group": "Flags",
        "subgroup": "country-flag",
        "name": "flag: United States"
      }
    """
    meta = {}
    group = None
    subgroup = None

    for raw in emojis_txt.read_text(encoding="utf-8", errors="ignore").splitlines():
        line = raw.strip()
        if not line:
            continue

        if line.startswith("# group:"):
            group = line.split(":", 1)[1].strip()
            continue
        if line.startswith("# subgroup:"):
            subgroup = line.split(":", 1)[1].strip()
            continue
        if line.startswith("#"):
            continue

        # Example line:
        # 1F1FA 1F1F8 ; fully-qualified # 🇺🇸 E2.0 flag: United States
        if "#" not in line or ";" not in line:
            continue

        left, right = line.split("#", 1)
        left = left.strip()
        right = right.strip()

        try:
            cps_part, status = left.split(";", 1)
            status = status.strip()
        except ValueError:
            continue

        if only_fully_qualified and status != "fully-qualified":
            continue

        cps = "-".join([c.strip().upper() for c in cps_part.strip().split() if c.strip()])
        toks = right.split()
        if not toks:
            continue
        emoji = toks[0]
        # toks[1] is "E?.?" version, rest is name
        name = " ".join(toks[2:]) if len(toks) &gt;= 3 else ""

        meta[emoji] = {
            "codepoints": cps,
            "status": status,
            "group": group or "",
            "subgroup": subgroup or "",
            "name": name,
        }

    return meta


def is_flag_emoji(meta_entry: dict) -&gt; bool:
    if not meta_entry:
        return False
    g = (meta_entry.get("group") or "").lower()
    sg = (meta_entry.get("subgroup") or "").lower()
    nm = (meta_entry.get("name") or "").lower()
    return ("flags" in g) or ("flag" in sg) or nm.startswith("flag:")


# ------------------------- template audit -------------------------

def img_hash64(path: Path) -&gt; str:
    """
    Robust-ish hash: decode image -&gt; RGB -&gt; resize -&gt; hash pixels.
    If multiple emojis render identically, they will collide here.
    """
    im = Image.open(path).convert("RGB").resize((64, 64), Image.BILINEAR)
    arr = np.asarray(im, dtype=np.uint8)
    return hashlib.sha1(arr.tobytes()).hexdigest()


def audit_templates(templates_dir: Path, labels: dict, meta: dict, max_print: int = 30):
    """
    Find template collisions (identical rendered image for different emoji IDs).
    """
    id_to_emoji = labels.get("id_to_emoji", {})
    buckets = defaultdict(list)

    for k_str, emoji in id_to_emoji.items():
        p = templates_dir / f"{k_str}.png"
        if not p.exists() or p.stat().st_size == 0:
            continue
        h = img_hash64(p)
        buckets[h].append(int(k_str))

    collisions = {h: ids for h, ids in buckets.items() if len(ids) &gt; 1}
    total_groups = len(collisions)
    total_ids = sum(len(v) for v in collisions.values())

    # collisions involving flags
    flag_groups = 0
    flag_ids = 0
    for ids in collisions.values():
        any_flag = False
        for i in ids:
            e = id_to_emoji.get(str(i), "")
            if is_flag_emoji(meta.get(e, {})):
                any_flag = True
                flag_ids += 1
        if any_flag:
            flag_groups += 1

    print(f"[audit] template collisions: groups={total_groups} total_ids_involved={total_ids}")
    print(f"[audit] collisions involving flags: groups={flag_groups} ids_involved={flag_ids}")

    if total_groups:
        print("[audit] showing up to", max_print, "collision groups:")
        shown = 0
        for h, ids in list(collisions.items())[:max_print]:
            ems = [id_to_emoji.get(str(i), "?") for i in ids]
            names = []
            for e in ems:
                m = meta.get(e, {})
                nm = m.get("name", "")
                names.append(nm[:60])
            print("  ids:", ids[:10], ("..." if len(ids) &gt; 10 else ""))
            print("   em:", ems[:10], ("..." if len(ems) &gt; 10 else ""))
            print(" name:", names[:3], ("..." if len(names) &gt; 3 else ""))
            shown += 1
            if shown &gt;= max_print:
                break

    # write report
    out = templates_dir.parent / "template_collisions.json"
    out.write_text(json.dumps(collisions, indent=2), encoding="utf-8")
    print("[audit] wrote:", out.resolve())


# EMA stuff

class ModelEMA:
    def __init__(self, model: nn.Module, decay: float = 0.999):
        self.decay = decay
        self.ema = self._clone_model(model)

    @staticmethod
    def _clone_model(model: nn.Module) -&gt; nn.Module:
        import copy
        ema = copy.deepcopy(model)
        for p in ema.parameters():
            p.requires_grad_(False)
        ema.eval()
        return ema

    @torch.no_grad()
    def update(self, model: nn.Module):
        d = self.decay
        msd = model.state_dict()
        esd = self.ema.state_dict()
        for k, v in esd.items():
            if k in msd:
                nv = msd[k].detach()
                if v.dtype.is_floating_point:
                    v.mul_(d).add_(nv, alpha=(1.0 - d))
                else:
                    v.copy_(nv)




@torch.no_grad()
def top1_acc(logits: torch.Tensor, y: torch.Tensor) -&gt; float:
    pred = logits.argmax(dim=1)
    return float((pred == y).float().mean().item())


def build_convnext(num_classes: int):
    weights = ConvNeXt_Tiny_Weights.DEFAULT
    model = convnext_tiny(weights=weights)
    # classifier: Sequential(..., Linear)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    mean, std = weights.transforms().mean, weights.transforms().std
    return model, mean, std


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset_dir", default="rot_dataset")
    ap.add_argument("--emojis_txt", default="emojis.txt")
    ap.add_argument("--epochs", type=int, default=25)
    ap.add_argument("--batch", type=int, default=96)
    ap.add_argument("--img_size", type=int, default=160)
    ap.add_argument("--lr", type=float, default=5e-4)
    ap.add_argument("--weight_decay", type=float, default=0.02)
    ap.add_argument("--val_frac", type=float, default=0.02)
    ap.add_argument("--label_smoothing", type=float, default=0.02)
    ap.add_argument("--num_workers", type=int, default=4)
    ap.add_argument("--seed", type=int, default=1337)
    ap.add_argument("--onnx_out", default="emoji_model.onnx")
    ap.add_argument("--ema_decay", type=float, default=0.999)
    ap.add_argument("--boost_flags", type=float, default=1.5, help="&gt;1 oversamples flag examples in training")
    ap.add_argument("--audit_templates", action="store_true")
    args = ap.parse_args()

    ds = Path(args.dataset_dir)
    crops_dir = ds / "crops"
    labels_path = ds / "labels.json"
    templates_dir = ds / "templates"

    if not crops_dir.exists() or not labels_path.exists():
        raise SystemExit("dataset_dir must contain crops/ and labels.json (run make_rot_dataset.py).")

    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    meta = parse_emoji_test_meta(Path(args.emojis_txt), only_fully_qualified=True)

    # Verify codepoint formatting for FLAGS specifically
    id_to_emoji = labels.get("id_to_emoji", {})
    flag_mismatch = 0
    flag_total = 0
    for _, e in id_to_emoji.items():
        m = meta.get(e, {})
        if not is_flag_emoji(m):
            continue
        flag_total += 1
        exp = (m.get("codepoints") or "").upper()
        got = emoji_to_hex(e).upper()
        if exp and got != exp:
            flag_mismatch += 1
    print(f"[flags] emoji_to_hex vs emoji-test: mismatches={flag_mismatch}/{flag_total}")

    if args.audit_templates and templates_dir.exists():
        audit_templates(templates_dir, labels, meta)

    # Build datasets
    # Augmentations: keep them realistic
    # - Rotation 360 w/ white fill
    # - RandomResizedCrop to simulate crop/jitter differences from grid-splitting (im not perfect lol)
    # - tiny blur sometimes 
    model_tmp, mean, std = build_convnext(num_classes=1)
    del model_tmp

    train_tf = transforms.Compose([
        transforms.Resize((args.img_size, args.img_size)),
        transforms.RandomRotation(degrees=360, fill=(255, 255, 255)),
        transforms.RandomResizedCrop(
            args.img_size,
            scale=(0.80, 1.00),
            ratio=(0.92, 1.08),
            antialias=True,
        ),
        transforms.RandomApply([transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.0))], p=0.10),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    val_tf = transforms.Compose([
        transforms.Resize((args.img_size, args.img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=mean, std=std),
    ])

    base_train = ImageFolder(root=str(crops_dir), transform=train_tf)
    base_val = ImageFolder(root=str(crops_dir), transform=val_tf)

    num_classes = len(base_train.classes)
    n = len(base_train)
    val_n = max(1, int(n * args.val_frac))
    train_n = n - val_n

    print("Classes:", num_classes)
    print(f"Total images: {n} | train: {train_n} | val: {val_n}")

    # model class_index -&gt; emoji
    idx_to_emoji = {}
    for folder_name, class_index in base_train.class_to_idx.items():
        em = labels["id_to_emoji"].get(str(folder_name))
        if em is not None:
            idx_to_emoji[str(class_index)] = em

    (ds / "class_index_to_emoji.json").write_text(
        json.dumps(idx_to_emoji, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("[+] wrote mapping:", (ds / "class_index_to_emoji.json").resolve())

    # Identify flag class indices
    flag_class_idxs = set()
    for class_index_str, emoji in idx_to_emoji.items():
        m = meta.get(emoji, {})
        if is_flag_emoji(m):
            flag_class_idxs.add(int(class_index_str))
    print(f"[flags] classes flagged as flags: {len(flag_class_idxs)}")

    # Split indices deterministically
    g = torch.Generator().manual_seed(args.seed)
    perm = torch.randperm(n, generator=g).tolist()
    val_idx = perm[:val_n]
    train_idx = perm[val_n:]

    train_ds = Subset(base_train, train_idx)
    val_ds = Subset(base_val, val_idx)

    # Weighted sampling to emphasize flags
    sampler = None
    if args.boost_flags and args.boost_flags &gt; 1.0:
        # base_train.samples[i] = (path, class_idx)
        weights = []
        for i in train_idx:
            _, y = base_train.samples[i]
            w = float(args.boost_flags) if y in flag_class_idxs else 1.0
            weights.append(w)
        sampler = WeightedRandomSampler(weights=weights, num_samples=len(weights), replacement=True)
        print(f"[flags] using WeightedRandomSampler boost_flags={args.boost_flags}")

    train_loader = DataLoader(
        train_ds,
        batch_size=args.batch,
        shuffle=(sampler is None),
        sampler=sampler,
        num_workers=args.num_workers,
        pin_memory=True,
        persistent_workers=(args.num_workers &gt; 0),
        drop_last=True,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=args.batch,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=True,
        persistent_workers=(args.num_workers &gt; 0),
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Device:", device)
    if device.type == "cuda":
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.backends.cudnn.allow_tf32 = True
        try:
            torch.set_float32_matmul_precision("high")
        except Exception:
            pass

    model, _, _ = build_convnext(num_classes=num_classes)
    model.to(device)
    ema = ModelEMA(model, decay=args.ema_decay)

    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    loss_fn = nn.CrossEntropyLoss(label_smoothing=args.label_smoothing)

    # OneCycleLR tends to work well with AdamW for this kind of classification
    steps_per_epoch = len(train_loader)
    sched = torch.optim.lr_scheduler.OneCycleLR(
        opt,
        max_lr=args.lr,
        epochs=args.epochs,
        steps_per_epoch=steps_per_epoch,
        pct_start=0.10,
        div_factor=10.0,
        final_div_factor=100.0,
    )

    scaler = torch.amp.GradScaler("cuda", enabled=(device.type == "cuda"))

    # fast flag mask lookup: is_flag[class_idx] = 1
    is_flag = np.zeros((num_classes,), dtype=np.uint8)
    for k in flag_class_idxs:
        if 0 &lt;= k &lt; num_classes:
            is_flag[k] = 1

    best_val = 0.0
    best_path = ds / f"best_convnext_{args.img_size}.pt"

    for epoch in range(1, args.epochs + 1):
        model.train()
        total = correct = 0
        total_loss = 0.0

        it = train_loader
        if tqdm is not None:
            it = tqdm(train_loader, desc=f"Epoch {epoch:02d}/{args.epochs}", dynamic_ncols=True)

        for x, y in it:
            x = x.to(device, non_blocking=True)
            y = y.to(device, non_blocking=True)

            opt.zero_grad(set_to_none=True)
            with torch.amp.autocast("cuda", enabled=(device.type == "cuda")):
                logits = model(x)
                loss = loss_fn(logits, y)

            scaler.scale(loss).backward()
            scaler.step(opt)
            scaler.update()
            sched.step()

            ema.update(model)

            bs = x.size(0)
            total_loss += float(loss.item()) * bs
            pred = logits.argmax(dim=1)
            correct += int((pred == y).sum().item())
            total += bs

            if tqdm is not None:
                it.set_postfix(
                    loss=f"{total_loss/max(1,total):.4f}",
                    acc=f"{correct/max(1,total):.4f}",
                    lr=f"{opt.param_groups[0]['lr']:.2e}",
                )

        train_acc = correct / max(1, total)
        train_loss = total_loss / max(1, total)

        # Validate with EMA weights
        ema.ema.to(device)
        ema.ema.eval()

        vtotal = vcorrect = 0
        vflag_total = vflag_correct = 0
        vnon_total = vnon_correct = 0

        is_flag_t = torch.from_numpy(is_flag).to(device)

        with torch.no_grad():
            for x, y in val_loader:
                x = x.to(device, non_blocking=True)
                y = y.to(device, non_blocking=True)

                logits = ema.ema(x)
                pred = logits.argmax(dim=1)
                ok = (pred == y)

                vtotal += y.numel()
                vcorrect += int(ok.sum().item())

                mask_flag = is_flag_t[y].bool()
                if mask_flag.any():
                    vflag_total += int(mask_flag.sum().item())
                    vflag_correct += int(ok[mask_flag].sum().item())

                mask_non = ~mask_flag
                if mask_non.any():
                    vnon_total += int(mask_non.sum().item())
                    vnon_correct += int(ok[mask_non].sum().item())

        val_acc = vcorrect / max(1, vtotal)
        flag_acc = vflag_correct / max(1, vflag_total) if vflag_total else 0.0
        non_acc = vnon_correct / max(1, vnon_total) if vnon_total else 0.0

        print(
            f"Epoch {epoch:02d} | train_loss={train_loss:.4f} train_acc={train_acc:.4f} "
            f"| val_acc={val_acc:.4f} flags_acc={flag_acc:.4f} nonflags_acc={non_acc:.4f}"
        )

        if val_acc &gt;= best_val + 1e-6:
            best_val = val_acc
            torch.save(ema.ema.state_dict(), best_path)

    print("Best val_acc:", best_val)
    print("Saved:", best_path)

    # export
    cpu_model, _, _ = build_convnext(num_classes=num_classes)
    cpu_model.load_state_dict(torch.load(best_path, map_location="cpu"))
    cpu_model.eval()
    cpu_model.to("cpu")

    dummy = torch.randn(8, 3, args.img_size, args.img_size, device="cpu")
    torch.onnx.export(
        cpu_model,
        dummy,
        args.onnx_out,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
        do_constant_folding=True,
        dynamo=False,
    )
    print("Exported ONNX:", Path(args.onnx_out).resolve())


if __name__ == "__main__":
    main()</code></pre>

          <p>I ran this with
          <code>python3 train_emoji_model4.py 
  --dataset_dir rot_dataset 
  --emojis_txt emojis.txt 
  --img_size 160 
  --epochs 25 
  --batch 96 
  --lr 5e-4 
  --val_frac 0.02 
  --label_smoothing 0.02 
  --boost_flags 1.5 
  --audit_templates 
  --onnx_out emoji_model.onnx</code></p>

          <p>This code uses numpy, pillow, mainly pytorch, and torchvision to train the AI in an optimal way. I tested 4 other torchvision packages but this one specifically seemed to perform the best.</p>

          <p>To put it simply, it trains the AI and stores the weights in the emoji_model.onnx file. More complicatedly, it also tracks an Exponential Moving Average of the weights to further adjust during the training process. If you are more curious, look at the code lol.</p>

          <p>The astute of you who read the code might have noticed I got a little paranoid with the flags. When I tested the AI model against the test image, it sometimes got the flag wrong, so I added a little more weight to flag chances. Not sure if it made much of a difference with this torchvision package.</p>

          <hr />

          <p>Lastly, we need a way to take in base64 images and output the unicode answer after the <code>&gt;&gt;&gt;</code> line. </p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/format.png" alt="Input Format" width="800">

          <p>To do this, I used this code:</p>

          <p><strong>export_onyx_legacy.py:</strong></p>
          <pre><code class="language-python">#!/usr/bin/env python3
import argparse
from pathlib import Path

import torch
from torch import nn
from torchvision.models import mobilenet_v3_small, MobileNet_V3_Small_Weights
from torchvision.datasets import ImageFolder


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset_dir", default="rot_dataset")
    ap.add_argument("--weights", default="rot_dataset/best.pt")
    ap.add_argument("--out", default="emoji_model.onnx")
    ap.add_argument("--img_size", type=int, default=128)
    args = ap.parse_args()

    ds = Path(args.dataset_dir)
    crops_dir = ds / "crops"

    full = ImageFolder(root=str(crops_dir))
    num_classes = len(full.classes)
    print("num_classes:", num_classes)

    weights = MobileNet_V3_Small_Weights.DEFAULT
    model = mobilenet_v3_small(weights=weights)
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, num_classes)
    model.load_state_dict(torch.load(args.weights, map_location="cpu"))
    model.eval()

    dummy = torch.randn(8, 3, args.img_size, args.img_size, device="cpu")
    torch.onnx.export(
        model,
        dummy,
        args.out,
        input_names=["input"],
        output_names=["logits"],
        dynamic_axes={"input": {0: "batch"}, "logits": {0: "batch"}},
        opset_version=17,
        do_constant_folding=True,
        dynamo=False,  # legacy exporter
    )
    print("wrote:", Path(args.out).resolve())


if __name__ == "__main__":
    main()</code></pre>

          <p>This code uses torch and torchvision to load the model and run it. This is what I used in my solve.py below to actually communicate with the AI. Its really quite simple, and a quick read might make understanding torchvision make more sense.</p>

          <p><strong>solve.py:</strong></p>
          <pre><code class="language-python">#!/usr/bin/env python3
import argparse
import base64
import json
import random
import re
import socket
import time
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image
import onnxruntime as ort

# Menu prompt: lines ending with "&gt;"
MENU_PROMPT_RE = re.compile(rb"(?:\n|^)\s*&gt;\s*$|&gt;\s*$", re.M)
CAPTCHA_MARKER_RE = re.compile(rb"Here is your CAPTCHA:\s*\n", re.I)

# Base64 cleaning (strip newlines etc.)
NON_B64_RE = re.compile(rb"[^A-Za-z0-9+/=]+")

# Imagenet normalization
IM_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 3, 1, 1)
IM_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 3, 1, 1)


def emoji_to_hex(emoji: str) -&gt; str:
    return "-".join(f"{ord(ch):X}" for ch in emoji)


def split_grid_tight_crops(
    img: Image.Image,
    rows: int = 2,
    cols: int = 4,
    bg_thresh: int = 245,
    pad_frac: float = 0.08,
    out_size: int = 128,
):
    img = img.convert("RGB")
    W, H = img.size
    cell_w = W / cols
    cell_h = H / rows
    arr = np.array(img)

    coords, crops = [], []
    for r in range(rows):
        for c in range(cols):
            x0 = int(round(c * cell_w))
            x1 = int(round((c + 1) * cell_w))
            y0 = int(round(r * cell_h))
            y1 = int(round((r + 1) * cell_h))
            cell = arr[y0:y1, x0:x1]

            mask = np.any(cell &lt; bg_thresh, axis=2)
            if mask.any():
                ys, xs = np.where(mask)
                bx0, bx1 = xs.min(), xs.max() + 1
                by0, by1 = ys.min(), ys.max() + 1
            else:
                bx0, by0, bx1, by1 = 0, 0, cell.shape[1], cell.shape[0]

            bw, bh = bx1 - bx0, by1 - by0
            pad = int(round(max(bw, bh) * pad_frac))
            bx0 = max(0, bx0 - pad)
            by0 = max(0, by0 - pad)
            bx1 = min(cell.shape[1], bx1 + pad)
            by1 = min(cell.shape[0], by1 + pad)

            crop = cell[by0:by1, bx0:bx1]

            h, w = crop.shape[:2]
            side = max(h, w)
            top = (side - h) // 2
            bottom = side - h - top
            left = (side - w) // 2
            right = side - w - left
            crop_sq = np.pad(crop, ((top, bottom), (left, right), (0, 0)), constant_values=255)

            crop_img = Image.fromarray(crop_sq).resize((out_size, out_size), Image.LANCZOS)
            coords.append((r, c))
            crops.append(crop_img)

    return coords, crops


def pil_list_to_batch(imgs, img_size: int) -&gt; np.ndarray:
    arrs = []
    for im in imgs:
        if im.size != (img_size, img_size):
            im = im.resize((img_size, img_size), Image.LANCZOS)
        a = np.asarray(im, dtype=np.float32) / 255.0
        a = np.transpose(a, (2, 0, 1))
        arrs.append(a)
    x = np.stack(arrs, axis=0).astype(np.float32)
    x = (x - IM_MEAN) / IM_STD
    return x


class EmojiModel:
    def __init__(
        self,
        onnx_path: str,
        mapping_path: str,
        use_cuda: bool = False,
        img_size: int = 128,
        vote_angles=(0.0, 90.0, 180.0, 270.0),
    ):
        self.mapping = json.loads(Path(mapping_path).read_text(encoding="utf-8"))
        self.img_size = img_size
        self.vote_angles = tuple(float(a) for a in vote_angles)

        providers = ["CPUExecutionProvider"]
        if use_cuda:
            providers = ["CUDAExecutionProvider", "CPUExecutionProvider"]

        so = ort.SessionOptions()
        so.intra_op_num_threads = 0
        so.inter_op_num_threads = 0
        self.sess = ort.InferenceSession(onnx_path, sess_options=so, providers=providers)

        dummy = np.zeros((8, 3, img_size, img_size), dtype=np.float32)
        _ = self.sess.run(["logits"], {"input": dummy})

    def _predict_logits(self, crops: list[Image.Image]) -&gt; np.ndarray:
        batch = pil_list_to_batch(crops, self.img_size)
        return self.sess.run(["logits"], {"input": batch})[0]

    def predict_emojis(self, img: Image.Image) -&gt; list[str]:
        coords, crops = split_grid_tight_crops(img, rows=2, cols=4, out_size=self.img_size)

        if len(self.vote_angles) &lt;= 1:
            logits = self._predict_logits(crops)
            pred = logits.argmax(axis=1).tolist()
        else:
            aug = []
            for crop in crops:
                for ang in self.vote_angles:
                    if ang % 360 == 0:
                        aug.append(crop)
                    else:
                        aug.append(crop.rotate(ang, resample=Image.BICUBIC, expand=False, fillcolor=(255, 255, 255)))

            logits_all = self._predict_logits(aug)
            n = len(crops)
            v = len(self.vote_angles)
            logits_all = logits_all.reshape(n, v, -1).mean(axis=1)
            pred = logits_all.argmax(axis=1).tolist()

        out = []
        for (r, c), k in zip(coords, pred):
            out.append((r, c, self.mapping.get(str(int(k)), "?")))
        out.sort(key=lambda t: (t[0], t[1]))
        return [e for _, _, e in out]


class StreamReader:
    """
    Raw-byte reader that logs EVERYTHING (including base64 blobs).
    """
    def __init__(self, sock: socket.socket, log_path: str, echo: bool = False):
        self.sock = sock
        self.buf = bytearray()
        self.echo = echo
        self.log_fp = open(log_path, "a", encoding="utf-8")

    def close(self):
        try:
            self.log_fp.close()
        except Exception:
            pass

    def _log_bytes(self, b: bytes):
        if not b:
            return
        s = b.decode("utf-8", errors="ignore")
        self.log_fp.write(s)
        self.log_fp.flush()
        if self.echo:
            print(s, end="")

    def _recv(self, timeout: float) -&gt; bytes:
        self.sock.settimeout(timeout)
        try:
            chunk = self.sock.recv(65536)
        except socket.timeout:
            return b""
        if not chunk:
            raise ConnectionError("Server closed connection.")
        return chunk

    def sendline(self, s: str):
        self.sock.sendall((s + "\n").encode("utf-8"))

    def wait_for(self, pattern: re.Pattern, overall_timeout: float):
        """
        Wait until pattern matches current buffer; log all received bytes.
        """
        deadline = time.time() + overall_timeout
        while True:
            if pattern.search(self.buf):
                return
            if time.time() &gt; deadline:
                raise TimeoutError("Timed out waiting for server output.")
            chunk = self._recv(0.5)
            if chunk:
                self.buf.extend(chunk)
                self._log_bytes(chunk)

    def wait_for_captcha_marker(self, overall_timeout: float):
        """
        Wait for marker and consume it; log everything (including any base64 in same recv).
        Leaves buffer starting right after the marker line (base64 begins).
        """
        deadline = time.time() + overall_timeout
        while True:
            m = CAPTCHA_MARKER_RE.search(self.buf)
            if m:
                self.buf = self.buf[m.end():]
                return
            if time.time() &gt; deadline:
                raise TimeoutError("Timed out waiting for CAPTCHA marker.")
            chunk = self._recv(0.5)
            if chunk:
                self.buf.extend(chunk)
                self._log_bytes(chunk)

    def read_base64_until_prompt_stream(self, overall_timeout: float) -&gt; str:
        """
        Read bytes until we see '&gt;&gt;&gt;'. LOGS EVERYTHING while reading.
        Returns cleaned base64.
        """
        deadline = time.time() + overall_timeout
        raw = bytearray()

        if self.buf:
            raw.extend(self.buf)
            self.buf.clear()

        while True:
            idx = raw.find(b"&gt;&gt;&gt;")
            if idx != -1:
                b64_block = bytes(raw[:idx])
                leftover = raw[idx + 3:]

                while leftover and leftover[0] in b" \r\n\t":
                    leftover = leftover[1:]
                self.buf.extend(leftover)

                b64_clean = NON_B64_RE.sub(b"", b64_block)
                if not b64_clean:
                    raise ValueError("Empty/invalid base64 CAPTCHA.")
                return b64_clean.decode("ascii", errors="ignore")

            if time.time() &gt; deadline:
                raise TimeoutError("Timed out waiting for CAPTCHA base64/prompt.")

            chunk = self._recv(0.5)
            if chunk:
                raw.extend(chunk)
                self._log_bytes(chunk)

    def drain_until_idle(self, idle_timeout: float = 2.0, max_total: float = 15.0):
        """
        After last answer, keep reading/logging until no data arrives for idle_timeout,
        or until max_total is reached. This captures the FLAG text.
        """
        end_total = time.time() + max_total
        end_idle = time.time() + idle_timeout
        while time.time() &lt; end_total and time.time() &lt; end_idle:
            try:
                chunk = self._recv(0.5)
            except ConnectionError:
                return
            if chunk:
                self.buf.extend(chunk)
                self._log_bytes(chunk)
                end_idle = time.time() + idle_timeout


def connect(host: str, port: int) -&gt; socket.socket:
    s = socket.create_connection((host, port), timeout=10.0)
    try:
        s.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
    except Exception:
        pass
    return s


def parse_angles(s: str):
    if not s.strip():
        return (0.0,)
    out = []
    for tok in s.split(","):
        tok = tok.strip()
        if tok:
            out.append(float(tok))
    return tuple(out) if out else (0.0,)


def run_one_session(args, model: EmojiModel) -&gt; bool:
    sock = None
    reader = None
    try:
        sock = connect(args.host, args.port)
        reader = StreamReader(sock, args.log, echo=args.echo)

        reader.wait_for(MENU_PROMPT_RE, overall_timeout=args.menu_timeout)
        reader.buf.clear()
        reader.sendline("2")

        for _round in range(1, args.rounds + 1):
            reader.wait_for_captcha_marker(overall_timeout=args.menu_timeout)
            b64 = reader.read_base64_until_prompt_stream(overall_timeout=args.b64_timeout)

            png_bytes = base64.b64decode(b64)
            img = Image.open(BytesIO(png_bytes)).convert("RGB")

            emojis = model.predict_emojis(img)
            answer = " ".join(emoji_to_hex(e) for e in emojis)
            reader.sendline(answer)

        # IMPORTANT: after the final answer, read the remaining server output (FLAG etc.). I forgot this on one of my winning attempts :( had to win all over again.
        reader.drain_until_idle(idle_timeout=2.0, max_total=20.0)
        return True

    except (ConnectionResetError, ConnectionError, TimeoutError, OSError, ValueError) as e:
        msg = f"\n[!] Session error: {type(e).__name__}: {e}\n"
        if reader:
            reader._log_bytes(msg.encode("utf-8"))
        else:
            print(msg, end="")
        return False

    finally:
        if reader:
            reader.close()
        if sock:
            try:
                sock.close()
            except Exception:
                pass


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="emoji.challs.srdnlen.it")
    ap.add_argument("--port", type=int, default=1717)
    ap.add_argument("--onnx", default="emoji_model.onnx")
    ap.add_argument("--mapping", default="rot_dataset/class_index_to_emoji.json")
    ap.add_argument("--cuda", action="store_true")
    ap.add_argument("--img_size", type=int, default=128)

    ap.add_argument("--vote_angles", default="0,90,180,270",
                    help="comma-separated angles for rotation voting; use '0' to disable voting")
    ap.add_argument("--rounds", type=int, default=100)

    ap.add_argument("--log", default="server.log")
    ap.add_argument("--echo", action="store_true")
    ap.add_argument("--max_retries", type=int, default=20)

    ap.add_argument("--menu_timeout", type=float, default=60.0)
    ap.add_argument("--b64_timeout", type=float, default=30.0)
    args = ap.parse_args()

    angles = parse_angles(args.vote_angles)

    model = EmojiModel(
        args.onnx,
        args.mapping,
        use_cuda=args.cuda,
        img_size=args.img_size,
        vote_angles=angles,
    )

    backoff = 2.0
    for attempt in range(1, args.max_retries + 1):
        ok = run_one_session(args, model)
        if ok:
            print("\n[+] Completed rounds. Check server.log for the flag.")
            return
        sleep_for = backoff + random.uniform(0, 0.5)
        print(f"[!] Reconnecting (attempt {attempt}/{args.max_retries}) after {sleep_for:.2f}s...")
        time.sleep(sleep_for)
        backoff = min(20.0, backoff * 1.5)

    print("[!] Gave up after too many retries.")


if __name__ == "__main__":
    main()</code></pre>

          <p>This code is run by <code>python3 solve.py --echo</code></p>

          <p>I should note that just because you have the same files as me and run the same commands as me does not mean you will 100% get the flag. If you fail, try retraining the AI with better epocs.</p>

          <p>This solve.py uses numpy, pillow, the onnx python file mentioned above, and onnxruntime to connect to the server, send 2, read base64, split the image into 8 chunks (1 emoji per chunk), submit the chunks to the AI model, convert the AI model's output to the input the server is looking for, and repeat 100 times. It also reconnects when it fails since its not going to win every round.  This is a huge simplification of what really is going on, but thats the main gist. If you are curious, read the code... I tried to comment the files myself. </p>

          <p>after running solve.py, it took a couple minutes but I do get successful run as seen here:</p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/flag.png" alt="The Flag!" width="800">

          <p>Flag: <code>srdnlen{0P3nCV_1S_f4St3R_tH4n_Y0uR_3y3S_36E19205F8AFDE9D}</code></p>

          <img class="writeup-img" src="/images/writeups/Emoji_CAPTCHA/firstblood.png" alt="First Blood message" width="800">
        `,
            },

            {
                id: "eye_on_the_sky",
                title: "Eye on the Sky",
                subtitle: "BKCTF 2026 · Finding a flight and a trail with only a picture of a far away fogged mountain",
                difficulty: "hard",
                category: "osint",
                catColor: "#88d5f9", //light blue for osint
                body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">osint</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~3 hours.
          </p>

          <p class="desc-label"><strong>Descriptions:</strong></p>
          <p class="desc-label">Part 1:</p>
          <blockquote class="desc-area">
            <p>
            Flag format is the flight number (as marketed by the operating airline) (w/ no spaces), followed by ‘-‘, followed by the baggage carousel number. example : <code>bkctf{DL2949-12C4}</code><br>
            can you dedeuce where this photo was taken?</p>
          </blockquote>

          <p class="desc-label">Part 2:</p>
          <blockquote class="desc-area">
            <p>
            Flag format is the name of the location the image was taken from (ie the location of the photographer). All lower case, remove spaces. Example: <code>bkctf{goldengatebridge}</code></p>
          </blockquote>

          <hr />

          <p>For these challenges, it is easier to start with part 2, then solve part 1. For each challenge, we are given an image (very similar but different between challenges) depicting a mountain from far away.</p>

          <p>I'll start by explaining how I found the location for part 2.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/chall2.jpg" alt="Challenge 1 Image" width="500">

          <p>From several google sources and AI overviews, it is easy to conclude that the mountain in this image is Mount Rainier.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/google.png" alt="Mount Rainier" width="800">

          <p>Although every source I went to said this was Mount Rainier, I double checked in Google earth. It's also good to note that bkctf was hosted in Washington, so this mountain had a higher liklihood of being the one in the image.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/googleearth1.png" alt="Mount Rainier" width="800">

          <p>Now that we know this picture is of Mount Rainier, we need to find the locate where this image was taken from. Going back to google earth, if you look at this mountain from the north, you get the same lows and highs as seen from the picture:</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/googleearth2.png" alt="Mount Rainier" width="800">

          <p>After fiddling around in google earth a bit more, I was acurately able to find the approximate location the image was taken from.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/googleearth3.png" alt="Location" width="800">
          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/googleearth4.png" alt="Comparison" width="800">

          <p>After taking this longitude and latitude and plugging it into google maps, the closest location to my google earth coordinates was "Poo Poo Point". Thus, the flag I submitted (and the one that was right) was <code>bkctf{poopoopoint}</code></p>

          <hr />

          <p>Now that we have the location of part 2, we can be more accurate in our flight decision for part 1.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/chall1.jpg" alt="Challenge 1 Image" width="500">

          <p>The metadata of this image reveals when this photo was taken:</p>

          <p><code>Create Date: 2026:01:19 09:18:43</code></p>

          <p>Since this photo was taken from the west coast of the US, this time is given in PST. By adding 8 hours we get 17.18.43 UTC. By going to https://globe.adsbexchange.com, you can view all recent flights for free without a trial. By clicking the bottom replay button and plugging in the time 17:18:40 UTC (image is from a little after so we can see its path), we find no planes directly on top of poo poo point, but there was a plane really close to it and on route to get even closer.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/map.png" alt="The Plane" width="500">

          <p>If we assume that this is our plane, we need to now form the flag. As a reminder, the flag is made up of both the flight number and baggage carousel number of the given flight. To find this information, we need to gather information about the flight. On adsbexchange, we can gather this information:</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/plane.png" alt="Plane Information" width="500">

          <p>We now know the ICAO flight identifier is ASA265. A quick google search shows that the code for the flight number is the AITA airline code + flight number. Since ASA is the ICAO code for Alaska Airlines, and 265 is the flight code, we get the flight number of <code>AS265</code>.</p>

          <p>We can then plug this information into Alaska Airline's check flight status portal at https://www.alaskaair.com/flightstatus to get the baggage claim carousel. Because Alaska Airlines only stores flight status for the current and previous day, we can use the Wayback Machine to look for archives of the flight. Conviniently, there is an archive of the day we are looking for.</p>

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/wayback.png" alt="Plane Information" width="500">

          <img class="writeup-img" src="/images/writeups/Eye_on_the_Sky/alaska.png" alt="Plane Information" width="500">

          <p>From there, we see the Carousel number is 23T2.</p>

          <p>This gives us the completed flag:
          <code>bkctf{AS265-23T2}</code></p>
        `,
            },

            {
                id: "kaizo_brackeys",
                title: "Kaizo Brackeys",
                subtitle: "LITCTF 2025 · Hacking a unity game to reveal hidden scenes and assets",
                difficulty: "medium",
                category: "rev",
                catColor: "#9ca3af", // gray
                body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~2-3 hours.
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>only real ones copied those amazing tutorials</p>
            <p>Note: the flag matches this regex: <code>^LITCTF\\{[A-Z]+(?:_[A-Z]+)*\\}$</code></p>
          </blockquote>

          <hr />

          <p>For this flag, we are given the game files for a game called Kaizo Brackeys. Going through the directories, we can see that there is a file called UnityCrashHandler.exe. This tells us that this game was made with Unity. My first idea was to just run the Kaizo Brackeys.exe file. Running it brings up a menu where you can start the game.</p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_menu.png" alt="Kaizo Brackeys Menu" width="800">

          <p>Upon starting the game, you are placed into a game where you must avoid obstacles in order to reach the end. </p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_game.png" alt="Kaizo Brackeys Running" width="800">

          <p>The first level is completable by going to the right. Once a level has been beaten, this screen comes up.</p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_complete.png" alt="Kaizo Brackeys Level Change" width="800">

          <p>We are then brought to the next level, which is impractical to beat without cheats. Doing all of this helps us understand how this game works. If you reach the end of a level, you are brought to the next level. With this in mind, it is viable (<em>but not true, more on that later</em>) to believe that once we beat the game, we get the flag.</p>

          <p>Now to the actual rev part of the problem. We need some way to either let us see what you see when you win, or we need to to make it so getting past levels is a lot easier. A quick google search will tell us that there is no point looking/editing the actual .exe file, because that file only contains information about Unity's compiler. With another google search, we can find out that scripts that the .exe file reads can be found in the <code>_data/Managed/Assembly-CSharp.dll file</code>. To read/edit dll files, I like using a neat tool called DnSpy (http://dnspy.org/).</p>

          <p>To get to the scripts, open up DnSpy and go to <code>File</code> &gt;&gt; <code>Open</code> and then select the <code>Assembly-CSharp.dll</code> in <code>kaizobrackeys-export\\kaizobrackeys-export\\x86-64\\Kaizo Brackeys_Data\\Managed</code>. Once you open this file up, open up the file tree for <code>Assembly-CSharp/Assembly-CSharp.dll</code>. You should see a bunch of files like "PE", "Type References", and "References". If you want to know more about what each of these files hold, google.com. For our purposes, we want to open the "_" folder. In there, we can see a whole bunch of scripts that were written specifically for the game. None of these scripts are very long, so I highly suggest you look through all of them and see how this game runs. For the purpose of beating the game, there are a couple names that stand out.</p>

          <p>Take a look at Credits, Level Complete, and Player Movement.</p>

          <p>In the Credits script, it seems just to be code for a button, and does not have much use to us.
In the Level Complete scipt, it simply tells Unity to go to the next scene. The game will crash if you try and load a scene that doesn't exist, so this is for the best for now.
The Player Movement script, we can see how the player input is recieved and used. This is the script that I edited first. Instead of moving forward at a constantly increasing speed, how about we change the script to allow for wasd movement and a key that moves the player up? This can be done either through googling commands or chatGPT. To edit these scripts, simply right click the Player Movement script and click <code>Edit Class</code>. Once you are done editing the file, hit the <code>compile</code> button on the bottom right. If you have any issues compiling, try to edit each function and class seperately. </p>

          <p>This is the script I used:</p>

          <pre><code class="language-csharp">using System;
using UnityEngine;

// Token: 0x02000009 RID: 9
public class PlayerMovement : MonoBehaviour
{
	// Token: 0x06000011 RID: 17 RVA: 0x0000327E File Offset: 0x0000147E
	private void Start()
	{
	}

	// Token: 0x06000012 RID: 18 RVA: 0x00003E0C File Offset: 0x0000200C
	private void FixedUpdate()
	{
		if (Input.GetKey("w"))
		{
			this.rb.AddForce(0f, 0f, this.forwardForce * Time.deltaTime);
		}
		if (Input.GetKey("s"))
		{
			this.rb.AddForce(0f, 0f, this.forwardForce * -1f * Time.deltaTime);
		}
		if (Input.GetKey("d"))
		{
			this.rb.AddForce(this.sidewaysForce * Time.deltaTime, 0f, 0f, ForceMode.VelocityChange);
		}
		if (Input.GetKey("a"))
		{
			this.rb.AddForce(-this.sidewaysForce * Time.deltaTime, 0f, 0f, ForceMode.VelocityChange);
		}
		if (Input.GetKey("q"))
		{
			if (!this.wHover)
			{
				this.wHover = true;
				this.wHoverBaseY = this.rb.position.y;
				Vector3 velocity = this.rb.velocity;
				velocity.y = 0f;
				this.rb.velocity = velocity;
				this.rb.useGravity = false;
			}
			float target = this.wHoverBaseY + this.wHoverHeight;
			Vector3 position = this.rb.position;
			position.y = Mathf.MoveTowards(position.y, target, this.wHoverSnapSpeed * Time.fixedDeltaTime);
			this.rb.MovePosition(position);
		}
		else if (this.wHover)
		{
			this.wHover = false;
			this.rb.useGravity = true;
		}
		if (this.rb.position.y &lt; -1f)
		{
			Object.FindAnyObjectByType&lt;GameManager&gt;().EndGame();
		}
	}

	// Token: 0x06000013 RID: 19 RVA: 0x00003280 File Offset: 0x00001480
	public PlayerMovement()
	{
		this.forwardForce = 4000f;
		this.sidewaysForce = 100f;
		base..ctor();
	}

	// Token: 0x04000008 RID: 8
	public Rigidbody rb;

	// Token: 0x04000009 RID: 9
	public float forwardForce;

	// Token: 0x0400000A RID: 10
	public float sidewaysForce;

	// Token: 0x0400000B RID: 11
	private bool wHover;

	// Token: 0x0400000C RID: 12
	private float wHoverBaseY;

	// Token: 0x0400000D RID: 13
	private float wHoverHeight = 3f;

	// Token: 0x0400000E RID: 14
	private float wHoverSnapSpeed = 10f;
}</code></pre>

          <p>This script lets you move around with wasd controls and lets you move up with q. Once you have compiled your script with no errors, save your file by going to <code>File</code> &gt;&gt; <code>Save Module...</code>. </p>

          <p>With that, you can now run the kaizo_brackeys.exe file again and breeze through all of the levels until you get to this screen: </p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_credits.png" alt="Kaizo Brackeys Menu" width="800">

          <p>By pressing the exit button, all that happens is the game closes. It seems our previous assumption of the flag being in the credits was wrong. Our best bet now is to find more information about the game, and a good way of doing that is through a software called <a href="https://assetripper.github.io/AssetRipper/articles/Downloads.html" target="_blank" rel="noopener">Asset Ripper</a>.</p>

          <p>Asset Ripper is built for gathering assets for a Unity .exe filespace and peicing them together to create a file that Unity can read again. To use it, run the AssetRipper.GUI.Free.exe file, then in the pop up open your Kaizo Brackeys_Data file through <code>File</code> &gt;&gt; <code>Open Folder</code>. Once that is done, you can immediately export it as a Unity Project by going to <code>Export</code>, Giving it a folder to print to (IT WILL REPLACE ALL FILES IN A FOLDER if it is not created in a new folder!), then clicking <code>Export Unity Project</code>.</p>

          <p>One you have the Unity project exported, you can open that file through <a href="https://unity.com/download" target="_blank" rel="noopener">Unity</a>.</p>

          <blockquote>
            <p>
I should note, Asset Ripper only gathers assets, so the full game will not be runnable at this current state. The reason we are doing this is to see files and file structure that is not included in the written scripts.</p>
          </blockquote>

          <p>Once I got the file open in Unity, The first thing I did was look for the credits scene to see if I was missing something. What I saw in the scenes file was interesting.</p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_scenes.png" alt="Kaizo Brackeys Scenes" width="800">

          <p>As I remembered, the game did not seem like it was 6 levels long. We can confirm this by looking at the scene list (<code>File</code> &gt;&gt; <code>Build Profiles</code>). From there, we can see that the scenes are organised as such:</p>

          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_scene_list.png" alt="Kaizo Brackeys Scene List" width="800">

          <p>As we can see, the credits scene is executed early, not allowing us to get to the last two scenes. If we go back to our DnSpy application, we can get around this by simply skipping the credits scene in the <code>LevelComplete</code> script we looked at earlier.</p>

          <pre><code class="language-csharp">using System;
using UnityEngine;
using UnityEngine.SceneManagement;

// Token: 0x02000006 RID: 6
public class LevelComplete : MonoBehaviour
{
	// Token: 0x0600000B RID: 11 RVA: 0x00003DB8 File Offset: 0x00001FB8
	public void LoadNextLevel()
	{
		int num = SceneManager.GetActiveScene().buildIndex;
		if (num + 1 == 5)
		{
			num++;
		}
		SceneManager.LoadScene(num + 1);
	}
}</code></pre>

          <p>Once we save this code, we can run the program, and it successfully skips the credits scene and lets us go on to level 5 and 6. Level 5 you can complete normally, but if you take a close look at Level 6's format, you can tell that after the only 2 block tall obstacle, it spells out the flag:</p>

          <p><em>View of the 2 block tall obstacle</em></p>
          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_flag_one.png" alt="Kaizo Brackeys Flag Block" width="800">

          <p><em>View of "LIT..." from the right.</em></p>
          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_flag_two.png" alt="Kaizo Brackeys Flag Part 1" width="800">

          <p><em>View of "LIT..." from above.</em></p>
          <img class="writeup-img" src="/images/writeups/Kaizo_Brackeys/kaizo_brackeys_flag_three.png" alt="Kaizo Brackeys Flag Part 2" width="800">

          <p>By slowly moving forward and writing down each character, you spell the flag:</p>

          <p><code>LITCTF{I_HAD_TOO_MUCH_FUN_MAKING_THIS}</code></p>
        `,
            },

            {
                id: "drippy_adventures",
                title: "Drippy Adventures",
                subtitle: "L3AK CTF 2026 · Further hacking a unity game for all it has to offer",
                difficulty: "hard",
                category: "rev",
                catColor: "#9ca3af",
                author: true,
                body: String.raw `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~2 hours.
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>Help Drip escape his predicament, and perhaps find some drip along the way!</p>
          </blockquote>
          <hr>
          <p>We start out given a unity game build folder. After unzipping and running the game, we find out that the player is caught within a fence, with two signs explaining the situation.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/controls_story.png" alt="Signs depicting the storyline and controls"></p>
          <p>Taking a quick look around reveals the seemingly large flag in the distance. Now we have our target.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flag1FromStart.png" alt="Large flag in the distance"></p>
          <p>First, it is important to note that all player made scripts are stored in <code>Drippy Adventures_Data/Managed/Assembly-CSharp.dll</code>. We can view and edit these with dnSpy.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/dnSpyfiles.png" alt="dnSpy file explorer"></p>
          <p>From here, we can see that the most important script file to us at the moment is the Player.cs file. It contains all scripting relating to the player and the player&#39;s generation. By finding the HandleMovement() method, we can change/add controls to the player, allowing us to do more things.</p>
          <p>For instance, looking into the flag3 variable (has nothing to do with a ctf flag, this means flag in the boolean sense), we note that it depicts what happens if the space bar is pressed and what happens if the &quot;coyoteTimer&quot; is greater than zero. With a little more looking into the logic, we can see that the coyoteTimer is the timer that tells how long a player has been in the air for before not being able to jump (there is a slight time allowed to jump after falling off an object). By removing this timer from the flag3 condition, we allow ourselves to jump midair. This is just one example of how to get to the next step, there are many ways of continuing, such as Cheat Engine (more on issues with that below), new buttons to hover in place, increasing the jump height, etc. I should note that for every change in dnSpy, you must save in the top left File drop down, then you must restart the game. </p>
          <p>The annoying bit with cheat engine is that you must run <code>this.controller.enabled = false;</code> beforehand. Why this is the case is explained further in the next few sections.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/scriptJumpLogicBefore.png" alt="flag3 jump before"></p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/scriptJumpLogicAfter.png" alt="flag3 jump after"></p>
          <p>After this change, we can jump midair.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flying.png" alt="flying"></p>
          <p>Once we get to our desired location, we find a hole with part of the flag.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flagPart1.png" alt="Flag Part 1"></p>
          <p>This gives us part of the flag, <code>L3AK</code>.</p>
          <p>At the bottom of the hole, we see a sign and some equipable drip.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/sign3.png" alt="Sign 3"></p>
          <p>Moving to these coordinates is simple in Unity c#. We can bind a new key to change our x, y, and z values to these positions with the following code added anywhere in HandleMovement():</p>
          <pre><code>if (current.gKey.wasPressedThisFrame)
          {
          	this.controller.enabled = false;
          	this.controller.transform.position = new Vector3(4027f, 92457f, 125f);
          	this.verticalVelocity = 0f;
          	this.controller.enabled = true;
          }
          </code></pre>
          <p>Note that this custom Player object uses Unity&#39;s CharacterController object, which disallows unnatural movements such as direct position changes. This type of object can be easily gotten around though by turning its enabled value to false. This is why cheat engine doesn&#39;t work at first.</p>
          <p>Restarting the game and pressing <code>g</code> does indeed teleport us to the location mentioned on the sign. We are brought to another desert with another part of the flag laid out, along with another sign and some collectable boots.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/teleportLocation.png" alt="Location Directly after teleporting"></p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flagPart2.png" alt="Flag Part 2"></p>
          <p>This gives us part of the flag, <code>{H4ck3r</code>.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/sign4.png" alt="Sign 4"></p>
          <p>To get to the next scene, we can add a new keybind for going to the next scene, and another one for teleporting us to the given coordinates. This could be done in the same keybind but for simplicity&#39;s sake I put them separate. You could also turn <code>this.controller.enabled = false</code> and use Cheat Engine to teleport to the right location. The following code brings you to the next scene:</p>
          <pre><code>if (current.vKey.wasPressedThisFrame)
          {
          	int currentScene = UnityEngine.SceneManagement.SceneManager.GetActiveScene().buildIndex;
          	int nextScene = currentScene + 1;
          	if (nextScene &lt; UnityEngine.SceneManagement.SceneManager.sceneCountInBuildSettings)
          	{
          	UnityEngine.SceneManagement.SceneManager.LoadSceneAsync(nextScene);
          	}
          }
          </code></pre>
          <p>To have it compile you will also need to add this import at the top:</p>
          <pre><code>using UnityEngine.SceneManagement;
          </code></pre>
          <p>You can replicate the same code from before to teleport to a different location using a different Vector3(x, y, z).</p>
          <p>Once at this new location, we find ourselves in a grass field. A little to the left, we can see a giant red X in the ground. From the hint in the last sign, we can deduce that the flag is below this X. To get there, we can either move around the terrain and then move under it, or just add another keybind to move under it. I will note again that I am only mentioning one or two possible paths to the flag, but there exist countless other ways to the flag. This challenge is flexible in that way.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/x.png" alt="X on the ground"></p>
          <p>In this case, I made a keybind to teleport the player 10 units beneath their current position. The code is below:</p>
          <pre><code>if (current.jKey.wasPressedThisFrame)
          {
              this.controller.enabled = false;
              base.transform.position = base.transform.position + 10*Vector3.down;
              this.verticalVelocity = 0f;
              this.controller.enabled = true;
          }
          </code></pre>
          <p>Note that Vector3.down is just a unit vector facing down.</p>
          <p>This reveals the flag alongside a new sign and a collectable bowtie.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flagPart3.png" alt="Flag Part 3"></p>
          <p>This gives us another part of the flag, <code>_0f_G4M35</code>.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/sign5.png" alt="Sign 5"></p>
          <p>We are told that the next flag fragment is at a specified coordinate in another scene. If we take a quick look at some of the other scenes (press <code>v</code> if you are following along), they all seem to look the same. There are multiple ways of finding the next flag fragment, but the path I would like to highlight here is file size. If we look at the Drippy Adventures_Data folder, we find all the scene files labeled level{Number}. We see that scenes 0 and 1 have an abnormal size (1944 KB and 618 KB respectively) While every other scene has either 329 KB or 18KB. This is with the exception of level176 with the abnormal size of 1115 KB. From this data, we can make a hierarchy of levels to check out first. Since level176 has the most abnormal size, we should check that level out first to see what is taking up all that space. Next, we should check out the 349 KB files to see why they have greater size. Lastly, if we have not found anything yet, we should check the nearly empty 18 KB levels one by one.</p>
          <p>To get to each particular scene, you can use the same function above using the same scene index as stated in the file naming convention. Unity auto names its scenes level{number} where the number is the index stored for that scene. This makes our code convenient for this step.</p>
          <pre><code>if (current.bKey.wasPressedThisFrame)
          {
          	SceneManager.LoadSceneAsync(176);
          }
          </code></pre>
          <p>Also remember to make another teleport hotkey to the new coordinates.</p>
          <p>Using this, we find our top priority scene is in fact the one that we wanted to look for. Teleporting to the given coordinates gives us two signs to read.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/ocean_story.png" alt="Signs at the given coordinates in level176"></p>
          <p>The first sign is just there to mess with the people who brute forced all 176 prior scenes before checking this one. The second sign gives us our next objective to get into the box below us. There are a couple ways to do this. You can remove the death code from Player.cs, you can remove the death plane in WaterDeathFogTrigger.cs or WaterDeathFogZone.cs, you could guess and check depths to teleport the player, etc. </p>
          <p>I simply removed all innards of the BeginDeath(Player) method from the WaterDeathFogZone.cs file, and that successfully removed the issue of dying underwater. Then, with a little bit of guess and check, I was able to adjust the <code>j</code> keybind to teleport me through the top wall of the underwater box.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/underwaterBox.png" alt="Underwater Box"></p>
          <p>With this method, I was able to get into the box and recover another part of the flag and 2 more signs.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flagPart4.png" alt="Part 4 of the Flag"></p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/underwaterBoxSigns.png" alt="Underwater Box Signs"></p>
          <p>This gives us another part of the flag, <code>_m45T3r_0F_</code>.</p>
          <p>The sign on the left reveals that the last part of the flag is &quot;in our hearts&quot;, i.e. is inside the player. As always, there are a lot of ways of getting to this flag, such as deleting the character model in Player.cs, or removing the scroll cap on the player&#39;s scroll wheel zoom. I opted for the latter. in HandleCameraZoom() in Player.cs, simply remove the</p>
          <pre><code>this.currentBehindZoomDistance = Mathf.Clamp(this.currentBehindZoomDistance, min, normalMaxCameraDistance);
          </code></pre>
          <p>line from either the BehindPlayer if statement or after both FirstPerson and BehindPlayer if statements (the in front of player camera section).</p>
          <p>Then you will need to allow a higher level of pitch for the camera. Simply remove all clamps in PlaceOrbitCamrea() and HandleCamera() and you should be good to go.</p>
          <p>Then load up the game again, go into either the front or back view, and zoom into the player to retrieve the last flag.</p>
          <p><img class="writeup-img" src="/images/writeups/Drippy_Adventures/flagPart5.png" alt="Part 5 of the Flag"></p>
          <p>This gives us the last part of the flag, <code>UNITY!!}</code>.</p>
          <p>That gives us a combined flag of <code>L3AK{H4ck3r_0f_G4M35_m45Ter_0F_UNITY!!}</code>.</p>
          
        `,
            },

            {
                id: "you_scanned_what_and_how",
                title: "You Scanned WHAT?!? and HOW?!?!?",
                subtitle: "L3AK CTF 2026 · Reconstructing CT scan data from projection measurements",
                difficulty: "hard",
                category: "forensics",
                catColor: "#3b82f6",
                author: true,
                body: String.raw `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">forensics</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~3-5 hours (for humans).
          </p>

          <p class="desc-label"><strong>Descriptions:</strong></p>
          <p class="desc-label">You Scanned WHAT?!?:</p>
          <blockquote class="desc-area">
            <p>My llm got excited and somehow brought me this weird file it took from my local hospital 🐕. It seems to be a scan of some sorts, can you figure out what it was of?</p>
          </blockquote>
          <p class="desc-label">You Scanned HOW?!?!?:</p>
          <blockquote class="desc-area">
            <p>My agent was so happy to see my earlier reaction, it proceeded to bring me this much larger file 🤷. Can you find out what it is?</p>
            <p>Note: This challenge is the revenge challenge for <code>You Scanned WHAT?!?</code>. It is suggested that you solve that one first.</p>
          </blockquote>
          <hr>
          <p>This writeup is split up for the two challenges, <code>You Scanned WHAT?!?</code> and it&#39;s revenge challenge <code>You Scanned HOW?!?!?</code>. First, lets go over the solution to the first challenge. </p>
          <p>For this challenge, we are given a single file named scan.sqlite.</p>
          <p>The first step of this challenge, which is arguably the hardest, is to deduce that this file is an xray scan. The scan file includes the following schema:</p>
          <pre><code>sqlite&gt; .schema
          CREATE TABLE projections (
                          angle_degrees INTEGER PRIMARY KEY,
                          detector_count INTEGER NOT NULL,
                          light_values TEXT NOT NULL
                      );
          sqlite&gt;
          </code></pre>
          <p>The <code>projections</code> table contains <code>angle_degrees</code>, <code>detector_count</code>, and <code>light_values</code>. angle_degrees refers to what angle the scan was taken from in relation to the object, detector_count specifies how many measurements were recorded at that angle, and light_values contains those measurements.</p>
          <p>Through google searches and research, you can deduce that these three variables closely resemble a 2D xray scan. This is due to having 180 degrees of angles of a scan, lots of something being detected, and storing the values of each detector at every angle. This might be a long shot, but moving forward you can confirm this.</p>
          <p>Xrays scans are taken when a number of xrays are shot out of one side of an object, and are detected at the other side of an object. These detectors record how much radiation gets through the object, thus how much of an obstacle the path the xray took was. Denser objects will block more radiation, and thus will show brighter on an xray scan.</p>
          <p>An important note in this scan is that not all angles have the same detector count. That means we are scanning something that isn&#39;t a circle. We can find the ratio of width to height of this shape by finding the detector_count of the scan at 0 and 90 degrees.</p>
          <pre><code>sqlite&gt; select detector_count From projections Where angle_degrees == 0;
          497
          sqlite&gt; select detector_count From projections Where angle_degrees == 90;
          215
          sqlite&gt;
          </code></pre>
          <p>Taking a broader look at the scan, we can tell that the detector_count increases as angle_degrees approaches 23, then decreases until 90, then follows the exact reversed increase/decrease as angle_degrees approaches 157, then 179.</p>
          <pre><code>sqlite&gt; select detector_count From projections Where angle_degrees == 91;
          225
          sqlite&gt; select detector_count From projections Where angle_degrees == 89;
          225
          sqlite&gt;
          </code></pre>
          <p>Graphing out the data can also help us deduce what kind of shape the canvas of this image is.</p>
          <p><img class="writeup-img" src="/images/writeups/You_Scanned_WHAT_and_HOW/graph.png" alt="Graph of angle_degrees and detector_count"></p>
          <p>As we can see, the detector_count is symmetrical around angle_degrees == 90. Now analyzing the rate of increase and decrease, through deductive reasoning, we can deduce that the object we are scanning is in the shape of a rectangle with a width to height ratio of 497:215. This can be concluded because the detector_count follows the formula for the bounding width of a rotated rectangle. This formula is below:</p>
          <p><code>|W*cos(angle)| + |H*sin(angle)| = approx_detector_count</code></p>
          <p>For a rectangle, the maximum width occurs at $\tan^{-1}(H/W)$. Using the proposed dimensions we found earlier at angle 0 and 90, we find the maximum width occurs at $\theta = \tan^{-1}(215/497) \approx 23.4^\circ$, which matches our graph exactly. Angles 0, 90, and as it approaches 180 make sense too, as those are equivalent to taking a side or top view of the rectangle, and thus have the same amount of detectors as their length.</p>
          <p>Now that we have concluded this xray scan is of a rectangular canvas, we can use formulas to generate an approximate image of what was scanned.</p>
          <p>A little google searching gives us something called the Inverse Radon transform. This algorithm puts all 180 light projection graphs (graphs of detector_count to their corresponding light_values value) together and computes the sum of all xray values that go through each pixel. It also filters to make the image a lot more defined but this is unnecessary for this challenge. This sum is greater on denser objects, since all xrays that go through these denser objects will return a greater change from the detector. Thus all light_values that follow an xray going through a dense object will return a high value. To the visual learners out there, a video that shows this well (and was the inspiration for this challenge) is below:</p>
          <p><a href="https://www.youtube.com/shorts/nE8W-HZR070">https://www.youtube.com/shorts/nE8W-HZR070</a></p>
          <p>The code for this is simpler than you might think. Since the xray is taken from angles circular to the center of the rectangular image, most online sources use pixel coordinates in relation to the center of the image. That gives us:</p>
          <p>x = c - (W-1)/2</p>
          <p>y = (H-1)/2 - r</p>
          <p>For our given image of size 497x215, this means our pixel x and y equations are:</p>
          <p>x = c - 248</p>
          <p>y = 107 - r</p>
          <p>This makes the center of the image at coordinates (0,0), and our boundaries at ($\pm$248,$\pm$107). </p>
          <p>Since the largest projection angle contains 543 detectors, we can use a sinogram, a 2D array of size 543 and center all light_values to this array for each angle per row.</p>
          <p>That just means that the starting pointer for this index for a given detector_count is (543 - detector_count)/2. For the example of a detector_count of 215 (at 90 degrees), the array is filled from (543 - 215)/2 = 164 to 164 + 215 = 378. All other positions are filled with 0.</p>
          <p>Once you have a full sinogram, create an empty 497x215 image to store the sum values. Start with 0 degrees as vertical, and add the values of the sinogram from left to right starting from the calculated offset value from the sinograph and add up until the offset starts again on the right. The below exampele image may help:</p>
          <p><img class="writeup-img" src="/images/writeups/You_Scanned_WHAT_and_HOW/sinogram_example.png" alt="Sinogram Example image"></p>
          <p>Doing this vertically and horizontally is simple, but doing this for angles can be a little bit more complicated. The below code is the calculation to find the sinogram x and y at any angle.</p>
          <pre><code>x = column - 248
          y = 107 - row
          
          distance_along_detector = x*cos(angle) + y*sin(angle)
          
          
          sinogram_position = 271 + distance_along_detector
          </code></pre>
          <p>Now that the logic is explained, take a look at my solve script below. Most of it is self explanatory or explained through the comments. It looks long but if you see what its doing, its not that complicated. A lot of it is just formatting taking everything from the SQLite database and turning it into a sinogram, which is quite simple. The logic from the code above can be seen in reconstruct(). </p>
          <pre><code>import sqlite3
          import math
          import json
          from numpy import *
          from pathlib import Path
          from PIL import Image
          
          #get the stuff from the db
          def loadProjections(db_path):
                  with sqlite3.connect(db_path) as connection:
                          rows = connection.execute(&quot;&quot;&quot;SELECT angle_degrees, detector_count, light_values FROM projections ORDER BY angle_degrees&quot;&quot;&quot;).fetchall()
                          projections = []
                          for angle_degrees, detector_count, light_values in rows:
                                  values = array(json.loads(light_values))
                                  projections.append((int(angle_degrees), values))
                  return projections
          
          #making the sinogram, explained in the previous readme
          def getSinogram(projections):
                  maximum_detector_count = max([len(values) for _, values in projections])
                  #blank sinogram array
                  sinogram = zeros((len(projections), maximum_detector_count))
                  #padding is the offset of 0s to get to the data in the center
                  for angle_index, (_, values) in enumerate(projections):
                          padding = maximum_detector_count - len(values)
                          start = padding // 2
                          end = start + len(values)
                          sinogram[angle_index, start:end] = values
          
                  return sinogram
          
          #sums up all lines that go through each pixel (most of the logic behind the chall)
          def getPixelData(sinogram, angles, width, height):
                  detector_count = sinogram.shape[1]
                  detector_center = (detector_count - 1) / 2.0
          
                  x = arange(width) - (width - 1) / 2.0
                  y = arange(height) - (height - 1) / 2.0
          
                  x_grid, y_grid = meshgrid(x, y) # every possible x and y
                  pixeldata = zeros((height, width))      # empty array to hold pixel sums
          
                  detector_indexes = arange(detector_count)
                  #big loop that does most of the logic w the sinogram
                  for projection, angle in zip(sinogram, angles):
                          angle_rad = math.radians(angle)
                          detector_pos = detector_center + x_grid * math.cos(angle_rad) + y_grid * math.sin(angle_rad)
          
                          newsum = interp(
                                  detector_pos.ravel(),
                                  detector_indexes,
                                  projection,
                                  left=0,
                                  right=0
                          ).reshape(height, width)
          
                          pixeldata += newsum
          
                  return pixeldata
          
          #converts reconstructed sum values into grayscale and saves it to output.png
          def save(pixeldata, outpath):
                  #since all of the values are added up you have to weight the highest value at 255 and lowest at 0 and weigh the rest inbetween. Also skips outliers 0 and 100 so the image isnt all just grey
                  low, high = percentile(pixeldata, [1.0, 99.0])
                  weighted = clip((pixeldata - low) / (high - low), 0.0, 1.0)
                  imagedata = rint(weighted * 255.0).astype(uint8)
          
                  Image.fromarray(imagedata).save(outpath)
          
          
          
          
          #most of this stuff is self explanatory tbh
          dir = Path(__file__).parent
          db = dir / &quot;scan.sqlite&quot;
          
          projections = loadProjections(db)
          #put stuff in a dict so its accessible by angle
          dict = {angle: values for angle, values in projections}
          imageWidth = len(dict[0]) #num of detectors at 0 is width as explained in the readme
          imageHeight = len(dict[90]) #num of detectors at 90 is height as explained in the readme
          angles = array([angle for angle, _ in projections])
          sinogram = getSinogram(projections)
          
          pixeldata = getPixelData(sinogram, angles, imageWidth, imageHeight)
          
          outpath = dir / &quot;output.png&quot;
          save(pixeldata, outpath)
          print(&quot;done&quot;)
          </code></pre>
          <p>The outputted <code>output.png</code> is below.</p>
          <p><img class="writeup-img" src="/images/writeups/You_Scanned_WHAT_and_HOW/output.png" alt="Output of solve code"></p>
          <p>Final flag: <code>L3AK{Xr4Y_C0mp1373!}</code></p>
          <p>Note: there are a bunch of methods and filters you can put on this output to make it more readable, but they weren&#39;t required for this challenge.</p>
          <p>Also, unknown to me, there was a <a href="https://github.com/scikit-image/scikit-image">github repo</a> out there that solves this challenge and includes filtering and all, so that&#39;s kinda cooked 💀. I guess I should have looked for something like that lol. Since there isn&#39;t any standard that I found for what direction the degrees should go, I decided to make the handout start with 0 degrees in the positive x direction, moving clockwise with every increase in degree. scikit also starts with 0 degrees in the positive x direction, but rotates counter-clockwise. This just results in an image that is rotated 180 degrees from the final flag image.</p>
          <hr>
          <p>Now lets move on to the revenge challenge.</p>
          <p>For this challenge, we are also given a single file named scan2.sqlite.</p>
          <p>Looking at the scan, you can tell its a lot similar to the previous challenge. In fact, the solve code is almost exactly the same. The reason this challenge was made was to introduce a different type of scan, a 3d CT or CAT scan. This scan is built on many xrays lined up across an object. They provide cross sections of the object, and reading them is a lot harder than reading just an xray. It surprises me how few people know that single xray scans and ct / cat scans are basically the same thing.</p>
          <p>To build all of the xray scans, you must add a single for loop to your solve code to loop through all tables in the scan file. My solve code below outputs all of the scans in the same folder for organization.</p>
          <pre><code>import sqlite3
          import math
          import json
          from numpy import *
          from pathlib import Path
          from PIL import Image
          
          #get the stuff from the db
          def loadProjections(db_path, tablename):
          	with sqlite3.connect(db_path) as connection:
          		rows = connection.execute(f&quot;&quot;&quot;SELECT angle_degrees, detector_count, light_values FROM {tablename} ORDER BY angle_degrees&quot;&quot;&quot;).fetchall()
          		projections = []
          		for angle_degrees, detector_count, light_values in rows: #never gonna use detector_count bc thats just verification of how many things are in light_values
          			values = array(json.loads(light_values))
          			projections.append((int(angle_degrees), values))
          	return projections
          
          #get func for sorted table names used at the bottom
          def getTablenames(db_path: Path):
              with sqlite3.connect(db_path) as connection:
                  rows = connection.execute(&quot;&quot;&quot;SELECT name FROM sqlite_master WHERE type = &#39;table&#39;&quot;&quot;&quot;).fetchall()
              tables = []
              for (name,) in rows:
                  position_text = name[len(&quot;slice_&quot;):-len(&quot;cm&quot;)]
                  tables.append((int(position_text), name))
              # dont sort by alphabetically bc 1000 would be before 2
              tables.sort(key=lambda item: item[0])
              return [name for _, name in tables]
          
          #making the sinogram, explained in the previous readme
          def getSinogram(projections):
          	maximum_detector_count = max([len(values) for _, values in projections])
          	#blank sinogram array
          	sinogram = zeros((len(projections), maximum_detector_count))
          	#padding is the offset of 0s to get to the data in the center
          	for angle_index, (_, values) in enumerate(projections):
          		padding = maximum_detector_count - len(values)
          		start = padding // 2
          		end = start + len(values)
          		sinogram[angle_index, start:end] = values
          
          	return sinogram
          
          #sums up all lines that go through each pixel (most of the logic behind the chall)
          def getPixelData(sinogram, angles, width, height):
          	detector_count = sinogram.shape[1]
          	detector_center = (detector_count - 1) / 2.0
          
          	x = arange(width) - (width - 1) / 2.0
          	y = arange(height) - (height - 1) / 2.0
          
          	x_grid, y_grid = meshgrid(x, y) # every possible x and y
          	pixeldata = zeros((height, width))	# empty array to hold pixel sums
          
          	detector_indexes = arange(detector_count)
          	#big loop that does most of the logic w the sinogram
          	for projection, angle in zip(sinogram, angles):
          		angle_rad = math.radians(angle)
          		detector_pos = detector_center + x_grid * math.cos(angle_rad) + y_grid * math.sin(angle_rad)
          
          		newsum = interp(
          			detector_pos.ravel(),
          			detector_indexes,
          			projection,
          			left=0,
          			right=0
          		).reshape(height, width)
          
          		pixeldata += newsum
          
          	return pixeldata
          
          #converts reconstructed sum values into grayscale and saves it to output/
          def save(pixeldata, outpath):
          	#since all of the values are added up you have to weight the highest value at 255 and lowest at 0 and weigh the rest inbetween. Also skips outliers 0 and 100 so the image isnt mostly just grey but this isnt necessary its just a little filtering
          	low, high = percentile(pixeldata, [1.0, 99.0])
          	weighted = clip((pixeldata - low) / (high - low), 0.0, 1.0)
          	imagedata = rint(weighted * 255.0).astype(uint8)
          
          	Image.fromarray(imagedata).save(outpath)
          
          
          
          
          #most of this stuff is self explanatory tbh
          dir = Path(__file__).parent
          db = dir / &quot;scan2.sqlite&quot;
          outdir = dir / &quot;output&quot;
          outdir.mkdir(exist_ok=True)
          
          tablenames = getTablenames(db)
          #simple for loop that was added for all tables
          for name in tablenames:
          	projections = loadProjections(db, name)
          	#put stuff in a dict so its accessible by angle
          	dict = {angle: values for angle, values in projections}
          	imageWidth = len(dict[0]) #num of detectors at 0 is width as explained in the readme
          	imageHeight = len(dict[90]) #num of detectors at 90 is height as explained in the readme
          	angles = array([angle for angle, _ in projections])
          	sinogram = getSinogram(projections)
          
          	pixeldata = getPixelData(sinogram, angles, imageWidth, imageHeight)
          
          	#images are named after their table names
          	outpath = outdir / f&quot;{name}.png&quot;
          	save(pixeldata, outpath)
          	print(f&quot;{name} done&quot;)
          </code></pre>
          <p>Once you have all of these images, you need to reconstruct the 3d file by stacking all of the images at their height. The easiest way to do this is by eye, and to go image by image seeing what the cross section of the flag is. </p>
          <p><img class="writeup-img" src="/images/writeups/You_Scanned_WHAT_and_HOW/slice_147cm.png" alt="Sample output slice"></p>
          <p>You could also stack these images on a 3d rendering program, but that is not required.</p>
          <p>All output is in the output folder in this directory, feel free to take a look and try to solve it from there.</p>
          <p>For reference, here was the final flag that the scan was taken of.</p>
          <p><img class="writeup-img" src="/images/writeups/You_Scanned_WHAT_and_HOW/flagForReference.png" alt="Flag For Reference"></p>
          <p>Again, using a filter or method to make the images more clear could have been used, but they aren&#39;t requited if you don&#39;t need a completely clear file.</p>
          <p>Final flag: <code>L3AK{CT_Sc4Ns_R_jU57_L0tz_0F_Xr4y5!!}</code></p>
          
        `,
            },

            {
                id: "software_and_hardware_are_a_scam",
                title: "Software + Hardware is a scam",
                subtitle: "L3AK CTF 2026 · Simplifying hardware logic to recover the flag",
                difficulty: "hard",
                category: "hardware",
                catColor: "#e5e7eb",
                author: true,
                body: String.raw `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">hardware</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~3 hours.
          </p>

          <p class="desc-label"><strong>Descriptions:</strong></p>
          <p class="desc-label">Software is a scam:</p>
          <blockquote class="desc-area">
            <p>Why use software when hardware gets the job done just fine?</p>
          </blockquote>
          <p class="desc-label">Hardware is a scam:</p>
          <blockquote class="desc-area">
            <p>Maybe software isn&#39;t so bad after all...</p>
            <p>My current password <code>l3ak{...}</code> seems to be working fine, but something tells me someone else has been messing around on my machine 💀.</p>
            <p>Note: This challenge is the revenge challenge for <code>Software is a scam</code>. It is suggested that you solve that one first.</p>
          </blockquote>
          <hr>
          <p>Let&#39;s start with the first challenge. This is all we are given:</p>
          <p><img class="writeup-img" src="/images/writeups/Software_+_Hardware_is_a_scam/auth.png" alt="our handout"></p>
          <p>If you understand circuits, this challenge shouldn&#39;t be that hard. It should mostly be tedious.</p>
          <p>The circuit diagram is actually 3 seperate circuits. I will solve them here individually. They all are required for the password to be right, but none of the input characters in these three blocks effect any of the input characters in any other block.</p>
          <p>For circuit one, we have four input characters labeled 1-4. If we look closely, there are 5 subcircuits that all need to be true for the password to autheticate. Those circuits can be written like so:</p>
          <pre><code>((C1 x C4) + C1) xnor C2 == 5c
          (C1 &amp; C3) nor (C2 xor C4) == 87
          C3 xor C4 == 0a
          C2 - C1 == e7
          C3 - C1 == f4
          </code></pre>
          <p>To solve this series of equations, we know the flag must be printable, thus we can bound all characters between 32 and 127. with that, we can brute force this series smartly by starting with the equations that cancel out the most possibilities. One thing to note is that since the circuit is discarding all extra bits, we need to mod each arithmetic section by 256 (0xff). We start with <code>C3 xor C4</code>, <code>C2 - C1 == e7</code>, and <code>C3 - C1 == f4</code> in no particular order because all of these equations only include two characters, and thus are easy to brute force to lower the possibilities. Then, we can just add more if statements for the last circuits. The solve script I wrote is attached at <code>solve1.py</code> (pardon my awful code), and it computes all possibilities.</p>
          <pre><code>from Crypto.Util.number import *
          
          for one in range(32,127):
          	for three in range(32,127):
          		if ((three - one)%256 &gt; 0xf4):
          			for two in range(32,127):
          				if ((two - one)%256 == 0xe7):
          					for four in range(32,127):
          						if (three ^ four == 0xa):
          							if ((~(((((one * four)%256) + one)%256)^two))%256 == 0x5c):
          								if ((~((one &amp; three) | (two^four)))%256 == 0x87):
          									print(long_to_bytes(one) + long_to_bytes(two) +long_to_bytes(three) + long_to_bytes(four) + b&#39;?&#39;*16)
          </code></pre>
          <p>The series of circuits in the first section only lead to a single possibility for characters 1-4.</p>
          <p>Flag part one: <code>L3AK????????????????</code></p>
          <p>For the 2nd large circuit, we can do the same thing. We have 4 characters, and we have a total of 5 sub-circuits to validate those characters. We can write those circuts as so:</p>
          <pre><code>C5 - C20 == fe
          (C10 &amp; C20) xor !(C5) == d9
          (C5 &amp; C10) &amp; (C15 xnor C20) == 59
          d6 &gt; (C15 + C10)
          bd &lt; (C15 + C10)
          </code></pre>
          <p>Again, we start with the equations with the least characters, <code>d6 &gt; (C15 + C10)</code> and <code>bd &lt; (C15 + C10)</code>. Then, the rest of them all include C5 and C20 so we can use another two nested for loops to get through the rest of the equations. Again, pardon my awful code, my solve script is attached in <code>solve2.py</code>.</p>
          <pre><code>from Crypto.Util.number import *
          
          for ten in range(32,127):
          	for fifteen in range(32,127):
          		if ((ten + fifteen)%256 &lt; 0xd6):
          			if ((ten + fifteen)%256 &gt; 0xbd):
          				for five in range(32,127):
          					for twenty in range(32,127):
          						if ((five - twenty)%256 == 0xfe):
          							if (((ten &amp; twenty) ^ (~(five))%256) == 0xd9):
          								if (((five &amp; ten) &amp; (~(twenty ^ fifteen))) == 0x59):
          									print(b&#39;????&#39; + long_to_bytes(five) + b&#39;????&#39; + long_to_bytes(ten) + b&#39;????&#39;  + long_to_bytes(fifteen) +  b&#39;????&#39; + long_to_bytes(twenty))
          </code></pre>
          <p>This series of equations also gives us a single possible combination of C5, C10, C15, and C20.</p>
          <p>Flag part 2: <code>????{????_????_????}</code></p>
          <p>For the 3rd and largest circuit, we follow the same steps but at a larger scale. We see 11 sub-circuits that all seem intertwined. If you look closely enough though, there are several near the middle and bottom that require only 2 characters to validate. We start with six, thirteen, eight, sixteen, and seventeen (in an order where each number allows the next to be found with a single for loop) since all of these characters can be found via a single for loop comparison with another number. Then we move on to the much larger equations. The order doesn&#39;t matter much from here, but tis important to have the most if statements before your for loops as possible.</p>
          <p>My solve code is attached at <code>solve3.py</code>. One note that I have is that I simplified one of the equations from 5 calculations to one, since C7 is directly compared to this last connection. I am sure there are far more logic jumps you can simplify from, but none of those were really necessary for this challenge.</p>
          <p><img class="writeup-img" src="/images/writeups/Software_+_Hardware_is_a_scam/C7LogicSimplificationExample.png" alt="Logic simplification example with C7"></p>
          <pre><code>from Crypto.Util.number import *
          
          for six in range(32,127):
          	for thirteen in range(32,127):
          		if (((six + thirteen)%256) == 0xb5):
          			for eight in range(32,127):
          				if (((thirteen - eight)%256) == 0x2e):
          					for sixteen in range(32,127):
          						if (sixteen ^ eight == 0x2c):
          							for seventeen in range(32,127):
          								if (seventeen - eight)%256 == 0xef:
          									for twelve in range(32,127):
          										for seven in range(32,127):
          											if ((seven - ((~(((six &lt;&lt; 2)%256) &amp; twelve))%256))%256 == 0x74):
          												for nine in range(32,127):
          													if ((~(((((nine &amp; thirteen) ^ ((~(nine &amp; sixteen))%256)) ^ sixteen ^ twelve) &amp; ~(((nine &amp; thirteen) ^ ((~(nine &amp; sixteen))%256)) &amp; sixteen &amp; twelve)))%256) == seven):
          														for fourteen in range(32,127):
          															if ((fourteen ^ (twelve ^ (seventeen &amp; ((~(nine &amp; sixteen))%256)))) == 0x51):
          																for eighteen in range(32,127):
          																	if ((((seventeen - eighteen)%256) &amp; nine) == 0x33):
          																		for eleven in range(32,127):
          																			if (((((~(((~((((six &lt;&lt; 2)%256) ^ eleven ^ thirteen) &amp; ~(((six &lt;&lt; 2) % 256) &amp; eleven &amp; thirteen))) % 256) &amp; fourteen)) % 256) ^ ((~((((six &lt;&lt; 2) % 256) ^ eleven ^ thirteen) &amp; ~(((six &lt;&lt; 2) % 256) &amp; eleven &amp; thirteen))) % 256)) | eighteen) == 0x37):
          																				for nineteen in range(32,127):
          																					if (((((~((((six &lt;&lt; 2)%256) ^ eleven ^ thirteen) &amp; ~(((six &lt;&lt; 2)%256) &amp; eleven &amp; thirteen)))%256) + nineteen)%256) == 0xd):
          																						if ((((nine ^ nineteen) + eighteen)%256) == 0xab):
          																							print(b&#39;?????&#39; + long_to_bytes(six) + long_to_bytes(seven) + long_to_bytes(eight) + long_to_bytes(nine) + b&#39;?&#39; + long_to_bytes(eleven) + long_to_bytes(twelve) + long_to_bytes(thirteen) + long_to_bytes(fourteen) + b&#39;?&#39; + long_to_bytes(sixteen) + long_to_bytes(seventeen) + long_to_bytes(eighteen) + long_to_bytes(nineteen) + b&#39;?&#39;)
          </code></pre>
          <p>Again, there was only one possible combination that would verify the circuit.</p>
          <p>Flag part 3: <code>?????CoD3?Hur7?h34D?</code></p>
          <p>Final combined flag: <code>L3AK{CoD3_Hur7_h34D}</code></p>
          <hr>
          <p>The revenge challenge is very similar, but is given at a MUCH larger scale:</p>
          <p><img class="writeup-img" src="/images/writeups/Software_+_Hardware_is_a_scam/auth2.png" alt="our handout"></p>
          <p>If you understand circuits, this challenge should make sense, but the solve path still may seem unclear.</p>
          <p>The key idea behind this challenge was to simplify the circuit. There are a lot of sections throughout the circuit that can be simplified to much shorter logic gates, and thus brute forcers will be much faster / not necessary.</p>
          <p>First, let&#39;s look at the top block. There are a lot of logic gates on inputs C1-C4. Let&#39;s first see how many possible solutions C1-C4 have with just these logic gates.</p>
          <p>We see that there are 5 circuits that all need to be correct for this circuit block to respond true. These logic gates are below:</p>
          <pre><code>((C1 * C4) + C1) xnor C2 == 5c
          (C1 &amp; C3) nor (C2 xor C4) == 87
          C3 xor C4 == 0a
          (C2 xor C1) xor C3 == 3e
          C3 - C1 == 4f
          </code></pre>
          <p>With these 5 equations, we can brute force character by character to find all possibilities (in the same way used in <code>Software is a scam</code>). Here was my solve code for this section:</p>
          <pre><code>from Crypto.Util.number import *
          
          for one in range(32,127):
          	for three in range(32,127):
          		if ((three - one)%256 &gt; 0xf4):
          			for two in range(32,127):
          				for four in range(32,127):
          					if (((one ^ two) ^ three) == 0x3e):
          						if (three ^ four == 0xa):
          							if ((~(((((one * four)%256) + one)%256)^two))%256 == 0x5c):
          								if ((~((one &amp; three) | (two^four)))%256 == 0x87):
          									print(long_to_bytes(one) + long_to_bytes(two) +long_to_bytes(three) + long_to_bytes(four) + b&#39;?&#39;*30)
          </code></pre>
          <p>Through this code, we find that there exit only 2 possible combinations of C1-C4 that satisfy this circuit. <code>l3ak</code> and <code>L3AK</code>. We can note this down for our next script, as we can see that the rest of the circuit requires these characters to be known.</p>
          <p>The next step is to map out all the logic gates in the second chunk. This part will most likely take you the longest. Patience is key here lol, you will get to the end eventually.</p>
          <p>The below equations are all - circuits in the 2nd chunk:</p>
          <pre><code>(C5 xor C34) == 0x06
          
          (C6 - (
              (C1 &gt;&gt; 5)
              *
              (((C15 | C24) / (C24 | C15))
              | (((C21 nand C30) / (C30 nand C21)) &lt;&lt; 4))
          )) == 0x20
          
          (C7 - (
              (C3 &gt;&gt; 5)
              *
              (((C21 nor C30) / (C30 nor C21))
              | (((C14 xnor C23) / (C23 xnor C14)) &lt;&lt; 6))
          )) == 0xB2
          
          (C8 - (
              (C4 &gt;&gt; 5)
              *
              (((((C27 xor C9) | C18) / (C18 | (C9 xor C27)))
              | ((((C19 &amp; C28) | C10) / (C10 | (C28 &amp; C19))) &lt;&lt; 2))
              | ((((C31 + C13) | C22) / (C22 | (C13 + C31))) &lt;&lt; 3))
          )) == 0x49
          
          (C9 + (
              (C1 &gt;&gt; 5)
              *
              (((((C32 | C14) / (C14 | C32)) &lt;&lt; 3)
              | (((C17 nand C26) / (C26 nand C17)) &lt;&lt; 4))
              | (((C29 nor C11) / (C11 nor C29)) &lt;&lt; 5))
          )) == 0xDB
          
          (C10 - (
              (C3 &gt;&gt; 5)
              *
              (((((C29 xnor C11) / (C11 xnor C29)) &lt;&lt; 1)
              | ((((C14 xor C23) | C32) / (C32 | (C23 xor C14))) &lt;&lt; 2))
              | ((((C26 &amp; C7) | C17) / (C17 | (C7 &amp; C26))) &lt;&lt; 3))
          )) == 0x48
          
          (C11 + (
              (C4 &gt;&gt; 5)
              *
              ((((((C33 + C15) | C24) / (C24 | (C15 + C33)))
              | (((C12 | C21) / (C21 | C12)) &lt;&lt; 4))
              | (((C31 nand C13) / (C13 nand C31)) &lt;&lt; 6))
              | (((C16 nor C25) / (C25 nor C16)) &lt;&lt; 7))
          )) == 0xD2
          
          (C12 + (
              (C1 &gt;&gt; 5)
              *
              ((((((C29 xnor C10) / (C10 xnor C29)) &lt;&lt; 1)
              | ((((C21 xor C30) | C11) / (C11 | (C30 xor C21))) &lt;&lt; 3))
              | ((((C33 &amp; C15) | C24) / (C24 | (C15 &amp; C33))) &lt;&lt; 4))
              | ((((C18 + C27) | C8) / (C8 | (C27 + C18))) &lt;&lt; 5))
          )) == 0xE3
          
          (C13 xor (
              (C3 &gt;&gt; 5)
              *
              (((C10 | C20) / (C20 | C10))
              | (((C31 nand C12) / (C12 nand C31)) &lt;&lt; 6))
          )) == 0xF0
          
          (C14 - (
              (C4 &gt;&gt; 5)
              *
              (((C31 nor C12) / (C12 nor C31)) &lt;&lt; 2)
          )) == 0x57
          
          (C15 + (
              (C1 &gt;&gt; 5)
              *
              ((((C18 xnor C27) / (C27 xnor C18))
              | ((((C30 xor C11) | C21) / (C21 | (C11 xor C30))) &lt;&lt; 1))
              | ((((C29 &amp; C10) | C20) / (C20 | (C10 &amp; C29))) &lt;&lt; 4))
          )) == 0x8E
          
          (C16 - (
              (C3 &gt;&gt; 5)
              *
              ((((C29 + C10) | C20) / (C20 | (C10 + C29)))
              | (((C22 | C31) / (C31 | C22)) &lt;&lt; 6))
          )) == 0xAF
          
          (C17 + (
              (C4 &gt;&gt; 5)
              *
              ((((C7 nand C16) / (C16 nand C7))
              | (((C13 nor C23) / (C23 nor C13)) &lt;&lt; 4))
              | (((C26 xnor C7) / (C7 xnor C26)) &lt;&lt; 5))
          )) == 0xC6
          
          (C18 + (
              (C1 &gt;&gt; 5)
              *
              ((((C19 xor C28) | C9) / (C9 | (C28 xor C19)))
              | ((((C10 &amp; C20) | C29) / (C29 | (C20 &amp; C10))) &lt;&lt; 2))
          )) == 0x6E
          
          (C19 + (
              (C3 &gt;&gt; 5)
              *
              ((((((C25 + C6) | C15) / (C15 | (C6 + C25)))
              | (((C9 | C18) / (C18 | C9)) &lt;&lt; 1))
              | (((C23 nand C32) / (C32 nand C23)) &lt;&lt; 6))
              | (((C7 nor C16) / (C16 nor C7)) &lt;&lt; 7))
          )) == 0xB9
          
          (C20 + (
              (C4 &gt;&gt; 5)
              *
              (((((C21 xnor C30) / (C30 xnor C21)) &lt;&lt; 1)
              | ((((C12 xor C22) | C31) / (C31 | (C22 xor C12))) &lt;&lt; 3))
              | ((((C25 &amp; C6) | C15) / (C15 | (C6 &amp; C25))) &lt;&lt; 4))
          )) == 0x82
          
          (C21 - (
              (C1 &gt;&gt; 5)
              *
              (((((C11 + C20) | C30) / (C30 | (C20 + C11))) &lt;&lt; 2)
              | (((C31 | C12) / (C12 | C31)) &lt;&lt; 4))
          )) == 0x37
          
          (C22 - (
              (C3 &gt;&gt; 5)
              *
              ((((C10 nand C19) / (C19 nand C10)) &lt;&lt; 1)
              | (((C30 nor C11) / (C11 nor C30)) &lt;&lt; 3))
          )) == 0x55
          
          (C23 - (
              (C4 &gt;&gt; 5)
              *
              ((((C9 xnor C18) / (C18 xnor C9))
              | ((((C8 xor C17) | C27) / (C27 | (C17 xor C8))) &lt;&lt; 3))
              | ((((C28 &amp; C9) | C18) / (C18 | (C9 &amp; C28))) &lt;&lt; 5))
          )) == 0xFC
          
          (C24 - (
              (C1 &gt;&gt; 5)
              *
              ((((((C20 + C30) | C11) / (C11 | (C30 + C20)))
              | (((C27 | C8) / (C8 | C27)) &lt;&lt; 4))
              | (((C18 nand C28) / (C28 nand C18)) &lt;&lt; 6))
              | (((C31 nor C12) / (C12 nor C31)) &lt;&lt; 7))
          )) == 0xBD
          
          (C25 - (
              (C3 &gt;&gt; 5)
              *
              (((((C16 xnor C26) / (C26 xnor C16)) &lt;&lt; 1)
              | ((((C8 xor C17) | C27) / (C27 | (C17 xor C8))) &lt;&lt; 3))
              | ((((C28 &amp; C9) | C18) / (C18 | (C9 &amp; C28))) &lt;&lt; 5))
          )) == 0xF4
          
          (C26 - (
              (C4 &gt;&gt; 5)
              *
              ((((C21 + C31) | C12) / (C12 | (C31 + C21))) &lt;&lt; 4)
          )) == 0x14
          
          (C27 + (
              (C1 &gt;&gt; 5)
              *
              ((((C21 | C31) / (C31 | C21))
              | (((C6 nand C15) / (C15 nand C6)) &lt;&lt; 1))
              | (((C33 nor C14) / (C14 nor C33)) &lt;&lt; 4))
          )) == 0x98
          
          (C28 xor (
              (C3 &gt;&gt; 5)
              *
              (((((C12 xnor C21) / (C21 xnor C12)) &lt;&lt; 1)
              | ((((C24 xor C6) | C15) / (C15 | (C6 xor C24))) &lt;&lt; 2))
              | ((((C9 &amp; C18) | C27) / (C27 | (C18 &amp; C9))) &lt;&lt; 3))
          )) == 0x58
          
          (C29 + (
              (C4 &gt;&gt; 5)
              *
              ((((((C23 + C33) | C14) / (C14 | (C33 + C23))) &lt;&lt; 1)
              | (((C8 | C17) / (C17 | C8)) &lt;&lt; 2))
              | (((C14 nand C23) / (C23 nand C14)) &lt;&lt; 6))
          )) == 0x03
          
          (C30 - (
              (C1 &gt;&gt; 5)
              *
              (((((C27 nor C9) / (C9 nor C27))
              | (((C12 xnor C21) / (C21 xnor C12)) &lt;&lt; 1))
              | ((((C11 xor C20) | C29) / (C29 | (C20 xor C11))) &lt;&lt; 4))
              | ((((C23 &amp; C33) | C14) / (C14 | (C33 &amp; C23))) &lt;&lt; 5))
          )) == 0xCE
          
          (C31 + (
              (C3 &gt;&gt; 5)
              *
              (((((C23 + C33) | C14) / (C14 | (C33 + C23))) &lt;&lt; 1)
              | (((C15 | C24) / (C24 | C15)) &lt;&lt; 3))
          )) == 0x66
          
          (C32 xor (
              (C4 &gt;&gt; 5)
              *
              (((((C29 nand C11) / (C11 nand C29)) &lt;&lt; 1)
              | (((C28 nor C10) / (C10 nor C28)) &lt;&lt; 4))
              | (((C20 xnor C29) / (C29 xnor C20)) &lt;&lt; 6))
          )) == 0xC1
          
          (C33 xor (
              (C1 &gt;&gt; 5)
              *
              (((((C13 xor C22) | C31) / (C31 | (C22 xor C13))) &lt;&lt; 1)
              | ((((C25 &amp; C7) | C16) / (C16 | (C7 &amp; C25))) &lt;&lt; 2))
          )) == 0x2D
          
          (C34 - (C1 xor C3)) == 0x70
          </code></pre>
          <p>Immediately, we see a whole bunch of contradictive statements. Things such as <code>(((C13 xor C22) | C31) / (C31 | (C22 xor C13)))</code> or <code>((C27 nor C9) / (C9 nor C27))</code> where you have the same communative function dividing itself. The key idea of this challenge was to simplify all of these communative functions to cut away useless functions. If you found this pattern earlier, you could have skipped a bunch of logic gates. After doing so, you get the following (much nicer) series of equations:</p>
          <pre><code>(C5 xor C34) == 0x06
          (C6 - ((C1 &gt;&gt; 5) * (1 | (1 &lt;&lt; 4)))) == 0x20
          (C7 - ((C3 &gt;&gt; 5) * (1 | (1 &lt;&lt; 6)))) == 0xB2
          (C8 - ((C4 &gt;&gt; 5) * ((1 | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3)))) == 0x49
          (C9 + ((C1 &gt;&gt; 5) * (((1 &lt;&lt; 3) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) == 0xDB
          (C10 - ((C3 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3)))) == 0x48
          (C11 + ((C4 &gt;&gt; 5) * (((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) == 0xD2
          (C12 + ((C1 &gt;&gt; 5) * ((((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) == 0xE3
          (C13 xor ((C3 &gt;&gt; 5) * (1 | (1 &lt;&lt; 6)))) == 0xF0
          (C14 - ((C4 &gt;&gt; 5) * (1 &lt;&lt; 2))) == 0x57
          (C15 + ((C1 &gt;&gt; 5) * ((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)))) == 0x8E
          (C16 - ((C3 &gt;&gt; 5) * (1 | (1 &lt;&lt; 6)))) == 0xAF
          (C17 + ((C4 &gt;&gt; 5) * ((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) == 0xC6
          (C18 + ((C1 &gt;&gt; 5) * (1 | (1 &lt;&lt; 2)))) == 0x6E
          (C19 + ((C3 &gt;&gt; 5) * (((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) == 0xB9
          (C20 + ((C4 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 4)))) == 0x82
          (C21 - ((C1 &gt;&gt; 5) * ((1 &lt;&lt; 2) | (1 &lt;&lt; 4)))) == 0x37
          (C22 - ((C3 &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 3)))) == 0x55
          (C23 - ((C4 &gt;&gt; 5) * ((1 | (1 &lt;&lt; 3)) | (1 &lt;&lt; 5)))) == 0xFC
          (C24 - ((C1 &gt;&gt; 5) * (((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) == 0xBD
          (C25 - ((C3 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 5)))) == 0xF4
          (C26 - ((C4 &gt;&gt; 5) * (1 &lt;&lt; 4))) == 0x14
          (C27 + ((C1 &gt;&gt; 5) * ((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)))) == 0x98
          (C28 xor ((C3 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3)))) == 0x58
          (C29 + ((C4 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 6)))) == 0x03
          (C30 - ((C1 &gt;&gt; 5) * (((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) == 0xCE
          (C31 + ((C3 &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 3)))) == 0x66
          (C32 xor ((C4 &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6)))) == 0xC1
          (C33 xor ((C1 &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 2)))) == 0x2D
          (C34 - (C1 xor C3)) == 0x70
          </code></pre>
          <p>From here, since every equation has their own new variable (C1, C3, and C4 have been &quot;found&quot;), we can simply loop through every letter for every character index and get the flag. If you simplify further, you can do this without brute forcing, but since we&#39;ve written out all of this logic in almost python syntax, its probably faster just to port these equations to python and solve. Remember that everything here is bitwise and must have a bit mask of 256 (0xff).</p>
          <p>We can assume that each character is printable, and thus land between 32 and 126 inclusive on the ascii table (if we don&#39;t assume this, we can just use 0 through 256 it doesnt speed the code up that much).</p>
          <p>Below is my solve code for these equations. Sorry for the atrocious code, but it still gets the job done pretty quickly.</p>
          <pre><code>from Crypto.Util.number import *
          
          def _solve_28_to_33(one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twentyone, twentytwo, twentythree, twentyfour, twentyfive, twentysix, twentyseven, thirtyfour):
          	for twentyeight in range(32,127):
          		if ((twentyeight ^ (((three &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3))) % 256)) == 0x58):
          			for twentynine in range(32,127):
          				if (((twentynine + ((four &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 6)))) % 256) == 0x03):
          					for thirty in range(32,127):
          						if (((thirty - ((one &gt;&gt; 5) * (((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) % 256) == 0xCE):
          							for thirtyone in range(32,127):
          								if (((thirtyone + ((three &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 3)))) % 256) == 0x66):
          									for thirtytwo in range(32,127):
          										if ((thirtytwo ^ (((four &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6))) % 256)) == 0xC1):
          											for thirtythree in range(32,127):
          												if ((thirtythree ^ (((one &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 2))) % 256)) == 0x2D):
          													print(long_to_bytes(one) + long_to_bytes(two) + long_to_bytes(three) + long_to_bytes(four) + long_to_bytes(five) + long_to_bytes(six) + long_to_bytes(seven) + long_to_bytes(eight) + long_to_bytes(nine) + long_to_bytes(ten) + long_to_bytes(eleven) + long_to_bytes(twelve) + long_to_bytes(thirteen) + long_to_bytes(fourteen) + long_to_bytes(fifteen) + long_to_bytes(sixteen) + long_to_bytes(seventeen) + long_to_bytes(eighteen) + long_to_bytes(nineteen) + long_to_bytes(twenty) + long_to_bytes(twentyone) + long_to_bytes(twentytwo) + long_to_bytes(twentythree) + long_to_bytes(twentyfour) + long_to_bytes(twentyfive) + long_to_bytes(twentysix) + long_to_bytes(twentyseven) + long_to_bytes(twentyeight) + long_to_bytes(twentynine) + long_to_bytes(thirty) + long_to_bytes(thirtyone) + long_to_bytes(thirtytwo) + long_to_bytes(thirtythree) + long_to_bytes(thirtyfour))
          
          def _solve_20_to_27(one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, thirtyfour):
          	for twenty in range(32,127):
          		if (((twenty + ((four &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 4)))) % 256) == 0x82):
          			for twentyone in range(32,127):
          				if (((twentyone - ((one &gt;&gt; 5) * ((1 &lt;&lt; 2) | (1 &lt;&lt; 4)))) % 256) == 0x37):
          					for twentytwo in range(32,127):
          						if (((twentytwo - ((three &gt;&gt; 5) * ((1 &lt;&lt; 1) | (1 &lt;&lt; 3)))) % 256) == 0x55):
          							for twentythree in range(32,127):
          								if (((twentythree - ((four &gt;&gt; 5) * ((1 | (1 &lt;&lt; 3)) | (1 &lt;&lt; 5)))) % 256) == 0xFC):
          									for twentyfour in range(32,127):
          										if (((twentyfour - ((one &gt;&gt; 5) * (((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) % 256) == 0xBD):
          											for twentyfive in range(32,127):
          												if (((twentyfive - ((three &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 5)))) % 256) == 0xF4):
          													for twentysix in range(32,127):
          														if (((twentysix - ((four &gt;&gt; 5) * (1 &lt;&lt; 4))) % 256) == 0x14):
          															for twentyseven in range(32,127):
          																if (((twentyseven + ((one &gt;&gt; 5) * ((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)))) % 256) == 0x98):
          																	_solve_28_to_33(one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty, twentyone, twentytwo, twentythree, twentyfour, twentyfive, twentysix, twentyseven, thirtyfour)
          
          def _solve_12_to_19(one, two, three, four, five, six, seven, eight, nine, ten, eleven, thirtyfour):
          	for twelve in range(32,127):
          		if (((twelve + ((one &gt;&gt; 5) * ((((1 &lt;&lt; 1) | (1 &lt;&lt; 3)) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) % 256) == 0xE3):
          			for thirteen in range(32,127):
          				if ((thirteen ^ (((three &gt;&gt; 5) * (1 | (1 &lt;&lt; 6))) % 256)) == 0xF0):
          					for fourteen in range(32,127):
          						if (((fourteen - ((four &gt;&gt; 5) * (1 &lt;&lt; 2))) % 256) == 0x57):
          							for fifteen in range(32,127):
          								if (((fifteen + ((one &gt;&gt; 5) * ((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 4)))) % 256) == 0x8E):
          									for sixteen in range(32,127):
          										if (((sixteen - ((three &gt;&gt; 5) * (1 | (1 &lt;&lt; 6)))) % 256) == 0xAF):
          											for seventeen in range(32,127):
          												if (((seventeen + ((four &gt;&gt; 5) * ((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) % 256) == 0xC6):
          													for eighteen in range(32,127):
          														if (((eighteen + ((one &gt;&gt; 5) * (1 | (1 &lt;&lt; 2)))) % 256) == 0x6E):
          															for nineteen in range(32,127):
          																if (((nineteen + ((three &gt;&gt; 5) * (((1 | (1 &lt;&lt; 1)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) % 256) == 0xB9):
          																	_solve_20_to_27(one, two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, thirtyfour)
          
          def _solve_5_to_11(one, two, three, four):
          	for thirtyfour in range(32,127):
          		if (((thirtyfour - (one ^ three)) % 256) == 0x70):
          			for five in range(32,127):
          				if ((five ^ thirtyfour) == 0x06):
          					for six in range(32,127):
          						if (((six - ((one &gt;&gt; 5) * (1 | (1 &lt;&lt; 4)))) % 256) == 0x20):
          							for seven in range(32,127):
          								if (((seven - ((three &gt;&gt; 5) * (1 | (1 &lt;&lt; 6)))) % 256) == 0xB2):
          									for eight in range(32,127):
          										if (((eight - ((four &gt;&gt; 5) * ((1 | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3)))) % 256) == 0x49):
          											for nine in range(32,127):
          												if (((nine + ((one &gt;&gt; 5) * (((1 &lt;&lt; 3) | (1 &lt;&lt; 4)) | (1 &lt;&lt; 5)))) % 256) == 0xDB):
          													for ten in range(32,127):
          														if (((ten - ((three &gt;&gt; 5) * (((1 &lt;&lt; 1) | (1 &lt;&lt; 2)) | (1 &lt;&lt; 3)))) % 256) == 0x48):
          															for eleven in range(32,127):
          																if (((eleven + ((four &gt;&gt; 5) * (((1 | (1 &lt;&lt; 4)) | (1 &lt;&lt; 6)) | (1 &lt;&lt; 7)))) % 256) == 0xD2):
          																	_solve_12_to_19(one, two, three, four, five, six, seven, eight, nine, ten, eleven, thirtyfour)
          
          def solve(format):
          	format = format.encode()
          	one = format[0]
          	two = format[1]
          	three = format[2]
          	four = format[3]
          	_solve_5_to_11(one, two, three, four)
          
          solve(&quot;l3ak&quot;)
          solve(&quot;L3AK&quot;)
          </code></pre>
          <p>From running the code, we find out that there are <em>two</em> passwords that can authenticate via this device.</p>
          <pre><code>l3ak{Sup3r_53cUr3_p4ssw0rD_r1gH7?}
          L3AK{B4ckd0or_h1dd3N_iN_H4rDw4Re!}
          </code></pre>
          <p>The challenge description mentioned the intended password is <code>l3ak{...}</code> and the flag format is <code>L3AK{...}</code> so the final flag would be the hidden password: <code>L3AK{B4ckd0or_h1dd3N_iN_H4rDw4Re!}</code>.</p>
          
        `,
            },
        ]);

        const l3akOrder = new Map([
            ["drippy_adventures", 0],
            ["you_scanned_what_and_how", 1],
            ["software_and_hardware_are_a_scam", 2],
        ]);
        writeups.value.sort(
            (a, b) => (l3akOrder.get(a.id) ?? 3) - (l3akOrder.get(b.id) ?? 3)
        );

        // Keep collapsed writeups lightweight. Images are decoded asynchronously,
        // and a writeup body is only mounted after that card is opened once.
        const keepOriginalImage = new Set([
            "/images/writeups/Drippy_Adventures/dnSpyfiles.png",
            "/images/writeups/Emoji_CAPTCHA/exampleOutput.png",
            "/images/writeups/Emoji_CAPTCHA/header.png",
            "/images/writeups/Software_+_Hardware_is_a_scam/auth2.png",
            "/images/writeups/You_Scanned_WHAT_and_HOW/sinogram_example.png",
        ]);

        writeups.value.forEach((writeup) => {
            writeup.body = writeup.body
                .replace(
                    /<img(?![^>]*\bloading=)/g,
                    '<img loading="lazy" decoding="async"'
                )
                // These two source files are byte-for-byte identical; reuse one URL so
                // the browser can share a single download and decoded image.
                .replace(
                    /\/images\/writeups\/Eye_on_the_Sky\/chall2\.jpg/g,
                    "/images/writeups/Eye_on_the_Sky/chall1.jpg"
                )
                .replace(
                    /\/images\/writeups\/[^"']+\.(?:png|jpe?g)/gi,
                    (url) =>
                    keepOriginalImage.has(url) ?
                    url :
                    url.replace(/\.(?:png|jpe?g)$/i, ".webp")
                );
        });

        const loadedWriteups = new Set();

        const openId = S(null);

        // ---------------------------------------------------------
        // CODE TOGGLES (CSS-only chevron) FOR LONG <pre> BLOCKS
        // - only adds toggle if code has > 10 lines
        // - collapsed: 10 lines (scrollable)
        // - expanded: 25 lines (scrollable)
        // - button is OUTSIDE the <pre> so scrolling doesn't move it
        // ---------------------------------------------------------
        const setupCodeToggles = (id) => {
            const body = document.querySelector(`#writeup-${id} .writeup-body`);
            if (!body) return;

            const pres = body.querySelectorAll("pre");
            if (!pres || !pres.length) return;

            pres.forEach((pre) => {
                if (!pre || pre.dataset?.codeToggle === "1") return;

                const codeEl = pre.querySelector("code");
                const raw = (codeEl ? codeEl.textContent : pre.textContent || "").replace(
                    /\n$/,
                    ""
                );
                const lineCount = raw ? raw.split("\n").length : 0;

                try {
                    pre.dataset.codeToggle = "1";
                } catch (e) {}

                // Don't add a toggle for short code blocks (10 lines or less)
                if (lineCount <= 10) return;

                // Wrap so the button can be anchored outside the scrollable <pre>
                const wrap = document.createElement("div");
                wrap.className = "code-wrap";
                pre.parentNode.insertBefore(wrap, pre);
                wrap.appendChild(pre);

                // Default collapsed
                pre.classList.add("code-toggle");
                pre.classList.add("code-collapsed");
                pre.classList.remove("code-open");

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "code-toggle-btn";
                btn.title = "Expand code";
                btn.setAttribute("aria-label", "Expand code");

                btn.addEventListener("click", (e) => {
                    e.stopPropagation();

                    const isOpen = pre.classList.contains("code-open");

                    if (isOpen) {
                        pre.classList.remove("code-open");
                        pre.classList.add("code-collapsed");
                        btn.classList.remove("is-open");
                        btn.title = "Expand code";
                        btn.setAttribute("aria-label", "Expand code");
                    } else {
                        pre.classList.add("code-open");
                        pre.classList.remove("code-collapsed");
                        btn.classList.add("is-open");
                        btn.title = "Collapse code";
                        btn.setAttribute("aria-label", "Collapse code");
                    }

                    // keep measured-height accurate
                    if (openId.value === id) {
                        requestAnimationFrame(() => {
                            setBodyHeight(id);
                        });
                    }
                });

                wrap.appendChild(btn);
            });
        };

        // ---------------------------------------------------------
        // MEASURED HEIGHT SUPPORT (fixes "slow then snap" max-height)
        // Sets CSS var --body-h to the body's scrollHeight while open.
        // Keeps it updated if images load / content reflows.
        // ---------------------------------------------------------
        let bodyRO = null;

        const setBodyHeight = (id) => {
            // ensure code blocks are processed BEFORE measuring
            setupCodeToggles(id);

            const body = document.querySelector(`#writeup-${id} .writeup-body`);
            if (!body) return;

            const apply = () => {
                // scrollHeight includes padding; ensure we measure when open padding is applied
                body.style.setProperty("--body-h", body.scrollHeight + "px");
            };

            // Apply now + after layout settles a bit
            requestAnimationFrame(() => {
                apply();
                requestAnimationFrame(apply);
            });

            // Keep it correct while open (images, fonts, etc.)
            try {
                bodyRO?.disconnect();
                bodyRO = new ResizeObserver(() => {
                    if (openId.value === id) apply();
                });
                bodyRO.observe(body);
            } catch (e) {
                // Fallback if ResizeObserver isn't available
                setTimeout(apply, 350);
            }
        };

        const clearBodyObserver = () => {
            try {
                bodyRO?.disconnect();
            } catch (e) {}
            bodyRO = null;
        };

        // robust, deterministic offset scroll (beats scroll restoration + late layout shifts)
        const scrollToWriteup = (id, smooth, tries = 0, rescrolls = 0) => {
            const el = document.getElementById(`writeup-${id}`);

            // retry a few frames on initial load / view transitions
            if (!el) {
                if (tries < 48)
                    requestAnimationFrame(() =>
                        scrollToWriteup(id, smooth, tries + 1, rescrolls)
                    );
                return;
            }

            const findScrollParent = (node) => {
                let p = node && node.parentElement;
                while (p) {
                    const st = window.getComputedStyle(p);
                    const oy = st.overflowY;
                    if (
                        (oy === "auto" ||
                            oy === "scroll" ||
                            oy === "overlay") &&
                        p.scrollHeight > p.clientHeight + 2
                    ) {
                        return p;
                    }
                    p = p.parentElement;
                }
                return document.scrollingElement || document.documentElement;
            };

            const offset = 90; // matches scroll-margin-top / desired header offset

            const scrollOnce = (useSmooth) => {
                const scroller = findScrollParent(el);

                // window/document scroller
                if (
                    scroller === document.scrollingElement ||
                    scroller === document.documentElement ||
                    scroller === document.body
                ) {
                    const y = el.getBoundingClientRect().top + (window.pageYOffset || 0);
                    const top = Math.max(0, y - offset);
                    window.scrollTo({ top, behavior: useSmooth ? "smooth" : "auto" });
                    return;
                }

                // nested scroller
                const scRect = scroller.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const y = elRect.top - scRect.top + scroller.scrollTop;
                const top = Math.max(0, y - offset);

                if (typeof scroller.scrollTo === "function") {
                    scroller.scrollTo({ top, behavior: useSmooth ? "smooth" : "auto" });
                } else {
                    scroller.scrollTop = top;
                }
            };

            const verifyAndRescroll = () => {
                // if late layout shifts push it away, re-apply a couple times
                const delta = el.getBoundingClientRect().top - offset;
                if (Math.abs(delta) > 26 && rescrolls < 3) {
                    scrollOnce(false);
                    setTimeout(
                        () => scrollToWriteup(id, false, tries, rescrolls + 1),
                        260
                    );
                }
            };

            // wait 2 frames so layout (and .open max-height var) is applied before measuring
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollOnce(!!smooth);
                    // longer settle because your open animation is now slower
                    setTimeout(verifyAndRescroll, smooth ? 700 : 220);
                });
            });
        };

        const updateUrl = (idOrNull) => {
            const url = new URL(window.location.href);
            // Only manage the writeup id here. index.js owns the "view" param.
            if (idOrNull) url.searchParams.set("w", idOrNull);
            else url.searchParams.delete("w");

            history.replaceState({}, "", url);
        };

        const closeAll = () => {
            clearBodyObserver();
            openId.value = null;
            updateUrl(null);
        };

        const toggle = (id) => {
            const next = openId.value === id ? null : id;

            // switching cards: stop observing the old one first
            clearBodyObserver();

            if (next) loadedWriteups.add(next);
            openId.value = next;
            updateUrl(openId.value);

            if (openId.value) {
                // let DOM apply .open first, then measure height and scroll
                requestAnimationFrame(() => {
                    setBodyHeight(openId.value);
                    scrollToWriteup(openId.value, true);
                });
            }
        };

        const openFromUrl = (smooth) => {
            const sp = new URLSearchParams(window.location.search);
            const id = sp.get("w") || sp.get("writeup");
            if (!id) return;

            const exists = writeups.value.find((w) => w.id === id);
            if (!exists) return;

            // prevent browser scroll restoration from overriding our direct-link scroll
            try {
                if ("scrollRestoration" in history) history.scrollRestoration = "manual";
            } catch (e) {}

            clearBodyObserver();
            loadedWriteups.add(id);
            openId.value = id;

            requestAnimationFrame(() => {
                setBodyHeight(id);
                scrollToWriteup(id, !!smooth);
            });

            // one extra settle pass for late-loading assets / dvh changes
            setTimeout(() => {
                setBodyHeight(id);
                scrollToWriteup(id, false);
            }, 650);
        };

        D(() => {
            // direct-link support
            openFromUrl(false);

            // cross-view event support (index -> writeups)
            window.addEventListener("writeups:open", (e) => {
                const id = e?.detail?.id;
                if (!id) return;

                const exists = writeups.value.find((w) => w.id === id);
                if (!exists) return;

                clearBodyObserver();
                loadedWriteups.add(id);
                openId.value = id;

                requestAnimationFrame(() => {
                    setBodyHeight(id);
                    scrollToWriteup(id, true);
                });
            });

            // close any open card when index switches back to "about me"
            window.addEventListener("writeups:close", () => {
                closeAll();
            });

            // if page is restored from bfcache, re-apply direct-link scroll
            window.addEventListener("pageshow", (e) => {
                if (e.persisted) openFromUrl(false);
            });
        });

        return (i, a) => (
            m(),
            g("div", Root, [
                l("div", Main, [
                    l("div", Text, [
                        l("h2", null, "CTF Writeups"),
                        l(
                            "p",
                            null,
                            "Here are a couple of ctf writeups I've written. I plan to post more of these here as time goes on. I won't post AI slop here, all of it is written by me."
                        ),
                    ]),
                ]),

                l("div", List, [
                    (m(!0),
                        g(
                            W,
                            null,
                            A(T(writeups), (w) => (
                                m(),
                                g(
                                    "article", {
                                        key: w.id,
                                        id: `writeup-${w.id}`,
                                        class: "writeup-card" + (openId.value === w.id ? " open" : ""),
                                    }, [
                                        /* left tiles */
                                        l("div", { class: "writeup-badges-left" }, [
                                            l(
                                                "div", {
                                                    class: "writeup-badge writeup-diff" +
                                                        (w.difficulty === "brutal" ? " writeup-brutal" : ""),
                                                    style: { "--diff-color": diffColorOf(w.difficulty) },
                                                },
                                                I(w.difficulty),
                                                5
                                            ),
                                            l(
                                                "div", {
                                                    class: "writeup-badge writeup-cat" +
                                                        (w.category === "forensics" ?
                                                            " writeup-cat-forensics" :
                                                            ""),
                                                    style: { "--badge-color": w.catColor },
                                                },
                                                I(w.category),
                                                5
                                            ),
                                        ]),

                                        /* right tiles: challenge distinctions */
                                        l(
                                            "div", {
                                                class: "writeup-badges-right",
                                                style: {
                                                    display: w.firstBlood || w.author ? "" : "none",
                                                },
                                            },
                                            w.firstBlood ?
                                            [
                                                l(
                                                    "div", { class: "writeup-badge writeup-firstblood" },
                                                    "🩸First Blood🩸"
                                                ),
                                            ] :
                                            w.author ?
                                            [
                                                l(
                                                    "div", { class: "writeup-badge writeup-author" },
                                                    "✏️Author✏️"
                                                ),
                                            ] :
                                            []
                                        ),

                                        l(
                                            "header", { class: "writeup-head", onClick: () => toggle(w.id) }, [
                                                l("h3", { class: "writeup-title" }, I(w.title), 1),
                                                l("p", { class: "writeup-subtitle" }, I(w.subtitle), 1),
                                            ]
                                        ),

                                        l(
                                            "div", {
                                                class: "writeup-body",
                                                innerHTML: loadedWriteups.has(w.id) ? w.body : "",
                                            },
                                            null,
                                            8, ["innerHTML"]
                                        ),

                                        // bottom-right close button (only visible when .open)
                                        l(
                                            "button", {
                                                type: "button",
                                                class: "writeup-close-btn",
                                                title: "Close",
                                                "aria-label": "Close writeup",
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    closeAll();
                                                },
                                            },
                                            "×"
                                        ),
                                    ],
                                    2
                                )
                            )),
                            128
                        )),
                ]),
            ])
        );
    },
});

export { Writeups as default };
