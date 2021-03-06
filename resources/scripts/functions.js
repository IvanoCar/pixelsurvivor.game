(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();


// GLOBALS
var keys, friction, gravity, game, sound;
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
Resource.PLAYER_JUMPING_GM = "resources/images/player/jump_gm.png";
Resource.PLAYER_NORMAL_GM = "resources/images/player/normal_gm.png";
Resource.OBSTACLE0_IMAGE = "resources/images/obstacles/type0.png";
Resource.OBSTACLE1_IMAGE = "resources/images/obstacles/type1.png";
Resource.JUMP_POWERUP = "resources/images/powerups/jumpPowerup.png";
Resource.SCORE_POWERUP = "resources/images/powerups/scorePowerup.png";
Resource.GOD_MODE_POWERUP = "resources/images/powerups/gmPow.png";
Resource.BG_MUSIC = "resources/sounds/bg_music.mp3";
Resource.END_SOUND = "resources/sounds/end.wav";
Resource.JUMP_SOUND = "resources/sounds/jump2.wav";
Resource.POWUP_SOUND_1 = "resources/sounds/powerup1.wav";
Resource.POWUP_SOUND_2 = "resources/sounds/powerup2.wav";
Resource.POWUP_SOUND_3 = "resources/sounds/powerup3.wav";

class Canvas {

    constructor() {
        this.canvas = Utility.generateCanvas();
        this.ctx = this.canvas.getContext(Resource.CANVAS_CONTEXT);

        if(Utility.getScreenWidth() > 800) {
            this.canvas.width = 800;
            this.needsTouchControls = false;
            this.sizeCoef = 1;
            this.powerupSizeCoef = 1;
        } else {
            this.canvas.width = Utility.getScreenWidth() - 10;
            this.needsTouchControls = true;
            this.sizeCoef = 0.65;
            this.powerupSizeCoef = 0.8;
        }

        if(Utility.getScreenHeight() < 500) {
            this.canvas.height = 300;
        } else {
            this.canvas.height = 350;
        }
    }
}

class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext(Resource.CANVAS_CONTEXT);
        this.setupPlayerModel();
        this.defaultValues();
    }

    setPlayerSizeCoef() {
        if(this.canvas.width < 800) {
            this.playerSizeC = 0.7;
        } else {
            this.playerSizeC = 1;
        }
    }

    setupPlayerModel(){
        this.im_model = new Image();
        this.im_model.src = Resource.PLAYER_STANDING;
        this.im_jump = new Image();
        this.im_jump.src = Resource.PLAYER_JUMPING;
    }

    defaultValues(){
        this.setPlayerSizeCoef();
        this.y = this.canvas.height-5;
        this.x = (this.canvas.width/2)/2;
        this.width = 30 * this.playerSizeC;
        this.height = 30 * this.playerSizeC;
        this.speed = 5.7;
        this.velX = 0;
        this.velY = 0;
        this.jumping = false;
        this.jumpingPowerUp = false;
        this.god = false;
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

class PlayerController extends Player {

    constructor(canvas) {
        super(canvas);
    }

    jump(){
        if(!this.jumping) {
            this.jumping = true;
            this.velY = - this.speed*2;
            sound.jumpSound.play();
        } else if (this.jumpingPowerUp){
            this.jumping = true;
            this.velY = - this.speed*2;
            sound.jumpSound.play();
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
        this.player = new PlayerController(this.canvas);
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
        // return true if n frames have passed
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
        var element = document.createElement("DIV");
        document.getElementById(appendTo).appendChild(element).classList.add(classToApply);
    }

    static removeElementByClass(className) {
        // removes only the first element found
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
                button.setAttribute("onclick", "window.game.player.left(7)");
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
            case "MUTE":
                button.setAttribute("onclick", "ExtraControlsHandler.muteB()");
                break;
            case "UNMUTE":
                button.setAttribute("onclick", "ExtraControlsHandler.unMuteB()");
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

    static getCanvasWidth() {
        return document.getElementById(Resource.CANVAS_NAME).width;
    }
}

class ExtraControlsHandler {
    static generateLeftHandedControls() {
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(0);
        Utility.generateNewButton("SWITCH", "controls_container", "switchButton");

        if(!sound.muted && !game.gameover)
            sound.bgMusic.play();
        if(!game.gameover)
            update();
    }

    static generateRightHandedControls() {
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("<", "controls_container", "leftButton");
        Utility.generateNewButton(">", "controls_container", "rightButton");
        ExtraControlsHandler.generateUpButton(1);
        Utility.generateNewButton("SWITCH", "controls_container", "switchButton");

        if(!sound.muted && !game.gameover)
            sound.bgMusic.play();
        if(!game.gameover)
            update();
    }

    static generateUpButton(mode){
        if(mode == 0){
            Utility.generateNewButton("UP", "controls_container", "upButton0");
        } else {
            Utility.generateNewButton("UP", "controls_container", "upButton1");
        }
    }

    // show controls for player movement on the bottom of the screen
    static generateAdditionalControls() {
        Utility.generateNewParagraphElement("Are you left handed or right handed?", "controls_container", "centeredDiv");
        Utility.generateNewButton("Left", "controls_container", "buttonStyle");
        Utility.generateNewButton("Right", "controls_container", "buttonStyle");

    }

    static giveSmallMuteButton() {
        Utility.generateNewButton("MUTE", "header", "muteSmall");
    }

    // show buttons on the left panel -> mute and button for showing player movement onscreen controls
    static generateExtraButtons(){
        Utility.generateNewButton("GIVE EXTRA CONTROLS", "extrabuttons", "addButton");
        Utility.generateNewButton("MUTE", "extrabuttons", "muteButton");
    }

    static giveButtons(){
        Utility.removeElementByClass("addButton");
        ExtraControlsHandler.generateAdditionalControls();
        Utility.generateNewButton("REMOVE BUTTONS", "extrabuttons", "removeButton");
    }
    static removeButtons() {
        Utility.removeElementByClass("removeButton");
        Utility.deleteChildrenOnEl("controls_container");
        Utility.generateNewButton("GIVE EXTRA CONTROLS", "extrabuttons", "addButton");
    }

    static muteB() {
        try {
            Utility.removeElementByClass("muteButton");
            Utility.generateNewButton("UNMUTE", "extrabuttons", "unMuteButton");
        } catch (TypeError){
            Utility.removeElementByClass("muteSmall");
            Utility.generateNewButton("UNMUTE", "header", "unMuteSmall");
        }
        sound.mute();
    }

    static unMuteB(){
        try {
            Utility.removeElementByClass("unMuteButton");
            Utility.generateNewButton("MUTE", "extrabuttons", "muteButton");
        } catch(TypeError) {
            Utility.removeElementByClass("unMuteSmall");
            Utility.generateNewButton("MUTE", "header", "muteSmall");
        }
        sound.unMute();
    }


    static switchControls() {
        if (document.getElementsByClassName("upButton0")[0] != undefined){
            Utility.removeElementByClass("upButton0");
            ExtraControlsHandler.generateUpButton(1);
        } else { //if (document.getElementsByClassName("upButton1")[0] != undefined){
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
    destroy(){}
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
        this.ctx.drawImage(this.obst, this.x, this.y, this.width, this.height)
    }
    updateObstaclePosition(speed=1){
        this.x -= speed;
        this.genObstacle();
    }
    destroy() {
        return this.x <= -31;
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
        this.ctx.drawImage(this.obst, this.x, this.y, this.width, this.height)

    }
    updateObstaclePosition(speed=1){
        this.x += speed;
        this.genObstacle();
    }
    destroy() {
        return this.x >= game.objectControl.canvas.width + 31;
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
        this.width = 30 * game.powerupSizeCoef;
        this.height = 30 * game.powerupSizeCoef;
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
        this.ctx.drawImage(this.jp, this.x, this.y, this.width, this.height);
    }

    activate(){
        game.info.jumpPowerupActivatedInfo();
        if(!game.player.god) {
            game.player.im_model.src = Resource.PLAYER_NORMAL_P;
            game.player.im_jump.src = Resource.PLAYER_JUMPING_P;
        }
        game.player.speed = 4.2;
        game.player.jumpingPowerUp = true;
        sound.powerup1Sound.play();
        setTimeout(JumpPowerUp.deactivateJumpPowerup, 4000);
    }

    static deactivateJumpPowerup() {
        if(game.player.god) {
            game.player.im_model.src = Resource.PLAYER_NORMAL_GM;
            game.player.im_jump.src = Resource.PLAYER_JUMPING_GM;
        } else {
            game.player.im_model.src = Resource.PLAYER_STANDING;
            game.player.im_jump.src = Resource.PLAYER_JUMPING;
        }
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
        this.ctx.drawImage(this.scp, this.x, this.y, this.width, this.height);
    }

    activate() {
        game.score.value += 5;
        game.info.scorePowerupActivatedInfo();
        sound.powerup2Sound.play();
    }
}

class GodMode extends Powerup {
    constructor(x,y) {
        super(x,y);
        this.gmp = new Image();
        this.gmp.src = Resource.GOD_MODE_POWERUP;
        this.genPowerUp();
    }

    genPowerUp() {
        this.ctx.drawImage(this.gmp, this.x, this.y, this.width, this.height);
    }

    activate() {
        game.player.god = true;
        game.info.godModeInfo();
        game.player.im_model.src = Resource.PLAYER_NORMAL_GM;
        game.player.im_jump.src = Resource.PLAYER_JUMPING_GM;
        sound.powerup3Sound.play();
        setInterval(GodMode.deactivateGodMode, 12000);
    }

    static deactivateGodMode() {
        if(game.player.jumpingPowerUp) {
            game.player.im_model.src = Resource.PLAYER_NORMAL_P;
            game.player.im_jump.src = Resource.PLAYER_JUMPING_P;
        } else {
            game.player.im_model.src = Resource.PLAYER_STANDING;
            game.player.im_jump.src = Resource.PLAYER_JUMPING;
        }
        game.player.god = false;
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

    godModeInfo() {
        this.frameGM = game.frameCount;
        this.text = "GOD MODE ACTIVATED";
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
        this.keepVisible(150, this.frameGM);
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
            }
        } else {
            Cookie.set("highscore", game.score.value);
        }
        GameOver.writeHighscore();
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
        this.obstacles = [];
        this.powerups = [];
        this.canvas = canvas;
        this.x = this.canvas.width;
        this.y = this.canvas.height;
        this.speedIncreaseCoef = 1;
        this.choosePowup = undefined;
        this.genIntervals = [150, 200];
        this.intervalCap = 90; // ensures that generation speed does not go under 90 frames

        this.genY = [this.y - 162, this.y - 362]; // y-axis coordinates for obstacles when generated

    }

    pushObjectPlus(){
        if (game.frameCount == 1 || game.isCondEveryInterval(this.genIntervals[0])){
            this.obstacles.push(new ObstacleTypeZero(this.x, this.genY[0]));
        } if (game.isCondEveryInterval(this.genIntervals[1])){
            this.obstacles.push(new ObstacleTypeOne(-35, this.genY[1]));
        }

        if(game.isCondEveryInterval(800)) {
            this.pushPowerup();
        }

        if(game.isCondEveryInterval(1300)) {
            this.pushPowerup();
        }

        if(game.isCondEveryInterval(2500)) {
            // show god mode powerup -> not in pushPowerup function so it doesnt get shown as often
            this.powerups.push(new GodMode(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(120, 170))));
        }

        if(game.isCondEveryInterval(2700)){
            this.swapY();
        }  if(game.isCondEveryInterval(3000)) {
            this.changeCanvasColor();
        }  if(game.isCondEveryInterval(4200)) {
            this.revertCanvasColor();
        }
    }

    pushPowerup() {
        this.choosePowup = Utility.randInt(1,2);
        switch (this.choosePowup) {
            case 1:
                this.powerups.push(new JumpPowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(130, 150))));
                break;
            case 2:
                this.powerups.push(new ScorePowerUp(Utility.randInt(30, this.x - 30), this.y - (Utility.randInt(100, 140))));
                break;
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

    increaseDifficulty(){
        if (game.isCondEveryInterval(600)){
            if(this.speedIncreaseCoef < 4.9)
                this.speedIncreaseCoef += 0.35;
            else
                this.speedIncreaseCoef = 4.9;

            // add for loop for more obstacles
            if(this.genIntervals[0] > this.intervalCap)
                this.genIntervals[0] -= 8;
            else
                this.genIntervals[0] = this.intervalCap;

            if (this.genIntervals[1] > this.intervalCap)
                this.genIntervals[1] -= 10;
            else
                this.genIntervals[1] = this.intervalCap;
        }
    }
}

class SplitScreen {

    constructor() {
        this.intervalsArray = [];
        this.max = Utility.getCanvasWidth();
        this.splitScreen();
    }

    splitScreen() {
        var intervals = this.calculateScreenFragments();
        for(var i = 0; this.max > i;) {
            this.intervalsArray.push(Math.round(this.max/intervals + i));
            i = this.max/intervals + i;
        }
        this.intervalsArray.splice(0, 0, 0);
    }

    calculateScreenFragments(){ // game screen fragments
        return (Math.round(this.max / 75));
    }
}

class CollisionHandler extends SplitScreen {
    constructor() {
        super();
    }

    static checkCollisionOnTwoObjects(object1, object2) {
        return (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
            object1.y < object2.y + object2.height && object1.y + object1.height > object2.y)
    }

    checkInterval() {

        for (var i = 0; i < this.intervalsArray.length; i++) {
            if(Utility.isBetween(game.player.x, this.intervalsArray[i], this.intervalsArray[i + 1])){
                this.loopObstacles(game.objectControl.obstacles, i);
                this.loopPowerUps(game.objectControl.powerups, i);
                break;
            }
            GarbageCollector.obstacles(game.objectControl.obstacles);
            GarbageCollector.powerups(game.objectControl.powerups);
        }
    }

    loopObstacles(obstacleArray, i) {
        for (var j = 0; j < obstacleArray.length; j+=1) {

            if(obstacleArray[j] instanceof ObstacleTypeZero) {
                obstacleArray[j].updateObstaclePosition(2 * game.objectControl.speedIncreaseCoef);
            } else {
                obstacleArray[j].updateObstaclePosition(1.25 * game.objectControl.speedIncreaseCoef);
            }

            if(game.player.god)
                continue;

            if(Utility.isBetween(obstacleArray[j].x, this.intervalsArray[i], this.intervalsArray[i+1])){
                if(CollisionHandler.checkCollisionOnTwoObjects(game.player, obstacleArray[j])) {
                    game.gameover = true;
                }
            }
        }
    }

    loopPowerUps(powerupArray, i) {
        if (powerupArray.length > 0) {
            for (var j = 0; j < powerupArray.length; j += 1) {

                if(powerupArray[j] instanceof ScorePowerUp || powerupArray[j] instanceof GodMode) {
                    powerupArray[j].keepActive(600);
                } else {
                    powerupArray[j].keepActive();
                }
                if (Utility.isBetween(powerupArray[j].x, this.intervalsArray[i], this.intervalsArray[i + 1])) {
                    if (CollisionHandler.checkCollisionOnTwoObjects(game.player, powerupArray[j]) && powerupArray[j].active) {
                        powerupArray[j].activate();
                        powerupArray.splice(j, 1);
                        break;
                    }
                }
            }
        }
    }
}

class GarbageCollector {
    static obstacles(obstaclesArray) {
        // pops every other obstacle that goes off screen from the obstacles array
        if(obstaclesArray[1]) {
            if (obstaclesArray[0].destroy() && obstaclesArray[1].destroy()) {
                obstaclesArray.splice(0, 2);
            }
        }
    }

    static powerups(powerupsArray) {
        if(powerupsArray.length > 4){
            powerupsArray.splice(0,1);
        }

    }
}

class SoundController {
    constructor() {
        this.muted = false;
        this.bgMusic = this.setupBackgroundMusic();
        this.setupOtherSounds();
    }

    setupBackgroundMusic() {
        var bgMusic = new Audio(Resource.BG_MUSIC);
        bgMusic.volume = 0.35;
        bgMusic.addEventListener('ended', function() {this.play();}, false);
        return bgMusic;
    }

    stopBgSound(){
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    setupOtherSounds() {
        this.endSound = new Audio(Resource.END_SOUND);
        this.jumpSound = new Audio(Resource.JUMP_SOUND);
        this.powerup1Sound = new Audio(Resource.POWUP_SOUND_1);
        this.powerup2Sound = new Audio(Resource.POWUP_SOUND_2);
        this.powerup3Sound = new Audio(Resource.POWUP_SOUND_3);
    }

    mute() {
        this.bgMusic.pause();
        this.endSound.volume = 0;
        this.jumpSound.volume = 0;
        this.powerup1Sound.volume = 0;
        this.powerup2Sound.volume = 0;
        this.powerup3Sound.volume = 0;
        this.muted = true;
    }

    unMute() {
        this.bgMusic.play();
        this.endSound.volume = 1;
        this.jumpSound.volume = 1;
        this.powerup1Sound.volume = 1;
        this.powerup2Sound.volume = 1;
        this.powerup3Sound.volume = 1;
        this.muted = false;
    }
}

class Game {

    static setup(){
        sound = new SoundController();
        Utility.generateNewButton("START", "game_container", "newGameButton");
        Game.addListeners();
    }

    static startGame() {
        Utility.deleteChildrenOnEl("game_container");
        GameOver.writeHighscore();
        game = new GameController();
        if(game.needsTouchControls) {
            ExtraControlsHandler.generateAdditionalControls();
            ExtraControlsHandler.giveSmallMuteButton();
        } else {
            update();
            sound.bgMusic.play();
            ExtraControlsHandler.generateExtraButtons();
        }
    }

    static endGame(){
        sound.stopBgSound();
        setTimeout(function () {sound.endSound.play();}, 150);
        GameOver.setGameOverMessage();
        GameOver.setHighscore();
        Utility.generateNewButton("RESTART", "game_container", "restartButton");
        //this.clearCanvas();

    }

    static restart() {
        Utility.deleteChildrenOnEl("game_container");
        game = new GameController();
        if(!sound.muted) {
            sound.bgMusic.play();
        }
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
    game.objectControl.pushObjectPlus();
    game.objectControl.increaseDifficulty();
    game.collisionControl.checkInterval();
    game.player.updatePlayerPosition();
    game.score.updateScore();
    game.info.updateInfo();

    requestAnimationFrame(update);
}
