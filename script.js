// =====================================================
// PLOTTWISTED — FINAL SCRIPT.JS
// Loads existing Firestore history from:
// confessions, hugots, posts, signDelusionPosts,
// signVotes, unsentMessages
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
// FIRESTORE COLLECTIONS
// =====================================================

const COLLECTIONS = {
    confessions: "confessions",
    hugots: "hugots",
    posts: "posts",
    signDelusionPosts: "signDelusionPosts",
    signVotes: "signVotes",
    unsentMessages: "unsentMessages"
};


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


    // LOAD EVERYTHING
    loadAllHistory();
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

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}


// =====================================================
// DATE FORMAT
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

        if (timestamp.seconds) {

            return new Date(
                timestamp.seconds * 1000
            ).toLocaleString();

        }

        return "JUST NOW";

    } catch {

        return "JUST NOW";

    }

}


// =====================================================
// GET TEXT FROM DIFFERENT FIRESTORE FORMATS
// =====================================================

function getPostText(data) {

    // Your old database uses "text"
    if (data.text !== undefined && data.text !== null) {
        return String(data.text);
    }

    // Your newer database uses "message"
    if (data.message !== undefined && data.message !== null) {
        return String(data.message);
    }

    // Other possible field names
    if (data.content !== undefined && data.content !== null) {
        return String(data.content);
    }

    if (data.confession !== undefined && data.confession !== null) {
        return String(data.confession);
    }

    if (data.hugot !== undefined && data.hugot !== null) {
        return String(data.hugot);
    }

    return "";
}


// =====================================================
// GET LIKES
// =====================================================

function getLikes(data) {

    if (
        data.likes !== undefined &&
        data.likes !== null
    ) {
        return Number(data.likes) || 0;
    }

    return 0;
}


// =====================================================
// CREATE NEW POST
// =====================================================

async function createPost(type, message) {

    const cleanMessage =
        String(message || "").trim();


    if (!cleanMessage) {

        alert("Write something first. ♡");

        return false;

    }


    try {

        let targetCollection;


        if (type === "CONFESSION") {

            targetCollection =
                COLLECTIONS.confessions;

        }

        else if (type === "HUGOT") {

            targetCollection =
                COLLECTIONS.hugots;

        }

        else if (type === "UNSENT MESSAGE") {

            targetCollection =
                COLLECTIONS.unsentMessages;

        }

        else {

            targetCollection =
                COLLECTIONS.posts;

        }


        await addDoc(
            collection(
                db,
                targetCollection
            ),
            {
                type: type,
                text: cleanMessage,
                message: cleanMessage,
                likes: 0,
                createdAt: serverTimestamp()
            }
        );


        alert(
            "Posted successfully! ✦\n\nEveryone can now see your post."
        );


        await loadAllHistory();

        return true;


    } catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        alert(
            "Upload failed.\n\n" +
            error.message
        );


        return false;

    }

}


// =====================================================
// CONFESSION FORM
// =====================================================

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
                    input.value
                );


            if (success) {
                input.value = "";
            }

        }
    );

}


// =====================================================
// LOAD ALL FIRESTORE HISTORY
// =====================================================

async function loadAllHistory() {

    console.log(
        "Loading PlotTwisted history..."
    );


    clearPostLists();


    // ---------------------------------------------
    // CONFESSIONS
    // ---------------------------------------------

    await loadCollection(
        COLLECTIONS.confessions,
        "CONFESSION",
        "confessionList"
    );


    // ---------------------------------------------
    // HUGOTS
    // ---------------------------------------------

    await loadCollection(
        COLLECTIONS.hugots,
        "HUGOT",
        "hugotList"
    );


    // ---------------------------------------------
    // UNSENT MESSAGES
    // ---------------------------------------------

    await loadCollection(
        COLLECTIONS.unsentMessages,
        "UNSENT MESSAGE",
        "unsentList"
    );


    // ---------------------------------------------
    // POSTS
    // ---------------------------------------------

    await loadCollection(
        COLLECTIONS.posts,
        "POST",
        null
    );


    // ---------------------------------------------
    // SIGN / DELUSION POSTS
    // ---------------------------------------------

    await loadCollection(
        COLLECTIONS.signDelusionPosts,
        "SIGN / DELUSION",
        null
    );


    console.log(
        "PlotTwisted history loaded."
    );

}


