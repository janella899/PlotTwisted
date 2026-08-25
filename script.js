// =====================================================
// PLOTTWISTED — FINAL SCRIPT.JS
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
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

// =====================================================
// FIREBASE
// =====================================================

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

// =====================================================
// COLLECTIONS
// =====================================================

const POSTS_COLLECTION = "posts";
const CONFESSIONS_COLLECTION = "confessions";
const HUGOTS_COLLECTION = "hugots";
const UNSENT_COLLECTION = "unsentMessages";
const VOTES_COLLECTION = "signVotes";

// =====================================================
// PAGE NAVIGATION
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const interfaceCard =
        document.getElementById("mainInterface");

    const interfaceButtons =
        document.getElementById("interfaceButtons");

    if (interfaceCard && interfaceButtons) {

        interfaceCard.addEventListener("click", () => {

            interfaceButtons.classList.toggle("show-menu");

        });

    }

    const buttons =
        document.querySelectorAll("[data-slide]");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const target =
                button.getAttribute("data-slide");

            openSlide(target);

        });

    });

    setupForms();

    loadPosts();
    loadVotes();

});

// =====================================================
// OPEN SLIDE
// =====================================================

function openSlide(id) {

    const sections =
        document.querySelectorAll(".page-section");

    sections.forEach(section => {

        section.classList.remove("active-section");

    });

    const target =
        document.getElementById(id);

    if (!target) return;

    target.classList.add("active-section");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// =====================================================
// HTML SECURITY
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = String(text);

    return div.innerHTML;

}

// =====================================================
// DATE
// =====================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "JUST NOW";
    }

    try {

        if (typeof timestamp.toDate === "function") {

            return timestamp
                .toDate()
                .toLocaleString();

        }

        return "JUST NOW";

    } catch {

        return "JUST NOW";

    }

}

// =====================================================
// SETUP FORMS
// =====================================================

function setupForms() {

    // ---------------------------------------------
    // CONFESSION
    // ---------------------------------------------

    const confessionForm =
        document.getElementById("confessionForm");

    if (confessionForm) {

        confessionForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "confessionInput"
                    );

                if (!input) return;

                const success =
                    await createPost(
                        "CONFESSION",
                        input.value,
                        CONFESSIONS_COLLECTION
                    );

                if (success) {
                    input.value = "";
                }

            }
        );

    }


    // ---------------------------------------------
    // HUGOT
    // ---------------------------------------------

    const hugotForm =
        document.getElementById("hugotForm");

    if (hugotForm) {

        hugotForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "hugotInput"
                    );

                if (!input) return;

                const success =
                    await createPost(
                        "HUGOT",
                        input.value,
                        HUGOTS_COLLECTION
                    );

                if (success) {
                    input.value = "";
                }

            }
        );

    }


    // ---------------------------------------------
    // UNSENT MESSAGE
    // ---------------------------------------------

    const unsentForm =
        document.getElementById("unsentForm");

    if (unsentForm) {

        unsentForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "unsentInput"
                    );

                if (!input) return;

                const success =
                    await createPost(
                        "UNSENT MESSAGE",
                        input.value,
                        UNSENT_COLLECTION
                    );

                if (success) {
                    input.value = "";
                }

            }
        );

    }

}

// =====================================================
// CREATE POST
// =====================================================

async function createPost(
    type,
    message,
    collectionName
) {

    const cleanMessage =
        String(message || "").trim();

    if (!cleanMessage) {

        alert(
            "Write something first. ♡"
        );

        return false;

    }

    try {

        await addDoc(
            collection(
                db,
                collectionName
            ),
            {

                type: type,

                text: cleanMessage,

                message: cleanMessage,

                likes: 0,

                createdAt:
                    serverTimestamp()

            }
        );

        alert(
            "Posted successfully! ✦\n\nEveryone can now see your post."
        );

        await loadPosts();

        return true;

    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        alert(
            "The post could not be uploaded.\n\n" +
            "Please check your Firestore Rules."
        );

        return false;

    }

}

// =====================================================
// LOAD ALL PUBLIC POSTS
// =====================================================

