//MAIN LOOP
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var keys, friction, gravity;
keys = [];
friction = 0.8;
gravity = 0.3;

function getCanvasContext() {
    canvas = document.getElementById(Resource.CANVAS_NAME);
    ctx = canvas.getContext(Resource.CANVAS_CONTEXT);
    return ctx;
}

function getCanvasElement(){
    canvas = document.getElementById(Resource.CANVAS_NAME);
    return canvas;
}

class Resource{}
Resource.PLAYER_STANDING = "normal.png";
Resource.PLAYER_JUMPING = "jump.png";
Resource.CANVAS_NAME = "gamecanvas";
Resource.CANVAS_CONTEXT = "2d";

class Canvas {
    constructor() {
        this.canvas = document.getElementById(Resource.CANVAS_NAME);
        this.ctx = this.canvas.getContext(Resource.CANVAS_CONTEXT);
        if(Utility.getScreenWidth() > 800) {
            this.canvas.width = 800;
            this.needsTouchControls = false;
        }
        else {
            this.canvas.width = Utility.getScreenWidth() - 10;
            this.needsTouchControls = true;
        }
        this.canvas.height = 350;
    }
}

class PlayerController {

    jump(){
        if(!this.jumping) {
            this.jumping = true;
            this.velY = - this.speed*2;
        } else if (this.jumpingPowerUp){
            this.jumping = true;
            this.velY = - this.speed*2;
        }
    }

    right(){
        if (this.velX < this.speed) {
            this.velX++;
        }
    }

    left(){
        if (this.velX > - this.speed) {
            this.velX--;
        }
    }
}


class Player extends PlayerController {
    constructor(canvas, ctx) {
        super();
        this.canvas = canvas;
        this.ctx = ctx;
        this.setupPlayerModel();
        this.defaultValues();
    }

    setupPlayerModel(){
        this.im_model = new Image();
        this.im_model.src = Resource.PLAYER_STANDING;
        this.im_jump = new Image();
        this.im_jump.src = Resource.PLAYER_JUMPING;
    }

    defaultValues(){
        this.y = this.canvas.height-5;
        this.x = (this.canvas.width/2)/2;
        this.width = 30;
        this.height = 30;
        this.speed = 5.5;
        this.velX = 0;
        this.velY = 0;
        this.jumping = false;
        //this.walking = false;
        this.jumpingPowerUp = false;
    }

    checkCanvasLimits(){
        //x os
        if (this.x >= this.canvas.width-this.width) {
            this.x = this.canvas.width-this.width;
        } else if (this.x <= 0) {
            this.x = 0;
        }
        //y-os
        if (this.y >= this.canvas.height-this.height) {
            this.y = this.canvas.height-this.height;
        } else if (this.y <= 0) {
            this.y = 0;
        }
    }

    updatePlayerPosition(){
        if (this.ctx == null)
            return;
        this.velX *= friction;
        this.velY += gravity;

        this.x += this.velX;
        this.y += this.velY;

        this.checkCanvasLimits();

        if(this.y >= this.canvas.height - this.height){
            this.y = this.canvas.height - this.height;
            this.jumping = false;
            //player.walking = false;
        }

        if(!this.jumping) {
            this.ctx.drawImage(this.im_model, this.x, this.y);
        } else {
            this.ctx.drawImage(this.im_jump, this.x, this.y);
        }
    }

}


class Keys{
    static update(){
        Keys.UP_ARROW = keys[38];
        Keys.SPACE = keys[32];
        Keys.RIGHT_ARROW = keys[39];
        Keys.LEFT_ARROW = keys[37];
    }
}


class GameController extends Canvas{
    constructor(){
        super();
        this.frameCount = 0;
        this.collisionControl = new CollisionHandler(this.canvas.width);
        this.player = new Player(this.canvas, this.ctx);                                    // solve this
        this.objectControl = new ObjectGenController();
        this.score = new ScoreController();
        this.gameover = false;
        if(this.needsTouchControls)
            window.onload = GameController.generateAdditionalControls;
    }

