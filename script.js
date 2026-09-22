/* =========================================
   ALMOST CONFESSED — JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    const creatorPage = document.getElementById("creatorPage");
    const generatedPage = document.getElementById("generatedPage");
    const recipientPage = document.getElementById("recipientPage");

    const confessionForm = document.getElementById("confessionForm");
    const generatedLink = document.getElementById("generatedLink");
    const copyButton = document.getElementById("copyButton");
    const shareButton = document.getElementById("shareButton");
    const likeButton = document.getElementById("likeButton");
    const copyMessage = document.getElementById("copyMessage");

    const previewButton = document.getElementById("previewButton");
    const createAnotherButton = document.getElementById("createAnotherButton");

    const recipientFrom = document.getElementById("recipientFrom");
    const recipientTitle = document.getElementById("recipientTitle");
    const recipientQuestion = document.getElementById("recipientQuestion");
    const personalMessageBox = document.getElementById("personalMessageBox");
    const recipientMessage = document.getElementById("recipientMessage");

    const answerArea = document.getElementById("answerArea");
    const yesButton = document.getElementById("yesButton");
    const noButton = document.getElementById("noButton");
    const noMessage = document.getElementById("noMessage");
    const yesResult = document.getElementById("yesResult");
    const makeOwnButton = document.getElementById("makeOwnButton");

    function showPage(page) {
        creatorPage.classList.add("hidden");
        generatedPage.classList.add("hidden");
        recipientPage.classList.add("hidden");
        page.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /*
     * Encode Unicode-safe JSON into the URL.
     * This works with names/messages containing Bengali,
     * emojis, accents, etc.
     */
    function encodeData(data) {
        const json = JSON.stringify(data);
        const bytes = new TextEncoder().encode(json);

        let binary = "";
        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });

        return btoa(binary)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }

    function decodeData(encoded) {
        try {
            let base64 = encoded
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            while (base64.length % 4) {
                base64 += "=";
            }

            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));

            return JSON.parse(new TextDecoder().decode(bytes));
        } catch (error) {
            console.error("Could not decode confession:", error);
            return null;
        }
    }

    /* =========================
       CREATE CONFESSION
    ========================== */

    confessionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const fromName = document.getElementById("fromName").value.trim();
        const toName = document.getElementById("toName").value.trim();
        const question = document.getElementById("question").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!fromName || !toName || !question) {
            alert("Please fill in From, To, and your Question. 💌");
            return;
        }

        const confession = {
            from: fromName,
            to: toName,
            question: question,
            message: message,
            created: Date.now()
        };

        try {
            const encoded = encodeData(confession);

            /*
             * Use the current page URL.
             * On GitHub Pages this becomes:
             * https://username.github.io/repository/?c=...
             */
            const url = new URL(window.location.href);
            url.search = "";
            url.hash = "";
            url.searchParams.set("c", encoded);

            generatedLink.value = url.toString();

            localStorage.setItem(
                "lastConfession",
                JSON.stringify(confession)
            );

            showPage(generatedPage);

        } catch (error) {
            console.error(error);
            alert(
                "Something went wrong while creating the link. " +
                "Please refresh the page and try again."
            );
        }
    });

    /* =========================
       COPY
    ========================== */

    copyButton.addEventListener("click", async function() {
        const link = generatedLink.value;

        try {
            await navigator.clipboard.writeText(link);
        } catch (error) {
            generatedLink.focus();
            generatedLink.select();
            document.execCommand("copy");
        }

        copyMessage.textContent = "Link copied! 💗";
        copyMessage.classList.add("show");

        setTimeout(() => {
            copyMessage.classList.remove("show");
        }, 2000);
    });

    /* =========================
       SHARE
    ========================== */

    shareButton.addEventListener("click", async function() {
        const link = generatedLink.value;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "A little question for you 💌",
                    text: "Someone has a little question for you... 👀",
                    url: link
                });
                return;
            } catch (error) {
                if (error.name === "AbortError") return;
            }
        }

        try {
            await navigator.clipboard.writeText(link);
        } catch (error) {
            generatedLink.focus();
            generatedLink.select();
            document.execCommand("copy");
        }

        shareButton.textContent = "✓ Link Copied!";

        setTimeout(() => {
            shareButton.textContent = "🔗 Share";
        }, 2000);
    });

    /* =========================
       LIKE
    ========================== */

    let liked = false;

    likeButton.addEventListener("click", function() {
        liked = !liked;

        likeButton.classList.toggle("liked", liked);

        likeButton.innerHTML = liked
            ? "♥ <span>1</span>"
            : "♡ <span>0</span>";
    });

    /* =========================
       PREVIEW
    ========================== */

    previewButton.addEventListener("click", function() {
        const saved = localStorage.getItem("lastConfession");

        if (!saved) return;

        try {
            displayRecipient(JSON.parse(saved));
        } catch {
            alert("Preview could not be loaded.");
        }
    });

    /* =========================
       CREATE ANOTHER
    ========================== */

    createAnotherButton.addEventListener("click", function() {
        confessionForm.reset();

        const cleanURL =
            window.location.origin +
            window.location.pathname;

        window.history.replaceState({}, "", cleanURL);

        showPage(creatorPage);
    });

    /* =========================
       RECIPIENT
    ========================== */

    function displayRecipient(confession) {
        recipientFrom.textContent = confession.from;

        recipientTitle.textContent =
            `A little question for you, ${confession.to}.`;

        recipientQuestion.textContent = confession.question;

        if (confession.message) {
            recipientMessage.textContent = confession.message;
            personalMessageBox.classList.remove("hidden");
        } else {
            personalMessageBox.classList.add("hidden");
        }

        answerArea.classList.remove("hidden");
        yesResult.classList.add("hidden");

        resetNoButton();

        showPage(recipientPage);
    }

    /* =========================
       NO BUTTON
    ========================== */

    const noMessages = [
        "Are you sure? 👀",
        "Whoa! You almost got it.",
        "The NO button appears to be shy too. 😭",
        "Nice try. 😌",
        "You can't catch me that easily!",
        "Why are you chasing me? 😂",
        "I'm beginning to think you actually want YES.",
        "Okay... this is getting suspicious. 👀",
        "The button has officially entered flight mode.",
        "Fine. I'll keep running. 🏃‍♂️"
    ];

    let noAttempts = 0;

    noButton.addEventListener("mouseenter", moveNoButton);

    noButton.addEventListener("touchstart", function(event) {
        event.preventDefault();
        moveNoButton();
    }, { passive: false });

    noButton.addEventListener("click", function(event) {
        event.preventDefault();
        moveNoButton();
    });

    function moveNoButton() {
        noAttempts++;

        noButton.classList.add("running");

        const buttonWidth = noButton.offsetWidth;
        const buttonHeight = noButton.offsetHeight;
        const padding = 20;

        const maxX = Math.max(
            padding,
            window.innerWidth - buttonWidth - padding
        );

        const maxY = Math.max(
            padding,
            window.innerHeight - buttonHeight - padding
        );

        let newX = padding + Math.random() * (maxX - padding);
        let newY = padding + Math.random() * (maxY - padding);

        const yesRect = yesButton.getBoundingClientRect();
        const safeDistance = 120;

        let tries = 0;

        while (
            Math.abs(newX - yesRect.left) < safeDistance &&
            Math.abs(newY - yesRect.top) < safeDistance &&
            tries < 20
        ) {
            newX = padding + Math.random() * (maxX - padding);
            newY = padding + Math.random() * (maxY - padding);
            tries++;
        }

        noButton.style.left = `${newX}px`;
        noButton.style.top = `${newY}px`;

        const index = Math.min(
            noAttempts - 1,
            noMessages.length - 1
        );

        noMessage.textContent = noMessages[index];

        if (noAttempts >= 5) {
            noButton.style.transform = "scale(.9)";
        }

        if (noAttempts >= 8) {
            noButton.style.transform = "scale(.8)";
        }
    }

    function resetNoButton() {
        noAttempts = 0;

        noButton.classList.remove("running");

        noButton.style.left = "";
        noButton.style.top = "";
        noButton.style.transform = "";

        noMessage.textContent = "";
    }

    /* =========================
       YES
    ========================== */

    yesButton.addEventListener("click", function() {
        answerArea.classList.add("hidden");
        yesResult.classList.remove("hidden");
        createConfetti();
    });

    function createConfetti() {
        const symbols = ["♥", "♡", "✦", "✧", "•"];

        for (let i = 0; i < 45; i++) {
            const piece = document.createElement("div");

            piece.className = "confetti";

            piece.textContent =
                symbols[Math.floor(Math.random() * symbols.length)];

            piece.style.left = Math.random() * 100 + "vw";
            piece.style.animationDuration =
                2 + Math.random() * 2 + "s";
            piece.style.animationDelay =
                Math.random() * .8 + "s";
            piece.style.fontSize =
                8 + Math.random() * 12 + "px";

            document.body.appendChild(piece);

            setTimeout(() => piece.remove(), 4500);
        }
    }

    /* =========================
       MAKE YOUR OWN
    ========================== */

    makeOwnButton.addEventListener("click", function() {
        const cleanURL =
            window.location.origin +
            window.location.pathname;

        window.history.replaceState({}, "", cleanURL);

        confessionForm.reset();
        showPage(creatorPage);
    });

    /* =========================
       LOAD PAGE
    ========================== */

    function loadPage() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get("c");

        if (encoded) {
            const confession = decodeData(encoded);

            if (
                confession &&
                confession.from &&
                confession.to &&
                confession.question
            ) {
                displayRecipient(confession);
                return;
            }
        }

        showPage(creatorPage);
    }

    loadPage();
});
