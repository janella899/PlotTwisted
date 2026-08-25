/* =========================================================
   PLOTTWISTED — CLEAN SCRIPT
========================================================= */


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showSection(sectionID) {

    const sections = document.querySelectorAll(".page-section");
    const target = document.getElementById(sectionID);

    if (!target) {
        console.log("Section not found:", sectionID);
        return;
    }

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    target.classList.add("active-section");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    history.pushState(
        { section: sectionID },
        "",
        "#" + sectionID
    );
}


/* =========================================================
   BROWSER BACK BUTTON
========================================================= */

window.addEventListener("popstate", function () {

    const sectionID =
        window.location.hash.replace("#", "") || "home";

    openSectionWithoutHistory(sectionID);

});


function openSectionWithoutHistory(sectionID) {

    const sections =
        document.querySelectorAll(".page-section");

    const target =
        document.getElementById(sectionID);

    if (!target) return;

    sections.forEach(section => {
        section.classList.remove("active-section");
    });

    target.classList.add("active-section");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   PAGE LOADING
========================================================= */

window.addEventListener("load", function () {

    const loading =
        document.getElementById("loadingScreen");

    if (loading) {

        setTimeout(() => {

            loading.style.opacity = "0";
            loading.style.visibility = "hidden";

        }, 900);

    }


    const startingSection =
        window.location.hash.replace("#", "");

    if (
        startingSection &&
        document.getElementById(startingSection)
    ) {

        openSectionWithoutHistory(
            startingSection
        );

    }

});


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.add("show");

    document.body.style.overflow = "hidden";
}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove("show");

    document.body.style.overflow = "";
}


/* Close modal when clicking outside */

document.addEventListener("click", function(event) {

    if (
        event.target.classList.contains("modal")
    ) {

        event.target.classList.remove("show");

        document.body.style.overflow = "";

    }

});


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimeout);

    toastTimeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);

}


/* =========================================================
   CONFESSION SEARCH
========================================================= */

function searchConfessions() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const search =
        input.value.toLowerCase();

    const cards =
        document.querySelectorAll(
            ".confession-card"
        );

    cards.forEach(card => {

        const content =
            card.textContent.toLowerCase();

        if (content.includes(search)) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });

}


/* =========================================================
   CONFESSION FILTER
========================================================= */

