// =====================================================
// PLOTTWISTED — FIRESTORE ARCHIVE
// Matched to the current Victorian index.html
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
    apiKey: "AIzaSyCJ59V5ioK4DWp_mjYFy7NMMPPgjiHNeAE",
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
// COLLECTIONS
// =====================================================

const COLLECTIONS = {
    confessions: "confessions",
    hugots: "hugots",
    unsent: "unsentMessages"
};


// =====================================================
// HELPERS
// =====================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent =
        value === undefined || value === null
            ? ""
            : String(value);

    return div.innerHTML;
}


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


function getLikes(data) {

    const likes = Number(data.likes ?? 0);

    return Number.isFinite(likes)
        ? likes
        : 0;
}


function formatDate(timestamp) {

    if (!timestamp) {
        return "Recently filed";
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

        return "Recently filed";

    }

}


// =====================================================
// RECORD TYPE LABEL
// =====================================================

function getRecordLabel(type) {

    if (type === "CONFESSION") {
        return "CONFIDENTIAL CONFESSION";
    }

    if (type === "HUGOT") {
        return "EMOTIONAL RECORD";
    }

    if (type === "UNSENT MESSAGE") {
        return "UNSENT CORRESPONDENCE";
    }

    return "ARCHIVE RECORD";

}


// =====================================================
// RECORD SYMBOL
// No emoji — only Victorian text symbols
// =====================================================

function getRecordSymbol(type) {

    if (type === "CONFESSION") {
        return "PT";
    }

    if (type === "HUGOT") {
        return "PT";
    }

    if (type === "UNSENT MESSAGE") {
        return "PT";
    }

    return "PT";

}


// =====================================================
// VICTORIAN WATERMARK
// =====================================================

function createWatermark() {

    return `
        <div class="record-watermark" aria-hidden="true">

            <svg viewBox="0 0 180 180">

                <circle
                    cx="90"
                    cy="90"
                    r="65"
                ></circle>

                <circle
                    cx="90"
                    cy="90"
                    r="50"
                ></circle>

                <path
                    d="
                    M90 90
                    C65 72 70 45 91 43
                    C113 42 120 68 90 90Z
                    "
                ></path>

                <path
                    d="
                    M90 90
                    C112 73 136 85 130 105
                    C124 123 102 115 90 90Z
                    "
                ></path>

                <path
                    d="
                    M90 90
                    C71 111 47 99 52 80
                    C57 62 79 67 90 90Z
                    "
                ></path>

            </svg>

        </div>
    `;

}


// =====================================================
// CREATE VICTORIAN RECORD
// =====================================================

function createRecord(id, data, type, collectionName) {

    const record =
        document.createElement("article");

    record.className = "record";

    const text =
        escapeHTML(getPostText(data));

    const likes =
        getLikes(data);

    const date =
        escapeHTML(formatDate(data.createdAt));

    const label =
        escapeHTML(getRecordLabel(type));

    const symbol =
        escapeHTML(getRecordSymbol(type));

    record.dataset.recordId = id;

    record.innerHTML = `

        <div class="record-corner top-left">
            ❦
        </div>

        <div class="record-corner top-right">
            ❧
        </div>

        <div class="record-corner bottom-left">
            ❧
        </div>

        <div class="record-corner bottom-right">
            ❦
        </div>


        <div class="record-number">
            ${symbol}
            ${label}
        </div>


        <div class="record-text">
            ${text}
        </div>


        <div class="record-meta">

            <span>
                ${date}
            </span>

            <span>
                FILE NO. ${escapeHTML(id.slice(0, 6).toUpperCase())}
            </span>

        </div>


        ${createWatermark()}


        <div
            class="record-actions"
            style="
                position:relative;
                z-index:6;
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
                margin-top:18px;
                padding-top:12px;
                border-top:1px solid rgba(93,60,27,.25);
            "
        >

            <button
                type="button"
                class="record-action like-record"
                style="
                    border:1px solid #80602f;
                    background:rgba(247,229,193,.55);
                    color:#63451e;
                    padding:7px 12px;
                    font-family:var(--body);
                    font-size:7px;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                    cursor:pointer;
                "
            >
                LIKE ${likes}
            </button>


            <button
                type="button"
                class="record-action report-record"
                style="
                    border:1px solid #80602f;
                    background:transparent;
                    color:#63451e;
                    padding:7px 12px;
                    font-family:var(--body);
                    font-size:7px;
                    letter-spacing:1.5px;
                    text-transform:uppercase;
                    cursor:pointer;
                "
            >
                REPORT
            </button>

        </div>

    `;


    // =================================================
    // LIKE
    // =================================================

    const likeButton =
        record.querySelector(".like-record");


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


                const newLikes =
                    likes + 1;


                likeButton.textContent =
                    `LIKED ${newLikes}`;


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
                    "Unable to like this record right now."
                );

            }

        }
    );


    // =================================================
    // REPORT
    // =================================================

    const reportButton =
        record.querySelector(".report-record");


    reportButton.addEventListener(
        "click",
        function () {

            alert(
                "Thank you. Please report inappropriate content to the PlotTwisted administrator."
            );

        }
    );


    return record;

}


