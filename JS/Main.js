
var canvas = document.getElementById("mcanvas");
var ctx = canvas.getContext("2d");

var mouseX = -1, mouseY = -1;
var mouseDown = false;

document.onmousemove = function(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.x - rect.left;
    mouseY = e.y - rect.top;
}

document.onmousedown = function(e) {
    mouseDown = true;
}

document.onmouseup = function(e) {
    mouseDown = false;
}

document.ontouchstart = function(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches[0];
    mouseX = t.clientX - rect.left;
    mouseY = t.clientY - rect.top;
    mouseDown = true;
}

document.ontouchmove = function(e) {
    var rect = canvas.getBoundingClientRect();
    var t = e.touches[0];
    mouseX = t.clientX - rect.left;
    mouseY = t.clientY - rect.top;
}

document.ontouchend = function(e) {
    mouseDown = false;
}

function IsColliding(x, y, xtwo, ytwo, rad) {
    var dx = x - xtwo;
    var dy = y - ytwo;
    var dis = Math.sqrt(dx * dx + dy * dy);
    if (dis < rad) {
        return true;
    }
    return false;
}

class Part {
    x;
    y;
    w;
    h;
    rot;
    alpha;
    color;
    speed;
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.w = 10;
        this.h = 10;
        this.rot = Math.random() * 360.0;
        this.alpha = 1.0;
        this.color = color;
        this.speed = 2.5 + (Math.random() * 10.0);
    }
    Update() {
        this.x += Math.cos(this.rot) * this.speed;
        this.y += Math.sin(this.rot) * this.speed;
        this.alpha -= 0.025;
    }
    Render() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(-(this.w / 2), -(this.h / 2.0), this.w, this.h);
        ctx.restore();
    }
}

class Shape {
    x;
    y;
    w;
    h;
    angle;
    speed;
    dead;
    alpha;
    color;
    constructor(color) {
        var num = Math.random() * 100;
        if (num < 25) {
            this.x = -100.0;
            this.y = Math.random() * 600.0;
        } else if (num < 50) {
            this.x = 1100.0;
            this.y = Math.random() * 600.0;
        } else if (num < 75) {
            this.x = Math.random() * 1000.0;
            this.y = -100.0;
        } else {
            this.x = Math.random() * 1000.0;
            this.y = 700.0;
        }
        this.w = 100.0;
        this.h = 100.0;
        this.angle = 0.0;
        this.speed = 5.0 + (Math.random() * 10.0);
        this.dead = false;
        this.alpha = 1.0;
        this.color = color;
    }
    Update() {
        if (this.dead) {
            this.alpha -= 0.025;
        } else {
            this.angle = Math.atan2(300.0 - this.y, 500.0 - this.x);
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
        }
    }
    Render() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        if (this.dead) {
            ctx.globalAlpha = this.alpha;
        }
        ctx.fillRect(-(this.w / 2), -(this.h / 2), this.w, this.h);
        ctx.restore();
    }
}

class Beam {
    x;
    y;
    w;
    h;
    rot;
    alpha;
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.h = 20;
        var dx = 500.0 - this.x;
        var dy = 300.0 - this.y;
        this.w = Math.sqrt(dx * dx + dy * dy);
        this.rot = Math.atan2(dy, dx);
        this.alpha = 1.0;
    }
    Update() {
        this.alpha -= 0.025;
    }
    Render() {
        ctx.save();
        ctx.fillStyle = "#FF00FF";
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.globalAlpha = this.alpha;
        ctx.fillRect(0.0, 0.0, this.w, this.h);
        ctx.restore();
    }
}

