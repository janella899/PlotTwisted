// ============================================================
// PLOTTWISTED — COMPLETE FIREBASE + FIRESTORE SCRIPT
// ============================================================

// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Firebase Analytics
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";

// Firebase Firestore
import {
    getFirestore,
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc,
    increment
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIGURATION
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyCJ59V5ioK4DWpM_jYFy7NMMPPgjiHNeAE",

    authDomain:
        "plottwisted-c5551.firebaseapp.com",

    databaseURL:
        "https://plottwisted-c5551-default-rtdb.firebaseio.com",

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


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);

let analytics = null;

try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn(
        "Firebase Analytics could not initialize:",
        error
    );
}


// ============================================================
// INITIALIZE FIRESTORE
// ============================================================

const db = getFirestore(app);

console.log("🔥 PlotTwisted Firebase connected.");
console.log("📚 Firestore connected.");


// ============================================================
// COLLECTION NAMES
// ============================================================

const COLLECTIONS = {

    confessions: "confessions",

    hugots: "hugots",

    unsent: "unsentMessages",

    posts: "posts",

    signPosts: "signDelusionPosts",

    signVotes: "signVotes"

};


// ============================================================
// HELPER — GET ELEMENT
// ============================================================

function getElement(id) {

    return document.getElementById(id);

}


// ============================================================
// HELPER — FORMAT DATE
// ============================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Recently posted";
    }

    try {

        let date;

        if (
            typeof timestamp.toDate === "function"
        ) {

            date = timestamp.toDate();

        } else if (
            timestamp instanceof Date
        ) {

            date = timestamp;

        } else if (
            typeof timestamp === "number"
        ) {

            date = new Date(timestamp);

        } else {

            date = new Date(timestamp);

        }

        if (isNaN(date.getTime())) {
            return "Recently posted";
        }

        return date.toLocaleString(
            "en-PH",
            {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );

    } catch (error) {

        return "Recently posted";

    }

}


// ============================================================
// HELPER — ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// HELPER — GET TEXT FROM DOCUMENT
// ============================================================

function getPostText(data) {

    return (
        data.text ??
        data.message ??
        data.content ??
        data.confession ??
        data.hugot ??
        data.messageText ??
        ""
    );

}


// ============================================================
// CREATE POST CARD
// ============================================================

function createPostCard(
    data,
    id,
    type
) {

    const text =
        escapeHTML(
            getPostText(data)
        );

    const date =
        formatDate(
            data.createdAt
        );

    const likes =
        Number(
            data.likes ?? 0
        );

    const card =
        document.createElement("article");

    card.className = "post-card";

    card.dataset.id = id;

    card.innerHTML = `

        <div class="post-type">
            ${escapeHTML(type)}
        </div>

        <div class="post-message">
            ${text || "No message available."}
        </div>

        <div class="post-date">
            ${escapeHTML(date)}
        </div>

        <div class="post-actions">

            <button
                class="like-button"
                type="button"
                data-like-id="${escapeHTML(id)}"
                data-like-type="${escapeHTML(type)}">

                ♡ ${likes}

            </button>

            <button
                class="report-button"
                type="button"
                data-report-id="${escapeHTML(id)}">

                ⚑ Report

            </button>

        </div>

    `;

    return card;

}


// ============================================================
// SORT DOCUMENTS
// ============================================================

function sortDocuments(docs) {

    return docs.sort(
        (a, b) => {

            const aTime =
                a.data.createdAt?.toMillis
                    ? a.data.createdAt.toMillis()
                    : 0;

            const bTime =
                b.data.createdAt?.toMillis
                    ? b.data.createdAt.toMillis()
                    : 0;

            return bTime - aTime;

        }
    );

}


// ============================================================
// RENDER POSTS
// ============================================================

