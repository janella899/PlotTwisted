document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll("[data-slide]");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetID = button.getAttribute("data-slide");
            const target = document.getElementById(targetID);

            if (!target) {
                console.log("Section not found: " + targetID);
                return;
            }

            document.querySelectorAll(".page-section").forEach(function (section) {
                section.classList.remove("active-section");
            });

            target.classList.add("active-section");

            window.scrollTo(0, 0);
        });

    });

});
