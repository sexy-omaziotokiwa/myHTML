var scl = 1;
function Snake() {

    this.x = 0;
    this.y = 0;
    this.xspeed = 1;
    this.yspeed = 0;

    
    this.dir = function(x,y) {
        this.xspeed = x;
        this.yspeed = y;
    }

    this.update = function() {
        this.x = this.x + this.xspeed * scl;
        this.y = this.y + this.yspeed * scl;
        this.x = constrain(this.x, 0, width-scl);
        this.y = constrain(this.y, 0, height-scl);
    }

    this.show = function() {
        fill(255);
        rect(this.x, this.y, scl, scl);
        
    }
}



function setup() {
    createCanvas(400,400);
    sn = new Snake();
    //frameRate(10);
}


function draw() {
    background(51);
    sn.update();
    sn.show();
}

function keyPressed() {
    if (keyCode ===UP_ARROW) {
        sn.dir(0, -1);
    }
    else if (keyCode ===DOWN_ARROW) {
        sn.dir(0, 1);
    }
    else if (keyCode ===RIGHT_ARROW) {
        sn.dir(1, 0);
    }
    else if (keyCode ===LEFT_ARROW) {
        sn.dir(-1, 0);
    } 
}