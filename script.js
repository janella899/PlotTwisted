import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

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
    apiKey: "AIzaSyCJ59V5ioK4DWp_mjYFy7NMMPPgjiHNeAE",
    authDomain: "plottwisted-c5551.firebaseapp.com",
    databaseURL: "https://plottwisted-c5551-default-rtdb.firebaseio.com",
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

const COLLECTIONS = {
    confessions: "confessions",
    hugots: "hugots",
    unsent: "unsentMessages"
};


// =====================================================
// SAFE TEXT
// =====================================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent =
        value == null ? "" : String(value);

    return div.innerHTML;
}


// =====================================================
// GET MESSAGE
// Works with old AND new Firestore records
// =====================================================

function getText(data) {

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
// DATE
// =====================================================

function getDate(timestamp) {

    if (!timestamp) {
        return "Recently filed";
    }

    try {

        let date;

        if (typeof timestamp.toDate === "function") {
            date = timestamp.toDate();
        } else if (timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000);
        } else {
            date = new Date(timestamp);
        }

        if (isNaN(date.getTime())) {
            return "Recently filed";
        }

        return date.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });

    } catch {

        return "Recently filed";

    }

}


// =====================================================
// TIMESTAMP FOR SORTING
// =====================================================

function getTime(data) {

    const timestamp = data.createdAt;

    if (!timestamp) {
        return 0;
    }

    if (typeof timestamp.toMillis === "function") {
        return timestamp.toMillis();
    }

    if (typeof timestamp.seconds === "number") {
        return timestamp.seconds * 1000;
    }

    const time = new Date(timestamp).getTime();

    return isNaN(time) ? 0 : time;

}


// =====================================================
// VICTORIAN RECORD
// =====================================================