    keyEventHandler(){
        if (Keys.UP_ARROW || Keys.SPACE) { // up arrow or space
            this.player.jump();
        }
        if (Keys.RIGHT_ARROW) {
            this.player.right();
        }
        if (Keys.LEFT_ARROW) {
            this.player.left();
        }
    }
    isCondEveryInterval(n){
        return (this.frameCount / n) % 1 == 0;
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static generateAdditionalControls() {

        Utility.generateNewParagraphElement("Are you left handed or right handed?", "controls_container", "centeredDiv");
        Utility.generateNewButton("Left", "controls_container", "buttonStyle");
        Utility.generateNewButton("Right", "controls_container", "buttonStyle");

    }

    endGame(){
        console.log("Game over.");
    } // GENERATE TEXT ON CANVAS
}

class Utility {
    static isBetween(no, a, b){
        return (no >= a && no <= b);
    }

    static randInt(a,b) {
        return Math.floor(Math.random()*(b-a+1)+a);
    }

    static getScreenWidth(){
        return window.innerWidth;
    }

    static generateNewParagraphElement(text, appendTo, classToApply){
        var element = document.createElement("P");
        element.appendChild(document.createTextNode(text));
        document.getElementById(appendTo).appendChild(element).classList.add(classToApply);
    }

    static generateNewButton(text, appendTo, classToApply) {
        var button = document.createElement("BUTTON");
        button.appendChild(document.createTextNode(text));
        document.getElementById(appendTo).appendChild(button).classList.add(classToApply);

        switch(text){
            case "Left":
                button.setAttribute("onclick", "ExtraControlsHandler.generateLeftHandedControls()");
                break;
            case "Right":
                button.setAttribute("onclick", "ExtraControlsHandler.generateRightHandedControls()");
                break;
            case "<":
                button.setAttribute("onclick", "window.game.player.left()");                                   // OPTIMIZE
                break;
            case ">":
                button.setAttribute("onclick", "window.game.player.right()");
                break;
            case "UP":
                button.setAttribute("onclick", "window.game.player.jump()");
                break;
        }
    }

    static deleteChildrenOnEl(name){
        var parentElement = document.getElementById(name);
        while (parentElement.hasChildNodes()) {
            parentElement.removeChild(parentElement.lastChild);
        }
    }

    static getCanvasElement(){}
    static getCanvasContext(){}
}


class ExtraControlsHandler {
    static generateLeftHandedControls() {
        console.log("Generate left.");
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(0);

    }

    static generateRightHandedControls() {
        console.log("Generate right.");
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(1);
    }

    static generateUpButton(mode){
        if(mode == 0){
            Utility.generateNewButton("UP", "controls_container", "upButton0");
        } else {
            Utility.generateNewButton("UP", "controls_container", "upButton1");
        }
    }
}

class ObjectGeneration {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ctx = getCanvasContext();
    }
}

class Obstacle extends ObjectGeneration {
    constructor(x,y){
        super(x,y);
    }
    updateObstaclePosition(speed=1){}
}

class ObstacleTypeZero extends Obstacle{
    constructor(x, y){
        super(x,y);
        this.obstacleSetup();
        this.genObstacle();
    }
    obstacleSetup() {
        this.width = 45;
        this.height = 150;
    }

    genObstacle() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    updateObstaclePosition(speed=1){
        this.x -= speed;
        this.genObstacle();
    }
}

class ObstacleTypeOne extends Obstacle{
    constructor(x,y) {
        super(x,y);
        this.obstacleSetup();
        this.genObstacle()
    }
    obstacleSetup() {
        this.width = 60;
        this.height = 200;
    }
    genObstacle() {
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    updateObstaclePosition(speed=1){
        this.x += speed;
        this.genObstacle();
    }
}

class Powerup extends ObjectGeneration {
    constructor(x,y){
        super(x,y);
        this.frame = game.frameCount;
        this.powerupSetup();

    }
    powerupSetup() {
        this.width = 25;
        this.height = 25;
    }

