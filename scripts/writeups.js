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
    const diffColorOf = (d) => (d === "hard" ? "#b91c1c" : "#22c55e"); // hard darker than #ef4444

    const writeups = S([
      {
        id: "emoji_captcha",
        title: "Emoji CAPTCHA",
        subtitle: "Bypassing a robot image classification authenticator",
        difficulty: "hard",
        category: "misc",
        catColor: "#a855f7", // purple
        body: String.raw`
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">misc</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~3-4 hours.
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>CAPTCHAs were invented to keep robots out and let humans in. We decided to reverse the rules.</p>
            <p>This is a remote challenge, you can connect to the service with: <code>nc emoji.challs.srdnlen.it 1717</code></p>
          </blockquote>

          <hr />

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
        subtitle:
          "Finding a flight and a trail with only a picture of a far away fogged mountain",
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

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p><strong>Part 1:</strong><br>
            Flag format is the flight number (as marketed by the operating airline) (w/ no spaces), followed by ‘-‘, followed by the baggage carousel number. example : <code>bkctf{DL2949-12C4}</code><br>
            can you dedeuce where this photo was taken?</p>

            <p><strong>Part 2:</strong><br>
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
        subtitle: "LITCTF 2025 · Hacking a unity game for all it has to offer",
        difficulty: "hard",
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
            <p>[!IMPORTANT]
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
        id: "jailpy3",
        title: "jailpy3",
        subtitle: "LITCTF 2025 · Decyphering a 11MB pyjail",
        difficulty: "easy",
        category: "rev",
        catColor: "#9ca3af", // gray
        body: String.raw`
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="writeup-meta">
            <strong>Time spent to solve:</strong> ~30 minutes.
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>Made with a burning passion for pyjails (i.e. creating insane payloads just to bypass some random condition), I turned everything in this python script into pyjail tech! Here's a program that's suppose to print a flag. But something seems to be getting in the way...</p>
          </blockquote>

          <hr />

          <p>At first, this challenge looks like a simple 'find the error' challenge. We are given a python file with two lines, an import line and an <strong><em>11 megabite</em></strong> long print statement.</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[{}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^32^64)+chr(8^32^64)+chr(2^16^32^64)]({}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^4^8^16^64)+chr(1^2^4^8^16^64)+chr(1^8^32^64)+chr(1^4^8^32^64)+chr(16^32^64)+chr(1^2^4^8^32^64)+chr(2^16^32^64)+chr(4^16^32^64)+chr(1^2^4^8^16^64)

...

.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>When you try and run this file, it gives you the error: </p>

          <p><code>
$ python3 'code.py' \n
Segmentation fault
</code></p>

          <p>How this file is right now, we can't really understand what is going on.To start us off, let's start simplifying this print statement.</p>

          <p>taking a quick glance at this file, we can see there are a lot of <code>chr(1^2^32^64)</code> type statements, which we can simplify pretty easily. <code>chr()</code> is a function from <code>builtins</code> that returns a character given that character's ascii table value. the statement <code>1^2^32^64</code> can be mathmatecally simplified as just adding 1+2+32+64 because all of these numbers are factors of 2 so xor can be equivalized to addition. Let's first start by going through the file and simplifying all of the xor statements.</p>

          <pre><code class="language-python">import re

def decode_chr_expressions(file_path):
    """
    Reads a Python file, decodes all chr() expressions with XOR operations
    using re.sub(), and returns the modified content.

    Args:
        file_path (str): The path to the input Python file.

    Returns:
        str: The file content with decoded characters, or None if an error occurs.
    """
    try:
        # Read the entire content of the file
        with open(file_path, 'r') as file:
            content = file.read()

        # Counter for decoded commands (debugging + its neat)
        decoded_count = 0

        def decoder_callback(match):
            nonlocal decoded_count
            expression = match.group(1)
            try:
                result = eval(expression)
                decoded_char = chr(result)
                decoded_count += 1
                return f"'{re.escape(decoded_char)}'"
            except Exception as e:
                # If there's an error, return the original string to avoid breaking the code
                return match.group(0)

        # Regular expression to find all occurrences of chr(...)
        pattern = r"chr\(([^)]+)\)"
        
        # Use re.sub() with the callback function to handle all replacements in one pass
        modified_content = re.sub(pattern, decoder_callback, content)

        return modified_content, decoded_count

    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None, None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None


decoded_content, decoded_count = decode_chr_expressions(original_file)

if decoded_content:
    # Print the summary of the process
    print("\n--- Decoding Summary ---")
    # A total count isn't as useful here as we're not iterating separately,
    # but we can print the number of successful decodes.
    print(f"Commands successfully decoded: {decoded_count}")
    
    # Save the decoded content to a new file named 'decoded1.py' (you can edit this to be the same file or if you want a new one with a different name)
    try:
        with open('decoded1.py', 'w') as new_file:
            new_file.write(decoded_content)
        print("\nDecoded content successfully saved to 'decoded1.py'")
    except Exception as e:
        print(f"Error writing to file 'decoded1.py': {e}")</code></pre>

          <p>With that, you are left with a smaller file 'decoded1.py' that now looks like this:</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[{}.__class__.__subclasses__()[2].copy.__builtins__['chr']({}.__class__.__subclasses__()[2].copy.__builtins__['__import__']('subprocess').select.POLLIN^{}

...

.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>Next, to make this more readable, let's get rid of all of the '+' signs and combine all of the repeatedly added characters into strings. You can do this several ways, here is what I did:</p>

          <pre><code class="language-python">import os
import re

def simplify_concatenated_strings(file_path):
    """
    Reads a file, finds concatenated string expressions like "'c'+'h'+'r'",
    and replaces them with the single resulting string.

    Args:
        file_path (str): The path to the input Python file.

    Returns:
        tuple: A tuple containing the modified content (str) and a count of
               replacements made (int). Returns (None, None) if an error occurs.
    """
    try:
        if not os.path.exists(file_path):
            print(f"Error: The file '{file_path}' was not found.")
            return None, None

        with open(file_path, 'r') as file:
            content = file.read()
        
        replacements_made = 0
        
        pattern = re.compile(r"(\'[^\']*?\'\s*\+\s*\'[^\']*?\')(?:\s*\+\s*\'[^\']*?\')*")
        
        def replacer_callback(match):
            nonlocal replacements_made
            expression = match.group(0)
            
            try:
                simplified_string = eval(expression)
                replacements_made += 1
                return f"'{simplified_string}'"
            except Exception as e:
                print(f"Error evaluating string expression '{expression}': {e}")
                return match.group(0)

        simplified_content = re.sub(pattern, replacer_callback, content)
        
        return simplified_content, replacements_made
    
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None

source_file = 'decoded1.py'
output_file = 'decoded2.py'

simplified_content, count = simplify_concatenated_strings(source_file)

if simplified_content:
    print("\n--- Replacement Summary ---")
    print(f"Successfully simplified {count} concatenated string expressions.")
    
    try:
        with open(output_file, 'w') as new_file:
            new_file.write(simplified_content)
        print(f"\nSimplified content successfully saved to '{output_file}'")
    except Exception as e:
        print(f"Error writing to file '{output_file}': {e}")</code></pre>

          <p>With that, our file now will look like this</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[{}.__class__.__subclasses__()[2].copy.__builtins__['chr']({}.__class__.__subclasses__()[2].copy.__builtins__['__import__']('subprocess').select.POLLIN^{}

...

.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>Now it gets a little more complex to simplify. We see a repeated call of <code>{}.__class__.__subclasses__()[2].copy.__builtins__</code>. In short, this is just a call to <code>__builtins__</code>. We can simply replace all instances of <code>{}.__class__.__subclasses__()[2].copy.__builtins__</code> with <code>__builtins__</code>.</p>

          <pre><code class="language-python">import re

def simplify_builtins_expressions(file_path):
    """
    Reads a file and replaces the obfuscated __builtins__ access
    with the simple '__builtins__' name.
    """
    with open(file_path, 'r') as file:
        content = file.read()

    pattern = r"\{\}\.__class__\.__subclasses__\(\)\[2\]\.copy\.__builtins__"
    simplified_content, count = re.subn(pattern, '__builtins__', content)
    return simplified_content, count</code></pre>

          <p>that makes things much more readable,</p>

          <pre><code class="language-python">import collections
print(__builtins__[__builtins__['chr'](__builtins__['__import__']('subprocess').select.POLLIN^__builtins__['__import__']('subprocess').select.POLLPRI^__builtins__['__import__']('subprocess').select.POLLNVAL^__builtins__['__import__']('subprocess').select.POLLRDNORM)+__builtins__['chr'](__builtins__['__import__']('subprocess').select.POLLERR^__builtins__['__import__']

...

.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>From here, we need to look into the <code>__builtins__['__import__']('subprocess').select.POLLIN</code> type lines. They repeat a lot, just with different ending calls. A quick google search tells us that this code is supposed to simply return whatever number <code>POLLIN</code> is set to in the subprocess function.</p>

          <p>Another google search tells us what other values are set to:
POLLIN: 1,
POLLPRI: 2,
POLLOUT: 4,
POLLRDNORM: 64,
POLLRDBAND: 128,
POLLWRNORM: 256,
POLLWRBAND: 512,
POLLERR: 8,
POLLHUP: 16,
POLLNVAL: 32,</p>

          <p>With this information, we can greatly simplify what is left. Replace all of the <code>__builtins__['__import__']('subprocess').select.POLLIN</code> calls with the corresponding integer.</p>

          <pre><code class="language-python">import os
import re

def replace_obfuscated_select_constants(file_path):
    try:
        if not os.path.exists(file_path):
            print(f"Error: The file '{file_path}' was not found.")
            return None, None

        with open(file_path, 'r') as file:
            content = file.read()
            
        constant_values = {
            'POLLIN': 1,
            'POLLPRI': 2,
            'POLLOUT': 4,
            'POLLRDNORM': 64,
            'POLLRDBAND': 128,
            'POLLWRNORM': 256,
            'POLLWRBAND': 512,
            'POLLERR': 8,
            'POLLHUP': 16,
            'POLLNVAL': 32,
        }
        
        pattern = re.compile(r"__builtins__\['__import__']\('subprocess'\)\.select\.([A-Z_]+)")
        
        def replacer_callback(match):
            constant_name = match.group(1)
            return str(constant_values.get(constant_name, match.group(0)))
            
        simplified_content = re.sub(pattern, replacer_callback, content)
        return simplified_content, 0
    
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None, None</code></pre>

          <p>That last simplification greatly reduced the size of the file. Now, the file is only about 102 kb. We have a very familiar look to the print statement now:</p>

          <pre><code class="language-python">print(chr(4^8^64)+chr(1^8^64)+chr(4^16^64)+chr(1^2^64)+chr(4^16^64)+chr(2^4^64)+chr(1^2^8^16^32^64)+chr(8^32^64)+chr(16^32)+chr(1^2^4^16^32^64)+chr(1^2^4^8^16^64)+chr(1^2^32^64)+chr(16^32)+chr(2^4^8^32^64)+chr(2^4^16^32^64)+chr(1^2^4^8^32^64)+chr(4^8^32^64)

...

)</code></pre>

          <p>once that is done, you get this file:</p>

          <pre><code class="language-python">import collections
print('L'+'I'+'T'+'C'+'T'+'F'+'{'+'h'+'0'+'w'+'_'+'c'+'0'+'n'+'v'+'o'+'l'+'u'+'7'+'e'+'d'+'_'+'c'+'4'+'n'+'_'+'i'+'7'+'_'+'g'+__builtins__['__import__']('types').FunctionType(__builtins__['__import__']('marshal').loads(__builtins__['bytes'].fromhex('630000000000000000000000000300000000000000f3300000009700640064016c005a00020065006a020000000000000000000000000000000000006402ab01000000000000010079012903e9000000004ee9010000002902da026f73da055f65786974a900f300000000fa033c783efa083c6d6f64756c653e7208000000010000007314000000f003010101db0009883888328f38893890418d3b7206000000')), {'os': __builtins__['__import__']('os')})()+'3'+'7'+'_'+'f'+'0'+'r'+'_'+'0'+'n'+'3'+'_'+'s'+'1'+'m'+'p'+'l'+'3'+'_'+'w'+'0'+'r'+'k'+'4'+'r'+'o'+'u'+'n'+'d'+'?'+'?'+'}')</code></pre>

          <p>If we skip the middle statement, we can read the full flag:
          <code>LITCTF{h0w_c0nvolu7ed_c4n_i7_g37_f0r_0n3_s1mpl3_w0rk4round??}</code></p>

          <p>If we continue to simplify this code, we can see what was crashing the code.
The code that divides the flag simplifies down to the line <code>os._exit(2)</code> which simply exits the code prematurely.</p>
        `,
      },
    ]);

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
                "article",
                {
                  key: w.id,
                  id: `writeup-${w.id}`,
                  class:
                    "writeup-card" + (openId.value === w.id ? " open" : ""),
                },
                [
                  /* left tiles */
                  l("div", { class: "writeup-badges-left" }, [
                    l(
                      "div",
                      {
                        class: "writeup-badge writeup-diff",
                        style: { "--diff-color": diffColorOf(w.difficulty) },
                      },
                      I(w.difficulty),
                      5
                    ),
                    l(
                      "div",
                      {
                        class: "writeup-badge writeup-cat",
                        style: { "--badge-color": w.catColor },
                      },
                      I(w.category),
                      5
                    ),
                  ]),

                  /* right tile (only for Emoji CAPTCHA) */
                  l(
                    "div",
                    {
                      class: "writeup-badges-right",
                      style: {
                        display: w.id === "emoji_captcha" ? "" : "none",
                      },
                    },
                    [
                      l(
                        "div",
                        { class: "writeup-badge writeup-firstblood" },
                        "🩸First Blood🩸"
                      ),
                    ]
                  ),

                  l(
                    "header",
                    { class: "writeup-head", onClick: () => toggle(w.id) },
                    [
                      l("h3", { class: "writeup-title" }, I(w.title), 1),
                      l("p", { class: "writeup-subtitle" }, I(w.subtitle), 1),
                    ]
                  ),

                  l(
                    "div",
                    {
                      class: "writeup-body",
                      innerHTML: w.body,
                    },
                    null,
                    8,
                    ["innerHTML"]
                  ),

                  // bottom-right close button (only visible when .open)
                  l(
                    "button",
                    {
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