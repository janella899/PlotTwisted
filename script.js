/* =====================================================
   PLOTTWISTED - SCRIPT.JS
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ===============================
       SLIDE NAVIGATION
    =============================== */

    const buttons = document.querySelectorAll("[data-slide]");
    const sections = document.querySelectorAll(".page-section");

    function openSlide(id) {

        const target = document.getElementById(id);

        if (!target) {
            console.error("Slide not found: " + id);
            return;
        }

        sections.forEach(function (section) {
            section.classList.remove("active-section");
        });

        target.classList.add("active-section");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        history.replaceState(null, "", "#" + id);
    }

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const slide = button.getAttribute("data-slide");

            openSlide(slide);

        });

    });


    /* ===============================
       OPEN HOME
    =============================== */

    const homeButtons =
        document.querySelectorAll("[data-home]");

    homeButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            openSlide("home");

        });

    });


    /* ===============================
       OPEN SECTION FROM URL
    =============================== */

    const currentHash =
        window.location.hash.replace("#", "");

    if (
        currentHash &&
        document.getElementById(currentHash)
    ) {

        openSlide(currentHash);

    }


    /* ===============================
       MODALS
    =============================== */

    window.openModal = function (id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.add("show");

        document.body.style.overflow = "hidden";
    };


    window.closeModal = function (id) {

        const modal =
            document.getElementById(id);

        if (!modal) return;

        modal.classList.remove("show");

        document.body.style.overflow = "";
    };


    /* ===============================
       CLOSE MODAL OUTSIDE
    =============================== */

    document.querySelectorAll(".modal").forEach(function (modal) {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {

                modal.classList.remove("show");

                document.body.style.overflow = "";

            }

        });

    });


    /* ===============================
       ESCAPE KEY
    =============================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            document.querySelectorAll(".modal.show")
                .forEach(function (modal) {

                    modal.classList.remove("show");

                });

            document.body.style.overflow = "";
        }

    });


    /* ===============================
       CHARACTER COUNTER
    =============================== */

    const confessionInput =
        document.getElementById("confessionInput");

    const characterCount =
        document.getElementById("characterCount");

    if (confessionInput && characterCount) {

        confessionInput.addEventListener("input", function () {

            characterCount.textContent =
                confessionInput.value.length;

        });

    }


    const unsentInput =
        document.getElementById("unsentInput");

    const unsentCharacterCount =
        document.getElementById("unsentCharacterCount");

    if (unsentInput && unsentCharacterCount) {

        unsentInput.addEventListener("input", function () {

            unsentCharacterCount.textContent =
                unsentInput.value.length;

        });

    }


    /* ===============================
       HUGOT GENERATOR
    =============================== */

    const hugotLines = [

        "Maybe the plot twist is that you were never meant to chase them.",

        "Some people stay in your heart even when they leave your story.",

        "Maybe you don't miss them. You miss the memories.",

        "Sometimes the answer is already there. You're just afraid to accept it.",

        "Not every almost becomes a forever.",

        "Maybe the person you're waiting for is also waiting for a sign.",

        "Some stories end without a goodbye.",

        "The biggest plot twist is choosing yourself."

    ];


    window.newHugot = function () {

        const text =
            document.getElementById("hugotText");

        if (!text) return;

        const random =
            hugotLines[
                Math.floor(
                    Math.random() *
                    hugotLines.length
                )
            ];

        text.style.opacity = "0";

        setTimeout(function () {

            text.textContent =
                '"' + random + '"';

            text.style.opacity = "1";

        }, 250);

    };


    /* ===============================
       PLOT TWIST ROULETTE
    =============================== */

    const rouletteStories = [

        "Someone secretly likes their best friend.",

        "Someone is waiting for a message right now.",

        "Someone has a crush but is too shy to admit it.",

        "Someone keeps checking someone's profile.",

        "Someone wants to confess but doesn't know how.",

        "Someone is pretending not to care.",

        "Someone's best friend might actually be their crush.",

        "Someone's plot twist is finally moving on."

    ];


    window.spinRoulette = function () {

        const text =
            document.getElementById("rouletteText");

        const icon =
            document.getElementById("rouletteIcon");

        if (!text) return;

        if (icon) {
            icon.classList.add("spin");
        }

        text.style.opacity = "0";

        setTimeout(function () {

            const random =
                rouletteStories[
                    Math.floor(
                        Math.random() *
                        rouletteStories.length
                    )
                ];

            text.textContent =
                '"' + random + '"';

            text.style.opacity = "1";

            if (icon) {
                icon.classList.remove("spin");
            }

        }, 800);

    };


    /* ===============================
       SIGNS / DELULU VOTING
    =============================== */

    let votes = {

        sign: 62,

        maybe: 25,

        delulu: 13

    };


    window.voteSign = function (type) {

        if (
            !Object.prototype.hasOwnProperty.call(
                votes,
                type
            )
        ) {
            return;
        }

        votes[type]++;

        updateVotes();

    };


    function updateVotes() {

        const total =
            votes.sign +
            votes.maybe +
            votes.delulu;

        const sign =
            Math.round(
                votes.sign / total * 100
            );

        const maybe =
            Math.round(
                votes.maybe / total * 100
            );

        const delulu =
            100 - sign - maybe;

        updateBar(
            "signBar",
            "signPercent",
            sign
        );

        updateBar(
            "maybeBar",
            "maybePercent",
            maybe
        );

        updateBar(
            "deluluBar",
            "deluluPercent",
            delulu
        );

    }


    function updateBar(barID, textID, value) {

        const bar =
            document.getElementById(barID);

        const text =
            document.getElementById(textID);

        if (bar) {

            bar.style.width =
                value + "%";

        }

        if (text) {

            text.textContent =
                value + "%";

        }

    }

});