async function loadPosts() {

    try {

        const confessionList =
            document.getElementById(
                "confessionList"
            );

        const hugotList =
            document.getElementById(
                "hugotList"
            );

        const unsentList =
            document.getElementById(
                "unsentList"
            );


        if (confessionList) {
            confessionList.innerHTML = "";
        }

        if (hugotList) {
            hugotList.innerHTML = "";
        }

        if (unsentList) {
            unsentList.innerHTML = "";
        }


        // =================================================
        // CONFESSIONS
        // =================================================

        await loadCollection(
            CONFESSIONS_COLLECTION,
            "CONFESSION",
            confessionList
        );


        // =================================================
        // HUGOTS
        // =================================================

        await loadCollection(
            HUGOTS_COLLECTION,
            "HUGOT",
            hugotList
        );


        // =================================================
        // UNSENT MESSAGES
        // =================================================

        await loadCollection(
            UNSENT_COLLECTION,
            "UNSENT MESSAGE",
            unsentList
        );


        // =================================================
        // POSTS
        // =================================================

        await loadPostsCollection(
            confessionList,
            hugotList,
            unsentList
        );


        console.log(
            "PLOTTWISTED: ALL POSTS LOADED"
        );

    } catch (error) {

        console.error(
            "Loading posts failed:",
            error
        );

        showFirebaseError();

    }

}

// =====================================================
// LOAD OLD COLLECTION
// =====================================================

async function loadCollection(
    collectionName,
    defaultType,
    listElement
) {

    if (!listElement) return;

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    collectionName
                )
            );

        snapshot.forEach(postDoc => {

            const data =
                postDoc.data();

            const convertedData = {

                type:
                    data.type ||
                    defaultType,

                message:
                    data.message ||
                    data.text ||
                    "",

                likes:
                    Number(
                        data.likes || 0
                    ),

                createdAt:
                    data.createdAt ||
                    null

            };

            const card =
                createPostCard(
                    postDoc.id,
                    convertedData
                );

            listElement.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Collection loading error:",
            collectionName,
            error
        );

    }

}

// =====================================================
// LOAD POSTS COLLECTION
// =====================================================

async function loadPostsCollection(
    confessionList,
    hugotList,
    unsentList
) {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    POSTS_COLLECTION
                )
            );

        snapshot.forEach(postDoc => {

            const data =
                postDoc.data();

            const type =
                String(
                    data.type || ""
                ).toUpperCase();

            const convertedData = {

                type:
                    type ||
                    "POST",

                message:
                    data.message ||
                    data.text ||
                    "",

                likes:
                    Number(
                        data.likes || 0
                    ),

                createdAt:
                    data.createdAt ||
                    null

            };

            const card =
                createPostCard(
                    postDoc.id,
                    convertedData
                );


            if (
                type === "CONFESSION" &&
                confessionList
            ) {

                confessionList.appendChild(card);

            }

            else if (
                type === "HUGOT" &&
                hugotList
            ) {

                hugotList.appendChild(card);

            }

            else if (
                (
                    type === "UNSENT MESSAGE" ||
                    type === "UNSENT"
                ) &&
                unsentList
            ) {

                unsentList.appendChild(card);

            }

        });

    } catch (error) {

        console.error(
            "Posts collection error:",
            error
        );

    }

}

// =====================================================
// POST CARD
// =====================================================

function createPostCard(id, data) {

    const card =
        document.createElement("article");

    card.className =
        "post-card";


    const type =
        escapeHTML(
            data.type ||
            "STORY"
        );


    const message =
        escapeHTML(
            data.message ||
            data.text ||
            ""
        );


    const likes =
        Number(
            data.likes || 0
        );


    card.innerHTML = `

        <div class="post-type">
            ${type}
        </div>

        <div class="post-message">
            “${message}”
        </div>

        <div class="post-date">
            ${formatDate(data.createdAt)}
        </div>

        <div class="post-actions">

            <button
                class="like-button"
                type="button">

                ♡ ${likes}

            </button>

            <button
                class="report-button"
                type="button">

                REPORT

            </button>

        </div>

    `;


    const likeButton =
        card.querySelector(
            ".like-button"
        );


    likeButton.addEventListener(
        "click",
        async () => {

            await likePost(
                id,
                likeButton,
                likes,
                data
            );

        }
    );


    const reportButton =
        card.querySelector(
            ".report-button"
        );


    reportButton.addEventListener(
        "click",
        () => {

            alert(
                "Thank you for reporting this post."
            );

        }
    );


    return card;

}

// =====================================================
// LIKE
// =====================================================