function renderPosts(
    container,
    docs,
    type,
    emptyMessage
) {

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (!docs.length) {

        const empty =
            document.createElement("div");

        empty.className = "post-card";

        empty.innerHTML = `

            <div class="post-type">
                PLOTTWISTED
            </div>

            <div class="post-message">
                ${escapeHTML(emptyMessage)}
            </div>

        `;

        container.appendChild(empty);

        return;
    }


    const sorted =
        sortDocuments(
            [...docs]
        );


    sorted.forEach(
        item => {

            const card =
                createPostCard(
                    item.data,
                    item.id,
                    type
                );

            container.appendChild(card);

        }
    );

}


// ============================================================
// LOAD COLLECTION
// ============================================================

function listenToCollection(
    collectionName,
    containers,
    type,
    emptyMessage
) {

    console.log(
        `📖 Loading Firestore collection: ${collectionName}`
    );


    const collectionReference =
        collection(
            db,
            collectionName
        );


    onSnapshot(

        collectionReference,

        snapshot => {

            const documents =
                snapshot.docs.map(
                    firestoreDoc => ({
                        id:
                            firestoreDoc.id,

                        data:
                            firestoreDoc.data()
                    })
                );


            console.log(
                `✅ ${collectionName}: ${documents.length} document(s) found.`
            );


            containers.forEach(
                container => {

                    if (container) {

                        renderPosts(
                            container,
                            documents,
                            type,
                            emptyMessage
                        );

                    }

                }
            );

        },

        error => {

            console.error(
                `❌ Error loading ${collectionName}:`,
                error
            );


            containers.forEach(
                container => {

                    if (!container) {
                        return;
                    }


                    container.innerHTML = `

                        <div class="post-card">

                            <div class="post-type">
                                FIRESTORE ERROR
                            </div>

                            <div class="post-message">
                                Unable to load stories right now.
                            </div>

                            <div class="post-date">
                                ${escapeHTML(
                                    error.message ||
                                    "Unknown Firestore error"
                                )}
                            </div>

                        </div>

                    `;

                }
            );

        }

    );

}


// ============================================================
// LOAD ALL COMMUNITY DATA
// ============================================================

function loadCommunity() {

    // --------------------------------------------------------
    // CONFESSIONS
    // --------------------------------------------------------

    listenToCollection(

        COLLECTIONS.confessions,

        [
            getElement(
                "communityConfessions"
            ),

            getElement(
                "confessionList"
            )
        ],

        "CONFESSION",

        "No confessions have been posted yet."

    );


    // --------------------------------------------------------
    // HUGOTS
    // --------------------------------------------------------

    listenToCollection(

        COLLECTIONS.hugots,

        [
            getElement(
                "communityHugots"
            ),

            getElement(
                "hugotList"
            )
        ],

        "HUGOT",

        "No hugots have been posted yet."

    );


    // --------------------------------------------------------
    // UNSENT MESSAGES
    // --------------------------------------------------------

    listenToCollection(

        COLLECTIONS.unsent,

        [
            getElement(
                "communityUnsent"
            ),

            getElement(
                "unsentList"
            )
        ],

        "UNSENT MESSAGE",

        "No unsent messages have been posted yet."

    );

}


// ============================================================
// ADD CONFESSION
// ============================================================

async function addConfession(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return;
    }


    try {

        await addDoc(

            collection(
                db,
                COLLECTIONS.confessions
            ),

            {

                text:
                    cleanText,

                likes:
                    0,

                createdAt:
                    serverTimestamp()

            }

        );


        console.log(
            "✅ Confession saved."
        );

    } catch (error) {

        console.error(
            "❌ Could not save confession:",
            error
        );

        alert(
            "The confession could not be posted. Please check your Firestore Rules."
        );

    }

}


// ============================================================
// ADD HUGOT
// ============================================================

async function addHugot(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return;
    }


    try {

        await addDoc(

            collection(
                db,
                COLLECTIONS.hugots
            ),

            {

                text:
                    cleanText,

                likes:
                    0,

                createdAt:
                    serverTimestamp()

            }

        );


        console.log(
            "✅ Hugot saved."
        );

    } catch (error) {

        console.error(
            "❌ Could not save hugot:",
            error
        );

        alert(
            "The hugot could not be posted. Please check your Firestore Rules."
        );

    }

}


