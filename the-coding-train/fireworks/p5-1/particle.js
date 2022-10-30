function Particle(x, y) {
    this.pos = createVector(x, y); // position
    this.vel = createVector(0, 0); // velocity
    this.acc = createVector(0, 0); // acceleration

    this.applyForce = function(force) {
        this.acc.add(force);
    }

    this.update = function() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    this.show = function() {
        PointerEvent(this.pos.x, this.pos.y);
    }
}