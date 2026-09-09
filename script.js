// =====================================================
// CREATE AESTHETIC VICTORIAN ARCHIVE RECORD
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

    // Generate a display-only archive number.
    // This does NOT change the Firestore document ID.
    const recordNumber =
        String(
            Math.abs(
                Array.from(String(id))
                    .reduce(
                        (total, char) =>
                            total + char.charCodeAt(0),
                        0
                    )
            ) % 9999
        ).padStart(4, "0");


    // Determine archive label
    let archiveLabel =
        "ANONYMOUS RECORD";

    if (type === "CONFESSION") {
        archiveLabel =
            "ANONYMOUS CONFESSION";
    }

    if (type === "HUGOT") {
        archiveLabel =
            "PERSONAL HUGOT";
    }

    if (type === "UNSENT MESSAGE") {
        archiveLabel =
            "UNSENT MESSAGE";
    }


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
                        ${escapeHTML(
                            formatDate(data.createdAt)
                        )}
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
                    data-id="${escapeHTML(id)}"
                    data-collection="${escapeHTML(collectionName)}"
                    aria-label="Like this record">

                    <span class="button-symbol">♡</span>
                    <span class="like-count">${likes}</span>

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


                const count =
                    likeButton.querySelector(
                        ".like-count"
                    );


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


    // =================================================
    // REPORT BUTTON
    // =================================================

    const reportButton =
        card.querySelector(".report-button");


    reportButton.addEventListener(
        "click",
        function () {

            alert(
                "Thank you. Please report inappropriate content to the PlotTwisted administrator."
            );

        }
    );


    return card;
}
