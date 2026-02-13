class ShufflePool {
    constructor(items) {
        this.original = [...items];
        this.pool = [];
        this.shuffle();
    }

    shuffle() {
        this.pool = [...this.original];
        for (let i = this.pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.pool[i], this.pool[j]] = [this.pool[j], this.pool[i]];
        }
    }

    next() {
        if (this.pool.length === 0) {
            this.shuffle();
        }
        return this.pool.pop();
    }
}

const envelope = document.getElementById("envelope-container");
const letter   = document.getElementById("letter-container");
const noBtn    = document.getElementById("no-btn");
const yesBtn   = document.querySelector(".yes-btn");
const title    = document.getElementById("letter-title");
const subtitle = document.getElementById("letter-subtitle");
const catImg   = document.getElementById("letter-cat");
const buttons  = document.getElementById("letter-buttons");
const finalText = document.getElementById("final-text");

let attempts = 0;
let yesScale = 1;
let isFlying = false;

const bgMusic = new Audio("sound-effects/background_yes_music.mp3");
bgMusic.loop = true;
bgMusic.preload = "auto";

// Zelda Heart Icons (Base64)
const iconHeartRed = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='%23ff4d6d'><path d='M1 3h2v2H1zM3 1h2v2H3zM5 0h6v1H5zM11 1h2v2h-2zM13 3h2v2h-2zM15 5h1v4h-1zM13 9h2v2h-2zM11 11h2v2h-2zM9 13h2v2H9zM7 15h2v1H7zM5 13h2v2H5zM3 11h2v2H3zM1 9h2v2H1zM0 5h1v4H0zM3 3h3v3H3zM10 3h3v3h-3z'/></svg>")`;
const iconHeartGrey = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='%23aaaaaa'><path d='M1 3h2v2H1zM3 1h2v2H3zM5 0h6v1H5zM11 1h2v2h-2zM13 3h2v2h-2zM15 5h1v4h-1zM13 9h2v2h-2zM11 11h2v2h-2zM9 13h2v2H9zM7 15h2v1H7zM5 13h2v2H5zM3 11h2v2H3zM1 9h2v2H1zM0 5h1v4H0zM3 3h3v3H3zM10 3h3v3h-3z'/></svg>")`;

/* -------------------- SOUND SYSTEM -------------------- */

const soundPools = {
    yes: new ShufflePool([
        new Audio("sound-effects/yes/1.mp3"),
        new Audio("sound-effects/yes/2.mp3"),
        new Audio("sound-effects/yes/3.mp3")
    ]),
    cute: new ShufflePool([
        new Audio("sound-effects/no-cute/2.mp3"),
        new Audio("sound-effects/no-cute/4.mp3"),
        new Audio("sound-effects/no-cute/5.mp3"),
        new Audio("sound-effects/no-cute/6.mp3")
    ]),
    dramatic: new ShufflePool([
        new Audio("sound-effects/no-dramatic/8.mp3"),
        new Audio("sound-effects/no-dramatic/10.mp3"),
        new Audio("sound-effects/no-dramatic/11.mp3"),
        new Audio("sound-effects/no-dramatic/13.mp3"),
        new Audio("sound-effects/no-dramatic/15.mp3")
    ]),
    emotional: new ShufflePool([
        new Audio("sound-effects/no-emotional/9.mp3"),
        new Audio("sound-effects/no-emotional/14.mp3"),
        new Audio("sound-effects/no-emotional/16.mp3"),
        new Audio("sound-effects/no-emotional/18.mp3")
    ]),
    unhinged: new ShufflePool([
        new Audio("sound-effects/no-unhinged/12.mp3"),
        new Audio("sound-effects/no-unhinged/17.mp3"),
        new Audio("sound-effects/no-unhinged/19.mp3"),
        new Audio("sound-effects/no-unhinged/20.mp3"),
        new Audio("sound-effects/no-unhinged/21.mp3"),
        new Audio("sound-effects/no-unhinged/22.mp3"),
        new Audio("sound-effects/no-unhinged/23.mp3")
    ])
};

let soundEnabled = true;
let rainStarted = false;
const soundToggle = document.getElementById("sound-toggle");

soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        // Switch to Red Heart (by removing .muted)
        soundToggle.classList.remove("muted");
        soundToggle.classList.add("playing");
        
        // Resume music if it was already playing (rainStarted is from your existing logic)
        if (rainStarted) {
            bgMusic.play();
        }
    } else {
        // Switch to Grey Heart
        soundToggle.classList.add("muted");
        soundToggle.classList.remove("playing");
        
        // Stop the music
        bgMusic.pause();
    }
});

let currentlyPlaying = null;

// Optional: soften all sounds
Object.values(soundPools).flat().forEach(sound => {
    sound.volume = 0.5;
});