class Player {
    x;
    y;
    w;
    h;
    rot;
    constructor() {
        this.x = 500.0;
        this.y = 300.0;
        this.w = 100.0;
        this.h = 100.0;
        this.rot = 0.0;
    }
    Update() {
        this.rot = Math.atan2(this.y - mouseY, this.x - mouseX);
    }
    Render() {
        ctx.save();
        ctx.fillStyle = "#FF00FF";
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}

var player = new Player();
var shapes = [];
var siter = 0, stime = 90;
var biter = 0, btime = 100;
var yiter = 0, ytime = 80;
var giter = 0, gtime = 60;
var citer = 0, ctime = 60;
var beams = [];
var parts = [];
var score = 0, best = 0;
var showMenu = true;
var deaditer = 0, deadtime = 120;
var isDead = false;

function Render() {
    ctx.clearRect(0, 0, 1000, 600);
    
    if (showMenu) {
        if (mouseX > 100 && mouseX < 900 && mouseY > 200 && mouseY < 400) {
            ctx.fillStyle = "#0000FF";
            if (mouseDown) {
                score = 0;
                showMenu = false;
            }
        } else {
            ctx.fillStyle = "#FFFF00";
        }
        ctx.fillRect(100, 200, 800, 200);
        ctx.font = "50px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Best: " + best, 100, 50);
        ctx.fillText("Last: " + score, 100, 150);
        ctx.fillText("PLAY", 425, 325);
        ctx.fillText("Idea: Jacob Pavey", 100, 450);
        ctx.fillText("Script: Luke Brown", 100, 550);
    } else {
        player.Render();
        for (var i = 0; i < beams.length; i++) {
            beams[i].Render();
        }
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].Render();
        }
        for (var i = 0; i < parts.length; i++) {
            parts[i].Render();
        }
        ctx.font = "60px Arial"
        ctx.fillText("Score: " + score, 100, 100);
    }
}

function Update() {
    if (!showMenu){
        if (isDead) {
            parts.push(new Part(Math.random() * 1000, Math.random() * 600, "#FF0000"));
            deaditer++;
            if (deaditer > deadtime) {
                shapes.splice(0, shapes.length);
                parts.splice(0, parts.lenght);
                beams.splice(0, beams.length);
                isDead = false;
                deaditer = 0;
                showMenu = true;
            }
        } else {    
            player.Update();
        }
        siter++;
        if (siter > stime) {
            shapes.push(new Shape("#FF0000"));
            siter = 0;
        }
        if (score > 20) { 
            biter++;
            if (biter > btime) {
                shapes.push(new Shape("#0000FF"));
                biter = 0;
            }
        }
        if (score > 30) {  
            yiter++;
            if (yiter > ytime) {
                shapes.push(new Shape("#FFFF00"));
                yiter = 0;
            }
        }
        if (score > 40) { 
            giter++;
            if (giter > gtime) {
                shapes.push(new Shape("#00FF00"));
                giter = 0;
            }
        }
        if (score > 50) { 
            citer++;
            if (citer > ctime) {
                shapes.push(new Shape("#00FFFF"));
                citer = 0;
            }
        }
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].Update();
            if (shapes[i].dead) {
                parts.push(new Part(shapes[i].x, shapes[i].y, shapes[i].color));
            }
            if (IsColliding(player.x, player.y, shapes[i].x, shapes[i].y, 75.0)) {
                isDead = true;
            }
            if (shapes[i].alpha < 0.1) {
                shapes.splice(i, 1);
            }
        }
        for (var i = 0; i < beams.length; i++) {
            beams[i].Update();
            if (beams[i].alpha < 0.1) {
                beams.splice(i, 1);
            }
        }
        if (mouseDown) {
            for (var i = 0; i < shapes.length; i++) {    
                if (shapes[i].dead) {
                    continue;
                }
                if (IsColliding(shapes[i].x, shapes[i].y, mouseX, mouseY, 75.0)) {
                    beams.push(new Beam(shapes[i].x, shapes[i].y));
                    for (var j = 0; j < 5; j++) {
                        parts.push(new Part(player.x, player.y, "#FF00FF"));
                    }
                    score++;
                    if (score > best) {
                        best = score;
                    }
                    mouseDown = false;
                    shapes[i].dead = true;
                    break;
                }
            }
        }
        for (var i = 0; i < parts.length; i++) {
            parts[i].Update();
            if (parts[i].alpha < 0.1) {
                parts.splice(i, 1);
            }
        }
    }
    Render();
}

setInterval(Update, 1000 / 30);