    keepActive(noFrames=400){
        if(game.frameCount - this.frame <= noFrames) { // && not collided | check for collision with player here
            this.genPowerUp();
        }
    }
    genPowerUp(){}
    activate(){}
}

class JumpPowerUp extends Powerup{
    constructor(x,y){
        super(x,y);
        this.genPowerUp();
    }

    genPowerUp() {
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    activate(){ // on collision with powerup object  |  CHANGE PLAYER APPEREANCE + duration
        game.player.speed = 3.5;
        game.player.jumpingPowerUp = true;
        setTimeout(JumpPowerUp.deactivateJumpPowerup, 4000);
        console.log("Jump activated.");
    }

    static deactivateJumpPowerup() {
        game.player.speed = 5.5;
        game.player.jumpingPowerUp = false;
        console.log("Jump deactivated.");
    }
}

class ScorePowerUp extends Powerup {
    constructor(x,y){
        super(x,y);
        this.genPowerUp();

    }
    genPowerUp(){
        this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    activate() {
        game.score.value += 5;
    }
}

class ScoreController {
    constructor(){
        this.value = 0;
        this.text = "Score : 0";
        this.canvas = getCanvasElement();
        this.ctx = getCanvasContext();

        this.x = this.canvas.width - 170;
        this.y = 35;


        this.ctx.font = "bold 20px Arial";
        this.generateScore();
    }

    generateScore() {
        this.ctx.fillStyle = "black";
        this.ctx.fillText(this.text, this.x, this.y);
    }

    updateScore(){
        this.generateScore();
        if(game.isCondEveryInterval(15)) {
            this.value += 0.25;                                                     // set score text, invert game after
            this.text = "SCORE : " + this.value;                                               // frame, check FPS- 60?
        }
    }

    writeScore(){}

}


class ObjectGenController {
    constructor() {
        this.obstaclesZero = [];
        this.obstaclesOne = [];
        this.powerups = [];
        this.canvas = getCanvasElement();
        this.x = this.canvas.width;
        this.y = this.canvas.height;
        this.speedIncreaseCoef = 1;
        this.intervalOne = 150;
        this.intervalTwo = 200;
        this.intervalCap = 85;

        this.genY = [this.y - 150, this.y - 350];


    }
    pushObject(){
        if (game.frameCount == 1 || game.isCondEveryInterval(this.intervalOne)){
            this.obstaclesZero.push(new ObstacleTypeZero(this.x, this.genY[0]));
        }
        if (game.isCondEveryInterval(this.intervalTwo)){
            this.obstaclesOne.push(new ObstacleTypeOne(-35, this.genY[1]));
        }
        if (game.isCondEveryInterval(1002)){
            this.powerups[0] = (new JumpPowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(130, 150))));
        }
        if (game.isCondEveryInterval(1200)){
            this.powerups[1] = (new ScorePowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(100, 140))));
        }
        if(game.isCondEveryInterval(2500)){
            this.swapY();
        }

    }

    swapY(){
        var zeroEl = this.genY[0];
        this.genY[0] = this.genY[1];
        this.genY[1] = zeroEl;

    }

    updatePowerupStatus(){
        if((this.powerups[0])) {
            this.powerups[0].keepActive();
        }
        if(this.powerups[1]){
            this.powerups[1].keepActive(600);
        }

    }

    increaseDifficulty(){
        if (game.isCondEveryInterval(600)){
            //alert([this.intervalTwo, this.intervalOne]);
            if(this.speedIncreaseCoef < 4.9)
                this.speedIncreaseCoef += 0.35;
            else
                this.speedIncreaseCoef = 4.9;

            if(this.intervalOne > this.intervalCap)
                this.intervalOne -= 8;
            else
                this.intervalOne = this.intervalCap;

            if (this.intervalTwo > this.intervalCap)
                this.intervalTwo -= 10;
            else
                this.intervalTwo = this.intervalCap;
        }
    }
}

class SplitScreen {

