// writups.js (full file, patched: CSS-only open/close using .open class)

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
        id: "emoji_captcha",
        title: "Emoji CAPTCHA",
        subtitle: "Work In Progress",
        badgesLeft: [
          { text: "easy", color: "#60a5fa" },
          { text: "wip", color: "#f59e0b" },
        ],
        badgesRight: [{ text: "🩸First Blood🩸", color: "#ef4444" }],
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">wip</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>Work In Progress...</p>
          </blockquote>

          <hr />

          <p>Work In Progress...</p>
        `,
      },

      {
        id: "eye_on_the_sky",
        title: "Eye on the Sky",
        subtitle: "Work In Progress",
        badgesLeft: [
          { text: "easy", color: "#60a5fa" },
          { text: "wip", color: "#f59e0b" },
        ],
        badgesRight: [],
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">wip</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>Work In Progress...</p>
          </blockquote>

          <hr />

          <p>Work In Progress...</p>
        `,
      },

      {
        id: "kaizo_brackeys",
        title: "Kaizo Brackeys",
        subtitle: "LITCTF · rev — patching Unity scripts to skip scenes and read the flag",
        badgesLeft: [
          { text: "easy", color: "#60a5fa" },
          { text: "rev", color: "#22c55e" },
        ],
        badgesRight: [],
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>only real ones copied those amazing tutorials</p>
            <p>Note: the flag matches this regex: <code>^LITCTF\\{[A-Z]+(?:_[A-Z]+)*\\}$</code></p>
          </blockquote>

          <hr />

          <p>For this flag, we are given the game files for a game called Kaizo Brackeys. Going through the directories, we can see that there is a file called UnityCrashHandler.exe. This tells us that this game was made with Unity. My first idea was to just run the Kaizo Brackeys.exe file. Running it brings up a menu where you can start the game.</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_menu.png" alt="Kaizo Brackeys Menu" width="800">

          <p>Upon starting the game, you are placed into a game where you must avoid obstacles in order to reach the end.</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_game.png" alt="Kaizo Brackeys Running" width="800">

          <p>The first level is completable by going to the right. Once a level has been beaten, this screen comes up.</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_complete.png" alt="Kaizo Brackeys Level Change" width="800">

          <p>We are then brought to the next level, which is impractical to beat without cheats. Doing all of this helps us understand how this game works. If you reach the end of a level, you are brought to the next level. With this in mind, it is viable (<em>but not true, more on that later</em>) to believe that once we beat the game, we get the flag.</p>

          <p>Now to the actual rev part of the problem. We need some way to either let us see what you see when you win, or we need to to make it so getting past levels is a lot easier. A quick google search will tell us that there is no point looking/editing the actual .exe file, because that file only contains information about Unity's compiler. With another google search, we can find out that scripts that the .exe file reads can be found in the <code>_data/Managed/Assembly-CSharp.dll file</code>. To read/edit dll files, I like using a neat tool called DnSpy (http://dnspy.org/).</p>

          <p>To get to the scripts, open up DnSpy and go to <code>File</code> &gt;&gt; <code>Open</code> and then select the <code>Assembly-CSharp.dll</code> in <code>kaizobrackeys-export\\kaizobrackeys-export\\x86-64\\Kaizo Brackeys_Data\\Managed</code>. Once you open this file up, open up the file tree for <code>Assembly-CSharp/Assembly-CSharp.dll</code>. You should see a bunch of files like "PE", "Type References", and "References". If you want to know more about what each of these files hold, google.com. For our purposes, we want to open the "_" folder. In there, we can see a whole bunch of scripts that were written specifically for the game. None of these scripts are very long, so I highly suggest you look through all of them and see how this game runs. For the purpose of beating the game, there are a couple names that stand out.</p>

          <p>Take a look at Credits, Level Complete, and Player Movement.</p>

          <p>In the Credits script, it seems just to be code for a button, and does not have much use to us.
In the Level Complete scipt, it simply tells Unity to go to the next scene. The game will crash if you try and load a scene that doesn't exist, so this is for the best for now.
The Player Movement script, we can see how the player input is recieved and used. This is the script that I edited first. Instead of moving forward at a constantly increasing speed, how about we change the script to allow for wasd movement and a key that moves the player up? This can be done either through googling commands or chatGPT. To edit these scripts, simply right click the Player Movement script and click <code>Edit Class</code>. Once you are done editing the file, hit the <code>compile</code> button on the bottom right. If you have any issues compiling, try to edit each function and class seperately.</p>

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

          <p>This script lets you move around with wasd controls and lets you move up with q. Once you have compiled your script with no errors, save your file by going to <code>File</code> &gt;&gt; <code>Save Module...</code>.</p>

          <p>With that, you can now run the kaizo_brackeys.exe file again and breeze through all of the levels until you get to this screen: </p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_credits.png" alt="Kaizo Brackeys Menu" width="800">

          <p>By pressing the exit button, all that happens is the game closes. It seems our previous assumption of the flag being in the credits was wrong. Our best bet now is to find more information about the game, and a good way of doing that is through a software called <a href="https://assetripper.github.io/AssetRipper/articles/Downloads.html" target="_blank" rel="noopener">Asset Ripper</a>.</p>

          <p>Asset Ripper is built for gathering assets for a Unity .exe filespace and peicing them together to create a file that Unity can read again. To use it, run the AssetRipper.GUI.Free.exe file, then in the pop up open your Kaizo Brackeys_Data file through <code>File</code> &gt;&gt; <code>Open Folder</code>. Once that is done, you can immediately export it as a Unity Project by going to <code>Export</code>, Giving it a folder to print to (IT WILL REPLACE ALL FILES IN A FOLDER if it is not created in a new folder!), then clicking <code>Export Unity Project</code>.</p>

          <p>One you have the Unity project exported, you can open that file through <a href="https://unity.com/download" target="_blank" rel="noopener">Unity</a>.</p>

          <blockquote>
            <p>[!IMPORTANT]
I should note, Asset Ripper only gathers assets, so the full game will not be runnable at this current state. The reason we are doing this is to see files and file structure that is not included in the written scripts.</p>
          </blockquote>

          <p>Once I got the file open in Unity, The first thing I did was look for the credits scene to see if I was missing something. What I saw in the scenes file was interesting.</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_scenes.png" alt="Kaizo Brackeys Scenes" width="800">

          <p>As I remembered, the game did not seem like it was 6 levels long. We can confirm this by looking at the scene list (<code>File</code> &gt;&gt; <code>Build Profiles</code>). From there, we can see that the scenes are organised as such:</p>

          <img class="writeup-img" src="/images/writups/kaizo_brackeys_scene_list.png" alt="Kaizo Brackeys Scene List" width="800">

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
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_one.png" alt="Kaizo Brackeys Flag Block" width="800">

          <p><em>View of "LIT..." from the right.</em></p>
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_two.png" alt="Kaizo Brackeys Flag Part 1" width="800">

          <p><em>View of "LIT..." from above.</em></p>
          <img class="writeup-img" src="/images/writups/kaizo_brackeys_flag_three.png" alt="Kaizo Brackeys Flag Part 2" width="800">

          <p>By slowly moving forward and writing down each character, you spell the flag:</p>

          <p><code>LITCTF{I_HAD_TOO_MUCH_FUN_MAKING_THIS}</code></p>
        `,
      },

      {
        id: "jailpy3",
        title: "jailpy3",
        subtitle: "LITCTF · rev — peeling an 11MB pyjail print into a readable flag",
        badgesLeft: [
          { text: "easy", color: "#60a5fa" },
          { text: "rev", color: "#22c55e" },
        ],
        badgesRight: [],
        body: `
          <p class="writeup-meta">
            <strong>Category:</strong> <span class="pill">rev</span>
          </p>

          <p class="desc-label"><strong>Description:</strong></p>
          <blockquote class="desc-area">
            <p>Made with a burning passion for pyjails (i.e. creating insane payloads just to bypass some random condition), I turned everything in this python script into pyjail tech! Here's a program that's suppose to print a flag. But something seems to be getting in the way...</p>
          </blockquote>

          <hr />

          <p>At first, this challenge looks like a simple 'find the error' challenge. We are given a python file with two lines, an import line and an <strong><em>11 megabite</em></strong> long print statement.</p>

          <pre><code class="language-python">import collections
print({}.__class__.__subclasses__()[2].copy.__builtins__[{}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^32^64)+chr(8^32^64)+chr(2^16^32^64)]({}.__class__.__subclasses__()[2].copy.__builtins__[chr(1^2^4^8^16^64)+chr(1^2^4^8^16^64)+chr(1^8^32^64)+chr(1^4^8^32^64)+chr(16^32^64)+chr(1^2^4^8^32^64)+chr(2^16^32^64)+chr(4^16^32^64)+chr(1^2^4^8^16^64)+chr(1^2^4^8^16^64)](chr(1^2^16^32^64)

...

.select.POLLRDNORM)).select.POLLRDNORM))</code></pre>

          <p>When you try and run this file, it gives you the error: </p>

          <p><code>
