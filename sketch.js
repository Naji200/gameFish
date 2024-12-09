// ========== VARIABLES GLOBALES ==========
// Tableau principal contenant tous les poissons (boids)
const flock = [];

// Images pour les différentes entités
let fishImage;      // Image des poissons
let requinImage;    // Image du requin
let obstacleImage;  // Image des obstacles
let backgroundImage; // Image de fond

// Variables pour les contrôles UI
let alignSlider, cohesionSlider, separationSlider;
let labelNbBoids;

// Variables pour le comportement des requins
let target;         // Position cible (suit la souris)
let requins = [];   // Tableau contenant tous les requins
let obstacles = []; // Tableau contenant tous les obstacles

// Variables pour le contrôle des formations
let followCursor = false;   // Mode formation en pack autour du curseur
let snakeFormation = false; // Mode formation en ligne

// Variables pour le suivi du mouvement
let prevMouseX = 0;
let prevMouseY = 0;
let isMoving = false;
let leaderAtTarget = false;

// ========== CHARGEMENT DES RESSOURCES ==========
function preload() {
  // Chargement des images depuis le dossier assets
  fishImage = loadImage('assets/1.png');         // Image des poissons normaux
  requinImage = loadImage('assets/pngegg.png');  // Image du requin prédateur
  obstacleImage = loadImage('assets/2.png');     // Image des obstacles
  backgroundImage = loadImage('assets/background.jpg'); // Image de fond marine
}

// ========== INITIALISATION ==========
function setup() {
  createCanvas(1600, 700);

  // Quelques sliders pour régler les "poids" des trois comportements de flocking
  // flocking en anglais c'est "se rassembler"
  // rappel : tableauDesVehicules, min max val step posX posY propriété
  const posYSliderDeDepart = 10;
  creerUnSlider("Poids alignment", flock, 0, 2, 1.5, 0.1, 10, posYSliderDeDepart, "alignWeight");
  creerUnSlider("Poids cohesion", flock, 0, 2, 1, 0.1, 10, posYSliderDeDepart+30, "cohesionWeight");
  creerUnSlider("Poids séparation", flock, 0, 15, 3, 0.1, 10, posYSliderDeDepart+60,"separationWeight");
  creerUnSlider("Poids boundaries", flock, 0, 15, 10, 1, 10, posYSliderDeDepart+90,"boundariesWeight");
  
  creerUnSlider("Rayon des boids", flock, 4, 40, 6, 1, 10, posYSliderDeDepart+120,"r");
  creerUnSlider("Perception radius", flock, 15, 60, 25, 1, 10, posYSliderDeDepart+150,"perceptionRadius");

  // On créer les "boids". Un boid en anglais signifie "un oiseau" ou "un poisson"
  // Dans cet exemple c'est l'équivalent d'un véhicule dans les autres exemples
  for (let i = 0; i < 200; i++) {
    const b = new Boid(random(width), random(height), fishImage);
    b.r = random(8, 40);
    flock.push(b);
  }

  // Créer un label avec le nombre de boids présents à l'écran
   labelNbBoids = createP("Nombre de boids : " + flock.length);
  // couleur blanche
  labelNbBoids.style('color', 'white');
  labelNbBoids.position(10, posYSliderDeDepart+180);

  // target qui suit la souris
  target = createVector(mouseX, mouseY);
  target.r = 50;

  // requin prédateur initial
  let requin = new Boid(width/2, height/2, requinImage);
  requin.r = 40;
  requin.maxSpeed = 7;
  requin.maxForce = 0.5;
  requins.push(requin);
}

// ========== FONCTIONS UTILES ==========
function creerUnSlider(label, tabVehicules, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY+17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    tabVehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });

  return slider;
}