function stopAllSounds() {
    Object.values(soundPools).forEach(pool => {
        pool.original.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    });
}


function playRandomFromPool(poolName) {
    stopAllSounds();
    
    if (!soundEnabled) return; // Stop right here if muted!

    const sound = soundPools[poolName].next();

    sound.currentTime = 0;
    sound.play();
    currentlyPlaying = sound;
}




/* -------------------- PHASED DIALOGUE -------------------- */

const phraseStages = {
    cute: new ShufflePool([
        "Are you sure?",
        "Pookie please...",
        "Think about it 🥺",
        "Waittttt",
        "Just one little Yes?"
    ]),
    dramatic: new ShufflePool([
        "Why are you like this?",
        "That kinda hurt...",
        "The Yes button misses you 💕",
        "You're making this harder than it needs to be",
        "The cat is watching 👀"
    ]),
    emotional: new ShufflePool([
        "I'm gonna cry 😭",
        "You can't outrun love 💘",
        "This was supposed to be romantic...",
        "I made this for YOU 😢",
        "You're breaking my pixel heart 💔",
        "Are you allergic to happiness?"
    ]),
    unhinged: new ShufflePool([
        "Error. Reality collapsing.",
        "The Yes button grows stronger.",
        "This is destiny. Accept it.",
        "You will click Yes.",
        "Stop running.",
        "We both know the answer.",
        "The universe demands it.",
        "You can't escape forever.",
        "Why are you fighting love?",
        "Love always wins.",
        "This is my villain arc.",
        "You activated hard mode.",
        "Boss music intensifies.",
        "You're not winning this.",
        "Plot twist: You love me.",
        "Your finger slipped.",
        "The Yes button is inevitable.",
        "This is my canon event.",
        "Just accept it.",
        "This is the endgame.",
        "The prophecy foretold this.",
        "You are delaying the inevitable.",
        "Stop testing destiny."
    ])
};


/* -------------------- OPEN ENVELOPE -------------------- */

envelope.addEventListener("click", () => {
    envelope.style.display = "none";
    letter.style.display = "flex";
    setTimeout(() => {
        document.querySelector(".letter-window").classList.add("open");
    }, 50);
});

/* -------------------- RUNAWAY LOGIC -------------------- */

function teleport() {
    const wrapper = document.querySelector(".content-wrapper");
    const wrapperRect = wrapper.getBoundingClientRect();

    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;

    const margin = 10;

    const minX = wrapperRect.left + margin;
    const maxX = wrapperRect.right - btnW - margin;

    const minY = wrapperRect.top + margin;
    const maxY = wrapperRect.bottom - btnH - margin;

    const newX = Math.random() * (maxX - minX) + minX;
    const newY = Math.random() * (maxY - minY) + minY;

    noBtn.style.left = newX + "px";
    noBtn.style.top  = newY + "px";
}

