// ============================================================
// PLOTTWISTED — FIREBASE + FIRESTORE
// Community History + Confessions + Hugots + Unsent Messages
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

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


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCJ59V5ioK4DWpM_jYFy7NMMPPgjiHNeAE",
    authDomain: "plottwisted-c5551.firebaseapp.com",
    databaseURL: "https://plottwisted-c5551-default-rtdb.firebaseio.com",
    projectId: "plottwisted-c5551",
    storageBucket: "plottwisted-c5551.firebasestorage.app",
    messagingSenderId: "797105645748",
    appId: "1:797105645748:web:e410591f49c41b8a7f4fe1",
    measurementId: "G-V5DBX6TKK2"
};


// ============================================================
// INITIALIZE
// ============================================================

const app = initializeApp(firebaseConfig);

try {
    getAnalytics(app);
} catch (error) {
    console.warn("Analytics unavailable:", error);
}

const db = getFirestore(app);

console.log("🔥 PlotTwisted Firebase connected.");
console.log("🔥 Firestore connected.");


// ============================================================
// COLLECTION NAMES
// ============================================================

const CONFESSIONS = "confessions";
const HUGOTS = "hugots";
const UNSENT = "unsentMessages";


// ============================================================
// ELEMENT HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Just now";
    }

    try {

        const date =
            typeof timestamp.toDate === "function"
                ? timestamp.toDate()
                : new Date(timestamp);

        if (isNaN(date.getTime())) {
            return "Recently posted";
        }

        return date.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    } catch {
        return "Recently posted";
    }
}


// ============================================================
// GET TEXT
// ============================================================

function getText(data) {

    return (
        data.text ??
        data.message ??
        data.content ??
        ""
    );

}


// ============================================================
// CREATE POST CARD
// ============================================================

function createCard(data, id, type) {

    const text =
        escapeHTML(getText(data));

    const likes =
        Number(data.likes ?? 0);

    const date =
        formatDate(data.createdAt);

    const card =
        document.createElement("article");

    card.className = "post-card";

    card.innerHTML = `

        <div class="post-type">
            ${type}
        </div>

        <div class="post-message">
            ${text || "No message."}
        </div>

        <div class="post-date">
            ${escapeHTML(date)}
        </div>

        <div class="post-actions">

            <button
                type="button"
                class="like-button"
                data-id="${escapeHTML(id)}"
                data-collection="${escapeHTML(
                    type === "CONFESSION"
                        ? CONFESSIONS
                        : type === "HUGOT"
                            ? HUGOTS
                            : UNSENT
                )}">

                ♡ ${likes}

            </button>

            <button
                type="button"
                class="report-button">

                ⚑ Report

            </button>

        </div>

    `;

    return card;
}


// ============================================================
// SHOW ERROR
// ============================================================

function showError(container, error) {

    if (!container) return;

    container.innerHTML = `

        <div class="post-card">

            <div class="post-type">
                PLOTTWISTED
            </div>

            <div class="post-message">
                Unable to load stories.
            </div>

            <div class="post-date">
                ${escapeHTML(
                    error?.message ||
                    "Firestore error"
                )}
            </div>

        </div>

    `;
}


// ============================================================
// SHOW EMPTY
// ============================================================

function showEmpty(
    container,
    message
) {

    if (!container) return;

    container.innerHTML = `

        <div class="post-card">

            <div class="post-type">
                PLOTTWISTED
            </div>

            <div class="post-message">
                ${escapeHTML(message)}
            </div>

        </div>

    `;
}


// ============================================================
// LISTEN TO COLLECTION
// ============================================================

