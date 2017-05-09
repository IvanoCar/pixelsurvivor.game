(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

var keys, friction, gravity, game;
keys = [];
friction = 0.8;
gravity = 0.3;



class Resource{}
Resource.CANVAS_NAME = "gamecanvas";
Resource.CANVAS_CONTEXT = "2d";
Resource.PLAYER_STANDING = "resources/images/player/normal.png";
Resource.PLAYER_JUMPING = "resources/images/player/jump.png";
Resource.PLAYER_NORMAL_P = "resources/images/player/normal_jp.png";
Resource.PLAYER_JUMPING_P = "resources/images/player/jump_jp.png";
Resource.OBSTACLE0_IMAGE = "resources/images/obstacles/type0.svg";
Resource.OBSTACLE1_IMAGE = "resources/images/obstacles/type1.svg";
Resource.JUMP_POWERUP = "resources/images/powerups/jumpPowerup.png";
Resource.SCORE_POWERUP = "resources/images/powerups/scorePowerup.png";


class Canvas {

    constructor() {
        //Utility.generateCanvas();
        //this.canvas = document.getElementById(Resource.CANVAS_NAME);
        this.canvas = Utility.generateCanvas();
        this.ctx = this.canvas.getContext(Resource.CANVAS_CONTEXT);
        if(Utility.getScreenWidth() > 800) {
            this.canvas.width = 800;
            this.needsTouchControls = false;
            this.sizeCoef = 1;

        } else {
            this.canvas.width = Utility.getScreenWidth() - 10;
            this.needsTouchControls = true;
            this.sizeCoef = 0.65;
        }

        if(Utility.getScreenHeight() < 500) {
            this.canvas.height = 300;
        } else {
            this.canvas.height = 350;
        }
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

    right(moveby=1){
        if (this.velX < this.speed) {
            this.velX+= moveby;
        }
    }

    left(moveby=1){
        if (this.velX > - this.speed) {
            this.velX-= moveby;
        }
    }
}


class Player extends PlayerController {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext(Resource.CANVAS_CONTEXT);
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
        this.speed = 5.7;
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

        this.velX *= friction;
        this.velY += gravity;

        this.x += this.velX;
        this.y += this.velY;

        this.checkCanvasLimits();

        if(this.y >= this.canvas.height - this.height){
            this.y = this.canvas.height - this.height;
            this.jumping = false;
        }

        if(!this.jumping) {
            this.ctx.drawImage(this.im_model, this.x, this.y, this.width, this.height);
        } else {
            this.ctx.drawImage(this.im_jump, this.x, this.y, this.width, this.height);
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
        this.setupMainGameElements();
    }

    setupMainGameElements(){
        this.frameCount = 0;
        this.collisionControl = new CollisionHandler();
        this.player = new Player(this.canvas);
        this.objectControl = new ObjectGenController(this.canvas);
        this.score = new ScoreController(this.canvas);
        this.info = new InfoText(this.canvas);
        this.gameover = false;
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

    static getScreenHeight(){
        return window.innerHeight;
    }

    static generateNewDiv(appendTo, classToApply) {                                                                 //?
        var element = document.createElement("div");
        document.getElementById(appendTo).appendChild(element).classList.add(classToApply);
    }

    static removeElementByClass(className) {
        document.getElementsByClassName(className)[0].remove();
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
                button.setAttribute("onclick", "window.game.player.left(7)");                                   // OPTIMIZE
                break;
            case ">":
                button.setAttribute("onclick", "window.game.player.right(7)");
                break;
            case "UP":
                button.setAttribute("onclick", "window.game.player.jump()");
                break;
            case "RESTART":
                button.setAttribute("onclick", "Game.restart()");
                break;
            case "START":
                button.setAttribute("onclick", "Game.startGame()");
                break;
            case "GIVE EXTRA CONTROLS":
                button.setAttribute("onclick","ExtraControlsHandler.giveButtons()");
                break;
            case "REMOVE BUTTONS":
                button.setAttribute("onclick", "ExtraControlsHandler.removeButtons()");
                break;
            case "SWITCH":
                button.setAttribute("onclick", "ExtraControlsHandler.switchControls()");
                break;
        }
    }

    static generateCanvas(){
        var newCanvas = document.createElement("CANVAS");
        newCanvas.setAttribute("class", "centered");
        newCanvas.setAttribute("id", "gamecanvas");
        document.getElementById("game_container").appendChild(newCanvas);
        return newCanvas;
    }

    static deleteChildrenOnEl(name){
        var parentElement = document.getElementById(name);
        while (parentElement.hasChildNodes()) {
            parentElement.removeChild(parentElement.lastChild);
        }
    }

    static getCanvasContext(){
        return document.getElementById(Resource.CANVAS_NAME).getContext(Resource.CANVAS_CONTEXT);
    }
}


class ExtraControlsHandler {
    static generateLeftHandedControls() {
        console.log("Generate left.");
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(0);
        Utility.generateNewButton("SWITCH", "controls_container", "switchButton");

        update();
    }

    static generateRightHandedControls() {
        console.log("Generate right.");
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(1);
        Utility.generateNewButton("SWITCH", "controls_container", "switchButton");


        update();
    }

    static generateUpButton(mode){
        if(mode == 0){
            Utility.generateNewButton("UP", "controls_container", "upButton0");
        } else {
            Utility.generateNewButton("UP", "controls_container", "upButton1");
        }
    }

    static generateAdditionalControls() {

        Utility.generateNewParagraphElement("Are you left handed or right handed?", "controls_container", "centeredDiv");
        Utility.generateNewButton("Left", "controls_container", "buttonStyle");
        Utility.generateNewButton("Right", "controls_container", "buttonStyle");

    }

    static generateButtonXtraControl(){
        Utility.generateNewButton("GIVE EXTRA CONTROLS", "extrabuttons", "addButton");
    }

    static giveButtons(){
        Utility.deleteChildrenOnEl("extrabuttons");
        ExtraControlsHandler.generateAdditionalControls();
        Utility.generateNewButton("REMOVE BUTTONS", "extrabuttons", "removeButton");
    }

    static removeButtons() {
        Utility.deleteChildrenOnEl("extrabuttons");
        Utility.deleteChildrenOnEl("controls_container");
        ExtraControlsHandler.generateButtonXtraControl();
    }

    static switchControls() {
        if (document.getElementsByClassName("upButton0")[0] != undefined){
            /*Utility.deleteChildrenOnEl("controls_container");
            ExtraControlsHandler.generateRightHandedControls();*/
            Utility.removeElementByClass("upButton0");
            ExtraControlsHandler.generateUpButton(1);

        } else { //if (document.getElementsByClassName("upButton1")[0] != undefined){
            /*Utility.deleteChildrenOnEl("controls_container");
            ExtraControlsHandler.generateLeftHandedControls();*/
            Utility.removeElementByClass("upButton1");
            ExtraControlsHandler.generateUpButton(0);
        }
    }
}

class ObjectGeneration {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ctx = Utility.getCanvasContext();
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
        this.width = 45 * game.sizeCoef;
        this.height = 200;

        this.obst = new Image();
        this.obst.src = Resource.OBSTACLE0_IMAGE;
    }

    genObstacle() {
        //this.ctx.fillStyle = "blue";
        //this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.drawImage(this.obst, this.x, this.y, this.width, this.height)
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
        this.width = 60 * game.sizeCoef;
        this.height = 200;
        this.obst = new Image();
        this.obst.src = Resource.OBSTACLE1_IMAGE;
    }
    genObstacle() {
        //this.ctx.fillStyle = "red";
        //this.ctx.fillRect(this.x, this.y, this.width, this.height);
        this.ctx.drawImage(this.obst, this.x, this.y, this.width, this.height)

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
        this.active = false;
        this.powerupSetup();

    }
    powerupSetup() {
        this.width = 30;
        this.height = 30;
    }

    keepActive(noFrames=400){
        if(game.frameCount - this.frame <= noFrames) {
            this.genPowerUp();
            this.active = true;
        } else {
            this.active = false;
        }
    }
    genPowerUp(){}
    activate(){}
}

class JumpPowerUp extends Powerup{
    constructor(x,y){
        super(x,y);
        this.jp = new Image();
        this.jp.src = Resource.JUMP_POWERUP;
        this.genPowerUp();
    }

    genPowerUp() {
        /*this.ctx.fillStyle = "green";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);*/
        this.ctx.drawImage(this.jp, this.x, this.y, this.width, this.height);
    }

    activate(){                             // on collision with powerup object  |  CHANGE PLAYER APPEREANCE + duration 4 s jump powerup
        game.info.jumpPowerupActivatedInfo();
        game.player.im_model.src = Resource.PLAYER_NORMAL_P;
        game.player.im_jump.src = Resource.PLAYER_JUMPING_P;
        game.player.speed = 4.2;
        game.player.jumpingPowerUp = true;
        setTimeout(JumpPowerUp.deactivateJumpPowerup, 4000);
    }

    static deactivateJumpPowerup() {
        game.player.im_model.src = Resource.PLAYER_STANDING;
        game.player.im_jump.src = Resource.PLAYER_JUMPING;
        game.player.speed = 5.7;
        game.player.jumpingPowerUp = false;
    }
}

class ScorePowerUp extends Powerup {
    constructor(x,y){
        super(x,y);
        this.scp = new Image();
        this.scp.src = Resource.SCORE_POWERUP;
        this.genPowerUp();

    }
    genPowerUp(){
        /*this.ctx.fillStyle = "red";
        this.ctx.fillRect(this.x, this.y, this.width, this.height);*/
        this.ctx.drawImage(this.scp, this.x, this.y, this.width, this.height);
    }

    activate() {
        game.score.value += 5;
        game.info.scorePowerupActivatedInfo();
    }
}

class CanvasWriter {
    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext(Resource.CANVAS_CONTEXT);
    }

    write(color="black"){
        this.ctx.fillStyle = color;
        this.ctx.fillText(this.text, this.x, this.y);
    }

    setup(){}
}