// ============================================================
// ADD UNSENT MESSAGE
// ============================================================

async function addUnsentMessage(text) {

    const cleanText =
        text.trim();

    if (!cleanText) {
        return;
    }


    try {

        await addDoc(

            collection(
                db,
                COLLECTIONS.unsent
            ),

            {

                text:
                    cleanText,

                likes:
                    0,

                createdAt:
                    serverTimestamp()

            }

        );


        console.log(
            "✅ Unsent message saved."
        );

    } catch (error) {

        console.error(
            "❌ Could not save unsent message:",
            error
        );

        alert(
            "The message could not be posted. Please check your Firestore Rules."
        );

    }

}


// ============================================================
// CONFESSION FORM
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            getElement(
                "confessionForm"
            );


        const input =
            getElement(
                "confessionInput"
            );


        if (form && input) {

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    const text =
                        input.value.trim();

                    if (!text) {
                        return;
                    }


                    const button =
                        form.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {
                        button.disabled = true;
                        button.textContent =
                            "SAVING...";
                    }


                    await addConfession(
                        text
                    );


                    input.value = "";


                    if (button) {
                        button.disabled = false;
                        button.textContent =
                            "♡ SEAL THIS CONFESSION";
                    }

                }
            );

        }


        // ----------------------------------------------------
        // HUGOT FORM
        // ----------------------------------------------------

        const hugotForm =
            getElement(
                "hugotForm"
            );


        const hugotInput =
            getElement(
                "hugotInput"
            );


        if (
            hugotForm &&
            hugotInput
        ) {

            hugotForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    const text =
                        hugotInput.value.trim();

                    if (!text) {
                        return;
                    }


                    const button =
                        hugotForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {
                        button.disabled = true;
                        button.textContent =
                            "SAVING...";
                    }


                    await addHugot(
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
        // UNSENT MESSAGE FORM
        // ----------------------------------------------------

        const unsentForm =
            getElement(
                "unsentForm"
            );


        const unsentInput =
            getElement(
                "unsentInput"
            );


        if (
            unsentForm &&
            unsentInput
        ) {

            unsentForm.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();

                    const text =
                        unsentInput.value.trim();

                    if (!text) {
                        return;
                    }


                    const button =
                        unsentForm.querySelector(
                            "button[type='submit']"
                        );


                    if (button) {
                        button.disabled = true;
                        button.textContent =
                            "SAVING...";
                    }


                    await addUnsentMessage(
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
        // LOAD FIRESTORE DATA
        // ----------------------------------------------------

        loadCommunity();

    }
);


// ============================================================
// LIKE BUTTON
// ============================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                ".like-button"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.likeId;

        const type =
            button.dataset.likeType;


        let collectionName = null;


        if (
            type === "CONFESSION"
        ) {

            collectionName =
                COLLECTIONS.confessions;

        } else if (
            type === "HUGOT"
        ) {

            collectionName =
                COLLECTIONS.hugots;

        } else if (
            type === "UNSENT MESSAGE"
        ) {

            collectionName =
                COLLECTIONS.unsent;

        }


        if (
            !collectionName ||
            !id
        ) {

            return;

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


            console.log(
                "♡ Like added."
            );

        } catch (error) {

            console.error(
                "❌ Like failed:",
                error
            );

        }

    }
);


// ============================================================
// REPORT BUTTON
// ============================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".report-button"
            );


        if (!button) {
            return;
        }


        const id =
            button.dataset.reportId;


        if (!id) {
            return;
        }


        alert(
            "Thank you. Please contact the PlotTwisted administrator to report inappropriate content."
        );

    }
);


// ============================================================
// EXPOSE FUNCTIONS
// ============================================================

window.addConfession =
    addConfession;

window.addHugot =
    addHugot;

window.addUnsentMessage =
    addUnsentMessage;

window.loadCommunity =
    loadCommunity;


// ============================================================
// DONE
// ============================================================

console.log(
    "✦ PlotTwisted script loaded successfully."
);
