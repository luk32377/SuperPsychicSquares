
var canvas = document.getElementById("mcanvas");
var ctx = canvas.getContext("2d");
var canvasWidth = canvas.scrollWidth;
var canvasHeight = canvas.scrollHeight;
var scaleX = 1.0; //canvasWidth / 1000.0;
var scaleY = 1.0; //canvasHeight / 600.0;
var mouseX = 0, mouseY = 0;
var mouseDown = false, mouseClicked = false;

document.onmousemove = function(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  let sx = 1000.0 / canvasWidth;
  let sy = 600.0 / canvasHeight;
  mouseX *= sx;
  mouseY *= sy;
  //console.log("X: " + mouseX + "  Y: " + mouseY);
}

document.onmousedown = function(e) {
  mouseDown = true;
  //console.log("X: " + mouseX + "  Y: " + mouseY);
}

document.onmouseup = function(e) {
  mouseDown = false;
  mouseClicked = false;
}

document.ontouchstart = function(e) {
  e.preventDefault();
  var touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  mouseX = touch.clientX - rect.left;
  mouseY = touch.clientY - rect.top;
  let sx = 1000.0 / canvasWidth;
  let sy = 600.0 / canvasHeight;
  mouseX *= sx;
  mouseY *= sy;
  mouseDown = true;
  console.log("X: " + mouseX + "  Y: " + mouseY);
}

document.ontouchend = function(e) {
  mouseDown = false;
  mouseClicked = false;
}

class Part {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.w = 7.5;
    this.angle = Math.random() * 360;
    this.angle = this.angle * 3.14 / 180.0;
    this.speed = 2 + (Math.random() * 8);
    this.color = color;
    this.alpha = 1.0;
  }
  render() {
    ctx.save()
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x * scaleX, this.y * scaleY);
    ctx.fillRect(-(this.w / 2) * scaleX, -(this.w / 2) * scaleY,
     this.w * scaleX, this.w * scaleY);
    ctx.restore();
  }
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.alpha -= 0.015;
  }
}

class Player {
  constructor() {
    this.x = 500;
    this.y = 300;
    this.w = 100;
    this.rot = 0.0;
  }
  render() {
    ctx.fillStyle = "#FF00FF";
    ctx.save();
    ctx.translate(this.x * scaleX, this.y * scaleY);
    ctx.rotate(this.rot);
    ctx.fillRect(-(this.w / 2) * scaleX, -(this.w / 2) * scaleY,
    this.w * scaleX, this.w * scaleY);
    ctx.restore();
  }
  update() {
    this.rot = Math.atan2(mouseY - this.y, mouseX - this.x);
  }
};

function isColliding(x, y, xtwo, ytwo, rad) {
  let dx = x - xtwo;
  let dy = y - ytwo;
  let dis = Math.sqrt(dx * dx + dy * dy);
  if (dis < rad) {
    return true;
  }
  return false;
}

class Enemy {
  constructor (color) {
    this.x = -100;
    this.y = -100;
    this.w = 100;
    this.rot = 0;
    this.speed = 5;
    this.color = color;
    this.dead = false;
    this.alpha = 1.0;
    let num = Math.random() * 100;
    if (num < 25) {
      this.y = Math.random() * 600;
    } else if (num < 50) {
      this.x = Math.random() * 1000;
    } else if (num < 75) {
      this.x = 1100;
      this.y = Math.random() * 600;
    } else {
      this.x = Math.random() * 1000;
      this.y = 700;
    }
  }
  render() {
    ctx.save();
    ctx.translate(this.x * scaleX, this.y * scaleY);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.fillRect(-(this.w / 2) * scaleX, -(this.w / 2) * scaleY,
     this.w * scaleX, this.w * scaleY);
    if (this.dead) {
      ctx.fillStyle = "#FF00FF";
      let dy = 300 - this.y;
      let dx = 500 - this.x;
      ctx.fillRect(0, 0, Math.sqrt(dx * dx + dy * dy), 10 * scaleY);
    }
    ctx.restore();
  }
  update(px, py, parts) {
    if (mouseDown &&  !mouseClicked) {
      if (isColliding(this.x, this.y, mouseX, mouseY, this.w * 0.75)) {
        this.dead = true;
        mouseClicked = true;
      }
    }
    if (!this.dead) {
      this.rot = Math.atan2(py - this.y, px - this.x);
      this.x += Math.cos(this.rot) * this.speed;
      this.y += Math.sin(this.rot) * this.speed;
    } else {
      parts.push(new Part(this.x, this.y, this.color));
      parts.push(new Part(500.0, 300.0, "#FF00FF"));
      this.alpha -= 0.025;
    }
  }
}