class ScoreController extends CanvasWriter {
    constructor(canvas){
        super(canvas);
        this.setup();
        this.write();
    }

    setup(){
        this.value = 0;
        this.text = "Score : 0";
        this.x = this.canvas.width - 170;
        this.y = 35;
    }

    updateScore(){
        this.ctx.font = "bold 20px Arial";
        this.write();
        if(game.isCondEveryInterval(15)) {
            this.value += 0.25;
            this.text = "SCORE : " + this.value;
        }
    }
}

class InfoText extends CanvasWriter{
    constructor(canvas) {
        super(canvas);
        this.setup()
    }

    setup(){
        this.x = 30;
        this.y = this.canvas.height - 10;
    }

    jumpPowerupActivatedInfo(){
        this.frameJ = game.frameCount;
        this.text = "JUMP POWERUP ACTIVATED";
        this.write();
    }

    scorePowerupActivatedInfo(){
        this.frameS = game.frameCount;
        this.text = "SCORE + 5 seconds";
        this.write();
    }

    keepVisible(noFrames, frameActivated){
        if(game.frameCount - frameActivated <= noFrames) {
            this.ctx.font = "bold 16px Arial";
            this.write();
        }
    }

    updateInfo(){
        this.keepVisible(150, this.frameJ);
        this.keepVisible(150, this.frameS);
    }
}


