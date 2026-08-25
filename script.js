/* =========================================================
   PLOTTWISTED — MAIN JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       LOADING SCREEN
    ===================================================== */

    setTimeout(() => {

        const loading = document.getElementById("loadingScreen");

        if (loading) {
            loading.style.opacity = "0";
            loading.style.visibility = "hidden";
        }

    }, 1200);


    /* =====================================================
       CHARACTER COUNTERS
    ===================================================== */

    const confessionInput =
        document.getElementById("confessionInput");

    const characterCount =
        document.getElementById("characterCount");

    if (confessionInput && characterCount) {

        confessionInput.addEventListener("input", () => {

            characterCount.textContent =
                confessionInput.value.length;

        });

    }


    const unsentInput =
        document.getElementById("unsentInput");

    const unsentCharacterCount =
        document.getElementById("unsentCharacterCount");

    if (unsentInput && unsentCharacterCount) {

        unsentInput.addEventListener("input", () => {

            unsentCharacterCount.textContent =
                unsentInput.value.length;

        });

    }


    /* =====================================================
       CLOSE MODAL WHEN CLICKING OUTSIDE
    ===================================================== */

    document.querySelectorAll(".modal").forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {
                modal.classList.remove("show");
            }

        });

    });

});


/* =========================================================
   MODAL FUNCTIONS
========================================================= */

function openModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeModal(id) {

    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("show");

    document.body.style.overflow = "";
}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


/* =========================================================
   HERO PLOT TWIST
========================================================= */

function revealHeroTwist() {

    const twist =
        document.getElementById("heroTwist");

    const button =
        document.getElementById("heroTwistButton");

    if (!twist || !button) return;

    twist.classList.toggle("show");

    if (twist.classList.contains("show")) {

        button.textContent = "Hide Plot Twist";

    } else {

        button.textContent = "Reveal Plot Twist";

    }
}


/* =========================================================
   DAILY PLOT TWISTS
========================================================= */

const dailyTwists = [

    "Maybe they weren't ignoring you. Maybe they were waiting for you to notice.",

    "The person you think doesn't care might actually be scared to make the first move.",

    "Sometimes the plot twist is realizing you deserve better.",

    "You thought the story ended. It was actually just the beginning.",

    "Maybe they remember everything you thought they forgot.",

    "The plot twist? You were never asking for too much.",

    "Sometimes closure doesn't come from them. It comes from you."

];


function newDailyTwist() {

    const element =
        document.getElementById("dailyTwist");

    if (!element) return;

    let random;

    do {

        random =
            dailyTwists[
                Math.floor(
                    Math.random() * dailyTwists.length
                )
            ];

    } while (
        random === element.textContent &&
        dailyTwists.length > 1
    );

    element.style.opacity = "0";

    setTimeout(() => {

        element.textContent = `"${random}"`;

        element.style.opacity = "1";

    }, 250);
}


/* =========================================================
   CONFESSION FILTER
========================================================= */

