// =====================================================
// PLOTTWISTED — FINAL FIRESTORE SCRIPT
// GitHub Pages + Firebase Firestore
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

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
// FIREBASE CONFIG
// =====================================================

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


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// =====================================================
// COLLECTION NAMES
// =====================================================

const COLLECTIONS = {
    confessions: "confessions",
    hugots: "hugots",
    unsent: "unsentMessages"
};


// =====================================================
// SAFE DATE FORMAT
// =====================================================

function formatDate(timestamp) {

    if (!timestamp) {
        return "Just now";
    }

    try {

        const date =
            timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);

        return date.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    } catch (error) {

        return "Recently";

    }
}


// =====================================================
// ESCAPE HTML
// Prevents user-submitted HTML from being rendered
// =====================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;
}


// =====================================================
// GET TEXT FROM FIRESTORE
// Supports different field names from older posts
// =====================================================

function getPostText(data) {

    return (
        data.text ??
        data.message ??
        data.content ??
        data.confession ??
        data.hugot ??
        data.body ??
        ""
    );

}


// =====================================================
// GET LIKES
// =====================================================

function getLikes(data) {

    const likes =
        Number(data.likes ?? 0);

    return Number.isFinite(likes)
        ? likes
        : 0;

}


// =====================================================
// CREATE POST CARD
// =====================================================

function createPostCard(
    id,
    data,
    type,
    collectionName
) {

    const text =
        getPostText(data);

    const likes =
        getLikes(data);

    const card =
        document.createElement("div");

    card.className =
        "post-card";

    card.innerHTML = `

        <div class="post-type">
            ${escapeHTML(type)}
        </div>

        <div class="post-message">
            ${escapeHTML(text)}
        </div>

        <div class="post-date">
            ${escapeHTML(
                formatDate(data.createdAt)
            )}
        </div>

        <div class="post-actions">

            <button
                class="like-button"
                type="button"
                data-id="${escapeHTML(id)}"
                data-collection="${escapeHTML(collectionName)}">

                ♡ ${likes}

            </button>

            <button
                class="report-button"
                type="button"
                onclick="alert('Thank you. Please report inappropriate content to the PlotTwisted administrator.')">

                ⚑ REPORT

            </button>

        </div>
    `;


    const likeButton =
        card.querySelector(".like-button");


    likeButton.addEventListener(
        "click",
        async function () {

            if (
                likeButton.dataset.liked === "true"
            ) {
                return;
            }

            likeButton.disabled = true;

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
                        likes: increment(1)
                    }
                );

                const currentLikes =
                    likes + 1;

                likeButton.textContent =
                    `♡ ${currentLikes}`;

                likeButton.dataset.liked =
                    "true";

            } catch (error) {

                console.error(
                    "Like error:",
                    error
                );

                likeButton.disabled =
                    false;

                alert(
                    "Unable to like this story right now."
                );

            }

        }
    );


    return card;
}


// =====================================================
// LOAD ONE COLLECTION
// =====================================================

async function loadCollection(
    collectionName,
    elementId,
    type
) {

    const container =
        document.getElementById(elementId);

    if (!container) {
        return;
    }


    // Loading state

    container.innerHTML = `

        <div class="post-card">

            <div class="post-type">
                PLOTTWISTED
            </div>

            <div class="post-message">
                Loading stories...
            </div>

        </div>

    `;


    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );


        // First try newest-first.

        let snapshot;

        try {

            const orderedQuery =
                query(
                    collectionRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );

            snapshot =
                await getDocs(
                    orderedQuery
                );

        } catch (orderError) {

            console.warn(
                "Ordered query failed. Loading without order:",
                orderError
            );

            // Important:
            // This allows older documents with missing
            // createdAt fields to still appear.

            snapshot =
                await getDocs(
                    collectionRef
                );

        }


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML = `

                <div class="post-card">

                    <div class="post-type">
                        PLOTTWISTED
                    </div>

                    <div class="post-message">
                        No stories yet.
                        Be the first to share one.
                    </div>

                </div>

            `;

            return;
        }


        const posts = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();

                posts.push({
                    id: documentSnapshot.id,
                    data
                });

            }
        );


        // Sort locally as an extra safety measure.

        posts.sort(
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


        posts.forEach(
            post => {

                const card =
                    createPostCard(
                        post.id,
                        post.data,
                        type,
                        collectionName
                    );

                container.appendChild(card);

            }
        );


    } catch (error) {

        console.error(
            `Error loading ${collectionName}:`,
            error
        );


        container.innerHTML = `

            <div class="post-card">

                <div class="post-type">
                    PLOTTWISTED
                </div>

                <div class="post-message">
                    Unable to load stories right now.
                </div>

                <div class="post-date">
                    Please check your Firestore rules.
                </div>

            </div>

        `;

    }

}


