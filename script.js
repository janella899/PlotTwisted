/* =====================================================
   PLOTTWISTED — FIREBASE + WEBSITE FUNCTIONS
===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE
===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyCJ59V5ioK4DWpM_jYFy7NMMPPgjiHNeAE",

    authDomain: "plottwisted-c5551.firebaseapp.com",

    projectId: "plottwisted-c5551",

    storageBucket: "plottwisted-c5551.firebasestorage.app",

    messagingSenderId: "797105645748",

    appId: "1:797105645748:web:e410591f49c41b8a7f4fe1",

    measurementId: "G-V5DBX6TKK2"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* =====================================================
   PAGE / SLIDE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll(".page-section");

const navigationButtons =
    document.querySelectorAll("[data-slide]");


function openSlide(id) {

    sections.forEach(section => {

        section.classList.remove(
            "active-section"
        );

    });


    const target =
        document.getElementById(id);


    if (target) {

        target.classList.add(
            "active-section"
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


navigationButtons.forEach(button => {

    button.addEventListener("click", () => {

        const slide =
            button.getAttribute("data-slide");

        openSlide(slide);

    });

});


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function escapeText(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function formatDate(timestamp) {

    if (!timestamp) {
        return "JUST NOW";
    }


    try {

        const date =
            timestamp.toDate();

        return date.toLocaleString();

    } catch {

        return "JUST NOW";

    }

}


function showMessage(message) {

    alert(message);

}


/* =====================================================
   CONFESSIONS
===================================================== */

const confessionForm =
    document.getElementById(
        "confessionForm"
    );


const confessionInput =
    document.getElementById(
        "confessionInput"
    );


const confessionList =
    document.getElementById(
        "confessionList"
    );


if (confessionForm) {

    confessionForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const text =
                confessionInput.value.trim();


            if (!text) return;


            const button =
                confessionForm.querySelector(
                    "button"
                );


            button.disabled = true;

            button.textContent =
                "POSTING...";


            try {

                await addDoc(
                    collection(
                        db,
                        "confessions"
                    ),
                    {

                        text: text,

                        likes: 0,

                        createdAt:
                            serverTimestamp()

                    }
                );


                confessionInput.value = "";


                showMessage(
                    "Your confession is now public. ♡"
                );


            } catch (error) {

                console.error(
                    "Confession error:",
                    error
                );


                showMessage(
                    "Unable to post confession. Check your Firebase Firestore rules."
                );

            }


            button.disabled = false;

            button.textContent =
                "♡ POST CONFESSION";

        }

    );

}


/* =====================================================
   LOAD CONFESSIONS
===================================================== */

if (confessionList) {

    const confessionQuery =
        query(
            collection(
                db,
                "confessions"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        confessionQuery,

        snapshot => {

            confessionList.innerHTML = "";


            if (snapshot.empty) {

                confessionList.innerHTML = `
                    <div class="loading">
                        No confessions yet.<br>
                        Be the first to tell the story. ♡
                    </div>
                `;

                return;

            }


            snapshot.forEach(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "post-card";


                    card.innerHTML = `

                        <div class="post-type">
                            ANONYMOUS CONFESSION
                        </div>

                        <div class="post-message">
                            ${escapeText(data.text)}
                        </div>

                        <div class="post-date">
                            ${formatDate(data.createdAt)}
                        </div>

                        <div class="post-actions">

                            <button
                                class="like-button"
                                data-id="${documentSnapshot.id}">

                                ♡ ${data.likes || 0}

                            </button>

                            <button
                                class="report-button">

                                REPORT

                            </button>

                        </div>

                    `;


                    confessionList.appendChild(
                        card
                    );

                }
            );


            confessionList
                .querySelectorAll(".like-button")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            try {

                                await updateDoc(
                                    doc(
                                        db,
                                        "confessions",
                                        button.dataset.id
                                    ),
                                    {
                                        likes:
                                            increment(1)
                                    }
                                );

                            } catch (error) {

                                console.error(
                                    error
                                );

                            }

                        }
                    );

                });

        },

        error => {

            console.error(
                "Confession loading error:",
                error
            );

            confessionList.innerHTML = `
                <div class="loading">
                    Unable to load public stories.
                </div>
            `;

        }

    );

}


/* =====================================================
   HUGOTS
===================================================== */

