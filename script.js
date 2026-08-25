document.addEventListener("DOMContentLoaded", function () {

    const buttons = document.querySelectorAll("[data-slide]");
    const sections = document.querySelectorAll(".page-section");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetID = button.getAttribute("data-slide");
            const target = document.getElementById(targetID);

            if (!target) {
                console.log("Cannot find:", targetID);
                return;
            }

            // Hide every section
            sections.forEach(function (section) {
                section.classList.remove("active-section");
            });

            // Show selected section
            target.classList.add("active-section");

            // Go smoothly to the top
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    });

});
