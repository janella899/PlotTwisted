// =====================================================
// PLOTTWISTED — FIRESTORE SCRIPT
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

        if (isNaN(date.getTime())) {
            return "Recently";
        }

        return date.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    } catch (error) {

        console.warn(
            "Date formatting error:",
            error
        );

        return "Recently";
    }
}


// =====================================================
// ESCAPE HTML
// Prevents submitted HTML from being rendered
// =====================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


// =====================================================
// GET TEXT FROM FIRESTORE
// Supports older field names
// =====================================================

function getPostText(data) {

    if (!data) {
        return "";
    }

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

    if (!data) {
        return 0;
    }

    const likes =
        Number(data.likes ?? 0);

    return Number.isFinite(likes)
        ? likes
        : 0;
}


// =====================================================
// CREATE VICTORIAN ARCHIVE RECORD
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
        document.createElement("article");

    card.className =
        "post-card archive-record";


    // =================================================
    // DISPLAY-ONLY RECORD NUMBER
    // Does NOT change Firestore ID
    // =================================================

    const recordNumber =
        String(
            Math.abs(
                Array.from(String(id || ""))
                    .reduce(
                        (total, char) =>
                            total +
                            char.charCodeAt(0),
                        0
                    )
            ) % 9999
        ).padStart(4, "0");


    // =================================================
    // ARCHIVE LABEL
    // =================================================

    let archiveLabel =
        "ANONYMOUS RECORD";

    if (type === "CONFESSION") {

        archiveLabel =
            "ANONYMOUS CONFESSION";

    } else if (type === "HUGOT") {

        archiveLabel =
            "PERSONAL HUGOT";

    } else if (type === "UNSENT MESSAGE") {

        archiveLabel =
            "UNSENT MESSAGE";

    }


    // =================================================
    // DATE
    // =================================================

    let dateText =
        "DATE UNKNOWN";

    try {

        if (data && data.createdAt) {

            dateText =
                formatDate(
                    data.createdAt
                );

        }

    } catch (error) {

        dateText =
            "Recently";

    }


    // =================================================
    // RECORD HTML
    // =================================================

    card.innerHTML = `

        <div class="record-inner">

            <div class="record-header">

                <span class="record-stamp">
                    RECENTLY FILED
                </span>

                <span class="record-number">
                    RECORD No. ${recordNumber}
                </span>

            </div>


            <div class="record-ornament">

                <span></span>

                <b>ARCHIVE</b>

                <span></span>

            </div>


            <div class="record-category">

                ${escapeHTML(archiveLabel)}

            </div>


            <div class="record-content">

                <p class="record-message">

                    ${escapeHTML(text)}

                </p>

            </div>


            <div class="record-divider"></div>


            <div class="record-footer">

                <div class="record-date">

                    <span class="footer-label">
                        FILED
                    </span>

                    <time>
                        ${escapeHTML(dateText)}
                    </time>

                </div>


                <div class="record-seal">
                    SEALED
                </div>

            </div>


            <div class="record-actions">

                <button
                    class="like-button"
                    type="button"
                    data-id="${escapeHTML(String(id))}"
                    data-collection="${escapeHTML(String(collectionName))}"
                    aria-label="Like this record">

                    <span class="button-symbol">
                        ♡
                    </span>

                    <span class="like-count">
                        ${likes}
                    </span>

                </button>


                <button
                    class="report-button"
                    type="button">

                    REPORT RECORD

                </button>

            </div>

        </div>

    `;


    // =================================================
    // LIKE BUTTON
    // =================================================

    const likeButton =
        card.querySelector(
            ".like-button"
        );


    if (likeButton) {

        likeButton.addEventListener(
            "click",
            async function () {

                if (
                    likeButton.dataset.liked ===
                    "true"
                ) {
                    return;
                }


                likeButton.disabled =
                    true;


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


                    const count =
                        likeButton.querySelector(
                            ".like-count"
                        );


                    const currentLikes =
                        Number(
                            count
                                ? count.textContent
                                : likes
                        ) + 1;


                    if (count) {

                        count.textContent =
                            currentLikes;

                    }


                    likeButton.dataset.liked =
                        "true";


                    likeButton.classList.add(
                        "is-liked"
                    );


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

    }


    // =================================================
    // REPORT BUTTON
    // =================================================

    const reportButton =
        card.querySelector(
            ".report-button"
        );


    if (reportButton) {

        reportButton.addEventListener(
            "click",
            function () {

                alert(
                    "Thank you. Please report inappropriate content to the PlotTwisted administrator."
                );

            }
        );

    }


    return card;
}


// =====================================================
// GET ARCHIVE CONTAINER
// =====================================================

function getContainer(elementId) {

    const container =
        document.getElementById(
            elementId
        );

    if (!container) {

        console.warn(
            `PlotTwisted: #${elementId} was not found.`
        );

    }

    return container;
}


// =====================================================
// CREATE EMPTY MESSAGE
// =====================================================

function createEmptyMessage() {

    const empty =
        document.createElement("div");

    empty.className =
        "post-card archive-empty";

    empty.innerHTML = `

        <div class="post-type">
            THE ARCHIVE IS QUIET
        </div>

        <div class="post-message">
            No records have been filed here yet.
        </div>

    `;

    return empty;
}


// =====================================================
// CREATE ERROR MESSAGE
// =====================================================

function createErrorMessage() {

    const errorCard =
        document.createElement("div");

    errorCard.className =
        "post-card archive-error";

    errorCard.innerHTML = `

        <div class="post-type">
            ARCHIVE ERROR
        </div>

        <div class="post-message">
            Unable to retrieve the records right now.
        </div>

        <div class="post-date">
            Please check your Firebase Firestore rules.
        </div>

    `;

    return errorCard;
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
        getContainer(elementId);


    if (!container) {
        return;
    }


    // =================================================
    // LOADING STATE
    // =================================================

    container.innerHTML = `

        <div class="post-card archive-loading">

            <div class="post-type">
                PLOTTWISTED ARCHIVE
            </div>

            <div class="post-message">
                Opening the archive...
            </div>

        </div>

    `;


    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );


        let snapshot;


        // =================================================
        // TRY NEWEST FIRST
        // =================================================

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
                "Ordered query failed. Loading collection without ordering.",
                orderError
            );


            snapshot =
                await getDocs(
                    collectionRef
                );

        }


        // =================================================
        // CLEAR LOADING
        // =================================================

        container.innerHTML = "";


        // =================================================
        // EMPTY COLLECTION
        // =================================================

        if (snapshot.empty) {

            container.appendChild(
                createEmptyMessage()
            );

            return;
        }


        // =================================================
        // COLLECT POSTS
        // =================================================

        const posts = [];


        snapshot.forEach(
            documentSnapshot => {

                posts.push({

                    id:
                        documentSnapshot.id,

                    data:
                        documentSnapshot.data()

                });

            }
        );


        // =================================================
        // LOCAL SORT
        // =================================================

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


        // =================================================
        // DISPLAY POSTS
        // =================================================

        posts.forEach(
            post => {

                const card =
                    createPostCard(
                        post.id,
                        post.data,
                        type,
                        collectionName
                    );


                container.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            `Error loading ${collectionName}:`,
            error
        );


        container.innerHTML = "";


        container.appendChild(
            createErrorMessage()
        );

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
// ADD NEW RECORD DIRECTLY TO PAGE
// =====================================================

function addNewRecordToPage(
    id,
    data,
    type,
    collectionName,
    elementId
) {

    const container =
        getContainer(elementId);


    if (!container) {
        return;
    }


    // Remove empty/loading messages
    const emptyCards =
        container.querySelectorAll(
            ".archive-empty, .archive-loading"
        );


    emptyCards.forEach(
        card => card.remove()
    );


    const card =
        createPostCard(
            id,
            data,
            type,
            collectionName
        );


    // Put newest record at the top
    container.prepend(card);

}


// =====================================================
// SAVE POST
// =====================================================

async function savePost(
    collectionName,
    inputId,
    formId,
    type,
    listId,
    communityId
) {

    const form =
        document.getElementById(
            formId
        );


    const input =
        document.getElementById(
            inputId
        );


    if (!form || !input) {

        console.warn(
            `PlotTwisted: Form or input missing for ${formId}`
        );

        return;
    }


    // Prevent duplicate event listeners
    if (
        form.dataset.firestoreReady ===
        "true"
    ) {
        return;
    }


    form.dataset.firestoreReady =
        "true";


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


            const originalButtonText =
                button
                    ? button.textContent
                    : "";


            if (button) {

                button.disabled =
                    true;

                button.textContent =
                    "FILING RECORD...";

            }


            try {

                // =================================================
                // SAVE TO FIRESTORE
                // =================================================

                const docRef =
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


                // =================================================
                // CREATE LOCAL DATA
                // =================================================

                const newPostData = {

                    text: text,

                    likes: 0,

                    // serverTimestamp is not immediately readable
                    // on the client, so use the current time
                    // for immediate display.
                    createdAt:
                        new Date()

                };


                // =================================================
                // CLEAR INPUT
                // =================================================

                input.value = "";


                // =================================================
                // IMMEDIATELY DISPLAY NEW RECORD
                // =================================================

                addNewRecordToPage(
                    docRef.id,
                    newPostData,
                    type,
                    collectionName,
                    listId
                );


                // Also display it in community feed
                addNewRecordToPage(
                    docRef.id,
                    newPostData,
                    type,
                    collectionName,
                    communityId
                );


                alert(
                    "Your story has been filed in the archive."
                );


                // =================================================
                // REFRESH FROM FIRESTORE
                // =================================================

                setTimeout(
                    async function () {

                        try {

                            await Promise.all([
                                loadCommunityStories(),
                                loadIndividualLists()
                            ]);

                        } catch (refreshError) {

                            console.warn(
                                "Archive refresh failed:",
                                refreshError
                            );

                        }

                    },
                    500
                );


            } catch (error) {

                console.error(
                    "Save error:",
                    error
                );


                alert(
                    "Unable to file your story right now. Please check your Firestore rules."
                );


            } finally {

                if (button) {

                    button.disabled =
                        false;


                    if (
                        originalButtonText
                    ) {

                        button.textContent =
                            originalButtonText;

                    } else {

                        if (
                            formId ===
                            "confessionForm"
                        ) {

                            button.textContent =
                                "SEAL THIS CONFESSION";

                        } else if (
                            formId ===
                            "hugotForm"
                        ) {

                            button.textContent =
                                "SEND THIS HUGOT";

                        } else {

                            button.textContent =
                                "SEND TO THE VOID";

                        }

                    }

                }

            }

        }
    );

}


