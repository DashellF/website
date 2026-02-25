// writups.js (full file, patched)

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
        id: "kaizo_brackeys",
        title: "Kaizo Brackeys",
        subtitle: "LITCTF · rev — patching Unity scripts to skip scenes and read the flag",
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>only real ones copied those amazing tutorials</p>
            <p><strong>Note:</strong> the flag matches this regex:
              <code>^LITCTF\\\\{[A-Z]+(?:_[A-Z]+)*\\\\}$</code>
            </p>
          </blockquote>

          <hr />

          <p>
            For this flag, we are given the game files for a game called <strong>Kaizo Brackeys</strong>.
            Going through the directories, we can see that there is a file called
            <code>UnityCrashHandler.exe</code>. This tells us that this game was made with Unity.
            My first idea was to just run <code>Kaizo Brackeys.exe</code>. Running it brings up a menu where you can start the game.
          </p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_menu.png" alt="Kaizo Brackeys Menu" />

          <p>
            Upon starting the game, you are placed into a game where you must avoid obstacles in order to reach the end.
          </p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_game.png" alt="Kaizo Brackeys Running" />

          <p>
            The first level is completable by going to the right. Once a level has been beaten, this screen comes up.
          </p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_complete.png" alt="Kaizo Brackeys Level Change" />

          <p>
            We are then brought to the next level, which is impractical to beat without cheats. Doing all of this helps us
            understand how this game works. If you reach the end of a level, you are brought to the next level. With this in mind,
            it is viable (<em>but not true, more on that later</em>) to believe that once we beat the game, we get the flag.
          </p>

          <h4>Finding the scripts</h4>
          <p>
            Now to the actual rev part of the problem. We need some way to either let us see what you see when you win,
            or we need to make it so getting past levels is a lot easier.
          </p>
          <p>
            A quick google search will tell us that there is no point looking/editing the actual <code>.exe</code> file,
            because that file only contains information about Unity's compiler. With another google search, we can find out that
            scripts that the <code>.exe</code> file reads can be found in the
            <code>_data/Managed/Assembly-CSharp.dll</code> file.
          </p>
          <p>
            To read/edit dll files, I like using a neat tool called
            <a href="http://dnspy.org/" target="_blank" rel="noopener">DnSpy</a>.
          </p>

          <p>
            To get to the scripts, open up DnSpy and go to <code>File</code> &gt;&gt; <code>Open</code> and then select the
            <code>Assembly-CSharp.dll</code> in
            <code>kaizobrackeys-export\\kaizobrackeys-export\\x86-64\\Kaizo Brackeys_Data\\Managed</code>.
            Once you open this file up, open up the file tree for <code>Assembly-CSharp/Assembly-CSharp.dll</code>.
          </p>

          <p>
            For our purposes, we want to open the <code>_</code> folder. In there, we can see a whole bunch of scripts that were
            written specifically for the game. None of these scripts are very long, so I highly suggest you look through all of them
            and see how this game runs.
          </p>

          <p>Take a look at <strong>Credits</strong>, <strong>Level Complete</strong>, and <strong>Player Movement</strong>:</p>
          <ul>
            <li><strong>Credits</strong>: just code for a button, not much use to us.</li>
            <li><strong>Level Complete</strong>: tells Unity to go to the next scene.</li>
            <li><strong>Player Movement</strong>: how player input is received and used.</li>
          </ul>

          <h4>Editing PlayerMovement for cheats</h4>
          <p>
            The <strong>Player Movement</strong> script is the one I edited first.
            Instead of moving forward at a constantly increasing speed, change it to allow for WASD movement and a key that moves
            the player up.
          </p>
          <p>
            To edit these scripts, right click the Player Movement script and click <code>Edit Class</code>.
            Once you are done editing the file, hit the <code>compile</code> button on the bottom right.
            If you have any issues compiling, try to edit each function and class separately.
          </p>

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

          <p>
            This script lets you move around with WASD controls and lets you move up with <code>q</code>.
            Once you have compiled your script with no errors, save your file by going to
            <code>File</code> &gt;&gt; <code>Save Module...</code>.
          </p>

          <p>With that, you can now run the game again and breeze through all of the levels until you get to this screen:</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_credits.png" alt="Kaizo Brackeys Credits" />

          <p>
            By pressing the exit button, all that happens is the game closes. It seems our previous assumption of the flag being
            in the credits was wrong.
          </p>

          <h4>Inspecting scenes with AssetRipper</h4>
          <p>
            Our best bet now is to find more information about the game, and a good way of doing that is through a software called
            <a href="https://assetripper.github.io/AssetRipper/articles/Downloads.html" target="_blank" rel="noopener">Asset Ripper</a>.
          </p>

          <p>
            Asset Ripper is built for gathering assets for a Unity <code>.exe</code> filespace and piecing them together to create
            a file that Unity can read again. To use it, run <code>AssetRipper.GUI.Free.exe</code>, then in the pop up open your
            <code>Kaizo Brackeys_Data</code> folder through <code>File</code> &gt;&gt; <code>Open Folder</code>.
            Once that is done, export it as a Unity Project by going to <code>Export</code>, giving it a folder to print to
            (it will replace files if you reuse a folder), then clicking <code>Export Unity Project</code>.
          </p>

          <p>
            Once you have the Unity project exported, you can open that file through
            <a href="https://unity.com/download" target="_blank" rel="noopener">Unity</a>.
          </p>

          <div class="callout important">
            <strong>IMPORTANT:</strong>
            Asset Ripper only gathers assets, so the full game will not be runnable at this current state.
            The reason we are doing this is to see files and file structure that is not included in the written scripts.
          </div>

          <p>Once I got the file open in Unity, the first thing I did was look for the credits scene to see if I was missing something.</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_scenes.png" alt="Kaizo Brackeys Scenes" />

          <p>
            As I remembered, the game did not seem like it was 6 levels long. We can confirm this by looking at the scene list
            (<code>File</code> &gt;&gt; <code>Build Profiles</code>). From there, we can see that the scenes are organised as such:
          </p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_scene_list.png" alt="Kaizo Brackeys Scene List" />

          <p>
            The credits scene is executed early, not allowing us to get to the last two scenes. If we go back to DnSpy,
            we can get around this by simply skipping the credits scene in the <code>LevelComplete</code> script.
          </p>

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

          <p>
            Once we save this code, we can run the program, and it successfully skips the credits scene and lets us go on to level 5 and 6.
            Level 5 you can complete normally, but if you take a close look at Level 6's format, you can tell that after the only
            2-block-tall obstacle, it spells out the flag.
          </p>

          <p class="caption"><em>View of the 2 block tall obstacle</em></p>
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_one.png" alt="Kaizo Brackeys Flag Block" />

          <p class="caption"><em>View of "LIT..." from the right.</em></p>
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_two.png" alt="Kaizo Brackeys Flag Part 1" />

          <p class="caption"><em>View of "LIT..." from above.</em></p>
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_three.png" alt="Kaizo Brackeys Flag Part 2" />

          <p>
            By slowly moving forward and writing down each character, you spell the flag:
            <code>LITCTF{I_HAD_TOO_MUCH_FUN_MAKING_THIS}</code>
          </p>
        `,
      },

      {
        id: "jailpy3",
        title: "jailpy3",
        subtitle: "LITCTF · rev — peeling an 11MB pyjail print into a readable flag",
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>
              Made with a burning passion for pyjails (i.e. creating insane payloads just to bypass some random condition),
              I turned everything in this python script into pyjail tech! Here's a program that's suppose to print a flag.
              But something seems to be getting in the way...
            </p>
          </blockquote>

          <hr />

          <p>
            At first, this challenge looks like a simple “find the error” challenge. We are given a python file with two lines:
            an import line and an <strong>~11 megabyte</strong> long print statement.
          </p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[{}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^32^64)+chr(8^32^64)+chr(2^16^32^64)]({}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^4^8^16^64)+chr(1^2^4^8^16^64)+chr(1^8^32^64)+chr(1^4^8^32^64)+chr(16^32^64)+chr(1^2^4^8^32^64)+chr(2^16^32^64)+chr(4^16^32^64)+chr(1^2^4^8^16^64)+chr(1^2^4^8^16^64)](chr(1^2^16^32^64)
...
.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>When you try and run this file, it crashes immediately:</p>

          <pre><code class="language-bash">$ python3 code.py
Segmentation fault</code></pre>

          <p>
            In its current form, we can’t really understand what is going on, so the goal is just to keep simplifying until it turns
            into something readable.
          </p>

          <h4>Step 1: simplifying <code>chr(1^2^32^64)</code> expressions</h4>
          <p>
            Taking a quick glance, there are tons of expressions like <code>chr(1^2^32^64)</code>.
            <code>chr()</code> returns a character from an ASCII integer, and because these are all powers of 2,
            XOR is effectively just “turning on bits” (so for this style it behaves like summing those powers).
            I wrote a script to scan the file and replace every <code>chr(...)</code> with its decoded character.
          </p>

          <pre><code class="language-python">import re

def decode_chr_expressions(file_path):
    """
    Reads a Python file, decodes all chr() expressions with XOR operations
    using re.sub(), and returns the modified content.
    """
    with open(file_path, 'r') as file:
        content = file.read()

    decoded_count = 0

    def decoder_callback(match):
        nonlocal decoded_count
        expression = match.group(1)
        try:
            result = eval(expression)
            decoded_char = chr(result)
            decoded_count += 1
            return f"'{re.escape(decoded_char)}'"
        except Exception:
            return match.group(0)

    pattern = r"chr\\(([^)]+)\\)"
    modified_content = re.sub(pattern, decoder_callback, content)
    return modified_content, decoded_count

decoded_content, decoded_count = decode_chr_expressions("code.py")

if decoded_content:
    print(f"Commands successfully decoded: {decoded_count}")
    with open('decoded1.py', 'w') as new_file:
        new_file.write(decoded_content)</code></pre>

          <p>After that pass, the file is still huge, but it starts to look like this:</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[
  {}.__class__.__subclasses__()[2].copy.__builtins__['c'+'h'+'r'](
    {}.__class__.__subclasses__()[2].copy.__builtins__['__import__']('subprocess').select.POLLIN ^ ...
  )
  ...
)</code></pre>

          <h4>Step 2: collapse concatenated strings</h4>
          <p>
            Next, I wanted to get rid of all the <code>'c'+'h'+'r'</code> style joins and replace them with real strings.
            There are a bunch of ways to do this; here’s what I used:
          </p>

          <pre><code class="language-python">import os
import re

def simplify_concatenated_strings(file_path):
    """
    Replaces concatenated single-quoted string expressions like:
      'c'+'h'+'r'
    with:
      'chr'
    """
    with open(file_path, 'r') as file:
        content = file.read()

    replacements_made = 0
    pattern = re.compile(r"(\\'[^\']*?\\'\\s*\\+\\s*\\'[^\']*?\\')(?:\\s*\\+\\s*\\'[^\']*?\\')*")

    def replacer_callback(match):
        nonlocal replacements_made
        expression = match.group(0)
        try:
            simplified_string = eval(expression)
            replacements_made += 1
            return f"'{simplified_string}'"
        except Exception:
            return match.group(0)

    simplified_content = re.sub(pattern, replacer_callback, content)
    return simplified_content, replacements_made

simplified_content, count = simplify_concatenated_strings("decoded1.py")
with open("decoded2.py", "w") as f:
    f.write(simplified_content)</code></pre>

          <p>Now you get something like:</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[
  {}.__class__.__subclasses__()[2].copy.__builtins__['chr'](
    {}.__class__.__subclasses__()[2].copy.__builtins__['__import__']('subprocess').select.POLLIN ^ ...
  )
  ...
)</code></pre>

          <h4>Step 3: simplify the repeated <code>__builtins__</code> access</h4>
          <p>
            The repeating chain <code>{}.__class__.__subclasses__()[2].copy.__builtins__</code> is just a (very) obfuscated way of
            accessing <code>__builtins__</code>. Instead of trying to “find/replace” manually on an enormous file, I did it with regex:
          </p>

          <pre><code class="language-python">import re

def simplify_builtins_expressions(file_path):
    with open(file_path, 'r') as file:
        content = file.read()

    pattern = r"\\{\\}\\.__class__\\.__subclasses__\\(\\)\\[2\\]\\.copy\\.__builtins__"
    simplified_content, count = re.subn(pattern, "__builtins__", content)
    return simplified_content, count

simplified_content, count = simplify_builtins_expressions("decoded2.py")
with open("decoded3.py", "w") as f:
    f.write(simplified_content)

print(f"Instances simplified: {count}")</code></pre>

          <p>At this point, it becomes much more readable:</p>

          <pre><code class="language-python">import collections
print(__builtins__[__builtins__['chr'](
  __builtins__['__import__']('subprocess').select.POLLIN ^
  __builtins__['__import__']('subprocess').select.POLLPRI ^
  __builtins__['__import__']('subprocess').select.POLLNVAL ^
  __builtins__['__import__']('subprocess').select.POLLRDNORM
) + ... ](...))</code></pre>

          <h4>Step 4: replacing select “POLL*” constants with integers</h4>
          <p>
            The next repeated pattern is the <code>__builtins__['__import__']('subprocess').select.POLLIN</code> style access.
            That’s just grabbing the integer values for the poll constants.
          </p>

          <p>Values used:</p>
          <ul>
            <li><code>POLLIN</code>: 1</li>
            <li><code>POLLPRI</code>: 2</li>
            <li><code>POLLOUT</code>: 4</li>
            <li><code>POLLERR</code>: 8</li>
            <li><code>POLLHUP</code>: 16</li>
            <li><code>POLLNVAL</code>: 32</li>
            <li><code>POLLRDNORM</code>: 64</li>
            <li><code>POLLRDBAND</code>: 128</li>
            <li><code>POLLWRNORM</code>: 256</li>
            <li><code>POLLWRBAND</code>: 512</li>
          </ul>

          <p>This replacement script greatly reduced the file size (down to ~102KB):</p>

          <pre><code class="language-python">import os
import re

def replace_obfuscated_select_constants(file_path):
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

    pattern = re.compile(r"__builtins__\\['__import__'\\]\\('subprocess'\\)\\.select\\.([A-Z_]+)")

    def replacer_callback(match):
        name = match.group(1)
        return str(constant_values.get(name, match.group(0)))

    return re.sub(pattern, replacer_callback, content)

simplified = replace_obfuscated_select_constants("decoded4.py")
with open("decoded5.py", "w") as f:
    f.write(simplified)</code></pre>

          <h4>Re-running the pipeline and landing on the flag</h4>
          <p>
            After repeating the same two “workhorse” cleanups (decode <code>chr(xor)</code> and collapse string concatenations),
            the output eventually turns into something that is basically just building the flag as a string, with one weird chunk in the middle:
          </p>

          <pre><code class="language-python">import collections
print('L'+'I'+'T'+'C'+'T'+'F'+'{'+'h'+'0'+'w'+'_'+'c'+'0'+'n'+'v'+'o'+'l'+'u'+'7'+'e'+'d'+'_'+'c'+'4'+'n'+'_'+'i'+'7'+'_'+'g'
+ __builtins__['__import__']('types').FunctionType(
    __builtins__['__import__']('marshal').loads(__builtins__['bytes'].fromhex('63000000...')),
    {'os': __builtins__['__import__']('os')}
  )()
+ '3'+'7'+'_'+'f'+'0'+'r'+'_'+'0'+'n'+'3'+'_'+'s'+'1'+'m'+'p'+'l'+'3'+'_'+'w'+'0'+'r'+'k'+'4'+'r'+'o'+'u'+'n'+'d'+'?'+'?'+'}')</code></pre>

          <p>
            Collapsing the character concatenations gives a “final” readable form:
          </p>

          <pre><code class="language-python">import collections
print('LITCTF{h0w_c0nvolu7ed_c4n_i7_g'
+ __builtins__['__import__']('types').FunctionType(
    __builtins__['__import__']('marshal').loads(__builtins__['bytes'].fromhex('63000000...')),
    {'os': __builtins__['__import__']('os')}
  )()
+ '37_f0r_0n3_s1mpl3_w0rk4round??}')</code></pre>

          <p>
            If we skip the middle statement, we can read the full flag:
            <code>LITCTF{h0w_c0nvolu7ed_c4n_i7_g37_f0r_0n3_s1mpl3_w0rk4round??}</code>
          </p>

          <h4>What caused the crash?</h4>
          <p>
            Continuing to simplify the middle statement shows what was killing the program:
            it reduces to <code>os._exit(2)</code>, which force-exits the process prematurely.
          </p>
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

      // close any open card when index switches back to "about me"
      window.addEventListener("writups:close", () => {
        openId.value = null;
        updateUrl(null);
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
              "Here are a couple of ctf writups I've written. I plan to post more of these here as time goes on."
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
      ])
    );
  },
});

export { Writups as default };