async function likePost(
    id,
    button,
    currentLikes,
    data
) {

    try {

        let collectionName =
            POSTS_COLLECTION;


        const type =
            String(
                data.type || ""
            ).toUpperCase();


        if (type === "CONFESSION") {

            collectionName =
                CONFESSIONS_COLLECTION;

        }

        else if (type === "HUGOT") {

            collectionName =
                HUGOTS_COLLECTION;

        }

        else if (
            type === "UNSENT MESSAGE" ||
            type === "UNSENT"
        ) {

            collectionName =
                UNSENT_COLLECTION;

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


        button.textContent =
            `♡ ${currentLikes + 1}`;

        button.disabled = true;


    } catch (error) {

        console.error(
            "Like error:",
            error
        );

    }

}

// =====================================================
// SIGN OR DELUSION
// =====================================================

const voteButtons =
    document.querySelectorAll(
        ".vote-buttons button"
    );

voteButtons.forEach(button => {

    button.addEventListener(
        "click",
        async () => {

            const text =
                button.textContent
                    .toLowerCase();

            let choice;


            if (
                text.includes(
                    "definitely"
                )
            ) {

                choice = "sign";

            }

            else if (
                text.includes(
                    "maybe"
                )
            ) {

                choice = "maybe";

            }

            else {

                choice = "delulu";

            }


            await saveVote(choice);

        }
    );

});

// =====================================================
// SAVE VOTE
// =====================================================

async function saveVote(choice) {

    try {

        await addDoc(
            collection(
                db,
                VOTES_COLLECTION
            ),
            {

                choice: choice,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Your vote has been counted! ✦"
        );


        loadVotes();

    } catch (error) {

        console.error(
            "Vote error:",
            error
        );


        alert(
            "Vote failed. Check Firestore Rules."
        );

    }

}

// =====================================================
// LOAD VOTES
// =====================================================

async function loadVotes() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    VOTES_COLLECTION
                )
            );


        let sign = 0;
        let maybe = 0;
        let delulu = 0;


        snapshot.forEach(vote => {

            const data =
                vote.data();


            if (
                data.choice === "sign"
            ) {

                sign++;

            }


            if (
                data.choice === "maybe"
            ) {

                maybe++;

            }


            if (
                data.choice === "delulu"
            ) {

                delulu++;

            }

        });


        const total =
            sign +
            maybe +
            delulu;


        if (total === 0) {

            updateVoteUI(
                62,
                25,
                13
            );

            return;

        }


        const signPercent =
            Math.round(
                sign / total * 100
            );


        const maybePercent =
            Math.round(
                maybe / total * 100
            );


        const deluluPercent =
            100 -
            signPercent -
            maybePercent;


        updateVoteUI(
            signPercent,
            maybePercent,
            deluluPercent
        );


    } catch (error) {

        console.error(
            "Vote loading error:",
            error
        );

    }

}

// =====================================================
// UPDATE VOTE UI
// =====================================================

function updateVoteUI(
    sign,
    maybe,
    delulu
) {

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


    const signPercent =
        document.getElementById(
            "signPercent"
        );

    const maybePercent =
        document.getElementById(
            "maybePercent"
        );

    const deluluPercent =
        document.getElementById(
            "deluluPercent"
        );


    if (signBar)
        signBar.style.width =
            sign + "%";


    if (maybeBar)
        maybeBar.style.width =
            maybe + "%";


    if (deluluBar)
        deluluBar.style.width =
            delulu + "%";


    if (signPercent)
        signPercent.textContent =
            sign + "%";


    if (maybePercent)
        maybePercent.textContent =
            maybe + "%";


    if (deluluPercent)
        deluluPercent.textContent =
            delulu + "%";

}

// =====================================================
// PLOT TWIST ROULETTE
// =====================================================