// ========== BOUCLE PRINCIPALE ==========
function draw() {
  // 1. Affichage du fond
  imageMode(CORNER);
  image(backgroundImage, 0, 0, width, height);

  // 2. Mise à jour du compteur de poissons
  labelNbBoids.html("Nombre de boids : " + flock.length);

  // 3. Gestion de la cible (curseur)
  target.x = mouseX;
  target.y = mouseY;
  fill("lightgreen");
  noStroke();
  ellipse(target.x, target.y, target.r, target.r);

  // Check if cursor is moving
  isMoving = (abs(mouseX - prevMouseX) > 0.1 || abs(mouseY - prevMouseY) > 0.1);
  prevMouseX = mouseX;
  prevMouseY = mouseY;

  // Draw obstacles
  obstacles.forEach(obstacle => {
    fill(0, 255, 0);
    noStroke();
    circle(obstacle.pos.x, obstacle.pos.y, obstacle.r * 2);
  });

  for (let boid of flock) {
    boid.flock(flock);
    boid.fleeWithTargetRadius(target);
    
    // Add obstacle avoidance for boids
    for (let obstacle of obstacles) {
      let avoidForce = boid.avoidObstacle(obstacle);
      avoidForce.mult(5);
      boid.applyForce(avoidForce);
    }

    boid.update();
    boid.show();
  }  

  // Update and draw sharks
  for (let i = 0; i < requins.length; i++) {
    let requin = requins[i];
    
    if (snakeFormation) {
      // Snake formation following cursor
      if (i === 0) {
        // Lead shark follows cursor
        let cursorPos = createVector(mouseX, mouseY);
        let distToCursor = p5.Vector.dist(requin.pos, cursorPos);
        
        // Check if leader has reached cursor
        leaderAtTarget = distToCursor < 5;
        
        if (!leaderAtTarget) {
          let seekForce = requin.seek(cursorPos);
          seekForce.mult(1.5);
          requin.applyForce(seekForce);
        } else {
          // Immediately stop the leader
          requin.vel.x = 0;
          requin.vel.y = 0;
          requin.acc.x = 0;
          requin.acc.y = 0;
        }

        // Debug visualization for leader
        if (Boid.debug) {
          // Draw perception radius
          stroke(255);
          noFill();
          circle(requin.pos.x, requin.pos.y, requin.perceptionRadius * 2);
          
          // Draw velocity vector
          stroke(255, 0, 0);
          line(requin.pos.x, requin.pos.y, 
               requin.pos.x + requin.vel.x * 10, 
               requin.pos.y + requin.vel.y * 10);
               
          // Draw target
          stroke(0, 255, 0);
          line(requin.pos.x, requin.pos.y, mouseX, mouseY);
        }
      } else {
        // Other sharks in the formation
        let leader = requins[i - 1];
        let desiredDistance = 5; // 5 pixel spacing between sharks

        if (leaderAtTarget) {
          // Immediately stop all following sharks
          requin.vel.x = 0;
          requin.vel.y = 0;
          requin.acc.x = 0;
          requin.acc.y = 0;
        } else {
          // Normal following behavior when leader is moving
          let offsetVector = leader.vel.copy();
          offsetVector.normalize();
          offsetVector.mult(-desiredDistance);
          let targetPos = p5.Vector.add(leader.pos, offsetVector);
          
          let seekForce = requin.seek(targetPos);
          seekForce.mult(1.5);
          requin.applyForce(seekForce);
        }

        // Debug visualization for followers
        if (Boid.debug) {
          // Draw perception radius
          stroke(255);
          noFill();
          circle(requin.pos.x, requin.pos.y, requin.perceptionRadius * 2);
          
          // Draw velocity vector
          stroke(255, 0, 0);
          line(requin.pos.x, requin.pos.y, 
               requin.pos.x + requin.vel.x * 10, 
               requin.pos.y + requin.vel.y * 10);
               
          // Draw line to leader
          stroke(0, 255, 0);
          line(requin.pos.x, requin.pos.y, leader.pos.x, leader.pos.y);
          
          // Draw desired spacing
          stroke(255, 255, 0);
          noFill();
          circle(requin.pos.x, requin.pos.y, desiredDistance * 2);
        }
      }
    } else if (followCursor) {
      // Pack formation around cursor
      let cursorPos = createVector(mouseX, mouseY);
      
      // Calculate desired position in circular formation around cursor
      let angle = (i * (360 / requins.length)) * (Math.PI / 180);
      let radius = 100; // Distance from cursor
      let offsetX = radius * Math.cos(angle);
      let offsetY = radius * Math.sin(angle);
      let desiredPos = createVector(cursorPos.x + offsetX, cursorPos.y + offsetY);
      
      // Seek towards position in formation
      let seekForce = requin.seek(desiredPos);
      seekForce.mult(1);
      requin.applyForce(seekForce);

      // Add separation from other sharks
      let separationForce = createVector(0, 0);
      for (let other of requins) {
        if (other !== requin) {
          let d = p5.Vector.dist(requin.pos, other.pos);
          if (d < 60) {
            let diff = p5.Vector.sub(requin.pos, other.pos);
            diff.normalize();
            diff.div(d);
            separationForce.add(diff);
          }
        }
      }
      
      if (separationForce.mag() > 0) {
        separationForce.normalize();
        separationForce.mult(requin.maxSpeed);
        separationForce.sub(requin.vel);
        separationForce.limit(requin.maxForce);
        separationForce.mult(2);
        requin.applyForce(separationForce);
      }

      // Add slight attraction to cursor to maintain formation
      let cursorAttraction = p5.Vector.sub(cursorPos, requin.pos);
      let distToCursor = cursorAttraction.mag();
      if (distToCursor > radius * 1.5) {
        cursorAttraction.normalize();
        cursorAttraction.mult(0.5);
        requin.applyForce(cursorAttraction);
      }
    } else {
      // Follow closest boid behavior
      let closest = requin.getVehiculeLePlusProche(flock);
      if (closest) {
        let d = p5.Vector.dist(requin.pos, closest.pos);
        if (d < 150) {
          let seekForce = requin.seek(closest.pos);
          seekForce.mult(2);
          requin.applyForce(seekForce);
        }
      }

      // Add some wandering behavior when no boids are nearby
      let wanderForce = requin.wander();
      wanderForce.mult(0.5);
      requin.applyForce(wanderForce);
    }

    // Add obstacle avoidance for sharks
    for (let obstacle of obstacles) {
      let avoidForce = requin.avoidObstacle(obstacle);
      avoidForce.mult(5);
      requin.applyForce(avoidForce);
    }

    // Check for eating boids
    let closest = requin.getVehiculeLePlusProche(flock);
    if (closest) {
      let d = p5.Vector.dist(requin.pos, closest.pos);
      if (d < 5) {
        let index = flock.indexOf(closest);
        flock.splice(index, 1);
      }
    }

    requin.edges();
    requin.update();
    requin.show();
  }

  // Afficher les obstacles
   for (let obstacle of obstacles) {
    imageMode(CENTER);
    image(obstacleImage, obstacle.pos.x, obstacle.pos.y, obstacle.r * 2, obstacle.r * 2);
  }

  // Afficher le texte d'instructions en bas de page
  textSize(16);
  textAlign(LEFT, BOTTOM);
  fill(255);
  let instructions = [
    "'r' : Ajouter un requin",
    "      'p' : Formation en pack",
    "            's' : Formation en serpent",
    "                       'o' : Ajouter un obstacle",
    "                             'd' : Mode debug"
  ];
  
  let startY = height - 20;
  let padding = 150;
  
  for (let i = 0; i < instructions.length; i++) {
    text(instructions[i], 20 + i * padding, startY);
  }
}