const moveButton = (e) => {
    if (e.type === "touchstart" && e.cancelable) e.preventDefault();

    attempts++;

    if (!isFlying) {
        const rect = noBtn.getBoundingClientRect();
        noBtn.style.left = rect.left + "px";
        noBtn.style.top  = rect.top  + "px";
        noBtn.style.width = rect.width + "px";
        noBtn.classList.add("flying");
        isFlying = true;
        requestAnimationFrame(() => requestAnimationFrame(teleport));
    } else {
        teleport();
    }

    /* ---- Difficulty Scaling ---- */

    let speed = 0.22;
    if (attempts >= 5) speed = 0.15;
    if (attempts >= 10) speed = 0.1;
    if (attempts >= 15) speed = 0.06;

    noBtn.style.transition = `left ${speed}s ease, top ${speed}s ease`;

    /* ---- YES Growth ---- */

    yesScale += (window.innerWidth < 768 && attempts > 10) ? 0.35 : 0.15;
    yesBtn.style.setProperty("--yes-scale", yesScale);
    yesBtn.style.transform = `scale(${yesScale})`;

    if (attempts >= 10) {
        yesBtn.style.filter = "drop-shadow(0 0 10px red)";
    }

    if (attempts >= 15) {
        yesBtn.style.animation = "pulseYes 0.8s infinite";
    }

    /* ---- Dialogue Phases ---- */

    let pool;
    let phase;

    if (attempts < 5) {
        pool = phraseStages.cute;
        phase = "cute";
    } else if (attempts < 10) {
        pool = phraseStages.dramatic;
        phase = "dramatic";
    } else if (attempts < 15) {
        pool = phraseStages.emotional;
        phase = "emotional";
    } else {
        pool = phraseStages.unhinged;
        phase = "unhinged";
    }

    lastPhase = phase;

    subtitle.textContent = phraseStages[phase].next();

    playRandomFromPool(phase);

    if (attempts < 10) subtitle.style.color = "black";
    else if (attempts < 15) subtitle.style.color = "#8b0000";
    else subtitle.style.color = "red";

    /* ---- Background Rage Mode ---- */

    if (attempts >= 10) {
        const intensity = Math.min(attempts * 5, 120);
        document.body.style.backgroundColor =
            `rgba(255,0,0,${intensity/255})`;
        document.body.style.backgroundBlendMode = "multiply";
    }

    /* ---- FINAL BOSS MODE ---- */

    if (attempts === 15) {
        subtitle.textContent = "FINAL PHASE.";
        subtitle.style.fontWeight = "bold";
        subtitle.style.transform = "scale(1.2)";
    }

    if (attempts >= 15) {
        document.querySelector(".letter-window")
            .style.animation = "screenShake 0.3s infinite";
    }

    if (navigator.vibrate) navigator.vibrate(40);


    if (attempts === 10 || (attempts >= 15 && attempts % 5 === 0)) {
        const wrapper = document.querySelector(".content-wrapper");
        const rect = wrapper.getBoundingClientRect();
        const subtitleRect = subtitle.getBoundingClientRect();

        const newYes = yesBtn.cloneNode(true);
        newYes.classList.add("yes-clone");
        newYes.removeAttribute("style");
        newYes.style.position = "fixed";

        const btnW = yesBtn.offsetWidth;
        const btnH = yesBtn.offsetHeight;
        const margin = 20;

        const minX = rect.left + margin;
        const maxX = rect.right - btnW - margin;

        // 🔥 Avoid subtitle vertical zone
        const safeTop = subtitleRect.bottom + 15;
        const minY = Math.max(rect.top + margin, safeTop);
        const maxY = rect.bottom - btnH - margin;

        const newX = Math.random() * (maxX - minX) + minX;
        const newY = Math.random() * (maxY - minY) + minY;

        newYes.style.left = newX + "px";
        newYes.style.top  = newY + "px";

        newYes.addEventListener("click", () => {
            yesBtn.click();
        });

        document.body.appendChild(newYes);

        requestAnimationFrame(() => {
            newYes.classList.add("show");
        });

    }

};

noBtn.addEventListener("mouseover", moveButton);
noBtn.addEventListener("touchstart", moveButton, { passive: false });

/* -------------------- YES CLICK -------------------- */

yesBtn.addEventListener("click", () => {

    /* ---- RESET BOSS MODE ---- */

    document.body.style.backgroundColor = "";
    document.body.style.backgroundBlendMode = "";

    const windowEl = document.querySelector(".letter-window");
    windowEl.style.animation = "";

    subtitle.style.transform = "";
    subtitle.style.fontWeight = "";
    subtitle.style.color = "";

    yesBtn.style.animation = "";
    yesBtn.style.filter = "";
    yesBtn.style.transform = "scale(1)";
    yesBtn.style.setProperty("--yes-scale", 1);

    noBtn.style.transition = "left 0.22s ease, top 0.22s ease";



    // --- Background Music Fade-In ---

    bgMusic.volume = 0;
    bgMusic.currentTime = 10;
    bgMusic.play().catch(error => console.log("Audio play failed:", error));

    let fadeIn = setInterval(() => {
        if (bgMusic.volume < 0.5) { // Adjust 0.5 to your preferred max volume
            bgMusic.volume = Math.min(bgMusic.volume + 0.008, 0.5);
        } else {
            clearInterval(fadeIn);
        }
    }, 100); // Increases volume every 100ms



    /* ---- SUCCESS STATE ---- */

    // Play YES sound
    playRandomFromPool("yes");

    // Remove all scattered yes clones
    document.querySelectorAll(".yes-clone").forEach(btn => btn.remove());

    title.textContent = "Yippeeee!";
    subtitle.textContent = "";
    catImg.src = "cat_dance.gif";
    buttons.style.display = "none";
    if (isFlying) noBtn.style.display = "none";


    rainStarted = true;
    // Heart rain
    setInterval(() => {
        const heart = document.createElement("div");
        heart.style.cssText = `
            position:fixed;
            top:-20px;
            left:${Math.random()*100}vw;
            font-size:25px;
            z-index:1000;
            pointer-events:none;
        `;
        heart.innerHTML = "❤️";
        heart.animate(
            [{ transform: "translateY(0)" },
             { transform: "translateY(110vh)" }],
            { duration: 3000 }
        );
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 3000);
    }, 150);

    typeWriter(
        "EU TE AMO! ❤️ Valentine Date: Be ready to get wet and dress fancy! ❤️",
        finalText,
        50
    );
});


function typeWriter(text, element, speed) {
    let i = 0;
    element.innerHTML = "";
    element.style.display = "block";
    element.style.color = "black";
    element.style.opacity = "0.85";

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}