function filterConfessions(category, button) {

    const cards =
        document.querySelectorAll(".confession-card");

    const filters =
        document.querySelectorAll(".filter");

    filters.forEach(filter => {

        filter.classList.remove("active");

    });

    if (button) {
        button.classList.add("active");
    }

    cards.forEach(card => {

        const cardCategory =
            card.dataset.category;

        if (
            category === "all" ||
            cardCategory === category
        ) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


/* =========================================================
   SEARCH CONFESSIONS
========================================================= */

function searchConfessions() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const search =
        input.value.toLowerCase().trim();

    const cards =
        document.querySelectorAll(".confession-card");

    cards.forEach(card => {

        const text =
            card.textContent.toLowerCase();

        card.style.display =
            text.includes(search)
                ? ""
                : "none";

    });

}


/* =========================================================
   CONFESSION LIKES
========================================================= */

function react(button) {

    if (!button) return;

    const number =
        button.querySelector("span");

    if (!number) return;

    let count =
        parseInt(number.textContent) || 0;

    if (button.classList.contains("liked")) {

        count--;

        button.classList.remove("liked");

    } else {

        count++;

        button.classList.add("liked");

        showToast("Anonymous reaction added ♡");

    }

    number.textContent = count;

}


/* =========================================================
   SUBMIT CONFESSION
========================================================= */

function submitConfession() {

    const input =
        document.getElementById("confessionInput");

    const category =
        document.getElementById("confessionCategory");

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) {

        showToast("Write something first.");

        input.focus();

        return;

    }

    if (text.length < 5) {

        showToast("Your confession is too short.");

        return;

    }


    /*
       Temporary local submission.

       Firebase will replace this later so
       everyone can see the confession online.
    */

    const confessionList =
        document.getElementById("confessionList");

    if (confessionList) {

        const card =
            document.createElement("article");

        card.className =
            "confession-card";

        card.dataset.category =
            category ? category.value : "random";

        const anonymousNumber =
            Math.floor(
                1000 +
                Math.random() * 8999
            );

        const categoryName =
            category
                ? category.options[
                    category.selectedIndex
                ].text.toUpperCase()
                : "RANDOM";


        card.innerHTML = `

            <div class="post-header">

                <span>
                    ANONYMOUS #${anonymousNumber}
                </span>

                <span class="post-category">
                    ${categoryName}
                </span>

            </div>

            <p>
                "${escapeHTML(text)}"
            </p>

            <div class="post-footer">

                <button onclick="react(this)">
                    ♡ <span>0</span>
                </button>

                <span>
                    just now
                </span>

            </div>

        `;

        confessionList.prepend(card);

    }


    input.value = "";

    const count =
        document.getElementById("characterCount");

    if (count) {
        count.textContent = "0";
    }

    closeModal("confessionModal");

    showToast("Your confession is now anonymous. ✦");

}


/* =========================================================
   UNSENT MESSAGE
========================================================= */

function submitUnsent() {

    const input =
        document.getElementById("unsentInput");

    if (!input) return;

    const text =
        input.value.trim();

    if (!text) {

        showToast("Write your unsent message first.");

        input.focus();

        return;

    }

    if (text.length < 5) {

        showToast("Write a little more.");

        return;

    }


    const grid =
        document.querySelector(".unsent-grid");

    if (grid) {

        const card =
            document.createElement("article");

        card.className =
            "unsent-card";

        const anonymousNumber =
            Math.floor(
                1000 +
                Math.random() * 8999
            );

        card.innerHTML = `

            <span>
                ANONYMOUS #${anonymousNumber}
            </span>

            <p>
                "${escapeHTML(text)}"
            </p>

        `;

        grid.prepend(card);

    }


    input.value = "";

    const count =
        document.getElementById(
            "unsentCharacterCount"
        );

    if (count) {
        count.textContent = "0";
    }

    closeModal("unsentModal");

    showToast("Your message stayed unsent. ♡");

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* =========================================================
   PLOT TWIST REVEAL
========================================================= */

function revealTwist(button) {

    if (!button) return;

    const card =
        button.closest(".twist-card");

    if (!card) return;

    const answer =
        card.querySelector(".twist-answer");

    if (!answer) return;

    answer.classList.toggle("show");

    if (answer.classList.contains("show")) {

        button.textContent =
            "Hide Plot Twist";

    } else {

        button.textContent =
            "Reveal Plot Twist";

    }

}


/* =========================================================
   SIGNS OR DELUSION
========================================================= */

let signVotes = {

    sign: 62,

    maybe: 25,

    delulu: 13

};


function voteSign(type) {

    if (!signVotes[type]) {
        signVotes[type] = 0;
    }

    signVotes[type] += 1;

    updateSignResults();

    showToast("Your vote has been counted ✦");

}


function updateSignResults() {

    const total =
        signVotes.sign +
        signVotes.maybe +
        signVotes.delulu;

    const signPercent =
        Math.round(
            signVotes.sign / total * 100
        );

    const maybePercent =
        Math.round(
            signVotes.maybe / total * 100
        );

    const deluluPercent =
        100 -
        signPercent -
        maybePercent;


    setResult(
        "signBar",
        "signPercent",
        signPercent
    );

    setResult(
        "maybeBar",
        "maybePercent",
        maybePercent
    );

    setResult(
        "deluluBar",
        "deluluPercent",
        deluluPercent
    );

}


function setResult(barID, textID, percent) {

    const bar =
        document.getElementById(barID);

    const text =
        document.getElementById(textID);

    if (bar) {
        bar.style.width = percent + "%";
    }

    if (text) {
        text.textContent = percent + "%";
    }

}


/* =========================================================
   FLAG IT
========================================================= */

let flagVotes = {

    green: 15,

    beige: 20,

    red: 65

};


function voteFlag(type) {

    if (!flagVotes[type]) {
        flagVotes[type] = 0;
    }

    flagVotes[type] += 1;

    updateFlagResults();

    showToast("Flag vote counted.");

}


function updateFlagResults() {

    const total =
        flagVotes.green +
        flagVotes.beige +
        flagVotes.red;

    const green =
        Math.round(
            flagVotes.green / total * 100
        );

    const beige =
        Math.round(
            flagVotes.beige / total * 100
        );

    const red =
        100 - green - beige;


    setResult(
        "greenBar",
        "greenPercent",
        green
    );

    setResult(
        "beigeBar",
        "beigePercent",
        beige
    );

    setResult(
        "redBar",
        "redPercent",
        red
    );

}


/* =========================================================
   HUGOT GENERATOR
========================================================= */

const hugotLines = [

    "Sometimes you don't miss the person. You miss who you were when they were around.",

    "Maybe the hardest goodbye is the one you never got to say.",

    "You can care about someone and still choose yourself.",

    "Some people are chapters, not the whole story.",

    "Maybe the closure you want is simply accepting what happened.",

    "Not every connection is meant to become a relationship.",

    "Sometimes the plot twist is realizing you were already enough.",

    "You thought you were waiting for them. Maybe you were waiting for yourself."

];


function newHugot() {

    const element =
        document.getElementById("hugotText");

    if (!element) return;

    let line;

    do {

        line =
            hugotLines[
                Math.floor(
                    Math.random() * hugotLines.length
                )
            ];

    } while (
        element.textContent.includes(line) &&
        hugotLines.length > 1
    );

    element.style.opacity = "0";

    setTimeout(() => {

        element.textContent =
            `"${line}"`;

        element.style.opacity = "1";

    }, 250);

}


/* =========================================================
   CONFESSION ROULETTE
========================================================= */

const rouletteStories = [

    "Someone has a crush on the person they always argue with.",

    "Someone checks their crush's profile but will never admit it.",

    "Someone is waiting for an apology they know may never come.",

    "Someone secretly wants to reconnect with an old friend.",

    "Someone has already written the message—they just haven't sent it.",

    "Someone thinks their best friend might actually like them.",

    "Someone is pretending not to care because caring feels embarrassing.",

    "Someone's biggest plot twist happened when they finally chose themselves."

];


function spinRoulette() {

    const icon =
        document.getElementById("rouletteIcon");

    const text =
        document.getElementById("rouletteText");

    if (!icon || !text) return;

    icon.classList.add("spin");

    text.textContent =
        "Spinning the story...";

    setTimeout(() => {

        const random =
            rouletteStories[
                Math.floor(
                    Math.random() *
                    rouletteStories.length
                )
            ];

        icon.classList.remove("spin");

        text.textContent =
            `"${random}"`;

        showToast("The plot has twisted. ✦");

    }, 1200);

}


/* =========================================================
   QUIZ
========================================================= */

const quizQuestions = [

    {
        question:
            "Who usually starts the conversation?",

        options: [
            ["Me", 2],
            ["Them", 3],
            ["We both do", 1],
            ["Nobody 😭", 0]
        ]

    },

    {
        question:
            "When they see you, what usually happens?",

        options: [
            ["They smile", 3],
            ["They act normal", 1],
            ["They look away", 2],
            ["Nothing", 0]
        ]

    },

    {
        question:
            "How often do you think about them?",

        options: [
            ["Occasionally", 1],
            ["Every day", 3],
            ["Way too much", 4],
            ["Almost never", 0]
        ]

    }

];


let currentQuestion = 0;

let quizScore = 0;


function answerQuiz(points) {

    quizScore += points;

    currentQuestion++;

    if (
        currentQuestion >=
        quizQuestions.length
    ) {

        showQuizResult();

        return;

    }

    renderQuizQuestion();

}


function renderQuizQuestion() {

    const question =
        quizQuestions[currentQuestion];

    const number =
        document.querySelector(".quiz-number");

    const questionText =
        document.getElementById("quizQuestion");

    const options =
        document.querySelector(".quiz-options");

    if (!questionText || !options) return;

    if (number) {

        number.textContent =
            `QUESTION ${currentQuestion + 1} OF ${quizQuestions.length}`;

    }

    questionText.textContent =
        question.question;

    options.innerHTML = "";

    question.options.forEach(option => {

        const button =
            document.createElement("button");

        button.textContent =
            option[0];

        button.onclick = () =>
            answerQuiz(option[1]);

        options.appendChild(button);

    });

}


function showQuizResult() {

    const content =
        document.getElementById("quizContent");

    const result =
        document.getElementById("quizResult");

    const title =
        document.getElementById("quizResultTitle");

    const text =
        document.getElementById("quizResultText");

    if (!content || !result) return;

    let resultTitle;

    let resultText;


    if (quizScore >= 8) {

        resultTitle =
            "THE PLOT IS PLOTTING ✦";

        resultText =
            "There are definitely some interesting signs here. Just remember that guessing isn't the same as knowing.";

    } else if (quizScore >= 5) {

        resultTitle =
            "IT'S COMPLICATED";

        resultText =
            "There might be something there, but don't let your imagination write the entire story.";

    } else if (quizScore >= 2) {

        resultTitle =
            "MAYBE... MAYBE NOT";

        resultText =
            "There are a few clues, but the plot still needs another chapter.";

    } else {

        resultTitle =
            "FRIENDSHIP ARC";

        resultText =
            "For now, the evidence says friendship. And honestly, that's not a bad plot.";

    }


    title.textContent =
        resultTitle;

    text.textContent =
        resultText;

    content.style.display =
        "none";

    result.style.display =
        "block";

}


function restartQuiz() {

    currentQuestion = 0;

    quizScore = 0;

    const content =
        document.getElementById("quizContent");

    const result =
        document.getElementById("quizResult");

    if (content) {
        content.style.display = "block";
    }

    if (result) {
        result.style.display = "none";
    }

    renderQuizQuestion();

}


/* =========================================================
   ESC KEY CLOSES MODAL
========================================================= */

document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;

    document.querySelectorAll(".modal.show")
        .forEach(modal => {

            modal.classList.remove("show");

        });

    document.body.style.overflow = "";

});