// =====================================================
// SIGN OR DELUSION — FIRESTORE VOTING
// =====================================================

function initializeVoting() {

    const voteButtons =
        document.querySelectorAll(
            ".vote-buttons button"
        );


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


    function updateVoteDisplay(
        sign,
        maybe,
        delulu
    ) {

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


    async function loadVotes() {

        try {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        "signVotes"
                    )
                );


            let sign = 0;
            let maybe = 0;
            let delulu = 0;


            snapshot.forEach(
                docSnap => {

                    const data =
                        docSnap.data();


                    if (
                        data.vote ===
                        "sign"
                    ) {

                        sign++;

                    }


                    if (
                        data.vote ===
                        "maybe"
                    ) {

                        maybe++;

                    }


                    if (
                        data.vote ===
                        "delulu"
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

                updateVoteDisplay(
                    62,
                    25,
                    13
                );

                return;
            }


            const signPct =
                Math.round(
                    (sign / total) * 100
                );


            const maybePct =
                Math.round(
                    (maybe / total) * 100
                );


            const deluluPct =
                100 -
                signPct -
                maybePct;


            updateVoteDisplay(
                signPct,
                maybePct,
                deluluPct
            );


        } catch (error) {

            console.error(
                "Unable to load votes:",
                error
            );

        }

    }


    voteButtons.forEach(
        (button, index) => {

            button.addEventListener(
                "click",
                async function () {

                    let vote;


                    if (index === 0) {
                        vote = "sign";
                    }

                    else if (index === 1) {
                        vote = "maybe";
                    }

                    else if (index === 2) {
                        vote = "delulu";
                    }


                    if (!vote) {
                        return;
                    }


                    const alreadyVoted =
                        localStorage.getItem(
                            "plottwisted_vote_001"
                        );


                    if (alreadyVoted) {

                        alert(
                            "You already voted on this case."
                        );

                        return;
                    }


                    try {

                        button.disabled =
                            true;


                        await addDoc(
                            collection(
                                db,
                                "signVotes"
                            ),
                            {
                                vote: vote,

                                caseId: "001",

                                createdAt:
                                    serverTimestamp()
                            }
                        );


                        localStorage.setItem(
                            "plottwisted_vote_001",
                            "true"
                        );


                        voteButtons.forEach(
                            btn => {

                                btn.disabled =
                                    true;

                            }
                        );


                        await loadVotes();


                        alert(
                            "Your verdict has been recorded."
                        );


                    } catch (error) {

                        console.error(
                            "Vote error:",
                            error
                        );


                        button.disabled =
                            false;


                        alert(
                            "Unable to record your vote right now."
                        );

                    }

                }
            );

        }
    );


    loadVotes();

}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "PlotTwisted Firebase starting..."
        );


        // =================================================
        // FORMS
        // =================================================

        await savePost(
            COLLECTIONS.confessions,
            "confessionInput",
            "confessionForm",
            "CONFESSION",
            "confessionList",
            "communityConfessions"
        );


        await savePost(
            COLLECTIONS.hugots,
            "hugotInput",
            "hugotForm",
            "HUGOT",
            "hugotList",
            "communityHugots"
        );


        await savePost(
            COLLECTIONS.unsent,
            "unsentInput",
            "unsentForm",
            "UNSENT MESSAGE",
            "unsentList",
            "communityUnsent"
        );


        // =================================================
        // LOAD EXISTING RECORDS
        // =================================================

        await Promise.all([

            loadCommunityStories(),

            loadIndividualLists()

        ]);


        // =================================================
        // INITIALIZE VOTING
        // =================================================

        initializeVoting();


        console.log(
            "PlotTwisted Firebase ready."
        );

    }
);


// =====================================================
// RELOAD ARCHIVE WHEN PAGES OPEN
// =====================================================

function connectPageReload() {

    const originalShowPage =
        window.showPage;


    if (
        typeof originalShowPage !==
        "function"
    ) {

        return;

    }


    // Prevent wrapping more than once
    if (
        window.showPage.__plotTwistedWrapped
    ) {

        return;

    }


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

                        if (
                            id ===
                            "community"
                        ) {

                            loadCommunityStories();

                        }


                        if (
                            id ===
                            "confessions" ||
                            id ===
                            "hugot" ||
                            id ===
                            "unsent"
                        ) {

                            loadIndividualLists();

                        }

                    },
                    100
                );

            }

        };


    window.showPage.__plotTwistedWrapped =
        true;

}


// Try immediately
connectPageReload();


// Try again after the HTML has finished loading
document.addEventListener(
    "DOMContentLoaded",
    function () {

        connectPageReload();

    }
);
