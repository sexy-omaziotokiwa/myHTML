const header = document.querySelector("header");

//sticky scrollbar
window.addEventListener("scroll", function () {
    header.classList.toggle("sticky", window.scrollY > 0);
});