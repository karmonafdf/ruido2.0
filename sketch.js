let font;
let tSizeTitle = 150;
let tSizeText = 30;
let tposXTitle = 75;
let tposYTitle = 150;
let pointCount = 0.5;
let speed = 10;
let comebackSpeed = 10;
let dia = 60; // Diámetro original
let diaOnClick = 1060; // 60 + 1000 cuando se hace clic
let randomPos = false;
let pointsDirection = "up";
let interactionDirection = -0.3;
let titlePoints = [];
let textPoints = [];
let paragraphs = [
  "Ruido: es un sonido no deseado y molesto. Es aquel, producido por la mezcla de ondas sonoras de distintas frecuencias y distintas amplitudes.",
  "El sonido es producido por una serie de variaciones de presión, en forma de vibraciones, que se propagan a través de los sólidos, los líquidos y los gases.",
  "Sonido: cualquier variación de presión que puede detectar el oído humano."
];

let mouseSize = 0.5;
let isMousePressed = false; // Estado del clic del mouse

function preload() {
  font = loadFont("AvenirNextLTPro-Demi.otf");
  soundEffect = loadSound("tv-static-6411.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();

  textFont(font);

  // Puntos del título
  let titlePointsArray = font.textToPoints("El Ruido", tposXTitle, tposYTitle, tSizeTitle, {
    sampleFactor: pointCount,
  });

  for (let i = 0; i < titlePointsArray.length; i++) {
    let pt = titlePointsArray[i];
    titlePoints.push(
      new Interact(pt.x, pt.y, speed, dia, randomPos, comebackSpeed, pointsDirection, interactionDirection)
    );
  }

  // Puntos de los párrafos
  let currentY = tposYTitle + 200; // Ajuste inicial para no sobreponer texto
  for (let i = 0; i < paragraphs.length; i++) {
    let words = paragraphs[i].split(" ");
    let currentX = tposXTitle;

    for (let word of words) {
      let wordWidth = textWidth(word + " ");
      if (currentX + wordWidth > width - 50) {
        // Si el texto se pasa, baja a la siguiente línea
        currentX = tposXTitle;
        currentY += tSizeText * 1.5;
      }

      let pointsArray = font.textToPoints(word, currentX, currentY, tSizeText, {
        sampleFactor: pointCount,
      });

      for (let j = 0; j < pointsArray.length; j++) {
        let pt = pointsArray[j];
        textPoints.push(
          new Interact(pt.x, pt.y, speed, dia, randomPos, comebackSpeed, pointsDirection, interactionDirection)
        );
      }

      currentX += wordWidth; // Avanza la posición X para el próximo texto
    }
    currentY += tSizeText * 2; // Espacio entre párrafos
  }
}

function draw() {
  if (isMousePressed) {
    background(0); // Fondo negro
    stroke(255); // Puntos blancos
  } else {
    background(255); // Fondo blanco
    stroke(0); // Puntos negros
  }

  // Cambia el diámetro de interacción dinámicamente
  if (mouseIsPressed) {
    dia = diaOnClick; // Aumenta el diámetro en 1000 px
  } else {
    dia = 60; // Restaura el diámetro original
  }

  for (let v of titlePoints) {
    v.dia = dia; // Actualiza el diámetro de interacción de los puntos
    v.update();
    v.show();
    v.behaviors();
  }

  for (let v of textPoints) {
    v.dia = dia; // Actualiza el diámetro de interacción de los puntos
    v.update();
    v.show();
    v.behaviors();
  }

  drawSpiral(mouseX, mouseY);
}

function drawSpiral(x, y) {
  push();
  translate(x, y);
  if (isMousePressed) {
    stroke(255); // Espiral blanca
  } else {
    stroke(0); // Espiral negra
  }
  strokeWeight(2);

  let numPoints = 30; // Número de puntos en la espiral
  let angleStep = TWO_PI / numPoints;
  let radiusIncrement = mouseSize; // Ajuste del tamaño de la espiral

  for (let i = 0; i < numPoints; i++) {
    let angle = i * angleStep;
    let radius = i * radiusIncrement;
    let px = cos(angle) * radius;
    let py = sin(angle) * radius;
    point(px, py);
  }
  pop();
}

function Interact(x, y, m, d, t, s, di, p) {
  this.home = t ? createVector(random(width), random(height)) : createVector(x, y);
  this.pos = this.home.copy();
  this.target = createVector(x, y);
  this.vel = di === "up" ? createVector(y, x) : createVector(0, y);
  this.acc = createVector();
  this.r = 8;
  this.maxSpeed = m;
  this.maxforce = 1;
  this.dia = d;
  this.come = s;
  this.dir = p;
}

Interact.prototype.behaviors = function () {
  let arrive = this.arrive(this.target);
  let mouse = createVector(mouseX, mouseY);
  let flee = this.flee(mouse);

  this.applyForce(arrive);
  this.applyForce(flee);
};

Interact.prototype.applyForce = function (f) {
  this.acc.add(f);
};

Interact.prototype.arrive = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();
  let speed = d < this.come ? map(d, 0, this.come, 0, this.maxSpeed) : this.maxSpeed;
  desired.setMag(speed);
  return p5.Vector.sub(desired, this.vel);
};

Interact.prototype.flee = function (target) {
  let desired = p5.Vector.sub(target, this.pos);
  let d = desired.mag();

  if (d < this.dia) {
    desired.setMag(this.maxSpeed);
    desired.mult(this.dir);
    return p5.Vector.sub(desired, this.vel);
  } else {
    return createVector(0, 0);
  }
};

Interact.prototype.update = function () {
  this.pos.add(this.vel);
  this.vel.add(this.acc);
  this.acc.mult(0);
};

Interact.prototype.show = function () {
  point(this.pos.x, this.pos.y);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  isMousePressed = true; // Activa el estado de clic
  soundEffect.loop(); // Comienza a reproducir el sonido en bucle
}

function mouseReleased() {
  isMousePressed = false; // Desactiva el estado de clic
  soundEffect.stop(); // Detiene el sonido al soltar el clic
}
