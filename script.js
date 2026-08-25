// =====================================================
// PLOTTWISTED — COMPLETE SCRIPT.JS
// =====================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    serverTimestamp,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =====================================================
// FIREBASE
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCJ59V5ioK4DWpM_jYFy7NMMPPgjiHNeAE",

    authDomain:
        "plottwisted-c5551.firebaseapp.com",

    projectId:
        "plottwisted-c5551",

    storageBucket:
        "plottwisted-c5551.firebasestorage.app",

    messagingSenderId:
        "797105645748",

    appId:
        "1:797105645748:web:e410591f49c41b8a7f4fe1",

    measurementId:
        "G-V5DBX6TKK2"
};


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// =====================================================
// FIRESTORE COLLECTIONS
// =====================================================

const CONFESSIONS_COLLECTION =
    "confessions";

const HUGOTS_COLLECTION =
    "hugots";

const UNSENT_COLLECTION =
    "unsentMessages";

const VOTES_COLLECTION =
    "signVotes";


// =====================================================
// PAGE NAVIGATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // Main interface

        const interfaceCard =
            document.getElementById(
                "mainInterface"
            );

        const interfaceButtons =
            document.getElementById(
                "interfaceButtons"
            );


        if (
            interfaceCard &&
            interfaceButtons
        ) {

            interfaceCard.addEventListener(
                "click",
                () => {

                    interfaceButtons.classList.toggle(
                        "show-menu"
                    );

                }
            );

        }


        // Navigation buttons

        const buttons =
            document.querySelectorAll(
                "[data-slide]"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const target =
                            button.getAttribute(
                                "data-slide"
                            );

                        openSlide(target);

                    }
                );

            }
        );


        // Load everything

        loadPosts();

        loadVotes();

    }
);


// =====================================================
// OPEN SLIDE
// =====================================================

function openSlide(id) {

    const sections =
        document.querySelectorAll(
            ".page-section"
        );


    sections.forEach(
        section => {

            section.classList.remove(
                "active-section"
            );

        }
    );


    const target =
        document.getElementById(id);


    if (!target) return;


    target.classList.add(
        "active-section"
    );


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


    div.textContent =
        String(text);


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

        if (
            typeof timestamp.toDate ===
            "function"
        ) {

            return timestamp
                .toDate()
                .toLocaleString();

        }


        return "JUST NOW";

    }

    catch {

        return "JUST NOW";

    }

}


// =====================================================
// CREATE POST
// =====================================================

async function createPost(
    type,
    message
) {

    const cleanMessage =
        message.trim();


    if (!cleanMessage) {

        alert(
            "Write something first. ♡"
        );

        return false;

    }


    let collectionName;


    // Choose the correct collection

    if (
        type === "CONFESSION"
    ) {

        collectionName =
            CONFESSIONS_COLLECTION;

    }

    else if (
        type === "HUGOT"
    ) {

        collectionName =
            HUGOTS_COLLECTION;

    }

    else if (
        type === "UNSENT MESSAGE"
    ) {

        collectionName =
            UNSENT_COLLECTION;

    }

    else {

        alert(
            "Invalid post type."
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

                text:
                    cleanMessage,

                likes:
                    0,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Posted successfully! ✦\n\nEveryone can now see your post."
        );


        await loadPosts();


        return true;


    }

    catch (error) {

        console.error(
            "Firebase upload error:",
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
// CONFESSION FORM
// =====================================================

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


            const success =
                await createPost(
                    "CONFESSION",
                    input.value
                );


            if (success) {

                input.value = "";

            }

        }
    );

}


// =====================================================
// HUGOT FORM
// =====================================================

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


            const success =
                await createPost(
                    "HUGOT",
                    input.value
                );


            if (success) {

                input.value = "";

            }

        }
    );

}


// =====================================================
// UNSENT MESSAGE FORM
// =====================================================

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


            const success =
                await createPost(
                    "UNSENT MESSAGE",
                    input.value
                );


            if (success) {

                input.value = "";

            }

        }
    );

}


// =====================================================
// LOAD ALL POSTS
// =====================================================