function listenToCollection(
    collectionName,
    containerIds,
    type,
    emptyMessage
) {

    const containers =
        containerIds
            .map(id => $(id))
            .filter(Boolean);

    if (!containers.length) {
        return;
    }

    console.log(
        "📖 Listening to:",
        collectionName
    );


    const collectionRef =
        collection(
            db,
            collectionName
        );


    // --------------------------------------------------------
    // Try newest-first using createdAt
    // --------------------------------------------------------

    const orderedQuery =
        query(
            collectionRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    onSnapshot(

        orderedQuery,

        snapshot => {

            console.log(
                `✅ ${collectionName}: ${snapshot.size} document(s)`
            );


            containers.forEach(
                container => {

                    container.innerHTML = "";

                    if (snapshot.empty) {

                        showEmpty(
                            container,
                            emptyMessage
                        );

                        return;
                    }


                    snapshot.forEach(
                        firestoreDoc => {

                            const card =
                                createCard(
                                    firestoreDoc.data(),
                                    firestoreDoc.id,
                                    type
                                );

                            container.appendChild(
                                card
                            );

                        }
                    );

                }
            );

        },

        error => {

            console.error(
                `❌ ${collectionName} error:`,
                error
            );


            containers.forEach(
                container => {

                    showError(
                        container,
                        error
                    );

                }
            );

        }

    );

}


// ============================================================
// LOAD COMMUNITY
// ============================================================

function loadCommunity() {

    // CONFESSIONS
    listenToCollection(

        CONFESSIONS,

        [
            "communityConfessions",
            "confessionList"
        ],

        "CONFESSION",

        "No confessions have been posted yet."

    );


    // HUGOTS
    listenToCollection(

        HUGOTS,

        [
            "communityHugots",
            "hugotList"
        ],

        "HUGOT",

        "No hugots have been posted yet."

    );


    // UNSENT
    listenToCollection(

        UNSENT,

        [
            "communityUnsent",
            "unsentList"
        ],

        "UNSENT MESSAGE",

        "No unsent messages have been posted yet."

    );

}


// ============================================================
// ADD CONFESSION
// ============================================================

async function saveConfession(text) {

    if (!text.trim()) return;

    try {

        await addDoc(
            collection(
                db,
                CONFESSIONS
            ),
            {
                text: text.trim(),
                likes: 0,
                createdAt: serverTimestamp()
            }
        );

        console.log(
            "✅ Confession saved."
        );

    } catch (error) {

        console.error(
            "❌ Confession save error:",
            error
        );

        alert(
            "Could not save confession.\n\n" +
            error.message
        );

    }

}


// ============================================================
// ADD HUGOT
// ============================================================

async function saveHugot(text) {

    if (!text.trim()) return;

    try {

        await addDoc(
            collection(
                db,
                HUGOTS
            ),
            {
                text: text.trim(),
                likes: 0,
                createdAt: serverTimestamp()
            }
        );

        console.log(
            "✅ Hugot saved."
        );

    } catch (error) {

        console.error(
            "❌ Hugot save error:",
            error
        );

        alert(
            "Could not save hugot.\n\n" +
            error.message
        );

    }

}


// ============================================================
// ADD UNSENT MESSAGE
// ============================================================

async function saveUnsent(text) {

    if (!text.trim()) return;

    try {

        await addDoc(
            collection(
                db,
                UNSENT
            ),
            {
                text: text.trim(),
                likes: 0,
                createdAt: serverTimestamp()
            }
        );

        console.log(
            "✅ Unsent message saved."
        );

    } catch (error) {

        console.error(
            "❌ Unsent message save error:",
            error
        );

        alert(
            "Could not save message.\n\n" +
            error.message
        );

    }

}


// ============================================================
// FORM HANDLERS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        // ----------------------------------------------------
        // CONFESSION
        // ----------------------------------------------------

        const confessionForm =
            $("confessionForm");

        const confessionInput =
            $("confessionInput");


        if (
            confessionForm &&
            confessionInput
        ) {

            confessionForm.addEventListener(
                "submit",
                async function(event) {

                    event.preventDefault();

                    const text =
                        confessionInput.value.trim();

                    if (!text) return;


                    const button =
                        confessionForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {

                        button.disabled = true;

                        button.textContent =
                            "SAVING...";

                    }


                    await saveConfession(
                        text
                    );


                    confessionInput.value = "";


                    if (button) {

                        button.disabled = false;

                        button.textContent =
                            "♡ SEAL THIS CONFESSION";

                    }

                }
            );

        }


        // ----------------------------------------------------
        // HUGOT
        // ----------------------------------------------------

        const hugotForm =
            $("hugotForm");

        const hugotInput =
            $("hugotInput");


        if (
            hugotForm &&
            hugotInput
        ) {

            hugotForm.addEventListener(
                "submit",
                async function(event) {

                    event.preventDefault();

                    const text =
                        hugotInput.value.trim();

                    if (!text) return;


                    const button =
                        hugotForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {

                        button.disabled = true;

                        button.textContent =
                            "SAVING...";

                    }


                    await saveHugot(
                        text
                    );


                    hugotInput.value = "";


                    if (button) {

                        button.disabled = false;

                        button.textContent =
                            "✦ SEND THIS HUGOT";

                    }

                }
            );

        }


        // ----------------------------------------------------
        // UNSENT
        // ----------------------------------------------------

        const unsentForm =
            $("unsentForm");

        const unsentInput =
            $("unsentInput");


        if (
            unsentForm &&
            unsentInput
        ) {

            unsentForm.addEventListener(
                "submit",
                async function(event) {

                    event.preventDefault();

                    const text =
                        unsentInput.value.trim();

                    if (!text) return;


                    const button =
                        unsentForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {

                        button.disabled = true;

                        button.textContent =
                            "SAVING...";

                    }


                    await saveUnsent(
                        text
                    );


                    unsentInput.value = "";


                    if (button) {

                        button.disabled = false;

                        button.textContent =
                            "✉ SEND TO THE VOID";

                    }

                }
            );

        }


        // ----------------------------------------------------
        // START FIRESTORE
        // ----------------------------------------------------

        loadCommunity();

    }
);


// ============================================================
// LIKE BUTTON
// ============================================================

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".like-button"
            );

        if (!button) return;


        const id =
            button.dataset.id;

        const collectionName =
            button.dataset.collection;


        if (
            !id ||
            !collectionName
        ) {
            return;
        }


        button.disabled = true;


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


            console.log(
                "♡ Like added."
            );

        } catch (error) {

            console.error(
                "❌ Like error:",
                error
            );

        } finally {

            button.disabled = false;

        }

    }
);


// ============================================================
// REPORT BUTTON
// ============================================================

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".report-button"
            );

        if (!button) return;


        alert(
            "Thank you for reporting this post. " +
            "Please contact the PlotTwisted administrator."
        );

    }
);


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.loadCommunity =
    loadCommunity;

window.saveConfession =
    saveConfession;

window.saveHugot =
    saveHugot;

window.saveUnsent =
    saveUnsent;


// ============================================================
// IMPORTANT:
// DO NOT PUT spinRoulette() HERE.
// Your HTML already contains spinRoulette().
// This script does NOT replace or remove it.
// ============================================================

console.log(
    "✦ PlotTwisted Firestore script loaded."
);