const plotTwists = [

    "Your friend might secretly like you too.",
    "Your friend knows you like them, but is waiting for you to say it.",
    "Your friend may be dropping hints without realizing it.",
    "Your friend starts treating you differently.",
    "Your friend remembers the smallest things you tell them.",
    "Your friend always finds a reason to talk to you.",
    "Your friend may be more interested in you than they admit.",
    "Your friend suddenly becomes shy around you.",
    "Your friend might be waiting for you to make the first move.",
    "Your friend chooses to sit beside you even when there are other seats.",
    "Your friend starts looking for you whenever you enter the room.",
    "Your friend notices when your mood changes.",
    "Your friend remembers your favorite things.",
    "Your friend might secretly check if you're okay.",
    "Your friend laughs harder at your jokes than everyone else.",
    "Your friend may be trying to spend more time with you.",
    "Your friend suddenly starts asking about your love life.",
    "Your friend asks who your crush is. Suspicious.",
    "Your friend gets curious whenever you mention someone else.",
    "Your friend may secretly get jealous.",
    "Your friend might be hiding their feelings behind jokes.",
    "Your friend suddenly compliments you more often.",
    "Your friend starts teasing you about having a crush.",
    "Your friend might be trying to figure out if you like them.",
    "Your friend remembers conversations you already forgot.",
    "Your friend finds random reasons to message you.",
    "Your friend sends you something because it reminded them of you.",
    "Your friend may be thinking about you more than you realize.",
    "Your friend becomes unusually protective of you.",
    "Your friend notices things about you that nobody else notices.",
    "Your friend may have a nickname for you that means more than you think.",
    "Your friend suddenly becomes nervous when you're alone together.",
    "Your friend may be waiting for the perfect moment.",
    "Your friend acts differently when other people mention your name.",
    "Your friend might secretly save your messages.",
    "Your friend may remember your birthday without a reminder.",
    "Your friend may have already noticed your feelings.",
    "Your friend might be pretending not to notice your hints.",
    "Your friend could be waiting for you to confess first.",
    "They look at you, then immediately look away.",
    "They reply quickly but pretend they weren't waiting.",
    "They say you're just a friend, but act differently.",
    "They tease you more than everyone else.",
    "They suddenly become quiet when you compliment them.",
    "They always seem to appear wherever you are.",
    "They ask about your plans for no obvious reason.",
    "They suddenly want to know who you're talking to.",
    "They send random messages just to start a conversation.",
    "They remember something you mentioned weeks ago.",
    "They keep finding reasons to continue the conversation.",
    "They act normal in front of everyone but different when you're alone.",
    "They may be giving you hints that you're too scared to believe.",
    "They might be waiting for you to notice.",
    "They say they aren't interested in anyone. Suspicious.",
    "They ask about your type.",
    "They suddenly want to know your ideal person.",
    "They ask whether you're talking to someone.",
    "They might be testing your reaction.",
    "They may be hiding their feelings behind playful teasing.",
    "You accidentally make eye contact and neither looks away.",
    "You both reach for the same thing at the same time.",
    "You laugh at the exact same moment.",
    "You accidentally wear matching colors.",
    "You get paired together unexpectedly.",
    "You end up sitting beside each other again.",
    "You accidentally call each other at the same time.",
    "You both remember the same funny memory.",
    "They smile the moment they see you.",
    "You catch them looking at you.",
    "They notice your new hairstyle immediately.",
    "They compliment you when you least expect it.",
    "They save you a seat.",
    "They wait for you before leaving.",
    "They ask if you've already eaten.",
    "They offer to help even when you didn't ask.",
    "They make you laugh when you're having a bad day.",
    "They remember something important to you.",
    "They message you after noticing you were quiet.",
    "They choose you as their partner.",
    "Maybe it's a sign. Maybe you're just hopeful.",
    "You have evidence, but your heart wants more.",
    "The signs are there. The question is whether they're intentional.",
    "Your friends think there's something going on.",
    "You might be overthinking it... or maybe you're not.",
    "Three people noticed the chemistry before you did.",
    "Your friend says it's nothing. Your heart disagrees.",
    "Maybe they're friendly with everyone, but why especially you?",
    "You could be delusional, but the coincidence is suspicious.",
    "The universe is giving hints. Your brain wants proof.",
    "Maybe it's friendship. Maybe it's the beginning of something else.",
    "You don't know if it's a sign or wishful thinking.",
    "Your heart says yes. Your logic says wait.",
    "You might be reading too much into one small moment.",
    "Or maybe that small moment meant everything.",
    "You almost confess but chicken out.",
    "Your friend almost tells you something important.",
    "You accidentally reveal your feelings.",
    "Someone asks you directly if you like your friend.",
    "Your friend asks, 'What if we dated?' as a joke... maybe.",
    "You almost send the message you've been writing for weeks.",
    "Your friend discovers your crush accidentally.",
    "Someone exposes your crush in front of them.",
    "You finally get the courage to say something.",
    "You decide to keep it a secret a little longer.",
    "Your friend might confess before you do.",
    "A simple conversation turns unexpectedly serious.",
    "You finally ask what your friend really thinks.",
    "The question you've been avoiding finally gets asked.",
    "You find out whether your feelings are mutual.",
    "Your friendship slowly starts feeling different.",
    "You realize they're the first person you want to tell everything to.",
    "They become your favorite notification.",
    "You start missing them even when you just saw them.",
    "Your favorite memories include them.",
    "Your friendship becomes deeper than you expected.",
    "You start wondering what dating your friend would be like.",
    "You catch yourself imagining a future with them.",
    "You realize your 'friend' is actually your favorite person.",
    "You start seeing them differently.",
    "They become the person you look for in every room.",
    "Their happiness matters to you more than you expected.",
    "Your friendship may be turning into something neither planned.",
    "You may have fallen for the person who was already closest to you.",
    "The person you thought would stay a friend may become something more.",
    "Your best friendship could become your biggest plot twist.",
    "You didn't plan to fall for your friend... but here you are.",
    "Maybe your favorite person has been beside you all along.",
    "Sometimes the best love story starts with friendship.",
    "Maybe friendship was only the beginning.",
    "You practice what to say, then forget everything when they appear.",
    "You pretend not to care when they talk to someone else.",
    "You check your phone hoping it's them.",
    "You reread their message way too many times.",
    "You tell your friends you don't like them for the 50th time.",
    "You accidentally smile at your phone because of their message.",
    "You say 'just friends' while writing a whole romance novel in your head.",
    "Your friends already know who you're talking about.",
    "You deny everything while your face says otherwise.",
    "You suddenly become an expert at analyzing their messages.",
    "One 'good morning' has you thinking about it all day.",
    "They send one emoji and you start investigating.",
    "They reply with 'haha' and you analyze the punctuation.",
    "Your friends are tired of hearing their name.",
    "You claim you're not delulu, then analyze everything.",
    "You accidentally make eye contact and forget how to act.",
    "You see their name pop up and suddenly your day is better.",
    "You tell yourself not to catch feelings. Too late.",
    "Your heart already decided before your brain caught up.",
    "They suddenly message you tonight.",
    "You'll have an unexpected conversation with them.",
    "You'll discover something surprising about your friend.",
    "A simple hangout becomes a core memory.",
    "Someone accidentally reveals a secret.",
    "You'll hear something that changes how you see them.",
    "Your friend surprises you with an unexpected gesture.",
    "You'll get closer because of a random coincidence.",
    "A normal school day suddenly feels special.",
    "You'll have a conversation you'll remember for a long time.",
    "Someone finally explains their confusing behavior.",
    "A random question reveals someone's true feelings.",
    "You'll discover someone has been rooting for you.",
    "An ordinary moment becomes your favorite memory.",
    "Someone unexpected becomes important to you.",
    "A friendship becomes stronger after one honest conversation.",
    "Your next conversation may change everything.",
    "Something you've been waiting for may finally happen.",
    "A coincidence makes you question everything.",
    "Your story isn't finished yet.",
    "Maybe your friend is your plot twist.",
    "Maybe you're not imagining the connection.",
    "Maybe they're waiting for you too.",
    "Maybe the signs were real after all.",
    "Maybe the person you're looking for is already beside you.",
    "Maybe your best friend is secretly your biggest love story.",
    "Maybe the person you keep thinking about is thinking about you too.",
    "Maybe you should stop overthinking and enjoy the moment.",
    "Maybe the answer isn't yes or no yet.",
    "Maybe your story needs one more chapter.",
    "Maybe the biggest plot twist is that you both feel the same.",
    "Maybe someday you'll laugh about how scared you were to confess.",
    "Maybe the person you call 'just a friend' won't always be just a friend.",
    "Maybe your friendship is already becoming something beautiful.",
    "Maybe the universe really is trying to tell you something.",
    "Maybe you found your favorite person without looking for them.",
    "Maybe this isn't delusion. Maybe it's the beginning.",
    "Maybe your friend is the plot twist you've been waiting for.",
    "Maybe the person beside you is the person you've been waiting for.",
    "Maybe your crush story is only getting started."

];

// =====================================================
// ROULETTE
// =====================================================

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

    text.style.opacity = "0";

    if (icon) {

        icon.style.transform =
            "rotate(360deg) scale(1.2)";

        icon.style.transition =
            "transform .5s ease";

    }

    setTimeout(() => {

        const random =
            Math.floor(
                Math.random() *
                plotTwists.length
            );

        text.textContent =
            "“" +
            plotTwists[random] +
            "”";

        text.style.opacity = "1";

        if (icon) {

            icon.style.transform =
                "rotate(0deg) scale(1)";

        }

    }, 450);

}

window.spinRoulette =
    spinRoulette;

// =====================================================
// FIREBASE ERROR
// =====================================================

function showFirebaseError() {

    const lists = [

        document.getElementById(
            "confessionList"
        ),

        document.getElementById(
            "hugotList"
        ),

        document.getElementById(
            "unsentList"
        )

    ];

    lists.forEach(list => {

        if (!list) return;

        list.innerHTML = `

            <div class="post-card">

                <div class="post-type">
                    PLOTTWISTED
                </div>

                <div class="post-message">
                    Public stories could not
                    be loaded right now.
                </div>

                <div class="post-date">
                    CHECK FIRESTORE RULES
                </div>

            </div>

        `;

    });

        }
