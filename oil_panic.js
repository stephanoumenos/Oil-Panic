var borderProportion = 0.1;
var dropSpeed = 2;
var myGuyScale = 2;
var myDrop;
var myGuy;
var FPS = 60;
var hearts = 3;
var dropsCollected = 0;

function preload() {
    dropSprite = loadImage('assets/drop.png')
    characterSprites = [ loadImage('assets/character_empty.png')
                       , loadImage('assets/character_1drop.png')
                       , loadImage('assets/character_2drop.png')
                       , loadImage('assets/character_3drop.png')
                       ]
    emptyingLeftSprite = loadImage('assets/empty_left.png');
    emptyingRightSprite = loadImage('assets/empty_right.png');
    heartSprite = loadImage('assets/heart.png');
}

function setup() {
    for (i = 0; i < characterSprites.length; i++) {
        resizeImage(characterSprites[i], myGuyScale);
    }
    resizeImage(emptyingLeftSprite, myGuyScale);
    resizeImage(emptyingRightSprite, myGuyScale);
    resizeImage(heartSprite, 0.1);
    createCanvas(640, 360);
    myDrop = new Drop(640, 360);
    myGuy = new Character(640, 360);
    frameRate(FPS);
    textSize(20);
    textAlign(CENTER, CENTER);
}

function draw() {
    if (!hearts) {
        background(255, 238, 183);
        textSize(40);
        text("GAME OVER =/", 300, 150);
        frameRate(0);
        return;
    }
    if (keyIsDown(LEFT_ARROW)) {
        myGuy.moveLeft();
    } else if (keyIsDown(RIGHT_ARROW)) {
        myGuy.moveRight();
    }
    
    if (colides(myDrop, myGuy)) {
        myGuy.addDrop();
        myDrop.spawnNew();
    }

    background(255, 238, 183);
    drawHearts();
    drawScore();
    myDrop.move();
    myDrop.show();
    myGuy.show();
}

function drawHearts() {
    for (i = 0; i < hearts; i++) {
        image(heartSprite, 550+20*i, 25);
    }
}

function drawScore() {
    var score = dropsCollected * 100;
    text(`Score: ${score}`, 80, 30);
}

function colides(drop, guy) {
    if (  drop.x > guy.x
       && drop.x < guy.x + guy.guyImage.width
       && drop.y < guy.y
       && drop.y > guy.y - guy.guyImage.height
       ) {
        return true;
    }
    return false;
}

function Drop(xScreenSize, yScreenSize) {
    this.lowerLimit = borderProportion * xScreenSize;
    this.higherLimit = xScreenSize - borderProportion * xScreenSize;
    this.yScreenSize = yScreenSize;
    this.x = random(this.lowerLimit, this.higherLimit);
    this.y = 0;

    this.show = function() {
        image(dropSprite, this.x, this.y);
    }

    this.spawnNew = function() {
        this.y = 0;
        this.x = random(this.lowerLimit, this.higherLimit);
        this.waitALittle = 1.5*FPS;
    }

    this.move = function() {
        if (this.waitALittle) {
            this.waitALittle--;
            return;
        }
        this.y += dropSpeed;
        if (this.y > this.yScreenSize) {
            hearts--;
            this.spawnNew();
        }
    }
}

function resizeImage(image, factor) {
    // Resize the image by a factor without fucking its proportions up
    image.resize(factor*image.width, factor*image.height);
}

function Character(xScreenSize, yScreenSize) {
    this.lowerLimit = (borderProportion-0.05) * xScreenSize;
    this.higherLimit = xScreenSize - (borderProportion-0.05) * xScreenSize;
    this.numberOfDrops = 0;
    this.guyImage = characterSprites[this.numberOfDrops];
    this.x = xScreenSize/2;
    this.y = yScreenSize - this.guyImage.height - 5;
    this.emptyingBucketTime = 0;
    this.emptyingSprite;
    // Comment this thing
    this.mustReset = false;

    this.show = function() {
        if (this.emptyingBucketTime) {
            image(this.emptyingSprite, this.x, this.y);
            this.emptyingBucketTime--;
            return;
        }
        if (!this.mustReset && this.x <= this.lowerLimit) {
            image(emptyingLeftSprite, this.x, this.y);
            this.emptyBucket();
            this.emptyingSprite = emptyingLeftSprite;
            this.emptyingBucketTime = 1.5 * FPS;
            this.mustReset = true;
        } else if (!this.mustReset && this.x + this.guyImage.width >= this.higherLimit) {
            image(emptyingRightSprite, this.x, this.y);
            this.emptyBucket();
            this.emptyingSprite = emptyingRightSprite;
            this.emptyingBucketTime = 1.5 * FPS;
            this.mustReset = true;
        } else {
            image(this.guyImage, this.x, this.y)
        }
    }

    this.emptyBucket = function() {
        this.numberOfDrops = 0;
        this.guyImage = characterSprites[this.numberOfDrops];
        this.y = yScreenSize - this.guyImage.height - 5;
    }

    this.addDrop = function() {
        if (++this.numberOfDrops > 3) {
            hearts--;
            return;
        }
        dropsCollected++;
        this.guyImage = characterSprites[this.numberOfDrops];
        this.y = yScreenSize - this.guyImage.height - 5;
    }

    this.moveLeft = function() {
        if (!this.emptyingBucketTime && this.x > this.lowerLimit) {
            this.x -= 5;
        }

        if (this.x < this.higherLimit * 0.8) {
            this.mustReset = false;
        }
    }

    this.moveRight = function() {
        if (!this.emptyingBucketTime && this.x + this.guyImage.width < this.higherLimit) {
            this.x += 5;
        }

        if (this.x > this.lowerLimit/0.8) {
            this.mustReset = false;
        }
    }
}

function keyPressed() {
    if (!hearts) {
        reset();
    }
}

function reset() {
    hearts = 3;
    dropsCollected = 0;    
    myDrop = new Drop(640, 360);
    myGuy = new Character(640, 360);
    textSize(20);
    frameRate(FPS);
}