const hugotForm =
    document.getElementById(
        "hugotForm"
    );


const hugotInput =
    document.getElementById(
        "hugotInput"
    );


const hugotList =
    document.getElementById(
        "hugotList"
    );


if (hugotForm) {

    hugotForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const text =
                hugotInput.value.trim();


            if (!text) return;


            const button =
                hugotForm.querySelector(
                    "button"
                );


            button.disabled = true;

            button.textContent =
                "POSTING...";


            try {

                await addDoc(
                    collection(
                        db,
                        "hugots"
                    ),
                    {

                        text: text,

                        likes: 0,

                        createdAt:
                            serverTimestamp()

                    }
                );


                hugotInput.value = "";


                showMessage(
                    "Your hugot is now public. ✦"
                );


            } catch (error) {

                console.error(
                    "Hugot error:",
                    error
                );


                showMessage(
                    "Unable to post hugot. Check your Firebase rules."
                );

            }


            button.disabled = false;

            button.textContent =
                "✦ POST HUGOT";

        }

    );

}


/* =====================================================
   LOAD HUGOTS
===================================================== */

if (hugotList) {

    const hugotQuery =
        query(
            collection(
                db,
                "hugots"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        hugotQuery,

        snapshot => {

            hugotList.innerHTML = "";


            if (snapshot.empty) {

                hugotList.innerHTML = `
                    <div class="loading">
                        No hugots yet.<br>
                        Drop the first one. ✦
                    </div>
                `;

                return;

            }


            snapshot.forEach(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "post-card";


                    card.innerHTML = `

                        <div class="post-type">
                            HUGOT CORNER
                        </div>

                        <div class="post-message">
                            ${escapeText(data.text)}
                        </div>

                        <div class="post-date">
                            ${formatDate(data.createdAt)}
                        </div>

                        <div class="post-actions">

                            <button
                                class="like-button"
                                data-id="${documentSnapshot.id}">

                                ♡ ${data.likes || 0}

                            </button>

                            <button
                                class="report-button">

                                REPORT

                            </button>

                        </div>

                    `;


                    hugotList.appendChild(
                        card
                    );

                }
            );


            hugotList
                .querySelectorAll(".like-button")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            try {

                                await updateDoc(
                                    doc(
                                        db,
                                        "hugots",
                                        button.dataset.id
                                    ),
                                    {
                                        likes:
                                            increment(1)
                                    }
                                );

                            } catch (error) {

                                console.error(
                                    error
                                );

                            }

                        }
                    );

                });

        },

        error => {

            console.error(
                "Hugot loading error:",
                error
            );

            hugotList.innerHTML = `
                <div class="loading">
                    Unable to load hugots.
                </div>
            `;

        }

    );

}


/* =====================================================
   UNSENT MESSAGES
===================================================== */

const unsentForm =
    document.getElementById(
        "unsentForm"
    );


const unsentInput =
    document.getElementById(
        "unsentInput"
    );


const unsentList =
    document.getElementById(
        "unsentList"
    );


if (unsentForm) {

    unsentForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const text =
                unsentInput.value.trim();


            if (!text) return;


            const button =
                unsentForm.querySelector(
                    "button"
                );


            button.disabled = true;

            button.textContent =
                "SENDING...";


            try {

                await addDoc(
                    collection(
                        db,
                        "unsentMessages"
                    ),
                    {

                        text: text,

                        likes: 0,

                        createdAt:
                            serverTimestamp()

                    }
                );


                unsentInput.value = "";


                showMessage(
                    "Your unsent message has been added publicly. ✉"
                );


            } catch (error) {

                console.error(
                    "Unsent message error:",
                    error
                );


                showMessage(
                    "Unable to upload message. Check Firebase Rules."
                );

            }


            button.disabled = false;

            button.textContent =
                "✉ SEND TO THE VOID";

        }

    );

}


/* =====================================================
   LOAD UNSENT MESSAGES
===================================================== */

