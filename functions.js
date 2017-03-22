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


function randInt(a,b) {
    return Math.floor(Math.random()*(b-a+1)+a);
}

class Resource{}
Resource.PLAYER_STANDING = "normal.png";
Resource.PLAYER_JUMPING = "jump.png";
Resource.CANVAS_NAME = "gamecanvas";
Resource.CANVAS_CONTEXT = "2d";

class Canvas {
    constructor(width, height) {
        this.canvas = document.getElementById(Resource.CANVAS_NAME);
        this.ctx = this.canvas.getContext(Resource.CANVAS_CONTEXT);
        this.canvas.height = height;
        this.canvas.width = width;
    }
}

class Player{
    constructor(canvas, ctx) {
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
        if (this.ctx == null) return;
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
        super(800, 350);
        this.frameCount = 0;
        this.collisionControl = new CollisionHandler(this.canvas.width);
        this.player = new Player(this.canvas, this.ctx);
        this.objectControl = new ObjectGenController();

    }

    keyEventHandler(){
        if (Keys.UP_ARROW || Keys.SPACE) { // up arrow or space
            this.player.jump();
        }
        if (Keys.RIGHT_ARROW) { // right arrow
            this.player.right();
        }
        if (Keys.LEFT_ARROW) { // left arrow
            this.player.left();
        }
    }
    isCondEveryInterval(n){
        return (this.frameCount / n) % 1 == 0;
    }

    clearCanvas(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
    constructor(x,y){
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

    static activateJumpPowerup(){ // on collision with powerup object  |  CHANGE PLAYER APPEREANCE + duration
        game.player.speed = 3;
        game.player.jumpingPowerUp = true;
    }

    static deactivateJumpPowerup() {
        game.player.speed = 5;
        game.player.jumpingPowerUp = false;
    }
}


class ObjectGenController {
    constructor(){
        this.obstaclesZero = [];
        this.obstaclesOne = [];
        this.powerups = [];
        this.canvas = getCanvasElement();
        this.x = this.canvas.width;
        this.y = this.canvas.height;
        this.speedIncreaseCoef = 1;
        this.intervalOne = 150;
        this.intervalTwo = 200;
        this.intervalCap = 90;


    }
    pushObject(){
        if (game.frameCount == 1 || game.isCondEveryInterval(this.intervalOne)){
            this.obstaclesZero.push(new ObstacleTypeZero(this.x, this.y - 150))
        }
        if (game.isCondEveryInterval(this.intervalTwo)){
            this.obstaclesOne.push(new ObstacleTypeOne(-35, this.y - 350));
        }
        if (game.isCondEveryInterval(1002)){
            this.powerups[0] = (new JumpPowerUp(randInt(30, this.x - 30), this.y - (randInt(130, 150))));
        }

    }
    updateAllPosZero(){
        for (var i = 0; i < this.obstaclesZero.length; i += 1) {
            this.obstaclesZero[i].updateObstaclePosition(2 * this.speedIncreaseCoef);
        }
        if(this.obstaclesZero[1] && this.obstaclesZero[1].x <= -31){
            this.obstaclesZero.splice(0,2);
        }
    }
    updateAllPosOne(){
        for (var i = 0; i<this.obstaclesOne.length;i+=1){
            this.obstaclesOne[i].updateObstaclePosition(1.25 * this.speedIncreaseCoef);
        }
        if(this.obstaclesOne[1] && this.obstaclesOne[1].x >= this.canvas.width + 31){
            this.obstaclesOne.splice(0,2);
        }
    }

    updatePowerupStatus(){
        if(!(this.powerups.length == 0)) {
            this.powerups[0].keepActive();
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

    constructor(screenWidth, noIntervals){
        this.array = [];
        this.max = screenWidth;
        this.splitScreen(noIntervals);
    }

    splitScreen(chunks) {
        for(var i = 0; this.max > i; ){
            this.array.push(this.max/chunks + i);
            i = this.max/chunks + i;
        }
        this.array.splice(0, 0, 0);
    }
    getArray(){
        return this.array;
    }
}

class CollisionHandler extends SplitScreen {
    constructor(screenWidth) {
        super(screenWidth, 10);
        this.intervalsArray = this.getArray();
    }

    checkInterval() {
        //collisionBool = false;
        for (var i = 0; i < this.intervalsArray.length - 1; i++) { // && skip frames
            if (game.player.x >= this.intervalsArray[i] && game.player.x <= this.intervalsArray[i + 1]) {
                //console.log([this.intervalsArray[i], this.intervalsArray[i + 1]]);
                for (var j = 0; i < game.objectControl.obstaclesZero.length; j+=1) {
                    //alert(game.objectControl.obstaclesZero.length);
                    try {
                        if ((game.objectControl.obstaclesZero[j].x >= this.intervalsArray[i] && game.objectControl.obstaclesZero[j].x <= this.intervalsArray[i + 1])) {

                            console.log([j, "Same interval", game.objectControl.obstaclesZero[j].x]);
                        } else {
                            //console.log([j, "Not in the same interval", game.objectControl.obstaclesZero[j].x]);
                            /*if(checkCollisionsOnTwoObjects(player, obstacles[j]))
                             endGame();*/
                        }
                    } catch(TypeError) {
                        break;
                    }
                }
                //break;
            }
        }


    }
}

class ScorePowerUp{}
class ScoreController{}


game = new GameController();


function update(){
    game.clearCanvas();
    game.keyEventHandler();
    game.frameCount += 1;
    game.objectControl.pushObject();
    game.objectControl.updateAllPosZero();
    game.objectControl.updateAllPosOne();
    game.objectControl.updatePowerupStatus();
    game.player.updatePlayerPosition();
    game.objectControl.increaseDifficulty();
    game.collisionControl.checkInterval();

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