const player = new Player();
const en = [];
const parts = [];
const stime = 90;
var iter = 0;
var dead = false;
const dtime = 120;
var diter = 0;

var greenTime = 360;
var yellowTime = greenTime * 2;
var blueTime = greenTime * 3;
var spawnIter = 0;

const gtime = 180;
const ytime = 120;
const btime = 160;
var giter = 0;
var yiter = 0;
var biter = 0;

var menu = true;
var menuColor = "#FFFF00";

var score = 0, best = 0;

function reset() {
  dead = false;
  score = 0;
  iter = 0;
  spawnIter = 0;
  giter = 0;
  yiter = 0;
  biter = 0;
  en.splice(0, en.length);
  parts.splice(0, parts.length);
}

function render() {
  ctx.clearRect(0, 0, 1100, 700);
  if (menu) {
    ctx.fillStyle = menuColor;
    ctx.fillRect(200 *  scaleX, 200 * scaleY, 600 * scaleX, 200 * scaleY);
    ctx.fillStyle = "#000000";
    ctx.font = "50px Helvetica";
    ctx.fillText("Play!", 450 * scaleX, 325 * scaleY);
    ctx.font = "50px Cursive";
    ctx.fillText("Idea: Jacob Pavey Script: Luke Brown", 100, 500);
  } else {
    player.render();
    for (var i = 0; i < en.length; i++) {
      en[i].render();
    }
    for (var i = 0; i < parts.length; i++) {
      parts[i].render();
    }
  }
  ctx.fillStyle = "#000000";
  ctx.font = "50px Helvetica";
  ctx.fillText("Score: " + score, 50 * scaleX, 75 * scaleY);
  ctx.fillText("Best: " + best, 50 * scaleX, 150 * scaleY);

}

function update() {
  if (menu) {
    if (mouseX > 200 && mouseX < 800 && mouseY > 200 && mouseY < 400) {
      menuColor = "#00AAFF";
      if (mouseDown) {
        reset();
        menu = false;
      }
    } else {
      menuColor = "#FFFF00";
    }
  } else if (dead) {
    parts.push(new Part(Math.random() * 1000, Math.random() * 600, "#FF0000"));
    diter++;
    if (diter > dtime) {
    if (score > best) {
      best = score;
    }
      menu = true;
    }
  } else {
    diter = 0;
    player.update();
    iter++;
    spawnIter++;
    giter++;
    yiter++;
    biter++;
    if (iter >= stime) {
      en.push(new Enemy("#FF0000"));
      if (spawnIter > greenTime) {
        if (giter > gtime) {
          en.push(new Enemy("#00FF00"));
        }
      }
      if (spawnIter > yellowTime) {
        if (yiter > ytime) {
          en.push(new Enemy("#FFFF00"));
        }
      }
      if (spawnIter > blueTime) {
        if (biter > btime) {
          en.push(new Enemy("#00AAFF"));
        }
      }
      iter = 0;
    }
    for (var i = 0; i < en.length; i++) {
      en[i].update(player.x, player.y, parts);
      if (isColliding(player.x, player.y, en[i].x, en[i].y, 50)) {
        dead = true;
      }
      if (en[i].alpha < 0.1) {
        en.splice(i, 1);
        score++;
        continue;
      }
    }
  }
  for (var i = 0; i < parts.length; i++) {
    parts[i].update();
    if (parts[i].alpha < 0.1) {
      parts.splice(i, 1);
      continue;
    }
  }
  render();
}

var mInterval = setInterval(update, 1000 / 30);
