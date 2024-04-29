
// Definition of the game board and cells size
let CellSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = CellSize * columns;
let boardHeight = CellSize * rows;
let context;

let shipWidth = CellSize * 2;
let shipHeight = CellSize;
let shipX = CellSize * columns / 2 - CellSize;
let shipY = CellSize * rows - CellSize * 2;
let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg;
let shipVelocityX = CellSize;

let alienArray = [];
let alienWidth = CellSize * 2;
let alienHeight = CellSize;
let alienX = CellSize;
let alienY = CellSize;
let alienImg;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienVelocityX = 1;

let bulletArray = [];
let bulletVelocityY = -10;

let score = 0;
let gameOver = false;

// Function called after page loading
window.onload = function() {
    // Get the canvas element by its id
    board = document.getElementById("board");
    board.width = boardWidth; 
    board.height = boardHeight; 
    context = board.getContext("2d"); 

    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    createAliens();

    // Start the game loop
    requestAnimationFrame(update);
    // Add event listeners for controlling the ship and shooting
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

// Function to update the game state
function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    // Clear the game board before drawing the new frame
    context.clearRect(0, 0, board.width, board.height);

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Draw the aliens
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // Check if the alien reaches the game board boundary, change its direction, and move all aliens down
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            // Draw the alien
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            // If the alien reaches the bottom boundary of the game board, set the gameOver flag to true
            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Update positions and draw bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Check for bullet collisions with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear the bullet array from used or out-of-screen bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); 
    }

    // If all aliens are destroyed, move to the next level
    if (alienCount == 0) {
        // Increase the number of aliens per level and their movement speed
        score += alienColumns * alienRows * 100; 
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); 
        alienRows = Math.min(alienRows + 1, rows - 4); 
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2; 
        } else {
            alienVelocityX -= 0.2; 
        }
        // Clear the arrays of aliens and bullets, create a new batch of aliens
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Display the current score on the game board
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

// Function to move the ship horizontally when arrow keys are pressed
function moveShip(e) { 
    if (gameOver) { 
        return; 
    } 
 
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) { 
        ship.x -= shipVelocityX; 
    } else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) { 
        ship.x += shipVelocityX; 
    } 
} 


// Function to create aliens
function createAliens() {
    // Loop through all possible alien positions and create them
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length; 
}

// Function for the ship to shoot when the spacebar is pressed
function shoot(e) {
    // If the game is over, exit the function
    if (gameOver) {
        return;
    }

    // If the spacebar is pressed, create a bullet and add it to the bullet array
    if (e.code == "Space") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32, 
            y: ship.y,
            width: CellSize / 8,
            height: CellSize / 2,
            used: false 
        }
        bulletArray.push(bullet); 
    }
}

// Function to detect collisions between objects
function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // The top-left corner of object 'a' does not reach the top-right corner of object 'b'
           a.x + a.width > b.x &&   // The top-right corner of object 'a' passes beyond the top-left corner of object 'b'
           a.y < b.y + b.height &&  // The top-left corner of object 'a' does not reach the bottom-left corner of object 'b'
           a.y + a.height > b.y;    // The bottom-left corner of object 'a' passes beyond the top-left corner of object 'b'
}
