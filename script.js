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
   PLOTTWISTED
   PUBLIC COMMUNITY SCRIPT
===================================================== */


/* =====================================================
   NAVIGATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const buttons =
        document.querySelectorAll("[data-slide]");

    const sections =
        document.querySelectorAll(".page-section");


    function openSlide(id) {

        const target =
            document.getElementById(id);

        if (!target) return;


        sections.forEach(function (section) {

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


        history.replaceState(
            null,
            "",
            "#" + id
        );

    }


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                openSlide(
                    button.getAttribute(
                        "data-slide"
                    )
                );

            }
        );

    });


    /* Open page from URL */

    const hash =
        window.location.hash.replace(
            "#",
            ""
        );


    if (
        hash &&
        document.getElementById(hash)
    ) {

        openSlide(hash);

    }


    /* =================================================
       LOAD PUBLIC CONTENT
    ================================================= */

    loadConfessions();

    loadHugots();

    loadUnsent();


    /* =================================================
       CONFESSION SUBMISSION
    ================================================= */

    const confessionForm =
        document.getElementById(
            "confessionForm"
        );


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


                if (message.length > 500) {

                    alert(
                        "Your confession is too long."
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


                } catch (error) {

                    console.error(error);


                    alert(
                        "Unable to post. Please check your Firebase settings."
                    );

                }

            }
        );

    }


    /* =================================================
       HUGOT SUBMISSION
    ================================================= */

    const hugotForm =
        document.getElementById(
            "hugotForm"
        );


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


                if (message.length > 400) {

                    alert(
                        "Your hugot is too long."
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


                } catch (error) {

                    console.error(error);


                    alert(
                        "Unable to post your hugot."
                    );

                }

            }
        );

    }


    /* =================================================
       UNSENT MESSAGE SUBMISSION
    ================================================= */

    const unsentForm =
        document.getElementById(
            "unsentForm"
        );


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


                if (message.length > 500) {

                    alert(
                        "Your message is too long."
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


                } catch (error) {

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
   DATE FORMATTER
===================================================== */

function formatDate(timestamp) {

    if (!timestamp) {

        return "Just now";

    }


    try {

        const date =
            timestamp.toDate();


        return date.toLocaleString(
            "en-US",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch {

        return "Just now";

    }

}



/* =====================================================
   CREATE PUBLIC POST CARD
===================================================== */

function createPostCard(
    data,
    id,
    type
) {

    const card =
        document.createElement("article");


    card.className =
        "post-card";


    const typeSymbol =
        type === "CONFESSION"
            ? "♡"
            : type === "HUGOT"
                ? "✦"
                : "✉";


    const date =
        formatDate(
            data.createdAt
        );


    const likes =
        Number(data.likes || 0);


    card.innerHTML = `

        <div class="post-type">
            ${typeSymbol} ${type}
        </div>


        <div class="post-message"></div>


        <div class="post-date">
            Anonymous · ${date}
        </div>


        <div class="post-actions">

            <button
                class="like-button"
                data-like="${id}"
                data-type="${type}">

                ♡ ${likes}

            </button>


            <button
                class="report-button"
                data-report="${id}"
                data-type="${type}">

                ⚑ Report

            </button>

        </div>

    `;


    /* Prevent submitted HTML from becoming HTML */

    card.querySelector(
        ".post-message"
    ).textContent =
        '"' +
        data.message +
        '"';


    /* LIKE */

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
                data.likes || 0,
                likeButton
            );

        }
    );


    /* REPORT */

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
   GET FIRESTORE COLLECTION
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
   LOAD CONFESSIONS
===================================================== */

async function loadConfessions() {

    const container =
        document.getElementById(
            "confessionList"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="card">

            <p>
                Loading anonymous stories...
            </p>

        </div>

    `;


    try {

        const posts =
            await getPosts(
                "confessions"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="card">

                    <span class="card-label">
                        THE FIRST STORY
                    </span>

                    <p>
                        Be the first person
                        to leave a confession. ♡
                    </p>

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


        createRecommendations(
            posts,
            "confession"
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="card">

                <p>
                    Unable to load confessions.
                </p>

            </div>

        `;

    }

}



/* =====================================================
   LOAD HUGOTS
===================================================== */

async function loadHugots() {

    const container =
        document.getElementById(
            "hugotList"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="card">

            <p>
                Loading community hugots...
            </p>

        </div>

    `;


    try {

        const posts =
            await getPosts(
                "hugots"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="card">

                    <span class="card-label">
                        EMPTY CORNER
                    </span>

                    <p>
                        Be the first to drop
                        a hugot. ✦
                    </p>

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


    } catch (error) {

        console.error(error);

    }

}



/* =====================================================
   LOAD UNSENT
===================================================== */

async function loadUnsent() {

    const container =
        document.getElementById(
            "unsentList"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="card">

            <p>
                Opening the drafts...
            </p>

        </div>

    `;


    try {

        const posts =
            await getPosts(
                "unsentMessages"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="card">

                    <span class="card-label">
                        THE VOID IS QUIET
                    </span>

                    <p>
                        Leave the first
                        unsent message. ✉
                    </p>

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


    } catch (error) {

        console.error(error);

    }

}



/* =====================================================
   LIKE POST
===================================================== */

async function likePost(
    id,
    type,
    currentLikes,
    button
) {

    try {

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


        const postRef =
            doc(
                db,
                collectionName,
                id
            );


        await updateDoc(
            postRef,
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


    } catch (error) {

        console.error(error);


        alert(
            "Unable to react right now."
        );

    }

}



/* =====================================================
   REPORT POST
===================================================== */

async function reportPost(
    id,
    type
) {

    const confirmed =
        confirm(
            "Report this anonymous post?"
        );


    if (!confirmed) return;


    try {

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


        const postRef =
            doc(
                db,
                collectionName,
                id
            );


        await updateDoc(
            postRef,
            {

                reports:
                    increment(1)

            }
        );


        alert(
            "Thank you. The post has been reported."
        );


    } catch (error) {

        console.error(error);


        alert(
            "Unable to report this post."
        );

    }

}



/* =====================================================
   RECOMMENDATIONS
===================================================== */

function createRecommendations(
    posts,
    type
) {

    const recommendation =
        document.querySelector(
            ".recommendation-box"
        );


    if (!recommendation) return;


    if (!posts || posts.length === 0) {

        return;

    }


    /* Pick a random public post */

    const random =
        posts[
            Math.floor(
                Math.random() *
                posts.length
            )
        ];


    const message =
        recommendation.querySelector("p");


    if (!message) return;


    message.textContent =
        "✦ " +
        '"' +
        random.message +
        '"';

}



/* =====================================================
   HUGOT RANDOMIZER
===================================================== */

const hugotLines = [

    "Maybe the plot twist is choosing yourself.",

    "Some people are chapters, not the whole story.",

    "You can't force someone to read a story they never opened.",

    "Sometimes closure is something you give yourself.",

    "Maybe they weren't your forever. Maybe they were your lesson.",

    "Not every almost deserves a second chance.",

    "Some feelings are real even when the relationship isn't.",

    "If they wanted to, they probably would.",

    "The hardest goodbye is the one you never got to say.",

    "Maybe the right person won't make you question where you stand."

];


function newHugot() {

    const text =
        document.getElementById(
            "hugotText"
        );


    if (!text) return;


    const random =
        hugotLines[
            Math.floor(
                Math.random() *
                hugotLines.length
            )
        ];


    text.textContent =
        '"' + random + '"';

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


    icon.style.transform =
        "rotate(720deg)";


    icon.style.transition =
        "transform 1s ease";


    text.style.opacity =
        "0";


    setTimeout(
        function () {

            const random =
                plotTwists[
                    Math.floor(
                        Math.random() *
                        plotTwists.length
                    )
                ];


            text.textContent =
                '"' +
                random +
                '"';


            text.style.opacity =
                "1";


            icon.style.transform =
                "rotate(0deg)";


        },
        600
    );

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

    else {

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


    document.getElementById(
        "signBar"
    ).style.width =
        signPercent + "%";


    document.getElementById(
        "maybeBar"
    ).style.width =
        maybePercent + "%";


    document.getElementById(
        "deluluBar"
    ).style.width =
        deluluPercent + "%";


    document.getElementById(
        "signPercent"
    ).textContent =
        signPercent + "%";


    document.getElementById(
        "maybePercent"
    ).textContent =
        maybePercent + "%";


    document.getElementById(
        "deluluPercent"
    ).textContent =
        deluluPercent + "%";

            }