async function loadPosts() {

    try {

        console.log(
            "Loading uploaded posts..."
        );


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


        // Clear lists

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
        // LOAD CONFESSIONS
        // =================================================

        const confessionSnapshot =
            await getDocs(
                collection(
                    db,
                    CONFESSIONS_COLLECTION
                )
            );


        console.log(
            "Confessions:",
            confessionSnapshot.size
        );


        confessionSnapshot.forEach(
            postDoc => {

                const data =
                    postDoc.data();


                const card =
                    createUploadedCard(
                        postDoc.id,
                        data,
                        "CONFESSION",
                        CONFESSIONS_COLLECTION
                    );


                if (confessionList) {

                    confessionList.appendChild(
                        card
                    );

                }

            }
        );


        // =================================================
        // LOAD HUGOTS
        // =================================================

        const hugotSnapshot =
            await getDocs(
                collection(
                    db,
                    HUGOTS_COLLECTION
                )
            );


        console.log(
            "Hugots:",
            hugotSnapshot.size
        );


        hugotSnapshot.forEach(
            postDoc => {

                const data =
                    postDoc.data();


                const card =
                    createUploadedCard(
                        postDoc.id,
                        data,
                        "HUGOT",
                        HUGOTS_COLLECTION
                    );


                if (hugotList) {

                    hugotList.appendChild(
                        card
                    );

                }

            }
        );


        // =================================================
        // LOAD UNSENT MESSAGES
        // =================================================

        const unsentSnapshot =
            await getDocs(
                collection(
                    db,
                    UNSENT_COLLECTION
                )
            );


        console.log(
            "Unsent Messages:",
            unsentSnapshot.size
        );


        unsentSnapshot.forEach(
            postDoc => {

                const data =
                    postDoc.data();


                const card =
                    createUploadedCard(
                        postDoc.id,
                        data,
                        "UNSENT MESSAGE",
                        UNSENT_COLLECTION
                    );


                if (unsentList) {

                    unsentList.appendChild(
                        card
                    );

                }

            }
        );


        console.log(
            "All posts loaded!"
        );

    }


    catch (error) {

        console.error(
            "Loading posts failed:",
            error
        );


        showFirebaseError();

    }

}


// =====================================================
// CREATE UPLOADED POST CARD
// =====================================================