// =====================================================
// CLEAR LISTS
// =====================================================

function clearPostLists() {

    const lists = [
        "confessionList",
        "hugotList",
        "unsentList"
    ];


    lists.forEach(id => {

        const list =
            document.getElementById(id);

        if (list) {
            list.innerHTML = "";
        }

    });

}


// =====================================================
// LOAD ONE COLLECTION
// =====================================================

async function loadCollection(
    collectionName,
    defaultType,
    listId
) {

    try {

        const collectionRef =
            collection(
                db,
                collectionName
            );


        let snapshot;


        // Try newest first
        try {

            const postsQuery =
                query(
                    collectionRef,
                    orderBy(
                        "createdAt",
                        "desc"
                    )
                );

            snapshot =
                await getDocs(postsQuery);

        } catch (orderError) {

            // If old documents don't have createdAt,
            // load them without orderBy.

            console.warn(
                "Ordering failed for",
                collectionName,
                "Loading without order."
            );

            snapshot =
                await getDocs(
                    collectionRef
                );

        }


        console.log(
            collectionName,
            "documents:",
            snapshot.size
        );


        snapshot.forEach(
            postDoc => {

                const data =
                    postDoc.data();


                const text =
                    getPostText(data);


                // Skip completely empty documents
                if (!text.trim()) {
                    return;
                }


                const type =
                    String(
                        data.type ||
                        defaultType
                    ).toUpperCase();


                const card =
                    createPostCard(
                        postDoc.id,
                        data,
                        type,
                        collectionName
                    );


                // If this collection has its own list
                if (listId) {

                    const list =
                        document.getElementById(
                            listId
                        );


                    if (list) {

                        list.appendChild(card);

                    }

                }

                // Otherwise try to put generic posts
                // into a matching available list
                else {

                    appendGenericPost(
                        card,
                        type
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "FAILED TO LOAD:",
            collectionName,
            error
        );


        // Don't stop the other collections
        // from loading.

    }

}


// =====================================================
// APPEND GENERIC POST
// =====================================================

function appendGenericPost(
    card,
    type
) {

    const upper =
        String(type).toUpperCase();


    if (
        upper.includes("CONFESSION")
    ) {

        const list =
            document.getElementById(
                "confessionList"
            );

        if (list) {
            list.appendChild(card);
        }

        return;

    }


    if (
        upper.includes("HUGOT")
    ) {

        const list =
            document.getElementById(
                "hugotList"
            );

        if (list) {
            list.appendChild(card);
        }

        return;

    }


    if (
        upper.includes("UNSENT")
    ) {

        const list =
            document.getElementById(
                "unsentList"
            );

        if (list) {
            list.appendChild(card);
        }

        return;

    }


    // If there is a general post list
    const genericList =
        document.getElementById(
            "postList"
        );


    if (genericList) {

        genericList.appendChild(card);

    }

}


// =====================================================
// CREATE POST CARD
// =====================================================

function createPostCard(
    id,
    data,
    defaultType,
    collectionName
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-card";


    const type =
        escapeHTML(
            data.type ||
            defaultType ||
            "STORY"
        );


    const message =
        escapeHTML(
            getPostText(data)
        );


    const likes =
        getLikes(data);


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


    // LIKE
    const likeButton =
        card.querySelector(
            ".like-button"
        );


    if (likeButton) {

        likeButton.addEventListener(
            "click",
            async () => {

                await likePost(
                    id,
                    collectionName,
                    likeButton,
                    likes
                );

            }
        );

    }


    // REPORT
    const reportButton =
        card.querySelector(
            ".report-button"
        );


    if (reportButton) {

        reportButton.addEventListener(
            "click",
            () => {

                alert(
                    "Thank you for reporting this post. ♡"
                );

            }
        );

    }


    return card;

}


// =====================================================
// LIKE POST
// =====================================================

async function likePost(
    id,
    collectionName,
    button,
    currentLikes
) {

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


        button.textContent =
            `♡ ${currentLikes + 1}`;


        button.disabled =
            true;


    } catch (error) {

        console.error(
            "Like error:",
            error
        );

    }

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
                COLLECTIONS.signVotes
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


        loadVotes();


    } catch (error) {

        console.error(
            "Vote error:",
            error
        );


        alert(
            "Vote failed.\n\n" +
            error.message
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
                    COLLECTIONS.signVotes
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
                sign /
                total *
                100
            );


        const maybePercent =
            Math.round(
                maybe /
                total *
                100
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
    "Your friend suddenly becomes shy around you.",
    "Your friend might be waiting for you to make the first move.",
    "Your friend asks who your crush is. Suspicious.",
    "Your friend gets curious whenever you mention someone else.",
    "Your friend may secretly get jealous.",
    "Your friend might be hiding their feelings behind jokes.",
    "Your friend suddenly compliments you more often.",
    "Your friend starts teasing you about having a crush.",
    "Your friend finds random reasons to message you.",
    "They reply quickly but pretend they weren't waiting.",
    "They say you're just a friend, but act differently.",
    "They tease you more than everyone else.",
    "They ask about your type.",
    "They ask whether you're talking to someone.",
    "They might be testing your reaction.",
    "You accidentally make eye contact and neither looks away.",
    "You get paired together unexpectedly.",
    "You catch them looking at you.",
    "They smile the moment they see you.",
    "They save you a seat.",
    "They wait for you before leaving.",
    "They ask if you've already eaten.",
    "They offer to help even when you didn't ask.",
    "They remember something important to you.",
    "Maybe it's a sign. Maybe you're just hopeful.",
    "The signs are there. The question is whether they're intentional.",
    "You might be overthinking it... or maybe you're not.",
    "Maybe it's friendship. Maybe it's the beginning of something else.",
    "Your heart says yes. Your logic says wait.",
    "Or maybe that small moment meant everything.",
    "You almost confess but chicken out.",
    "Your friend almost tells you something important.",
    "You accidentally reveal your feelings.",
    "Someone asks you directly if you like your friend.",
    "You finally get the courage to say something.",
    "Your friend might confess before you do.",
    "Your friendship slowly starts feeling different.",
    "They become your favorite notification.",
    "You start missing them even when you just saw them.",
    "Your friendship becomes deeper than you expected.",
    "You start seeing them differently.",
    "Your best friendship could become your biggest plot twist.",
    "You didn't plan to fall for your friend... but here you are.",
    "Maybe your favorite person has been beside you all along.",
    "Sometimes the best love story starts with friendship.",
    "Maybe friendship was only the beginning.",
    "Your heart already decided before your brain caught up.",
    "You tell your friends you don't like them for the 50th time.",
    "You accidentally smile at your phone because of their message.",
    "Your friends already know who you're talking about.",
    "You deny everything while your face says otherwise.",
    "Maybe they're friendly with everyone, but why especially you?",
    "Maybe the person you're looking for is already beside you.",
    "Maybe they're waiting for you too.",
    "Maybe the signs were real after all.",
    "Maybe your story needs one more chapter.",
    "Maybe the biggest plot twist is that you both feel the same.",
    "Maybe this isn't delusion. Maybe it's the beginning.",
    "Maybe your friend is the plot twist you've been waiting for."
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


        text.style.opacity =
            "1";


        if (icon) {

            icon.style.transform =
                "rotate(0deg) scale(1)";

        }

    }, 450);

}


window.spinRoulette =
    spinRoulette;


// =====================================================
// END
// =====================================================

console.log(
    "♡ PLOTTWISTED SCRIPT LOADED SUCCESSFULLY ♡"
);