function filterConfessions(category, button) {

    const cards =
        document.querySelectorAll(
            ".confession-card"
        );

    document.querySelectorAll(".filter")
        .forEach(filter => {

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
   LIKE / REACTION
========================================================= */

function react(button) {

    if (!button) return;

    const number =
        button.querySelector("span");

    if (!number) return;

    let count =
        parseInt(number.textContent) || 0;


    if (
        button.classList.contains("liked")
    ) {

        count--;

        button.classList.remove("liked");

    } else {

        count++;

        button.classList.add("liked");

        showToast("Reaction added ♡");

    }


    number.textContent = count;

}


/* =========================================================
   SUBMIT CONFESSION
========================================================= */

function submitConfession() {

    const input =
        document.getElementById(
            "confessionInput"
        );

    const category =
        document.getElementById(
            "confessionCategory"
        );

    const list =
        document.getElementById(
            "confessionList"
        );


    if (!input || !list) return;


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Write your confession first."
        );

        return;

    }


    if (text.length < 5) {

        showToast(
            "Write a little more."
        );

        return;

    }


    const card =
        document.createElement("article");

    card.className =
        "confession-card";


    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    const selectedCategory =
        category
            ? category.value
            : "random";


    const categoryText =
        category
            ? category.options[
                category.selectedIndex
            ].text.toUpperCase()
            : "RANDOM";


    card.dataset.category =
        selectedCategory;


    card.innerHTML = `

        <div class="post-header">

            <span>
                ANONYMOUS #${randomNumber}
            </span>

            <span class="post-category">
                ${escapeHTML(categoryText)}
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


    list.prepend(card);


    input.value = "";


    const counter =
        document.getElementById(
            "characterCount"
        );

    if (counter) {

        counter.textContent = "0";

    }


    closeModal(
        "confessionModal"
    );


    showToast(
        "Your confession was posted anonymously. ✦"
    );

}


/* =========================================================
   UNSENT MESSAGE
========================================================= */

function submitUnsent() {

    const input =
        document.getElementById(
            "unsentInput"
        );

    const grid =
        document.querySelector(
            ".unsent-grid"
        );


    if (!input || !grid) return;


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Write something first."
        );

        return;

    }


    const card =
        document.createElement("article");

    card.className =
        "unsent-card";


    const randomNumber =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    card.innerHTML = `

        <span>
            ANONYMOUS #${randomNumber}
        </span>

        <p>
            "${escapeHTML(text)}"
        </p>

    `;


    grid.prepend(card);


    input.value = "";


    const counter =
        document.getElementById(
            "unsentCharacterCount"
        );

    if (counter) {

        counter.textContent = "0";

    }


    closeModal(
        "unsentModal"
    );


    showToast(
        "Your message stayed unsent. ♡"
    );

}


/* =========================================================
   HUGOT GENERATOR
========================================================= */

const hugotLines = [

    "Sometimes you don't miss the person. You miss who you were when they were around.",

    "Maybe the hardest goodbye is the one you never got to say.",

    "Some people are chapters, not the whole story.",

    "You can care about someone and still choose yourself.",

    "Maybe closure is accepting that some stories don't get the ending you wanted.",

    "Sometimes the plot twist is realizing you deserve better.",

    "Not every connection is meant to become a relationship.",

    "Maybe you weren't asking for too much. Maybe you were asking the wrong person."

];


function newHugot() {

    const element =
        document.getElementById(
            "hugotText"
        );


    if (!element) return;


    const random =
        hugotLines[
            Math.floor(
                Math.random() *
                hugotLines.length
            )
        ];


    element.style.opacity = "0";

    element.style.transform =
        "translateY(10px)";


    setTimeout(() => {

        element.textContent =
            `"${random}"`;

        element.style.opacity = "1";

        element.style.transform =
            "translateY(0)";

    }, 250);

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

    signVotes[type]++;

    updateSignResults();

    showToast(
        "Your vote has been counted ✦"
    );

}


function updateSignResults() {

    const total =
        signVotes.sign +
        signVotes.maybe +
        signVotes.delulu;


    const sign =
        Math.round(
            signVotes.sign /
            total *
            100
        );


    const maybe =
        Math.round(
            signVotes.maybe /
            total *
            100
        );


    const delulu =
        100 -
        sign -
        maybe;


    updateResult(
        "signBar",
        "signPercent",
        sign
    );


    updateResult(
        "maybeBar",
        "maybePercent",
        maybe
    );


    updateResult(
        "deluluBar",
        "deluluPercent",
        delulu
    );

}


function updateResult(
    barID,
    textID,
    value
) {

    const bar =
        document.getElementById(
            barID
        );

    const text =
        document.getElementById(
            textID
        );


    if (bar) {

        bar.style.width =
            value + "%";

    }


    if (text) {

        text.textContent =
            value + "%";

    }

}


/* =========================================================
   ROULETTE
========================================================= */

const rouletteStories = [

    "Someone secretly likes the person they always argue with.",

    "Someone keeps checking a person's profile but will never admit it.",

    "Someone is waiting for a message that may never arrive.",

    "Someone wants to reconnect with an old friend.",

    "Someone has already written the message. They just haven't sent it.",

    "Someone thinks their best friend might like them.",

    "Someone is pretending not to care because caring feels scary.",

    "The biggest plot twist is choosing yourself."

];


function spinRoulette() {

    const icon =
        document.getElementById(
            "rouletteIcon"
        );

    const text =
        document.getElementById(
            "rouletteText"
        );


    if (!icon || !text) return;


    icon.classList.add("spin");

    text.style.opacity = "0";


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

        text.style.opacity = "1";


        showToast(
            "The plot has twisted. ✦"
        );


    }, 1000);

}


/* =========================================================
   CHARACTER COUNTERS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const confession =
            document.getElementById(
                "confessionInput"
            );

        const confessionCounter =
            document.getElementById(
                "characterCount"
            );


        if (confession) {

            confession.addEventListener(
                "input",
                function() {

                    if (confessionCounter) {

                        confessionCounter.textContent =
                            confession.value.length;

                    }

                }
            );

        }


        const unsent =
            document.getElementById(
                "unsentInput"
            );

        const unsentCounter =
            document.getElementById(
                "unsentCharacterCount"
            );


        if (unsent) {

            unsent.addEventListener(
                "input",
                function() {

                    if (unsentCounter) {

                        unsentCounter.textContent =
                            unsent.value.length;

                    }

                }
            );

        }

    }
);


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
   ESC KEY CLOSES MODALS
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            document
                .querySelectorAll(".modal.show")
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

            document.body.style.overflow =
                "";

        }

    }
);