// =====================================================
// EMPTY RECORD
// =====================================================

function createEmptyRecord(type) {

    const empty =
        document.createElement("div");

    empty.className =
        "empty-record";


    let title =
        "NO RECORDS YET";

    let message =
        "The archive is waiting for its first record.";


    if (type === "CONFESSION") {

        title =
            "NO CONFESSIONS YET";

        message =
            "The confession archive is waiting for its first record.";

    }


    if (type === "HUGOT") {

        title =
            "NO HUGOT LINES YET";

        message =
            "The emotional archive is waiting for its first line.";

    }


    if (type === "UNSENT MESSAGE") {

        title =
            "NO LETTERS YET";

        message =
            "No unsent messages have entered the archive.";

    }


    empty.innerHTML = `

        <div class="empty-symbol">
            ⁂
        </div>

        <div class="empty-title">
            ${title}
        </div>

        <div class="empty-text">
            ${message}
        </div>

        <div class="empty-line">
            — END OF CURRENT FILE —
        </div>

    `;


    return empty;

}


// =====================================================
// ERROR RECORD
// =====================================================

function createErrorRecord() {

    const errorBox =
        document.createElement("div");

    errorBox.className =
        "empty-record";


    errorBox.innerHTML = `

        <div class="empty-symbol">
            ◇
        </div>

        <div class="empty-title">
            ARCHIVE UNAVAILABLE
        </div>

        <div class="empty-text">
            The records could not be retrieved at this time.
        </div>

        <div class="empty-line">
            — PLEASE TRY AGAIN LATER —
        </div>

    `;


    return errorBox;

}


// =====================================================
// LOAD FIRESTORE COLLECTION
// =====================================================