// =====================================================
// LOAD ALL COMMUNITY STORIES
// =====================================================

async function loadCommunityStories() {

    await Promise.all([
        loadCollection(
            COLLECTIONS.confessions,
            "communityConfessions",
            "CONFESSION"
        ),

        loadCollection(
            COLLECTIONS.hugots,
            "communityHugots",
            "HUGOT"
        ),

        loadCollection(
            COLLECTIONS.unsent,
            "communityUnsent",
            "UNSENT MESSAGE"
        )
    ]);

}


// =====================================================
// LOAD INDIVIDUAL PAGE LISTS
// =====================================================

async function loadIndividualLists() {

    await Promise.all([
        loadCollection(
            COLLECTIONS.confessions,
            "confessionList",
            "CONFESSION"
        ),

        loadCollection(
            COLLECTIONS.hugots,
            "hugotList",
            "HUGOT"
        ),

        loadCollection(
            COLLECTIONS.unsent,
            "unsentList",
            "UNSENT MESSAGE"
        )
    ]);

}


// =====================================================
// SAVE POST
// =====================================================

async function savePost(
    collectionName,
    inputId,
    formId
) {

    const form =
        document.getElementById(formId);

    const input =
        document.getElementById(inputId);

    if (!form || !input) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const text =
                input.value.trim();


            if (!text) {

                alert(
                    "Please write something first."
                );

                return;
            }


            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            if (button) {
                button.disabled = true;
                button.textContent =
                    "SENDING...";
            }


            try {

                await addDoc(
                    collection(
                        db,
                        collectionName
                    ),
                    {
                        text: text,
                        likes: 0,
                        createdAt:
                            serverTimestamp()
                    }
                );


                input.value = "";


                alert(
                    "Your story has been posted."
                );


                // Refresh all feeds.

                await Promise.all([
                    loadCommunityStories(),
                    loadIndividualLists()
                ]);


            } catch (error) {

                console.error(
                    "Save error:",
                    error
                );


                alert(
                    "Unable to post your story right now. Please check your Firestore rules."
                );


            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        formId === "confessionForm"
                            ? "♡ SEAL THIS CONFESSION"
                            : formId === "hugotForm"
                                ? "✦ SEND THIS HUGOT"
                                : "✉ SEND TO THE VOID";

                }

            }

        }
    );

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "✦ PlotTwisted Firebase starting..."
        );


        // Forms

        await savePost(
            COLLECTIONS.confessions,
            "confessionInput",
            "confessionForm"
        );

        await savePost(
            COLLECTIONS.hugots,
            "hugotInput",
            "hugotForm"
        );

        await savePost(
            COLLECTIONS.unsent,
            "unsentInput",
            "unsentForm"
        );


        // Load existing Firestore data.

        await Promise.all([
            loadCommunityStories(),
            loadIndividualLists()
        ]);


        console.log(
            "✦ PlotTwisted Firebase ready."
        );

    }
);


// =====================================================
// RELOAD COMMUNITY WHEN COMMUNITY PAGE OPENS
// =====================================================

const originalShowPage =
    window.showPage;


if (typeof originalShowPage === "function") {

    window.showPage =
        function (id) {

            originalShowPage(id);

            if (
                id === "community" ||
                id === "confessions" ||
                id === "hugot" ||
                id === "unsent"
            ) {

                setTimeout(
                    function () {

                        loadCommunityStories();
                        loadIndividualLists();

                    },
                    100
                );

            }

        };

}


// =====================================================
// IMPORTANT
// Roulette is NOT touched here.
// Your existing spinRoulette() in index.html
// remains active.
// =====================================================