function createVictorianRecord(
    id,
    data,
    type,
    collectionName
) {

    const record =
        document.createElement("article");

    record.className = "record";

    const text =
        escapeHTML(getText(data));

    const likes =
        Number(data.likes ?? 0);

    const date =
        escapeHTML(getDate(data.createdAt));

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
            ${escapeHTML(type)}
        </div>


        <div class="record-text">
            ${text}
        </div>


        <div class="record-meta">

            <span>
                FILED ${date}
            </span>

            <span>
                ARCHIVE NO. ${escapeHTML(
                    id.substring(0, 6).toUpperCase()
                )}
            </span>

        </div>


        <div class="record-actions">

            <button
                type="button"
                class="record-like"
            >
                LIKE ${likes}
            </button>

            <button
                type="button"
                class="record-report"
            >
                REPORT
            </button>

        </div>


        <div class="record-watermark">

            <svg
                viewBox="0 0 180 180"
                aria-hidden="true"
            >

                <circle
                    cx="90"
                    cy="90"
                    r="62"
                ></circle>

                <circle
                    cx="90"
                    cy="90"
                    r="48"
                ></circle>

                <path
                    d="
                    M90 91
                    C67 78 69 53 88 46
                    C108 39 121 62 90 91
                    "
                ></path>

                <path
                    d="
                    M90 91
                    C111 74 133 85 130 104
                    C127 124 103 121 90 91
                    "
                ></path>

                <path
                    d="
                    M90 91
                    C74 111 51 103 51 84
                    C51 65 75 67 90 91
                    "
                ></path>

            </svg>

        </div>

    `;


    // =================================================
    // LIKE
    // =================================================

    const likeButton =
        record.querySelector(".record-like");


    likeButton.addEventListener(
        "click",
        async () => {

            if (
                likeButton.dataset.liked === "true"
            ) {
                return;
            }

            likeButton.disabled = true;

            try {

                await updateDoc(
                    doc(
                        db,
                        collectionName,
                        id
                    ),
                    {
                        likes: increment(1)
                    }
                );

                likeButton.textContent =
                    `LIKED ${likes + 1}`;

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
        record.querySelector(".record-report");


    reportButton.addEventListener(
        "click",
        () => {

            alert(
                "Thank you. Please report inappropriate content to the PlotTwisted administrator."
            );

        }
    );


    return record;

}


// =====================================================
// ADD FORCED RECORD STYLING
// This makes the design work even if the original
// CSS is not reaching the Firebase-generated records.
// =====================================================

function addRecordStyles() {

    if (
        document.getElementById(
            "plotTwistedFirebaseRecordStyles"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");

    style.id =
        "plotTwistedFirebaseRecordStyles";


    style.textContent = `

        /* =========================================
           VICTORIAN FIRESTORE RECORD
        ========================================= */

        .record {
            position: relative !important;
            min-height: 265px !important;
            padding: 48px 34px 28px !important;
            box-sizing: border-box !important;

            background:
                linear-gradient(
                    135deg,
                    #f1dfbd 0%,
                    #e5cfaa 48%,
                    #d8bb8c 100%
                ) !important;

            color: #28191a !important;

            border: 1px solid #a77c45 !important;

            box-shadow:
                0 12px 28px rgba(0,0,0,.30),
                inset 0 0 0 1px rgba(255,255,255,.35)
                !important;

            overflow: hidden !important;

            transform: rotate(-0.4deg);

            isolation: isolate;
        }


        .record:nth-child(even) {
            transform: rotate(0.4deg);
        }


        /* Outer gold frame */

        .record::before {

            content: "";

            position: absolute;

            inset: 9px;

            border: 1px solid
                rgba(128,96,47,.75);

            pointer-events: none;

            z-index: 1;
        }


        /* Inner Victorian frame */

        .record::after {

            content: "";

            position: absolute;

            inset: 16px;

            border: 1px dashed
                rgba(128,96,47,.55);

            pointer-events: none;

            z-index: 1;
        }


        /* =========================================
           RECORD HEADER
        ========================================= */

        .record-number {

            position: relative;

            z-index: 5;

            display: inline-block;

            margin-bottom: 25px;

            padding: 7px 13px;

            border: 1px solid #80602f;

            background:
                rgba(255,244,214,.65);

            color: #63451e;

            font-family:
                "Poppins",
                sans-serif;

            font-size: 9px;

            font-weight: 600;

            letter-spacing: 2px;

            text-transform: uppercase;
        }


        /* =========================================
           RECORD MESSAGE
        ========================================= */

        .record-text {

            position: relative;

            z-index: 5;

            color: #28191a !important;

            font-family:
                "Cormorant Garamond",
                Georgia,
                serif !important;

            font-size: 22px !important;

            line-height: 1.55 !important;

            font-weight: 500;

            white-space: pre-wrap;

            overflow-wrap: anywhere;

            text-align: left;
        }


        /* =========================================
           RECORD META
        ========================================= */

        .record-meta {

            position: relative;

            z-index: 5;

            display: flex;

            justify-content: space-between;

            gap: 15px;

            margin-top: 28px;

            padding-top: 12px;

            border-top:
                1px solid
                rgba(128,96,47,.45);

            color: #63451e !important;

            font-family:
                "Poppins",
                sans-serif;

            font-size: 7px;

            letter-spacing: 1.3px;

            text-transform: uppercase;
        }


        /* =========================================
           ACTIONS
        ========================================= */

        .record-actions {

            position: relative;

            z-index: 7;

            display: flex;

            justify-content: space-between;

            gap: 10px;

            margin-top: 15px;
        }


        .record-like,
        .record-report {

            appearance: none;

            border:
                1px solid
                #80602f;

            background:
                rgba(255,244,214,.45);

            color:
                #63451e;

            padding:
                7px 12px;

            font-family:
                "Poppins",
                sans-serif;

            font-size: 7px;

            letter-spacing:
                1.4px;

            text-transform:
                uppercase;

            cursor: pointer;

            transition:
                .2s ease;
        }


        .record-like:hover,
        .record-report:hover {

            background:
                rgba(255,244,214,.85);

            transform:
                translateY(-1px);
        }


        .record-like:disabled {

            cursor:
                default;

            opacity:
                .65;
        }


        /* =========================================
           CORNER ORNAMENTS
        ========================================= */

        .record-corner {

            position: absolute;

            z-index: 4;

            color:
                rgba(128,96,47,.78);

            font-family:
                Georgia,
                serif;

            font-size: 27px;

            line-height: 1;
        }


        .record-corner.top-left {
            top: 18px;
            left: 20px;
        }


        .record-corner.top-right {
            top: 18px;
            right: 20px;
        }


        .record-corner.bottom-left {
            bottom: 14px;
            left: 20px;
        }


        .record-corner.bottom-right {
            bottom: 14px;
            right: 20px;
        }


        /* =========================================
           WATERMARK
        ========================================= */

        .record-watermark {

            position: absolute;

            right: 20px;

            bottom: 20px;

            width: 125px;

            height: 125px;

            z-index: 2;

            opacity: .13;

            pointer-events: none;
        }


        .record-watermark svg {

            width: 100%;

            height: 100%;

            fill: none;

            stroke:
                #80602f;

            stroke-width:
                1.2;
        }


        /* =========================================
           EMPTY RECORD
        ========================================= */

        .empty-record {

            padding: 60px 30px;

            text-align: center;

            border:
                1px solid
                rgba(198,161,94,.5);

            background:
                rgba(22,7,11,.28);

            color:
                #d0bba5;
        }


        .empty-symbol {

            color:
                #c6a15e;

            font-size: 25px;

            margin-bottom: 15px;
        }


        .empty-title {

            color:
                #f1d58e;

            font-family:
                "DM Serif Display",
                serif;

            font-size: 18px;

            letter-spacing: 2px;
        }


        .empty-text {

            margin-top: 8px;

            font-family:
                "Poppins",
                sans-serif;

            font-size: 9px;

            letter-spacing: 1px;
        }


        .empty-line {

            margin-top: 15px;

            color:
                #80602f;

            font-size: 8px;

            letter-spacing: 2px;
        }


        @media(max-width:700px) {

            .record {

                padding:
                    45px 23px 25px !important;

            }


            .record-text {

                font-size:
                    19px !important;

            }


            .record-meta {

                flex-direction:
                    column;

                gap:
                    5px;

            }

        }

    `;


    document.head.appendChild(style);

}


// =====================================================
// LOAD RECORDS
// =====================================================

async function getRecords(
    collectionName
) {

    const snapshot =
        await getDocs(
            collection(
                db,
                collectionName
            )
        );


    const records = [];


    snapshot.forEach(
        documentSnapshot => {

            records.push({

                id:
                    documentSnapshot.id,

                data:
                    documentSnapshot.data()

            });

        }
    );


    records.sort(
        (a, b) =>
            getTime(b.data) -
            getTime(a.data)
    );


    return records;

}


// =====================================================
// DISPLAY ARCHIVE RECORDS
// =====================================================

async function loadArchive(
    collectionName,
    containerId,
    type
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    try {

        const records =
            await getRecords(
                collectionName
            );


        container.innerHTML = "";


        if (records.length === 0) {

            const empty =
                document.createElement("div");

            empty.className =
                "empty-record";

            empty.innerHTML = `

                <div class="empty-symbol">
                    ⁂
                </div>

                <div class="empty-title">
                    NO RECORDS YET
                </div>

                <div class="empty-text">
                    The archive is waiting for its first entry.
                </div>

                <div class="empty-line">
                    — END OF CURRENT FILE —
                </div>

            `;

            container.appendChild(
                empty
            );

            return;

        }


        records.forEach(
            record => {

                container.appendChild(

                    createVictorianRecord(
                        record.id,
                        record.data,
                        type,
                        collectionName
                    )

                );

            }
        );


    } catch (error) {

        console.error(
            `Unable to load ${collectionName}:`,
            error
        );


        container.innerHTML = `

            <div class="empty-record">

                <div class="empty-symbol">
                    ◇
                </div>

                <div class="empty-title">
                    ARCHIVE UNAVAILABLE
                </div>

                <div class="empty-text">
                    Unable to retrieve the records.
                </div>

                <div class="empty-line">
                    — PLEASE TRY AGAIN —
                </div>

            </div>

        `;

    }

}


// =====================================================
// LOAD ALL ARCHIVES
// =====================================================

async function loadAllArchives() {

    await Promise.all([

        loadArchive(
            COLLECTIONS.confessions,
            "confessionList",
            "CONFESSION"
        ),

        loadArchive(
            COLLECTIONS.hugots,
            "hugotList",
            "HUGOT"
        ),

        loadArchive(
            COLLECTIONS.unsent,
            "unsentList",
            "UNSENT MESSAGE"
        )

    ]);

}


// =====================================================
// COMMUNITY DISPLAY
// =====================================================

async function loadCommunityRecords() {

    const sections = [

        {
            collection:
                COLLECTIONS.confessions,

            id:
                "communityConfessions",

            type:
                "CONFESSION"
        },

        {
            collection:
                COLLECTIONS.hugots,

            id:
                "communityHugots",

            type:
                "HUGOT"
        },

        {
            collection:
                COLLECTIONS.unsent,

            id:
                "communityUnsent",

            type:
                "UNSENT MESSAGE"
        }

    ];


    for (
        const section of sections
    ) {

        const container =
            document.getElementById(
                section.id
            );


        if (!container) {
            continue;
        }


        try {

            const records =
                await getRecords(
                    section.collection
                );


            container.innerHTML = "";


            if (records.length === 0) {

                container.innerHTML = `

                    <p>
                        No records have been filed yet.
                    </p>

                `;

                continue;

            }


            records.forEach(
                record => {

                    const wrapper =
                        document.createElement("div");


                    wrapper.className =
                        "community-record";


                    wrapper.innerHTML = `

                        <div class="community-record-label">
                            ${escapeHTML(section.type)}
                        </div>

                        <p class="community-record-text">
                            ${escapeHTML(
                                getText(record.data)
                            )}
                        </p>

                        <div class="community-record-date">
                            ${escapeHTML(
                                getDate(
                                    record.data.createdAt
                                )
                            )}
                        </div>

                    `;


                    container.appendChild(
                        wrapper
                    );

                }
            );


        } catch (error) {

            console.error(
                "Community error:",
                error
            );

        }

    }

}


// =====================================================
// COMMUNITY CSS
// =====================================================

function addCommunityStyles() {

    const style =
        document.createElement("style");


    style.textContent = `

        .community-record {

            margin:
                12px 0;

            padding:
                17px;

            border:
                1px solid
                rgba(198,161,94,.35);

            background:
                rgba(22,7,11,.30);

        }


        .community-record-label {

            color:
                #f1d58e;

            font-family:
                "Poppins",
                sans-serif;

            font-size:
                7px;

            letter-spacing:
                2px;

            margin-bottom:
                10px;

        }


        .community-record-text {

            color:
                #ead9b8;

            font-family:
                "Cormorant Garamond",
                Georgia,
                serif;

            font-size:
                18px;

            line-height:
                1.5;

            white-space:
                pre-wrap;

            overflow-wrap:
                anywhere;

        }


        .community-record-date {

            margin-top:
                10px;

            color:
                #a98d72;

            font-family:
                "Poppins",
                sans-serif;

            font-size:
                7px;

            letter-spacing:
                1px;

            text-transform:
                uppercase;

        }

    `;


    document.head.appendChild(style);

}


// =====================================================
// SUBMIT RECORD
// =====================================================

function setupSubmission(
    collectionName,
    inputId,
    buttonId
) {

    const input =
        document.getElementById(
            inputId
        );


    const button =
        document.getElementById(
            buttonId
        );


    if (!input || !button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            const text =
                input.value.trim();


            if (!text) {

                alert(
                    "Please write something first."
                );

                return;

            }


            const original =
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


                await loadAllArchives();

                await loadCommunityRecords();


                alert(
                    "Your record has been filed."
                );


            } catch (error) {

                console.error(
                    "Submission error:",
                    error
                );


                alert(
                    "Unable to file your record right now."
                );

            }


            button.disabled =
                false;


            button.textContent =
                original;

        }
    );

}


// =====================================================
// FIRESTORE VOTING
// =====================================================

async function loadVotes() {

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


    if (!signBar) {
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


                if (data.vote === "sign") {
                    sign++;
                }

                if (data.vote === "maybe") {
                    maybe++;
                }

                if (data.vote === "delulu") {
                    delulu++;
                }

            }
        );


        const total =
            sign +
            maybe +
            delulu;


        if (total === 0) {

            sign = 62;
            maybe = 25;
            delulu = 13;

        } else {

            sign =
                Math.round(
                    (sign / total) * 100
                );

            maybe =
                Math.round(
                    (maybe / total) * 100
                );

            delulu =
                100 -
                sign -
                maybe;

        }


        signBar.style.width =
            `${sign}%`;

        maybeBar.style.width =
            `${maybe}%`;

        deluluBar.style.width =
            `${delulu}%`;


        if (signPercent) {
            signPercent.textContent =
                `${sign}%`;
        }

        if (maybePercent) {
            maybePercent.textContent =
                `${maybe}%`;
        }

        if (deluluPercent) {
            deluluPercent.textContent =
                `${delulu}%`;
        }


    } catch (error) {

        console.error(
            "Vote loading error:",
            error
        );

    }

}


// =====================================================
// VOTE BUTTONS
// =====================================================

function setupVoting() {

    const buttons =
        document.querySelectorAll(
            ".sign-vote"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const choice =
                        button.dataset.choice;


                    if (!choice) {
                        return;
                    }


                    if (
                        localStorage.getItem(
                            "plottwisted_vote_001"
                        )
                    ) {

                        alert(
                            "You already voted on this case."
                        );

                        return;

                    }


                    buttons.forEach(
                        btn => {
                            btn.disabled = true;
                        }
                    );


                    try {

                        await addDoc(
                            collection(
                                db,
                                "signVotes"
                            ),
                            {

                                vote:
                                    choice,

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


                        buttons.forEach(
                            btn => {
                                btn.disabled =
                                    false;
                            }
                        );


                        alert(
                            "Unable to record your vote."
                        );

                    }

                }
            );

        }
    );

}


// =====================================================
// START
// =====================================================

async function startPlotTwisted() {

    console.log(
        "PlotTwisted Firestore starting..."
    );


    // Force the Victorian record design

    addRecordStyles();

    addCommunityStyles();


    // Submission buttons

    setupSubmission(
        COLLECTIONS.confessions,
        "confessionInput",
        "submitConfession"
    );


    setupSubmission(
        COLLECTIONS.hugots,
        "hugotInput",
        "submitHugot"
    );


    setupSubmission(
        COLLECTIONS.unsent,
        "unsentInput",
        "submitUnsent"
    );


    // Existing records

    await loadAllArchives();

    await loadCommunityRecords();


    // Voting

    setupVoting();

    await loadVotes();


    console.log(
        "PlotTwisted Firestore ready."
    );

}


if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startPlotTwisted,
        { once: true }
    );

} else {

    startPlotTwisted();

        }