if (unsentList) {

    const unsentQuery =
        query(
            collection(
                db,
                "unsentMessages"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        unsentQuery,

        snapshot => {

            unsentList.innerHTML = "";


            if (snapshot.empty) {

                unsentList.innerHTML = `
                    <div class="loading">
                        The void is still empty... ✉
                    </div>
                `;

                return;

            }


            snapshot.forEach(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "post-card";


                    card.innerHTML = `

                        <div class="post-type">
                            UNSENT MESSAGE
                        </div>

                        <div class="post-message">
                            ${escapeText(data.text)}
                        </div>

                        <div class="post-date">
                            ${formatDate(data.createdAt)}
                        </div>

                        <div class="post-actions">

                            <button
                                class="like-button"
                                data-id="${documentSnapshot.id}">

                                ♡ ${data.likes || 0}

                            </button>

                            <button
                                class="report-button">

                                REPORT

                            </button>

                        </div>

                    `;


                    unsentList.appendChild(
                        card
                    );

                }
            );


            unsentList
                .querySelectorAll(".like-button")
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            try {

                                await updateDoc(
                                    doc(
                                        db,
                                        "unsentMessages",
                                        button.dataset.id
                                    ),
                                    {
                                        likes:
                                            increment(1)
                                    }
                                );

                            } catch (error) {

                                console.error(
                                    error
                                );

                            }

                        }
                    );

                });

        },

        error => {

            console.error(
                "Unsent loading error:",
                error
            );

            unsentList.innerHTML = `
                <div class="loading">
                    Unable to load unsent messages.
                </div>
            `;

        }

    );

}


/* =====================================================
   SIGN OR DELUSION — SUBMIT
===================================================== */

const signDelusionForm =
    document.getElementById(
        "signDelusionForm"
    );


const signDelusionInput =
    document.getElementById(
        "signDelusionInput"
    );


const signDelusionList =
    document.getElementById(
        "signDelusionList"
    );


if (signDelusionForm) {

    signDelusionForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const text =
                signDelusionInput.value.trim();


            if (!text) return;


            const button =
                signDelusionForm.querySelector(
                    "button"
                );


            button.disabled = true;

            button.textContent =
                "POSTING CASE...";


            try {

                await addDoc(
                    collection(
                        db,
                        "signDelusionPosts"
                    ),
                    {

                        text: text,

                        signVotes: 0,

                        maybeVotes: 0,

                        deluluVotes: 0,

                        createdAt:
                            serverTimestamp()

                    }
                );


                signDelusionInput.value = "";


                showMessage(
                    "Your case is now public! Let the community decide. ♡"
                );


            } catch (error) {

                console.error(
                    "Sign or Delusion error:",
                    error
                );


                showMessage(
                    "Unable to post your case. Check Firebase Rules."
                );

            }


            button.disabled = false;

            button.textContent =
                "♡ POST MY SITUATION";

        }

    );

}


/* =====================================================
   SIGN OR DELUSION — PUBLIC CASES
===================================================== */