$ python3 'code.py' \\n
Segmentation fault
</code></p>

          <p>How this file is right now, we can't really understand what is going on.To start us off, let's start simplifying this print statement.</p>

          <p>taking a quick glance at this file, we can see there are a lot of <code>chr(1^2^32^64)</code> type statements, which we can simplify pretty easily. <code>chr()</code> is a function from <code>builtins</code> that returns a character given that character's ascii table value. the statement <code>1^2^32^64</code> can be mathmatecally simplified as just adding 1+2+32+64 because all of these numbers are factors of 2 so xor can be equivalized to addition. Let's first start by going through the file and simplifying all of the xor statements.</p>

          <p>Continuing to simplify the middle statement shows what was crashing the code.
The code that divides the flag simplifies down to the line <code>os._exit(2)</code> which simply exits the code prematurely.</p>
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
                  // top-left badges (only visible while card is closed via CSS)
                  l("div", { class: "writeup-badges-left" }, [
                    (m(!0),
                    g(
                      W,
                      null,
                      A(w.badgesLeft, (b) => (
                        m(),
                        g(
                          "span",
                          {
                            key: b.text,
                            class: "writeup-tag",
                            style: { "--tag-color": b.color },
                          },
                          I(b.text),
                          5
                        )
                      )),
                      128
                    )),
                  ]),

                  l("header", { class: "writeup-head", onClick: () => toggle(w.id) }, [
                    l("div", { class: "writeup-head-top" }, [
                      l("h3", { class: "writeup-title" }, I(w.title), 1),
                      w.badgesRight && w.badgesRight.length
                        ? l("div", { class: "writeup-badges-right" }, [
                            (m(!0),
                            g(
                              W,
                              null,
                              A(w.badgesRight, (b) => (
                                m(),
                                g(
                                  "span",
                                  {
                                    key: b.text,
                                    class: "writeup-tag",
                                    style: { "--tag-color": b.color },
                                  },
                                  I(b.text),
                                  5
                                )
                              )),
                              128
                            )),
                          ])
                        : null,
                    ]),
                    l("p", { class: "writeup-subtitle" }, I(w.subtitle), 1),
                  ]),

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

export { Writups as default };