// ========== GESTION DES ENTRÉES UTILISATEUR ==========
function mouseDragged() {
  // Ajout d'un nouveau poisson à la position de la souris lors du drag
  const b = new Boid(mouseX, mouseY, fishImage);
  b.r = random(8, 40);
  flock.push(b);
}

function keyPressed() {
  if (key === 'd') {
    // Active/Désactive le mode debug pour voir les rayons et vecteurs
    Boid.debug = !Boid.debug;
  } else if (key === 'r') {
    // Ajoute un nouveau requin à une position aléatoire
    let newRequin = new Boid(random(width), random(height), requinImage);
    newRequin.r = 40;
    newRequin.maxSpeed = 7;
    newRequin.maxForce = 0.5;
    requins.push(newRequin);
  } else if (key === 'p') {
    // Active le mode formation en pack (désactive le mode serpent)
    followCursor = !followCursor;
    snakeFormation = false;
  } else if (key === 's') {
    // Active le mode formation en serpent (désactive le mode pack)
    snakeFormation = !snakeFormation;
    followCursor = false;
  } else if (key === 'o') {
    // Ajoute un nouvel obstacle à la position de la souris
    obstacles.push({
      pos: createVector(mouseX, mouseY),
      r: random(30, 80)  // Rayon aléatoire entre 30 et 80 pixels
    });
  }
}