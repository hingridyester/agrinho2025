// VARIÁVEIS GLOBAIS
let chickens = [];
let eggs = [];
let conveyor;
let truck;
let city = {
  population: 0,
  happiness: 50,
  eggsDelivered: 0,
  deliveryHistory: []
};
let isHoliday = false;
let dayCycle = 0;
let blink = true;
let blinkTimer = 0;
let feedBoost = false;

function setup() {
  createCanvas(1000, 600);
  frameRate(30);

  conveyor = {
    x: width / 4,
    y: height - 100,
    width: width / 2,
    speed: 2
  };

  truck = {
    x: conveyor.x + conveyor.width - 100,
    y: conveyor.y - 30,
    w: 100,
    h: 50,
    capacity: 5,
    loaded: 0,
    delivering: false,
    returning: false,
    update() {
      if (this.delivering) {
        this.x += 4;
        if (this.x > width) {
          city.deliveryHistory.push(this.loaded);
          city.eggsDelivered += this.loaded;
          city.population += this.loaded;
          city.happiness = min(100, city.happiness + this.loaded * 2);
          this.loaded = 0;
          this.delivering = false;
          this.returning = true;
        }
      } else if (this.returning) {
        this.x -= 4;
        if (this.x <= conveyor.x + conveyor.width - 100) {
          this.x = conveyor.x + conveyor.width - 100;
          this.returning = false;
        }
      }
    },
    collect(egg) {
      if (!this.delivering && !this.returning && this.loaded < this.capacity) {
        if (
          egg.position.x > this.x &&
          egg.position.x < this.x + this.w &&
          egg.position.y >= conveyor.y - 10
        ) {
          this.loaded++;
          return true;
        }
      }
      if (this.loaded >= this.capacity && !this.delivering) {
        this.delivering = true;
      }
      return false;
    },
    draw() {
      fill(100);
      rect(this.x, this.y, this.w, this.h, 10);
      fill(255);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(`${this.loaded}/${this.capacity}`, this.x + this.w / 2, this.y + this.h / 2);
    }
  };

  for (let i = 0; i < 3; i++) {
    chickens.push(new Chicken(150 + i * 120, 200));
  }

  let feedButton = createButton('Alimentar Galinhas');
  feedButton.position(20, 100);
  feedButton.mousePressed(() => {
    feedBoost = true;
    setTimeout(() => (feedBoost = false), 5000);
  });
}

function draw() {
  dayCycle = (dayCycle + 0.2) % 360;
  background(lerpColor(color('#87CEEB'), color('#001d3d'), dayCycle > 180 ? (dayCycle - 180) / 180 : 0));

  drawTitle();
  drawHenHouse();
  drawConveyor();
  drawTruck();
  updateChickens();
  updateEggs();
  drawCityProgress();
  drawUI();
  drawChart();

  truck.update();
}

function drawTitle() {
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Festejando Campo e Cidade - Granja do Agrinho", width / 2, 30);
}

function drawHenHouse() {
  fill(139, 69, 19);
  rect(100, 150, width - 200, 120);
  if (blinkTimer % 30 === 0) blink = !blink;
  blinkTimer++;

  if (blink) {
    fill(255, 0, 0);
    textSize(20);
    textAlign(CENTER);
    text("Galinha Chocadeira", width / 2, 140);
  }
}

function drawConveyor() {
  fill(160);
  rect(conveyor.x, conveyor.y, conveyor.width, 30);
  for (let x = conveyor.x; x < conveyor.x + conveyor.width; x += 40) {
    fill(100);
    rect(x, conveyor.y + 5, 30, 20);
  }
}

function drawTruck() {
  truck.draw();
}

function updateChickens() {
  chickens.forEach(chicken => {
    chicken.update();
    chicken.display();
    if (chicken.shouldLayEgg()) {
      eggs.push(new Egg(chicken.x, chicken.y));
    }
  });
}

function updateEggs() {
  for (let i = eggs.length - 1; i >= 0; i--) {
    eggs[i].update();
    eggs[i].display();
    if (truck.collect(eggs[i])) {
      eggs.splice(i, 1);
    } else if (eggs[i].x > width) {
      eggs.splice(i, 1);
    }
  }
}

function drawCityProgress() {
  fill(50);
  rect(width - 220, 80, 200, 20);
  fill(0, 200, 0);
  rect(width - 220, 80, map(city.happiness, 0, 100, 0, 200), 20);
}

function drawUI() {
  fill(0);
  textSize(14);
  textAlign(LEFT);
  text(`População: ${city.population}`, 20, height - 60);
  text(`Felicidade: ${city.happiness}%`, 20, height - 40);
  text(`Ovos Entregues: ${city.eggsDelivered}`, 20, height - 20);
}

function drawChart() {
  let chartX = 750;
  let chartY = 120;
  let chartW = 200;
  let chartH = 100;
  fill(240);
  stroke(0);
  rect(chartX, chartY, chartW, chartH);
  noStroke();
  fill(0);
  textSize(10);
  text("Histórico de Entregas", chartX + 10, chartY + 10);

  let barWidth = 10;
  for (let i = 0; i < city.deliveryHistory.length; i++) {
    let h = city.deliveryHistory[i] * 5;
    fill(100, 150, 255);
    rect(chartX + 10 + i * (barWidth + 2), chartY + chartH - h - 10, barWidth, h);
  }
}

class Chicken {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.resetTimer();
  }

  resetTimer() {
    this.timer = int(random(90, 180) / (feedBoost ? 2 : 1));
  }

  update() {
    this.timer--;
  }

  shouldLayEgg() {
    if (this.timer <= 0) {
      this.resetTimer();
      return true;
    }
    return false;
  }

  display() {
    fill(255);
    ellipse(this.x, this.y, 40, 30);
    ellipse(this.x + 15, this.y - 20, 20);
    fill(0);
    ellipse(this.x + 18, this.y - 22, 4);
  }
}

class Egg {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.falling = true;
  }

  update() {
    if (this.falling) {
      this.position.y += 3;
      if (this.position.y >= conveyor.y) {
        this.falling = false;
        this.position.y = conveyor.y;
      }
    } else {
      this.position.x += conveyor.speed;
    }
  }

  display() {
    fill(255, 255, 200);
    ellipse(this.position.x, this.position.y, 15, 20);
  }
}

