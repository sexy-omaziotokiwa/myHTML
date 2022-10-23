// color-box enable and disable
let colorIcons = document.querySelector(".color-icon"),
icons = document.querySelector(".icons");

icons.addEventListener("click", ()=> {
    colorIcons.classList.toggle("open");
})

let buttons = document.querySelectorAll(".btn");
for (var button of buttons) {
    button.addEventListener("click", (e)=> {
        let target = e.target;
        let open = document.querySelector(".open");
        if (open) open.classList.remove("open");
        document.querySelector(".active").classList.remove("active");
        target.classList.add("active");

        // switch colors (also day to night mode)
        let root = document.querySelector(":root"),
        dataColor = target.getAttribute("data-color"),
        //get data-color value from clicked button
        color = dataColor.split(" ");
        root.style.setProperty("--white", color[0]);
        root.style.setProperty("--black", color[1]);
        root.style.setProperty("--nav-main", color[2]);
        root.style.setProperty("--switchers-main", color[3]);
        root.style.setProperty("--light-bg", color[4]);

        let iconName = target.className.split(" ")[2],
        colorh3 = document.querySelector(".home-content h3"),
        colorP = document.querySelector(".home-content p");

        if (target.classList.contains("fa-moon")) {
            colorIcons.style.display = "none";
            target.classList.replace(iconName, "fa-sun");
            colorh3.style.color = "var(--black)";
            colorP.style.color = "var(--black)";
            document.querySelector("#hch2").style.color = "#76298D"; //purple
            document.querySelector("#sp").style.color = "#B53E20"; //orange
            
        }
        else if (target.classList.contains("fa-sun")) {
            target.classList.replace("fa-sun", "fa-moon");
            document.querySelector(".btn.blue").click();
            colorIcons.style.display = "block";
            colorh3.style.color = "#000";
            colorP.style.color = "#000";
            document.querySelector("#hch2").style.color = "#9136ec"; //purple
            document.querySelector("#sp").style.color = "#f75023"; //orange
        }
    })
}