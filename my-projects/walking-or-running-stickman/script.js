const pics = document.getElementById("pics");
const pic1 = document.querySelector(".pic1");
const pic2 = document.querySelector(".pic2");
const pic3 = document.querySelector(".pic3");
const pic4 = document.querySelector(".pic4");
const pic5 = document.querySelector(".pic5");

const pic2_1 = document.querySelector(".pic2_1");
const pic3_1 = document.querySelector(".pic3_1");
const pic4_1 = document.querySelector(".pic4_1");
const pic5_1 = document.querySelector(".pic5_1");


async function test(two, three, four, five) {
    // debugger
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(two, three);
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(three, four);
    await new Promise(resolve => setTimeout(resolve, 1000));
    animation1(four, five);
    // await new Promise(resolve => setTimeout(resolve, 1000));
}

// test()
//     .then( test2() )
//     .catch( err => {
//         console.log(err)
//     })

async function test2() {
    animation1(pic5, pic2_1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    test(pic2_1, pic3_1, pic4_1, pic5_1);
    
}

async function mouse_hover_delay() {

    await new Promise(resolve => setTimeout(resolve, 1000));
    pic1.addEventListener("mouseover",
        animation1(pic1, pic2),
        test(pic2, pic3, pic4, pic5),
    );
    // debugger
    await new Promise(resolve => setTimeout(resolve, 1000));
    test2();
}

function mouse_hover_func() {
    mouse_hover_delay();
}



function animation1(first, second) {
    first.style = "opacity: 0; visibility: hidden";
    second.style = "opacity: 1; visibility: visible;";

}