/* =========================================================
   CONSOLE MESSAGE
========================================================= */

console.log(
    "%cPlotTwisted ✦",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Every story has a twist."
);


/* =========================================================
   PLOTTWISTED PAGE NAVIGATION
========================================================= */

function showSection(sectionID) {

    const sections =
        document.querySelectorAll(".page-section");

    const target =
        document.getElementById(sectionID);

    if (!target) return;


    /* Remove current section */

    sections.forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });


    /*
       Small delay creates a smoother
       transition between sections.
    */

    setTimeout(() => {

        target.classList.add(
            "active-section"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }, 80);


    /* Update browser history */

    history.pushState(
        { section: sectionID },
        "",
        "#" + sectionID
    );

}


/* =========================================================
   BROWSER BACK BUTTON
========================================================= */

window.addEventListener(
    "popstate",
    () => {

        const sectionID =
            location.hash.replace("#", "") ||
            "home";

        showSectionWithoutHistory(
            sectionID
        );

    }
);


function showSectionWithoutHistory(sectionID) {

    const sections =
        document.querySelectorAll(".page-section");

    const target =
        document.getElementById(sectionID);

    if (!target) return;

    sections.forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });

    target.classList.add(
        "active-section"
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   OPEN CORRECT SECTION WHEN LINK IS SHARED
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const sectionID =
            location.hash.replace("#", "");

        if (
            sectionID &&
            document.getElementById(sectionID)
        ) {

            showSectionWithoutHistory(
                sectionID
            );

        }

    }
);
