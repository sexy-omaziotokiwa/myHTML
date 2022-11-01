const pics = document.getElementById("pics");
const pic1 = document.querySelector(".pic1");
const pic2 = document.querySelector(".pic2");
const pic3 = document.querySelector(".pic3");
const pic4 = document.querySelector(".pic4");
const pic5 = document.querySelector(".pic5");

async function test() {
    // debugger
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(pic2, pic3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(pic3, pic4);
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(pic4, pic5);
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// test()
//     .then( test2() )
//     .catch( err => {
//         console.log(err)
//     })

async function test2() {
    await new Promise(x => setTimeout(x, 1000));
    pics.style = "transform: translateX(300px)";
    test();
    
}

async function mouse_hover_delay() {

    await new Promise(resolve => setTimeout(resolve, 1000));
    pic1.addEventListener("mouseover",
        animation1(pic1, pic2),
        test(),
        await new Promise(resolve => setTimeout(resolve, 1000)),
        test2()
    );
}

function mouse_hover_func() {
    mouse_hover_delay();
    
    console.log("stop");

}



function animation1(first, second) {
    first.style = "opacity: 0; visibility: hidden";
    second.style = "opacity: 1; visibility: visible;";

}