if (signDelusionList) {

    const casesQuery =
        query(
            collection(
                db,
                "signDelusionPosts"
            ),
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(
        casesQuery,

        snapshot => {

            signDelusionList.innerHTML = "";


            if (snapshot.empty) {

                signDelusionList.innerHTML = `
                    <div class="loading">
                        No cases yet.<br>
                        Post the first mystery. ?
                    </div>
                `;

                return;

            }


            snapshot.forEach(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    const sign =
                        Number(
                            data.signVotes || 0
                        );


                    const maybe =
                        Number(
                            data.maybeVotes || 0
                        );


                    const delulu =
                        Number(
                            data.deluluVotes || 0
                        );


                    const total =
                        sign +
                        maybe +
                        delulu;


                    const signPercent =
                        total === 0
                        ? 0
                        : Math.round(
                            sign / total * 100
                        );


                    const maybePercent =
                        total === 0
                        ? 0
                        : Math.round(
                            maybe / total * 100
                        );


                    const deluluPercent =
                        total === 0
                        ? 0
                        : Math.round(
                            delulu / total * 100
                        );


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "post-card sign-post";


                    card.innerHTML = `

                        <div class="post-type">
                            PUBLIC CASE
                        </div>

                        <div class="sign-situation">
                            ${escapeText(data.text)}
                        </div>


                        <div class="vote-buttons">

                            <button
                                class="vote-choice"
                                data-id="${documentSnapshot.id}"
                                data-vote="sign">

                                ✦

                                <br>

                                DEFINITELY A SIGN

                            </button>


                            <button
                                class="vote-choice"
                                data-id="${documentSnapshot.id}"
                                data-vote="maybe">

                                ?

                                <br>

                                MAYBE

                            </button>


                            <button
                                class="vote-choice"
                                data-id="${documentSnapshot.id}"
                                data-vote="delulu">

                                ♡

                                <br>

                                YOU'RE DELULU

                            </button>

                        </div>


                        <div class="vote-results">

                            <div class="vote-row">

                                <span>Sign</span>

                                <div class="vote-bar">

                                    <div
                                        class="vote-fill"
                                        style="width:${signPercent}%">
                                    </div>

                                </div>

                                <strong>
                                    ${signPercent}%
                                </strong>

                            </div>


                            <div class="vote-row">

                                <span>Maybe</span>

                                <div class="vote-bar">

                                    <div
                                        class="vote-fill"
                                        style="width:${maybePercent}%">
                                    </div>

                                </div>

                                <strong>
                                    ${maybePercent}%
                                </strong>

                            </div>


                            <div class="vote-row">

                                <span>Delulu</span>

                                <div class="vote-bar">

                                    <div
                                        class="vote-fill"
                                        style="width:${deluluPercent}%">
                                    </div>

                                </div>

                                <strong>
                                    ${deluluPercent}%
                                </strong>

                            </div>

                        </div>


                        <div class="vote-count">

                            ${total}
                            ${total === 1 ? "VOTE" : "VOTES"}

                        </div>


                        <div class="post-date">

                            ${formatDate(data.createdAt)}

                        </div>

                    `;


                    signDelusionList.appendChild(
                        card
                    );

                }
            );


            signDelusionList
                .querySelectorAll(
                    ".vote-choice"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            const id =
                                button.dataset.id;


                            const vote =
                                button.dataset.vote;


                            const updates = {};


                            if (vote === "sign") {

                                updates.signVotes =
                                    increment(1);

                            }


                            if (vote === "maybe") {

                                updates.maybeVotes =
                                    increment(1);

                            }


                            if (vote === "delulu") {

                                updates.deluluVotes =
                                    increment(1);

                            }


                            try {

                                await updateDoc(
                                    doc(
                                        db,
                                        "signDelusionPosts",
                                        id
                                    ),
                                    updates
                                );


                                showMessage(
                                    "Vote counted! ♡"
                                );


                            } catch (error) {

                                console.error(
                                    "Vote error:",
                                    error
                                );

                            }

                        }
                    );

                });

        },

        error => {

            console.error(
                "Sign/Delusion loading error:",
                error
            );


            signDelusionList.innerHTML = `
                <div class="loading">
                    Unable to load public cases.
                </div>
            `;

        }

    );

}


