import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   NAVIGATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll("[data-slide]");
    const sections = document.querySelectorAll(".page-section");


    function openSlide(id) {

        const target = document.getElementById(id);

        if (!target) return;

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

            openSlide(
                button.getAttribute("data-slide")
            );

        });

    });


    const hash =
        window.location.hash.replace("#", "");

    if (
        hash &&
        document.getElementById(hash)
    ) {
        openSlide(hash);
    }


    /* LOAD FIREBASE CONTENT */

    loadConfessions();
    loadHugots();
    loadUnsent();


    /* =================================================
       CONFESSION FORM
    ================================================= */

    const confessionForm =
        document.getElementById("confessionForm");


    if (confessionForm) {

        confessionForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "confessionInput"
                    );

                const message =
                    input.value.trim();


                if (!message) {

                    alert(
                        "Please write your confession first. ♡"
                    );

                    return;
                }


                try {

                    await addDoc(
                        collection(
                            db,
                            "confessions"
                        ),
                        {
                            message: message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";

                    alert(
                        "♡ Your confession is now public anonymously!"
                    );

                    loadConfessions();

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Unable to post. Check your Firebase Rules."
                    );

                }

            }
        );

    }


    /* =================================================
       HUGOT FORM
    ================================================= */

    const hugotForm =
        document.getElementById("hugotForm");


    if (hugotForm) {

        hugotForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "hugotInput"
                    );

                const message =
                    input.value.trim();


                if (!message) {

                    alert(
                        "Write your hugot first! ✦"
                    );

                    return;
                }


                try {

                    await addDoc(
                        collection(
                            db,
                            "hugots"
                        ),
                        {
                            message: message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";

                    alert(
                        "✦ Your hugot is now public!"
                    );

                    loadHugots();

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Unable to post your hugot."
                    );

                }

            }
        );

    }


    /* =================================================
       UNSENT MESSAGE FORM
    ================================================= */

    const unsentForm =
        document.getElementById("unsentForm");


    if (unsentForm) {

        unsentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "unsentInput"
                    );

                const message =
                    input.value.trim();


                if (!message) {

                    alert(
                        "Write your message first. ✉"
                    );

                    return;
                }


                try {

                    await addDoc(
                        collection(
                            db,
                            "unsentMessages"
                        ),
                        {
                            message: message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";

                    alert(
                        "✉ Your message has been sent to the void."
                    );

                    loadUnsent();

                }

                catch (error) {

                    console.error(error);

                    alert(
                        "Unable to post your message."
                    );

                }

            }
        );

    }

});



/* =====================================================
   DATE
===================================================== */

function formatDate(timestamp) {

    if (!timestamp) {
        return "Just now";
    }

    try {

        return timestamp
            .toDate()
            .toLocaleString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

    }

    catch {

        return "Just now";

    }

}



/* =====================================================
   CREATE POST CARD
===================================================== */

function createPostCard(
    data,
    id,
    type
) {

    const card =
        document.createElement("article");


    card.className = "post-card";


    const symbol =
        type === "CONFESSION"
            ? "♡"
            : type === "HUGOT"
                ? "✦"
                : "✉";


    const likes =
        Number(data.likes || 0);


    card.innerHTML = `

        <div class="post-type">
            ${symbol} ${type}
        </div>

        <div class="post-message"></div>

        <div class="post-date">
            Anonymous · ${formatDate(data.createdAt)}
        </div>

        <div class="post-actions">

            <button
                class="like-button">

                ♡ ${likes}

            </button>

            <button
                class="report-button">

                ⚑ Report

            </button>

        </div>

    `;


    card.querySelector(
        ".post-message"
    ).textContent =
        '"' + data.message + '"';


    const likeButton =
        card.querySelector(
            ".like-button"
        );


    likeButton.addEventListener(
        "click",
        async function () {

            await likePost(
                id,
                type,
                likes,
                likeButton
            );

        }
    );


    const reportButton =
        card.querySelector(
            ".report-button"
        );


    reportButton.addEventListener(
        "click",
        async function () {

            await reportPost(
                id,
                type
            );

        }
    );


    return card;

}