class Cookie {
    static set(name, value) {
        document.cookie = name + "=" + value;
    }

    static get(name) {
        return parseFloat(document.cookie.replace(name + "=", ""));
    }
}


class GameOver {

    static setGameOverMessage(){
        Utility.generateNewParagraphElement("Game Over! You lasted " + game.score.value + " seconds.", "game_container", "gameOverText");
    }

    static setHighscore(){
        if (document.cookie != "") {
            if (Cookie.get("highscore") < game.score.value) {
                Cookie.set("highscore", game.score.value);
                GameOver.writeHighscore();
            }
        } else {
            Cookie.set("highscore", game.score.value);
        }
    }

    static writeHighscore(){
        if(document.cookie != ""){
            Utility.deleteChildrenOnEl("highscore_container");
            Utility.generateNewParagraphElement("Your highscore: " + Cookie.get("highscore") + " seconds", "highscore_container", "highscoreText");
        }
    }
}

class ObjectGenController {
    constructor(canvas) {
        this.obstaclesZero = [];
        this.obstaclesOne = [];
        this.powerups = [];
        this.canvas = canvas;
        this.x = this.canvas.width;
        this.y = this.canvas.height;
        this.speedIncreaseCoef = 1;
        this.intervalOne = 150;
        this.intervalTwo = 200;
        this.intervalCap = 90;

        this.genY = [this.y - 162, this.y - 362];

    }