/* =====================================================
   PLOT TWIST ROULETTE
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
    "Your crush accidentally reveals something important.",
    "A random friendship becomes your favorite friendship.",
    "Someone wants to apologize but doesn't know how.",
    "The person you least expected becomes important to you.",
    "You reconnect with someone from your past.",
    "Your next best friend is someone you haven't met yet.",
    "Someone has been waiting for you to make the first move.",
    "A simple conversation changes everything.",
    "Someone secretly admires your confidence.",

    "Your quietest friend knows your biggest secret.",
    "Your crush asks about you when you're not around.",
    "Someone saves one of your messages.",
    "A friendship unexpectedly becomes closer.",
    "Someone gets nervous whenever they talk to you.",
    "Your next adventure starts unexpectedly.",
    "Someone remembers the smallest thing you told them.",
    "You meet someone who completely changes your perspective.",
    "An old misunderstanding finally gets cleared up.",
    "Someone you miss is thinking about you too.",

    "Your next favorite memory happens on an ordinary day.",
    "Someone wants to be friends but is too shy to approach you.",
    "A person you overlooked becomes important.",
    "Your crush starts noticing little things about you.",
    "Someone is secretly rooting for you.",
    "You receive a message you never expected.",
    "Someone remembers your birthday without being reminded.",
    "Your friendship circle is about to change.",
    "A random coincidence introduces you to someone new.",
    "Someone has a completely different impression of you.",

    "Your next chapter begins with an unexpected invitation.",
    "Someone who seemed distant actually cares about you.",
    "You discover someone has been supporting you quietly.",
    "An accidental conversation becomes unforgettable.",
    "Someone finally tells you what they really think.",
    "Your crush gets nervous around you.",
    "Someone sends you a message at the perfect time.",
    "You become closer to someone through a shared secret.",
    "A forgotten friendship gets another chance.",
    "Someone unexpectedly defends you.",

    "You find out someone has been talking positively about you.",
    "Your next school day contains an unexpected surprise.",
    "Someone notices when you're having a bad day.",
    "A stranger becomes a familiar face.",
    "Someone you thought forgot about you remembers everything.",
    "Your crush asks your friend about you.",
    "A random seat assignment changes your social life.",
    "Someone wants to tell you something important.",
    "Your next group project introduces you to someone interesting.",
    "Someone secretly thinks you're funnier than you realize.",

    "An old photo brings back an important memory.",
    "Someone unexpectedly compliments you.",
    "You discover someone shares your interests.",
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
    "Someone starts a conversation just to have an excuse to talk.",
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
    "Your crush notices a small change about you.",
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
    "Someone is quietly cheering you on.",
    "Your next unexpected friendship becomes a favorite.",
    "Someone finally admits they missed talking to you.",

    "Someone remembers your favorite song.",
    "Your name comes up in a conversation you weren't part of.",
    "Someone suddenly becomes more talkative around you.",
    "A friend introduces you to someone unexpected.",
    "Someone sends you a random good-luck message.",
    "You discover someone shares your favorite hobby.",
    "Someone notices when you change something small.",
    "A casual joke becomes an inside joke.",
    "Someone asks for your advice because they trust you.",
    "You unexpectedly become friends with someone new.",

    "Someone recognizes you somewhere you didn't expect.",
    "A forgotten conversation suddenly becomes important.",
    "Someone gives you a nickname that actually sticks.",
    "You receive a message from someone you haven't heard from in months.",
    "Someone remembers a random detail from your first conversation.",
    "A simple invitation turns into a memorable day.",
    "Someone asks you to join their group.",
    "You discover you have more in common with someone than expected.",
    "Someone laughs harder at your jokes than everyone else.",
    "A random encounter turns into a friendship.",

    "Someone notices when you're unusually quiet.",
    "You discover someone has the same favorite movie.",
    "Someone sends you a song recommendation.",
    "A friend reveals an unexpected secret.",
    "Someone asks about your weekend because they genuinely care.",
    "You accidentally meet someone you were just talking about.",
    "Someone remembers your favorite snack.",
    "A random comment starts a surprisingly deep conversation.",
    "Someone asks you to help with something just to spend time together.",
    "You discover an unexpected mutual friend.",

    "Someone finally replies after a long silence.",
    "A person you rarely talk to suddenly becomes part of your routine.",
    "Someone compliments something you didn't expect them to notice.",
    "A random photo becomes one of your favorite memories.",
    "Someone asks what kind of music you like.",
    "You find out someone has the same sense of humor.",
    "Someone starts greeting you every day.",
    "A random message makes your entire day better.",
    "Someone remembers something you thought everyone forgot.",
    "A small act of kindness starts a friendship.",

    "Someone asks you a question they've wanted to ask for a while.",
    "You unexpectedly discover a shared childhood interest.",
    "Someone saves you a seat.",
    "A friend introduces you to their favorite person.",
    "Someone starts sharing their favorite things with you.",
    "You discover an unexpected talent in someone you know.",
    "Someone asks you to be part of something important.",
    "A boring day suddenly becomes memorable.",
    "Someone sends you a funny picture because it reminded them of you.",
    "You make a new friend in the most random way.",

    "Someone finally explains something you misunderstood.",
    "A random compliment stays in your mind all day.",
    "Someone notices when you need encouragement.",
    "You discover that someone secretly enjoys talking to you.",
    "Someone asks you about your future plans.",
    "A simple 'take care' means more than expected.",
    "Someone remembers the first thing you ever told them.",
    "You unexpectedly become part of a new friend group.",
    "Someone asks you to help choose something important.",
    "A random conversation gives you a completely new idea.",

    "Someone unexpectedly shares a secret with you.",
    "A person you thought you had nothing in common with surprises you.",
    "Someone sends a message at exactly the right moment.",
    "A forgotten friendship slowly becomes close again.",
    "Someone asks you to recommend something.",
    "You discover someone has been quietly supporting your goals.",
    "Someone remembers a funny moment you completely forgot.",
    "A random invitation leads to your next favorite memory.",
    "Someone tells you that they enjoy talking to you.",
    "The next person you meet might become important to your story.",

    "Someone unexpectedly waves at you from across the room.",
    "Your next conversation starts because of a random question.",
    "Someone remembers your favorite color.",
    "A mutual friend accidentally reveals something interesting.",
    "Someone suddenly asks to take a picture with you.",
    "You discover someone has been listening to your recommendations.",
    "A random compliment changes your mood.",
    "Someone notices your effort even when nobody else does.",
    "Your next friendship begins with a shared laugh.",
    "Someone asks you to join an unexpected adventure.",

    "A person you barely know suddenly remembers your name.",
    "Someone sends you a meme that perfectly describes you.",
    "You find out someone has the same comfort show.",
    "A random conversation makes you rethink everything.",
    "Someone asks for your playlist.",
    "Your next favorite person starts as a stranger.",
    "Someone notices when you enter the room.",
    "A friend introduces you to someone who matches your energy.",
    "Someone unexpectedly asks how your day went.",
    "A small favor turns into a lasting friendship.",

    "Someone remembers your favorite food.",
    "You discover an unexpected shared dream.",
    "Someone starts using one of your favorite phrases.",
    "A random encounter becomes a story you'll tell for years.",
    "Someone asks you to explain something because they trust you.",
    "Your next best memory happens without planning it.",
    "Someone notices something everyone else overlooked.",
    "You receive an unexpected compliment from someone you respect.",
    "A random decision leads you somewhere unforgettable.",
    "Someone unexpectedly becomes your study buddy.",

    "Someone asks to sit beside you.",
    "You discover someone has been quietly cheering for you.",
    "A forgotten joke suddenly becomes funny again.",
    "Someone asks about something you posted.",
    "You make someone laugh when they really needed it.",
    "Someone unexpectedly remembers your favorite character.",
    "Your next conversation reveals a surprising secret.",
    "Someone asks you to join their plans.",
    "A random friendship becomes a trusted friendship.",
    "Someone unexpectedly tells you they appreciate you.",

    "Someone notices when you aren't online.",
    "A simple greeting becomes a daily habit.",
    "Someone sends you a message just because.",
    "You discover someone has been hoping to meet you.",
    "A random school activity creates a new friendship.",
    "Someone asks for your opinion on something personal.",
    "You become someone's favorite person to ask for advice.",
    "Someone unexpectedly remembers your smallest achievement.",
    "A random conversation turns into hours of talking.",
    "Someone makes you laugh when you least expect it.",

    "Someone unexpectedly asks to work with you.",
    "A friend introduces you to someone who shares your interests.",
    "Someone remembers an embarrassing moment and laughs with you.",
    "You discover someone secretly likes the same things you do.",
    "Someone unexpectedly asks about your dreams.",
    "Your next friendship starts with a misunderstanding.",
    "Someone notices your mood before you say anything.",
    "A random message becomes the start of something new.",
    "Someone finally says what they've been thinking.",
    "Your next plot twist is closer than you think."

];


const rouletteText =
    document.getElementById(
        "rouletteText"
    );


const rouletteIcon =
    document.getElementById(
        "rouletteIcon"
    );


const spinButton =
    document.getElementById(
        "spinButton"
    );


if (spinButton) {

    spinButton.addEventListener(
        "click",
        () => {

            spinButton.disabled = true;

            spinButton.textContent =
                "✧ SPINNING...";


            if (rouletteIcon) {

                rouletteIcon.style.transition =
                    "transform 1.2s ease";

                rouletteIcon.style.transform =
                    "rotate(1080deg)";

            }


            if (rouletteText) {

                rouletteText.style.opacity =
                    "0";

            }


            setTimeout(() => {

                const random =
                    plotTwists[
                        Math.floor(
                            Math.random() *
                            plotTwists.length
                        )
                    ];


                if (rouletteText) {

                    rouletteText.textContent =
                        "“" + random + "”";

                    rouletteText.style.opacity =
                        "1";

                }


                if (rouletteIcon) {

                    rouletteIcon.style.transform =
                        "rotate(0deg)";

                }


                spinButton.disabled =
                    false;

                spinButton.textContent =
                    "✧ SPIN THE PLOT";

            }, 800);

        }

    );

}


/* =====================================================
   READY
===================================================== */

console.log(
    "PlotTwisted is ready. ✦"
);