/* =====================================================
   GET POSTS
===================================================== */

async function getPosts(
    collectionName
) {

    const q =
        query(
            collection(
                db,
                collectionName
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    const snapshot =
        await getDocs(q);


    return snapshot.docs.map(
        function (document) {

            return {
                id: document.id,
                ...document.data()
            };

        }
    );

}



/* =====================================================
   CONFESSIONS
===================================================== */

async function loadConfessions() {

    const container =
        document.getElementById(
            "confessionList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>Loading anonymous stories...</p>";


    try {

        const posts =
            await getPosts(
                "confessions"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="post-card">

                    <div class="post-type">
                        ♡ FIRST STORY
                    </div>

                    <div class="post-message">
                        Be the first person
                        to leave a confession.
                    </div>

                </div>

            `;

            return;
        }


        posts.forEach(
            function (post) {

                container.appendChild(
                    createPostCard(
                        post,
                        post.id,
                        "CONFESSION"
                    )
                );

            }
        );


        showRecommendation(posts);

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Unable to load confessions.
            </p>
        `;

    }

}



/* =====================================================
   HUGOTS
===================================================== */

async function loadHugots() {

    const container =
        document.getElementById(
            "hugotList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>Loading community hugots...</p>";


    try {

        const posts =
            await getPosts(
                "hugots"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="post-card">

                    <div class="post-type">
                        ✦ EMPTY CORNER
                    </div>

                    <div class="post-message">
                        Be the first to drop a hugot.
                    </div>

                </div>

            `;

            return;
        }


        posts.forEach(
            function (post) {

                container.appendChild(
                    createPostCard(
                        post,
                        post.id,
                        "HUGOT"
                    )
                );

            }
        );

    }

    catch (error) {

        console.error(error);

    }

}



/* =====================================================
   UNSENT
===================================================== */

async function loadUnsent() {

    const container =
        document.getElementById(
            "unsentList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>Opening the drafts...</p>";


    try {

        const posts =
            await getPosts(
                "unsentMessages"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="post-card">

                    <div class="post-type">
                        ✉ THE VOID IS QUIET
                    </div>

                    <div class="post-message">
                        Leave the first
                        unsent message.
                    </div>

                </div>

            `;

            return;
        }


        posts.forEach(
            function (post) {

                container.appendChild(
                    createPostCard(
                        post,
                        post.id,
                        "UNSENT"
                    )
                );

            }
        );

    }

    catch (error) {

        console.error(error);

    }

}



/* =====================================================
   LIKE
===================================================== */

async function likePost(
    id,
    type,
    currentLikes,
    button
) {

    let collectionName;


    if (type === "CONFESSION") {

        collectionName =
            "confessions";

    }

    else if (type === "HUGOT") {

        collectionName =
            "hugots";

    }

    else {

        collectionName =
            "unsentMessages";

    }


    try {

        await updateDoc(
            doc(
                db,
                collectionName,
                id
            ),
            {
                likes:
                    increment(1)
            }
        );


        const newLikes =
            Number(currentLikes || 0) + 1;


        button.textContent =
            "♡ " + newLikes;


        button.style.color =
            "#e29aab";


    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to react right now."
        );

    }

}



/* =====================================================
   REPORT
===================================================== */

async function reportPost(
    id,
    type
) {

    if (
        !confirm(
            "Report this anonymous post?"
        )
    ) {
        return;
    }


    let collectionName;


    if (type === "CONFESSION") {

        collectionName =
            "confessions";

    }

    else if (type === "HUGOT") {

        collectionName =
            "hugots";

    }

    else {

        collectionName =
            "unsentMessages";

    }


    try {

        await updateDoc(
            doc(
                db,
                collectionName,
                id
            ),
            {
                reports:
                    increment(1)
            }
        );


        alert(
            "Thank you. The post has been reported."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to report this post."
        );

    }

}



/* =====================================================
   RECOMMENDATIONS
===================================================== */

function showRecommendation(posts) {

    const box =
        document.querySelector(
            ".recommendation-box p"
        );


    if (!box || !posts.length) return;


    const random =
        posts[
            Math.floor(
                Math.random() *
                posts.length
            )
        ];


    box.textContent =
        '✦ "' +
        random.message +
        '"';

}



/* =====================================================
   PLOT TWIST ROULETTE
===================================================== */

const plotTwists = [

    "Someone secretly likes their best friend.",

    "Your old crush suddenly messages you.",

    "The person you thought hated you actually likes you.",

    "Your best friend has been hiding a secret.",

    "Someone is writing anonymous confessions about you.",

    "The person you least expected becomes your closest friend.",

    "Your next plot twist starts with a simple 'hi'.",

    "Someone from your past comes back.",

    "The person you've been looking for has been beside you all along.",

    "Your biggest delusion might actually be true."

];


function spinRoulette() {

    const text =
        document.getElementById(
            "rouletteText"
        );


    const icon =
        document.getElementById(
            "rouletteIcon"
        );


    if (!text) return;


    if (icon) {

        icon.style.transition =
            "transform 1s ease";

        icon.style.transform =
            "rotate(720deg)";

    }


    text.style.transition =
        "opacity .3s ease";

    text.style.opacity = "0";


    setTimeout(function () {

        const random =
            plotTwists[
                Math.floor(
                    Math.random() *
                    plotTwists.length
                )
            ];


        text.textContent =
            '"' + random + '"';


        text.style.opacity = "1";


        if (icon) {

            icon.style.transform =
                "rotate(0deg)";

        }

    }, 600);

}



/* =====================================================
   SIGN OR DELUSION
===================================================== */

let signVotes = 62;
let maybeVotes = 25;
let deluluVotes = 13;


function voteSign(choice) {

    if (choice === "sign") {

        signVotes++;

    }

    else if (choice === "maybe") {

        maybeVotes++;

    }

    else if (choice === "delulu") {

        deluluVotes++;

    }


    const total =
        signVotes +
        maybeVotes +
        deluluVotes;


    const signPercent =
        Math.round(
            (signVotes / total) * 100
        );


    const maybePercent =
        Math.round(
            (maybeVotes / total) * 100
        );


    const deluluPercent =
        100 -
        signPercent -
        maybePercent;


    const signBar =
        document.getElementById(
            "signBar"
        );

    const maybeBar =
        document.getElementById(
            "maybeBar"
        );

    const deluluBar =
        document.getElementById(
            "deluluBar"
        );


    const signText =
        document.getElementById(
            "signPercent"
        );

    const maybeText =
        document.getElementById(
            "maybePercent"
        );

    const deluluText =
        document.getElementById(
            "deluluPercent"
        );


    if (signBar)
        signBar.style.width =
            signPercent + "%";


    if (maybeBar)
        maybeBar.style.width =
            maybePercent + "%";


    if (deluluBar)
        deluluBar.style.width =
            deluluPercent + "%";


    if (signText)
        signText.textContent =
            signPercent + "%";


    if (maybeText)
        maybeText.textContent =
            maybePercent + "%";


    if (deluluText)
        deluluText.textContent =
            deluluPercent + "%";


    /* BUTTON ANIMATION */

    const buttons =
        document.querySelectorAll(
            ".vote-buttons button"
        );


    buttons.forEach(
        function (button) {

            button.style.transform =
                "scale(1)";

        }
    );


    if (
        choice === "sign" &&
        buttons[0]
    ) {

        buttons[0].style.transform =
            "scale(1.05)";

    }


    if (
        choice === "maybe" &&
        buttons[1]
    ) {

        buttons[1].style.transform =
            "scale(1.05)";

    }


    if (
        choice === "delulu" &&
        buttons[2]
    ) {

        buttons[2].style.transform =
            "scale(1.05)";

    }

}



/* =====================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
===================================================== */

window.spinRoulette =
    spinRoulette;

window.voteSign =
    voteSign;