    pushObject(){
        if (game.frameCount == 1 || game.isCondEveryInterval(this.intervalOne)){
            this.obstaclesZero.push(new ObstacleTypeZero(this.x, this.genY[0]));
        } if (game.isCondEveryInterval(this.intervalTwo)){
            this.obstaclesOne.push(new ObstacleTypeOne(-35, this.genY[1]));
        }  if (game.isCondEveryInterval(1002)){
            this.powerups[0] = (new JumpPowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(130, 150))));
        }  if (game.isCondEveryInterval(1200)){
            this.powerups[1] = (new ScorePowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(100, 140))));
        }  if(game.isCondEveryInterval(2700)){
            this.swapY();
        }  if(game.isCondEveryInterval(3000)) {
            this.changeCanvasColor();
        }  if(game.isCondEveryInterval(3600)) {
            this.revertCanvasColor();
        }
    }

    changeCanvasColor() {
        this.canvas.style.backgroundColor = "#007DFF";
    }

    revertCanvasColor() {
        this.canvas.style.backgroundColor = "#ffffff";
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

    constructor() {
        this.array = [];
        this.max = Utility.getScreenWidth();
        this.splitScreen();
    }

    splitScreen() {
        var intervals = this.calculateScreenFragments();
        console.log([intervals, this.max]);
        for(var i = 0; this.max > i;) {
            this.array.push(this.max/intervals + i);
            i = this.max/intervals + i;
        }
        this.array.splice(0, 0, 0);
    }
    getArray(){
        return this.array;
    }

    calculateScreenFragments(){
        return (Math.round(this.max / 75));
    }
}

class CollisionHandler extends SplitScreen {
    constructor() {
        super();
        this.intervalsArray = this.getArray();

        /*
        this.arrayHalf = Math.ceil(this.intervalsArray.length/2);
        this.half = this.intervalsArray[this.arrayHalf];*/
    }

    static checkCollisionOnTwoObjects(object1, object2) {                                               // IMPRROVE!
        return (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
            object1.y < object2.y + object2.height && object1.y + object1.height > object2.y)
    }

    checkInterval() {
        /*var index, max;
        if (game.player.x > this.half) {
            index = this.arrayHalf;
            max = this.intervalsArray.length - 1;
        } else {
            index = 0;
            max = this.arrayHalf - 1;
        }
         for (var i = index; i < max; i++) {*/

        for (var i = 0; i < this.intervalsArray.length; i++) {
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
                    game.gameover = true;
                }
            }
        }
    }

    loopPowerUps(powerupArray, i) {                                                                         // dnt loop
        for (var j = 0; j < powerupArray.length; j+=1) {
            try {
                if (Utility.isBetween(powerupArray[j].x, this.intervalsArray[i], this.intervalsArray[i + 1])) {
                    if (CollisionHandler.checkCollisionOnTwoObjects(game.player, powerupArray[j]) && powerupArray[j].active) {
                        powerupArray[j].activate();
                        powerupArray.splice(j, 1);
                        break;
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

class Game {

    static setup(){
        Utility.generateNewButton("START", "game_container", "newGameButton");
        Game.addListeners();
    }

    static startGame() {
        Utility.deleteChildrenOnEl("game_container");
        GameOver.writeHighscore();
        game = new GameController();
        if(game.needsTouchControls) {
            ExtraControlsHandler.generateAdditionalControls();
        } else {
            update();
            ExtraControlsHandler.generateButtonXtraControl();
        }
    }

    static endGame(){
        console.log("Game over.");
        GameOver.setGameOverMessage();
        GameOver.setHighscore();

        Utility.generateNewButton("RESTART", "game_container", "restartButton");

        //this.clearCanvas();

    }

    static restart() {
        Utility.deleteChildrenOnEl("game_container");
        game = new GameController();
        update();
    }

    static addListeners() {
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
    }

    static removeListeners() {
        document.body.removeEventListener("keydown", function(e) {
            keys[e.keyCode] = true;
            Keys.update();
        });

        document.body.removeEventListener("keyup", function(e) {
            keys[e.keyCode] = false;
            Keys.update();
        });

        /*window.removeEventListener("load",function(){
            update();
        });*/
    }
}

Game.setup();

function update(){
    if(!game) return;
    if(game.gameover){
        Game.endGame();
        return;
    }
    game.clearCanvas();
    game.keyEventHandler();
    game.frameCount += 1;
    game.objectControl.pushObject();
    game.objectControl.increaseDifficulty();
    game.collisionControl.checkInterval();
    game.objectControl.updatePowerupStatus();
    game.player.updatePlayerPosition();
    game.score.updateScore();
    game.info.updateInfo();

    requestAnimationFrame(update);
}