function createUploadedCard(
    id,
    data,
    type,
    collectionName
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-card";


    // Your Firebase uses "text"

    const message =
        escapeHTML(
            data.text ||
            data.message ||
            ""
        );


    const likes =
        Number(
            data.likes || 0
        );


    card.innerHTML = `

        <div class="post-type">
            ${escapeHTML(type)}
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


    // =================================================
    // LIKE
    // =================================================

    const likeButton =
        card.querySelector(
            ".like-button"
        );


    likeButton.addEventListener(
        "click",
        async () => {

            try {

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


                likeButton.textContent =
                    `♡ ${likes + 1}`;


                likeButton.disabled =
                    true;

            }


            catch (error) {

                console.error(
                    "Like error:",
                    error
                );


                alert(
                    "Could not like this post."
                );

            }

        }
    );


    // =================================================
    // REPORT
    // =================================================

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
// SIGN OR DELUSION BUTTONS
// =====================================================

const voteButtons =
    document.querySelectorAll(
        ".vote-buttons button"
    );


voteButtons.forEach(
    button => {

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

                    choice =
                        "sign";

                }

                else if (
                    text.includes(
                        "maybe"
                    )
                ) {

                    choice =
                        "maybe";

                }

                else {

                    choice =
                        "delulu";

                }


                await saveVote(
                    choice
                );

            }
        );

    }
);


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

                choice:
                    choice,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "Your vote has been counted! ✦"
        );


        await loadVotes();

    }


    catch (error) {

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


        snapshot.forEach(
            vote => {

                const data =
                    vote.data();


                if (
                    data.choice === "sign"
                ) {

                    sign++;

                }


                else if (
                    data.choice === "maybe"
                ) {

                    maybe++;

                }


                else if (
                    data.choice === "delulu"
                ) {

                    delulu++;

                }

            }
        );


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

    }


    catch (error) {

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


    if (signBar) {
        signBar.style.width =
            sign + "%";
    }


    if (maybeBar) {
        maybeBar.style.width =
            maybe + "%";
    }


    if (deluluBar) {
        deluluBar.style.width =
            delulu + "%";
    }


    if (signPercent) {
        signPercent.textContent =
            sign + "%";
    }


    if (maybePercent) {
        maybePercent.textContent =
            maybe + "%";
    }


    if (deluluPercent) {
        deluluPercent.textContent =
            delulu + "%";
    }

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
    "Your friend chooses to sit beside you.",
    "Your friend starts looking for you whenever you enter the room.",
    "Your friend notices when your mood changes.",
    "Your friend remembers your favorite things.",
    "Your friend laughs harder at your jokes.",
    "Your friend may be trying to spend more time with you.",
    "Your friend suddenly asks about your love life.",
    "Your friend asks who your crush is. Suspicious.",
    "Your friend gets curious whenever you mention someone else.",
    "Your friend may secretly get jealous.",
    "Your friend might be hiding their feelings behind jokes.",
    "Your friend suddenly compliments you more often.",
    "Your friend starts teasing you about having a crush.",
    "Your friend might be trying to figure out if you like them.",
    "Your friend finds random reasons to message you.",
    "Your friend sends you something because it reminded them of you.",
    "Your friend may be thinking about you more than you realize.",
    "Your friend becomes unusually protective of you.",
    "They look at you, then immediately look away.",
    "They reply quickly but pretend they weren't waiting.",
    "They tease you more than everyone else.",
    "They suddenly become quiet when you compliment them.",
    "They ask about your plans for no obvious reason.",
    "They send random messages just to start a conversation.",
    "They remember something you mentioned weeks ago.",
    "They keep finding reasons to continue the conversation.",
    "They ask about your type.",
    "They ask whether you're talking to someone.",
    "They might be testing your reaction.",
    "You accidentally make eye contact and neither looks away.",
    "You both reach for the same thing at the same time.",
    "You accidentally wear matching colors.",
    "You get paired together unexpectedly.",
    "You end up sitting beside each other again.",
    "They smile the moment they see you.",
    "You catch them looking at you.",
    "They notice your new hairstyle immediately.",
    "They save you a seat.",
    "They wait for you before leaving.",
    "They ask if you've already eaten.",
    "They offer to help even when you didn't ask.",
    "They make you laugh when you're having a bad day.",
    "Maybe it's a sign. Maybe you're just hopeful.",
    "The signs are there. The question is whether they're intentional.",
    "Your friends think there's something going on.",
    "You might be overthinking it... or maybe you're not.",
    "Maybe it's friendship. Maybe it's the beginning of something else.",
    "Your heart says yes. Your logic says wait.",
    "You almost confess but chicken out.",
    "Your friend almost tells you something important.",
    "You accidentally reveal your feelings.",
    "Someone asks you directly if you like your friend.",
    "Your friend asks, 'What if we dated?' as a joke... maybe.",
    "You finally get the courage to say something.",
    "Your friend might confess before you do.",
    "A simple conversation turns unexpectedly serious.",
    "You finally ask what your friend really thinks.",
    "You find out whether your feelings are mutual.",
    "Your friendship slowly starts feeling different.",
    "They become your favorite notification.",
    "Your friendship becomes deeper than you expected.",
    "You start seeing them differently.",
    "They become the person you look for in every room.",
    "Maybe your friend is your plot twist.",
    "Maybe you're not imagining the connection.",
    "Maybe they're waiting for you too.",
    "Maybe the signs were real after all.",
    "Maybe your story needs one more chapter.",
    "Maybe the biggest plot twist is that you both feel the same.",
    "Maybe your friend is the plot twist you've been waiting for.",
    "Your story isn't finished yet."

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


    text.style.opacity =
        "0";


    if (icon) {

        icon.style.transition =
            "transform .5s ease";

        icon.style.transform =
            "rotate(360deg) scale(1.2)";

    }


    setTimeout(
        () => {

            const random =
                Math.floor(
                    Math.random() *
                    plotTwists.length
                );


            text.textContent =
                "“" +
                plotTwists[random] +
                "”";


            text.style.opacity =
                "1";


            if (icon) {

                icon.style.transform =
                    "rotate(0deg) scale(1)";

            }

        },
        450
    );

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


    lists.forEach(
        list => {

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

        }
    );

    }
