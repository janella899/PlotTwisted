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
   COMMUNITY SCRIPT
===================================================== */


/* =====================================================
   NAVIGATION
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const buttons =
        document.querySelectorAll("[data-slide]");

    const sections =
        document.querySelectorAll(".page-section");


    function openSlide(id) {

        const target =
            document.getElementById(id);

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


        history.replaceState(
            null,
            "",
            "#" + id
        );

    }


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openSlide(
                    button.dataset.slide
                );

            }
        );

    });


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


    /* LOAD PUBLIC CONTENT */

    loadConfessions();

    loadHugots();

    loadUnsent();

    loadSignDelusion();


    /* =================================================
       CONFESSION FORM
    ================================================= */

    const confessionForm =
        document.getElementById(
            "confessionForm"
        );


    if (confessionForm) {

        confessionForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const input =
                    document.getElementById(
                        "confessionInput"
                    );


                const message =
                    input.value.trim();


                if (!message) {

                    alert(
                        "Write your confession first. ♡"
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
                            message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";


                    alert(
                        "♡ Confession posted anonymously!"
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
        document.getElementById(
            "hugotForm"
        );


    if (hugotForm) {

        hugotForm.addEventListener(
            "submit",
            async event => {

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
                            message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";


                    alert(
                        "✦ Hugot posted!"
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
       UNSENT MESSAGE
    ================================================= */

    const unsentForm =
        document.getElementById(
            "unsentForm"
        );


    if (unsentForm) {

        unsentForm.addEventListener(
            "submit",
            async event => {

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
                            message,
                            likes: 0,
                            reports: 0,
                            createdAt:
                                serverTimestamp()
                        }
                    );


                    input.value = "";


                    alert(
                        "✉ Message sent anonymously."
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


    /* =================================================
       SIGN OR DELUSION FORM
    ================================================= */

    const signForm =
        document.getElementById(
            "signDelusionForm"
        );


    if (signForm) {

        signForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const input =
                    document.getElementById(
                        "signDelusionInput"
                    );


                if (!input) return;


                const situation =
                    input.value.trim();


                if (!situation) {

                    alert(
                        "Tell us what happened first! 👀"
                    );

                    return;

                }


                if (situation.length > 500) {

                    alert(
                        "Keep your story under 500 characters."
                    );

                    return;

                }


                try {

                    await addDoc(
                        collection(
                            db,
                            "signDelusionPosts"
                        ),
                        {

                            situation,

                            sign: 0,

                            maybe: 0,

                            delulu: 0,

                            reports: 0,

                            createdAt:
                                serverTimestamp()

                        }
                    );


                    input.value = "";


                    alert(
                        "👀 Your situation is now public!"
                    );


                    loadSignDelusion();

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

});



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
        document => ({

            id: document.id,

            ...document.data()

        })
    );

}



/* =====================================================
   SIGN OR DELUSION
===================================================== */

async function loadSignDelusion() {

    const container =
        document.getElementById(
            "signDelusionList"
        );


    if (!container) return;


    container.innerHTML = `
        <p class="loading">
            Loading everyone's situations...
        </p>
    `;


    try {

        const posts =
            await getPosts(
                "signDelusionPosts"
            );


        container.innerHTML = "";


        if (posts.length === 0) {

            container.innerHTML = `

                <div class="post-card">

                    <div class="post-type">
                        👀 FIRST PLOT
                    </div>

                    <div class="post-message">
                        No situations yet.
                        Be the first to ask
                        the community!
                    </div>

                </div>

            `;

            return;

        }


        posts.forEach(post => {

            container.appendChild(
                createSignPost(post)
            );

        });

    }

    catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="post-card">

                <div class="post-message">
                    Unable to load public situations.
                </div>

            </div>

        `;

    }

}



/* =====================================================
   CREATE SIGN POST
===================================================== */

function createSignPost(post) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-card sign-post";


    const sign =
        Number(post.sign || 0);


    const maybe =
        Number(post.maybe || 0);


    const delulu =
        Number(post.delulu || 0);


    const total =
        sign +
        maybe +
        delulu;


    let signPercent = 0;

    let maybePercent = 0;

    let deluluPercent = 0;


    if (total > 0) {

        signPercent =
            Math.round(
                sign / total * 100
            );


        maybePercent =
            Math.round(
                maybe / total * 100
            );


        deluluPercent =
            100 -
            signPercent -
            maybePercent;

    }


    card.innerHTML = `

        <div class="post-type">
            👀 SIGN OR DELUSION
        </div>


        <div class="sign-situation"></div>


        <div class="post-date">
            Anonymous · Public
        </div>


        <div class="vote-buttons">

            <button
                class="sign-btn">

                💗 SIGN

            </button>


            <button
                class="maybe-btn">

                🤔 MAYBE

            </button>


            <button
                class="delulu-btn">

                💀 DELULU

            </button>

        </div>


        <div class="vote-results">

            <div class="vote-row">

                <span>
                    💗 Sign
                </span>

                <div class="vote-bar">
                    <div
                        class="vote-fill sign-fill"
                        style="width:${signPercent}%">
                    </div>
                </div>

                <strong>
                    ${signPercent}%
                </strong>

            </div>


            <div class="vote-row">

                <span>
                    🤔 Maybe
                </span>

                <div class="vote-bar">
                    <div
                        class="vote-fill maybe-fill"
                        style="width:${maybePercent}%">
                    </div>
                </div>

                <strong>
                    ${maybePercent}%
                </strong>

            </div>


            <div class="vote-row">

                <span>
                    💀 Delulu
                </span>

                <div class="vote-bar">
                    <div
                        class="vote-fill delulu-fill"
                        style="width:${deluluPercent}%">
                    </div>
                </div>

                <strong>
                    ${deluluPercent}%
                </strong>

            </div>

        </div>


        <div class="vote-count">

            ${total} total vote${total === 1 ? "" : "s"}

        </div>


        <button class="report-button">
            ⚑ Report
        </button>

    `;


    card.querySelector(
        ".sign-situation"
    ).textContent =
        '"' +
        post.situation +
        '"';


    /* SIGN */

    card.querySelector(
        ".sign-btn"
    ).addEventListener(
        "click",
        () => {

            voteCommunity(
                post.id,
                "sign"
            );

        }
    );


    /* MAYBE */

    card.querySelector(
        ".maybe-btn"
    ).addEventListener(
        "click",
        () => {

            voteCommunity(
                post.id,
                "maybe"
            );

        }
    );


    /* DELULU */

    card.querySelector(
        ".delulu-btn"
    ).addEventListener(
        "click",
        () => {

            voteCommunity(
                post.id,
                "delulu"
            );

        }
    );


    /* REPORT */

    card.querySelector(
        ".report-button"
    ).addEventListener(
        "click",
        async () => {

            if (
                !confirm(
                    "Report this post?"
                )
            ) return;


            try {

                await updateDoc(
                    doc(
                        db,
                        "signDelusionPosts",
                        post.id
                    ),
                    {
                        reports:
                            increment(1)
                    }
                );


                alert(
                    "Thank you for reporting this post."
                );

            }

            catch (error) {

                console.error(error);

                alert(
                    "Unable to report."
                );

            }

        }
    );


    return card;

}



/* =====================================================
   COMMUNITY VOTING
===================================================== */

async function voteCommunity(
    id,
    choice
) {

    try {

        const update = {};


        if (choice === "sign") {

            update.sign =
                increment(1);

        }


        if (choice === "maybe") {

            update.maybe =
                increment(1);

        }


        if (choice === "delulu") {

            update.delulu =
                increment(1);

        }


        await updateDoc(
            doc(
                db,
                "signDelusionPosts",
                id
            ),
            update
        );


        loadSignDelusion();


    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to record your vote."
        );

    }

}



/* =====================================================
   PLOT TWIST ROULETTE
   100+ RESULTS
===================================================== */

const plotTwists = [

    "Someone secretly likes your best friend.",

    "Your crush already knows you like them.",

    "Your old crush suddenly messages you.",

    "Someone has been checking your stories every day.",

    "Your best friend has a secret crush.",

    "The person you thought hated you actually likes you.",

    "Someone is writing anonymous confessions about you.",

    "Your next plot twist starts with a simple hello.",

    "Someone from your past comes back.",

    "Your biggest delusion might actually be true.",

    "Someone you barely talk to thinks you're interesting.",

    "Your crush accidentally reveals their feelings.",

    "A random friendship becomes your favorite friendship.",

    "Someone wants to apologize but is too shy.",

    "The person you least expected becomes important to you.",

    "You reconnect with someone you haven't talked to in years.",

    "Your next best friend is someone you haven't met yet.",

    "Someone has been waiting for you to make the first move.",

    "A simple conversation changes everything.",

    "Someone secretly admires your confidence.",

    "Your quietest friend knows your biggest secret.",

    "Your crush asks about you when you're not around.",

    "Someone saves your messages.",

    "A friendship unexpectedly turns into something deeper.",

    "Someone is nervous every time they talk to you.",

    "Your next adventure starts unexpectedly.",

    "Someone remembers the smallest thing you told them.",

    "You meet someone who completely changes your perspective.",

    "An old misunderstanding finally gets cleared up.",

    "Someone you miss is thinking about you too.",

    "Your next favorite memory happens on an ordinary day.",

    "Someone wants to be friends but doesn't know how to approach you.",

    "A person you overlooked becomes important.",

    "Your crush starts noticing the little things about you.",

    "Someone is secretly rooting for you.",

    "You receive a message you never expected.",

    "Someone remembers your birthday without being reminded.",

    "Your friendship circle is about to change.",

    "A random coincidence introduces you to someone new.",

    "Someone has a completely different impression of you.",

    "Your next chapter begins with an unexpected invitation.",

    "Someone who seemed distant actually cares a lot.",

    "You discover someone has been supporting you quietly.",

    "An accidental conversation becomes unforgettable.",

    "Someone finally tells you what they really think.",

    "Your crush gets jealous but tries to hide it.",

    "Someone sends you a message at the perfect time.",

    "You become closer to someone through a shared secret.",

    "A forgotten friendship gets another chance.",

    "Someone unexpectedly defends you.",

    "You find out that someone has been talking positively about you.",

    "Your next school day contains an unexpected surprise.",

    "Someone notices when you're having a bad day.",

    "A stranger becomes a familiar face.",

    "Someone you thought forgot about you remembers everything.",

    "Your crush asks your friend about you.",

    "A random seat assignment changes your social life.",

    "Someone wants to tell you something important.",

    "Your next group project introduces you to someone special.",

    "Someone secretly thinks you're funnier than you realize.",

    "An old photo brings back an important memory.",

    "Someone unexpectedly compliments you.",

    "You discover that someone shares the same interests as you.",

    "Your next conversation lasts much longer than expected.",

    "Someone is waiting for the right moment to approach you.",

    "A misunderstanding turns into a funny memory.",

    "Someone you haven't noticed has noticed you.",

    "Your next friendship starts through a mutual friend.",

    "Someone wants to become closer to you.",

    "Your crush accidentally likes an old post.",

    "Someone sends you a message and immediately regrets it.",

    "You hear something surprising about yourself.",

    "A random decision leads to a great memory.",

    "Someone who rarely talks suddenly opens up to you.",

    "Your next laugh comes from the most unexpected person.",

    "Someone secretly hopes you'll notice them.",

    "A forgotten promise comes back into your life.",

    "You meet someone with the same chaotic energy as you.",

    "Someone starts a conversation because they wanted an excuse to talk.",

    "Your crush remembers a tiny detail about you.",

    "Someone unexpectedly asks for your opinion.",

    "A friendship becomes stronger after a difficult day.",

    "Someone is happier when you're around.",

    "Your next inside joke begins today.",

    "Someone you've been avoiding finally talks to you.",

    "A simple compliment turns into a meaningful conversation.",

    "Someone secretly thinks you're approachable.",

    "You discover an unexpected shared connection.",

    "Someone sends you something that reminds them of you.",

    "Your next group hangout becomes unforgettable.",

    "Someone who seemed intimidating turns out to be really nice.",

    "Your crush notices when you change something small.",

    "Someone has been waiting for you to reply.",

    "An unexpected apology fixes an old friendship.",

    "You accidentally become someone's favorite person to talk to.",

    "Someone starts trusting you with their secrets.",

    "A random conversation reveals a surprising connection.",

    "Your next plot twist happens when you stop expecting one.",

    "Someone finally gathers the courage to say hello.",

    "You discover that you're someone's inspiration.",

    "A person from your past becomes part of your future.",

    "Someone secretly hopes you'll stay in their life.",

    "Your next chapter is better than the one you planned.",

    "Someone notices your absence more than you think.",

    "A small decision creates a huge memory.",

    "The person you least expect sends the message you've been waiting for.",

    "Someone is quietly cheering you on.",

    "Your next unexpected friendship becomes a favorite.",

    "A coincidence makes you question whether it was really a coincidence.",

    "Someone finally admits they missed talking to you.",

    "Your biggest plot twist hasn't happened yet.",

    "Someone is about to enter your life at exactly the right time."

];



/* =====================================================
   SPIN ROULETTE
===================================================== */

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


    text.style.opacity = "0";


    setTimeout(() => {

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
   MAKE HTML BUTTONS WORK
===================================================== */

window.spinRoulette =
    spinRoulette;