    constructor(screenWidth, noIntervals) {
        this.array = [];
        this.max = screenWidth;
        this.splitScreen(noIntervals);
    }

    splitScreen(intervals) {
        for(var i = 0; this.max > i;) {
            this.array.push(this.max/intervals + i);
            i = this.max/intervals + i;
        }
        this.array.splice(0, 0, 0);
    }
    getArray(){
        return this.array;
    }
}

class CollisionHandler extends SplitScreen {
    constructor(screenWidth) {
        super(screenWidth, 20);
        this.intervalsArray = this.getArray();                                                 // split leftright side.

        /*
        * this.intervalsArray = undefined;
        * this.inervalsRight = this.getArray();
        * this.inervalsLeft = SPLIT
        *
        * */
    }

    static checkCollisionOnTwoObjects(object1, object2) {
        return (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
            object1.y < object2.y + object2.height && object1.y + object1.height > object2.y)
    }

    checkInterval() {
        /*
        * if(game.player.x <= half)
        *   this.inervalsArray = this.intervalsLeft;
        * else
        *   this.intervalsArray = this.intervalsRight;
        * */

        for (var i = 0; i < this.intervalsArray.length - 1; i++) { // && skip frames
            if(Utility.isBetween(game.player.x, this.intervalsArray[i], this.intervalsArray[i + 1])){
                this.loopObstacles(game.objectControl.obstaclesZero, 2, i);
                this.loopObstacles(game.objectControl.obstaclesOne, 1.25, i);
                this.loopPowerUps(game.objectControl.powerups, i);
                break;
            }
            CollisionHandler.popExtra(game.objectControl.obstaclesZero, 0);
            CollisionHandler.popExtra(game.objectControl.obstaclesOne, 1);
        }
    }

    loopObstacles(obstacleArray, multiplier,  i) {
        for (var j = 0; j < obstacleArray.length; j+=1) {
            obstacleArray[j].updateObstaclePosition(multiplier * game.objectControl.speedIncreaseCoef);

            if(Utility.isBetween(obstacleArray[j].x, this.intervalsArray[i], this.intervalsArray[i+1])){
                if(CollisionHandler.checkCollisionOnTwoObjects(game.player, obstacleArray[j])) {
                    //console.log("Collision.");
                    game.gameover = true;
                }
            }
        }
    }

    loopPowerUps(powerupArray, i) {                                                                         // dnt loop
        for (var j = 0; j < powerupArray.length; j+=1) {
            try {
                if (Utility.isBetween(powerupArray[j].x, this.intervalsArray[i], this.intervalsArray[i + 1])) {
                    if (CollisionHandler.checkCollisionOnTwoObjects(game.player, powerupArray[j])) {
                        //console.log("Collision with powerup.");
                        powerupArray[j].activate();
                        powerupArray.splice(j, 1);
                        break;
                        //endGame();
                    }
                }
            } catch (TypeError){
                j = 0;
            }
        }
    }
    static popExtra(obstaclesArray, mode) {
        if(mode == 0) {
            if (obstaclesArray[1] && obstaclesArray[1].x <= -31)
                obstaclesArray.splice(0, 2);
        } else { // if mode == 1
            if(obstaclesArray[1] && obstaclesArray[1].x >= game.objectControl.canvas.width + 31)
                obstaclesArray.splice(0, 2);
        }
    }
}



game = new GameController();                                                                   // CREATE SPACE TO BEGIN

function update(){
    /*if(game.gameover){
        game.endGame();
        return;
    }*/
    game.clearCanvas();
    game.keyEventHandler();
    game.frameCount += 1;
    game.objectControl.pushObject();
    game.objectControl.increaseDifficulty();
    game.collisionControl.checkInterval();
    game.objectControl.updatePowerupStatus();
    game.player.updatePlayerPosition();
    game.score.updateScore();

    requestAnimationFrame(update);
}

// ADD LISTENERS
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    Keys.update();
});

document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
    Keys.update();
});

window.addEventListener("load",function(){
    update();
});