async function loadCollection(
    collectionName,
    elementId,
    type
) {

    const container =
        document.getElementById(elementId);


    if (!container) {

        console.warn(
            `Container #${elementId} was not found.`
        );

        return;

    }


    // Loading state

    container.innerHTML = `

        <div class="empty-record">

            <div class="empty-symbol">
                ◇
            </div>

            <div class="empty-title">
                OPENING ARCHIVE
            </div>

            <div class="empty-text">
                Retrieving recently filed records...
            </div>

            <div class="empty-line">
                — PLEASE WAIT —
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


        // Try newest first

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
                "Ordered query unavailable. Loading records without ordering.",
                orderError
            );


            snapshot =
                await getDocs(
                    collectionRef
                );

        }


        // Clear loading state

        container.innerHTML = "";


        if (snapshot.empty) {

            container.appendChild(
                createEmptyRecord(type)
            );

            return;

        }


        const posts = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                posts.push({

                    id:
                        documentSnapshot.id,

                    data:
                        data

                });

            }
        );


        // Sort newest first

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


        // Add Victorian records

        posts.forEach(
            post => {

                const record =
                    createRecord(
                        post.id,
                        post.data,
                        type,
                        collectionName
                    );


                container.appendChild(
                    record
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
            createErrorRecord()
        );

    }

}


// =====================================================
// LOAD ALL INDIVIDUAL ARCHIVES
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
// COMMUNITY RECORDS
// =====================================================

async function loadCommunity() {

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
// SAVE NEW RECORD
// =====================================================

async function saveRecord(
    collectionName,
    inputId,
    buttonId
) {

    const input =
        document.getElementById(inputId);


    const button =
        document.getElementById(buttonId);


    if (!input || !button) {

        console.warn(
            `Missing input or button: ${inputId}`
        );

        return;

    }


    button.addEventListener(
        "click",
        async function () {

            const text =
                input.value.trim();


            if (!text) {

                alert(
                    "Please write something first."
                );

                return;

            }


            const originalText =
                button.textContent;


            button.disabled =
                true;


            button.textContent =
                "FILING RECORD...";


            try {

                await addDoc(
                    collection(
                        db,
                        collectionName
                    ),
                    {

                        text:
                            text,

                        likes:
                            0,

                        createdAt:
                            serverTimestamp()

                    }
                );


                input.value = "";


                alert(
                    "Your record has been filed in the archive."
                );


                // Refresh archive records

                await loadIndividualLists();

                await loadCommunity();


            } catch (error) {

                console.error(
                    "Save error:",
                    error
                );


                alert(
                    "Unable to file your record right now. Please check your Firestore rules."
                );


            } finally {

                button.disabled =
                    false;


                button.textContent =
                    originalText;

            }

        }
    );

}


// =====================================================
// SIGN / DELUSION VOTING
// =====================================================

const voteButtons =
    document.querySelectorAll(".sign-vote");


async function loadVotes() {

    const signBar =
        document.getElementById("signBar");

    const maybeBar =
        document.getElementById("maybeBar");

    const deluluBar =
        document.getElementById("deluluBar");


    const signPercent =
        document.getElementById("signPercent");

    const maybePercent =
        document.getElementById("maybePercent");

    const deluluPercent =
        document.getElementById("deluluPercent");


    if (
        !signBar ||
        !maybeBar ||
        !deluluBar
    ) {
        return;
    }


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
                    data.vote === "sign"
                ) {
                    sign++;
                }


                if (
                    data.vote === "maybe"
                ) {
                    maybe++;
                }


                if (
                    data.vote === "delulu"
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


function updateVoteDisplay(
    sign,
    maybe,
    delulu
) {

    const signBar =
        document.getElementById("signBar");

    const maybeBar =
        document.getElementById("maybeBar");

    const deluluBar =
        document.getElementById("deluluBar");


    const signPercent =
        document.getElementById("signPercent");

    const maybePercent =
        document.getElementById("maybePercent");

    const deluluPercent =
        document.getElementById("deluluPercent");


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
// VOTE BUTTONS
// =====================================================

voteButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            async function () {

                const vote =
                    this.dataset.choice;


                if (
                    ![
                        "sign",
                        "maybe",
                        "delulu"
                    ].includes(vote)
                ) {

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

                    voteButtons.forEach(
                        btn => {
                            btn.disabled = true;
                        }
                    );


                    await addDoc(
                        collection(
                            db,
                            "signVotes"
                        ),
                        {

                            vote:
                                vote,

                            caseId:
                                "001",

                            createdAt:
                                serverTimestamp()

                        }
                    );


                    localStorage.setItem(
                        "plottwisted_vote_001",
                        "true"
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


                    voteButtons.forEach(
                        btn => {
                            btn.disabled = false;
                        }
                    );


                    alert(
                        "Unable to record your verdict right now."
                    );

                }

            }
        );

    }
);


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "PlotTwisted archive starting..."
        );


        // Save buttons

        await saveRecord(
            COLLECTIONS.confessions,
            "confessionInput",
            "submitConfession"
        );


        await saveRecord(
            COLLECTIONS.hugots,
            "hugotInput",
            "submitHugot"
        );


        await saveRecord(
            COLLECTIONS.unsent,
            "unsentInput",
            "submitUnsent"
        );


        // Load existing records

        await loadIndividualLists();

        await loadCommunity();


        // Load voting

        await loadVotes();


        console.log(
            "PlotTwisted archive ready."
        );

    }
);


// =====================================================
// REFRESH RECORDS WHEN PAGES OPEN
// =====================================================

const originalOpenInterface =
    window.openInterface;


if (
    typeof originalOpenInterface ===
    "function"
) {

    window.openInterface =
        async function (id) {

            originalOpenInterface(id);


            if (
                id === "confessions" ||
                id === "hugot" ||
                id === "unsent"
            ) {

                await loadIndividualLists();

            }

        };

}


// =====================================================
// REFRESH COMMUNITY WHEN OPENED
// =====================================================

const originalShowPage =
    window.showPage;


if (
    typeof originalShowPage ===
    "function"
) {

    window.showPage =
        async function (id) {

            originalShowPage(id);


            if (id === "community") {

                await loadCommunity();

            }

        };

                }
