var frictionCoefficients = {}
            
function setFrictionCoefficients(a, b, static, kinetic) {
    var materials = [a, b];
    materials.sort();
    frictionCoefficients[materials] = [static, kinetic];
}
            
function getFrictionCoefficients(a, b) {
    var materials = [a, b];
    materials.sort();
    var out = frictionCoefficients[materials];
    if(out) {
        return out;
    } else {
        return [0, 0];
    }
}

class FrictionObject {
    constructor(pos, material) {
        this.pos = pos;
        this.material = material;

        this.mass = 10;
        this.size = new Vector(10, 10);
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
    }

    get newPos() {
        return this.pos.add(this.velocity);
    }

    render() {
        ctx.beginPath();
        ctx.rect(
            this.pos.x - this.size.x/2 - cameraPos.x,
            this.pos.y - this.size.y/2 - cameraPos.y,
            this.size.x, this.size.y
        );
        ctx.stroke();
        ctx.closePath();
    }

    tick() {
        this.acceleration.addSet(this.frictionForce);
        this.velocity.addSet(this.acceleration);
        this.pos.addSet(this.velocity);

        this.acceleration = new Vector(0, 0);
    }

    get contactVelocity() {
        return this.velocity;
    }

    get static() {
        return round(this.contactVelocity.mag, 10) == 0;
    }

    get weight() {
        return this.mass * gravity;
    }

    get frictionCoefficients() {
        return getFrictionCoefficients(surfaceMaterial, this.material);
    }

    get friction() {
        if(this.static) {
            return this.frictionCoefficients[0] * this.weight;
        } else {
            return this.frictionCoefficients[1] * this.weight;
        }
    }

    get frictionForce() {
        var v = this.velocity.add(this.acceleration);
        var mag = Math.min(v.mag, this.friction);
        return v.norm.mul(-mag);
    }
}

class Wheel extends FrictionObject {
    constructor(pos) {
        super(pos, "rubber");

        this.rollAngle = 0;
        this.rollSpeed = 0;
    }

    render() {
        ctx.beginPath();
        ctx.rect(
            this.pos.x - this.size.x/2 - cameraPos.x,
            this.pos.y - this.size.y/2 - cameraPos.y,
            this.size.x, this.size.y
        );
        ctx.stroke();
        if(this.static) {
            ctx.fillStyle = "#88cc88";
        } else {
            ctx.fillStyle = "#cc8888";
        }
        ctx.fill();
        ctx.closePath();
    }

    tick() {
        this.acceleration.addSet(this.frictionForce);
        this.velocity.addSet(this.acceleration);
        if(!this.static) {
            skidMarks.push([
                ...this.pos.arr(),
                ...this.newPos.arr()
            ]);
        }
        this.pos.addSet(this.velocity);

        this.acceleration = new Vector(0, 0);
    }

    get rollVector() {
        return angleToVector(this.rollAngle).mul(this.rollSpeed);
    }

    get contactVelocity() {
        return this.velocity.sub(this.rollVector);
    }

    // get static() {
    //     return this.contactVelocity.mag == 0;
    // }

    get frictionForce() {
        var v = this.contactVelocity.add(this.acceleration);
        var mag = Math.min(v.mag, this.friction);
        return v.norm.mul(-mag);
    }
}



setFrictionCoefficients("wood", "wood", 0.5, 0.25);
setFrictionCoefficients("rubber", "wood", 0.75, 0.5);

// console.log(frictionCoefficients);
// console.log(frictionCoefficients[["rubber", "wood"]]);

var surfaceMaterial = "wood";
var objects = [];

var gravity = 1;

var cameraPos = new Vector(0, 0);
var cameraSize = new Vector(1000, 500);
function cameraMax() {return cameraPos + cameraMax;}

var skidMarks = [];


// for(let i=5; i<10000; i+=10) {
//     objects.push(new FrictionObject(new Vector(5, i), 10, "wood"));
// }
// objects.push(new FrictionObject(new Vector(100, 100), "wood"));
objects.push(new Wheel(new Vector(0, 0)));



function drawCanvasLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function drawWorldLine(x1, y1, x2, y2) {
    drawCanvasLine(
        x1 - cameraPos.x,
        y1 - cameraPos.y,
        x2 - cameraPos.x,
        y2 - cameraPos.y,
    )
}

function drawGridLines(spacing) {
    var offset = cameraPos.mod(spacing);
    
    for(let x=spacing-offset.x; x<cameraSize.x; x+=spacing) {
        drawCanvasLine(x, 0, x, cameraSize.y);
    }
    
    for(let y=spacing-offset.y; y<cameraSize.y; y+=spacing) {
        drawCanvasLine(0, y, cameraSize.x, y);
    }
}

function drawSkidMarks() {
    for(let i=0; i<skidMarks.length; i++) {
        drawWorldLine(...skidMarks[i])
    }
}


            
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGridLines(200);


    drawSkidMarks();

    for(let i=0; i<objects.length; i++) {
        let o = objects[i]
        o.render();
    }


    var o = objects[0];
    
    sidePanel.innerHTML = `ticks: ${ticks}
position: ${o.pos.str()}
velocity: ${o.velocity.str()}    ${o.velocity.mag}
acceleration: ${o.acceleration.str()}    ${o.acceleration.mag}
friction: ${o.frictionForce.str()}    ${o.frictionForce.mag}
roll angle: ${mod(o.rollAngle, 2*Math.PI)}
roll speed: ${o.rollSpeed}`;
}

function update() {
    // User
    
    var o = objects[0];

    // Outside acceleration
    var movementVector = new Vector(0, 0);
    if(keysPressed["w"]) {
        movementVector.y -= 1;
    }
    if(keysPressed["a"]) {
        movementVector.x -= 1;
    }
    if(keysPressed["s"]) {
        movementVector.y += 1;
    }
    if(keysPressed["d"]) {
        movementVector.x += 1;
    }
    o.acceleration.addSet(movementVector.norm.mul(10));

    // Wheel kinematics
    if(keysPressed["ArrowUp"]) {
        o.rollSpeed += 1;
    }
    if(keysPressed["ArrowDown"]) {
        o.rollSpeed -= 1;
    }
    if(keysPressed["ArrowLeft"]) {
        o.rollAngle -= 0.1;
    }
    if(keysPressed["ArrowRight"]) {
        o.rollAngle += 0.1;
    }


    // Camera

    cameraPos.addSet(
        o.newPos.sub(cameraPos).sub(cameraSize.mul(0.5)).mul(0.4)
    );


    // Tick
    
    ticks++;
    
    for(let i=0; i<objects.length; i++) {
        let o = objects[i];
        o.tick();
    }
}



const keysPressed = {};
function keyDownHandler(e) {
    keysPressed[e.key] = true;
}
function keyUpHandler(e) {
    keysPressed[e.key] = false;
}

function clickHandler() {
    // paragraph.style.display = "block";
    // paragraph.innerHTML += "!";
}


            
var ticksPerSecond = 20;
var ticks = -1


var canvas = document.getElementById("main-canvas");
var ctx = canvas.getContext("2d");

var sidePanel = document.getElementById("side-panel");

// var horizontalForce = document.getElementById("horizontal-force");

            

setInterval(draw, 10);
setInterval(update, 1000/ticksPerSecond);

// https://www.w3schools.com/jsref/dom_obj_event.asp
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("click", clickHandler);

// JSON.stringify()
// JSON.parse()







// var m = ["wood", "rubber"];
// m.sort();

// console.log(m);