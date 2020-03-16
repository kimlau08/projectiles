//Canvas layout dimensions for desktop and mobile
const desktopBackgroundWidth=1000;
const desktopBackgroundHeight=500;

const desktopGameControlWidth=desktopBackgroundWidth;
const desktopGameControlHeight=150;   //130 for 800x400, 150 for 1000x500 canvas

let canvasOrigin; //origin (x,y) coord of canvas

const AndroidMobileWidthTriggerMargin=200;
const AndroidMobileWidth=360;
const AndroidMobileHeight=640;

const AndroidMobileGameHeight=400;
const AndroidMobileGameControlWidth=AndroidMobileWidth;
const AndroidMobileGameControlHeight=desktopGameControlHeight;

let canvasWidth=desktopBackgroundWidth;
let canvasHeight=desktopBackgroundHeight;

//groundLevel=number of pixels from top of canvas. (0,0) is upper left corner
const groundLevel=canvasHeight-desktopGameControlHeight; //bottom space for sliders and buttons

const cannonWidth=30;			const cannonHeight=10;
const cannonPlatformWidth=20;   const cannonPlatformHeight=5;

//red cannon angle > 0 and can only turn counter clockwise
//green cannon angle < 0 and can only turn clockwise
const redCannonInitAngle=-1;		const greenCannonInitAngle=1; 
const initialShotsCount=10;



//////////Image assets and attributes
//Load image assets

//background
let bg;

let redCannonImg;			const redCannonSizeFactor=0.5;
const redCannonInitX=20; 	//initial distance from left side of canvas

let greenCannonImg;			let greenCannonSizeFactor=0.5;
const greenCannonInitX=canvasWidth-redCannonInitX-cannonWidth;  //symmetric dist from righ side of canvas

let projectileImg;			let projectileImgSizeFactor=0.2;
const redProjectileInitX=redCannonInitX; 	//inside red cannon
const redProjectileInitY=groundLevel-cannonPlatformHeight; 	//inside red cannon
const greenProjectileInitX=greenCannonInitX //inside green cannon
const greenProjectileInitY=groundLevel-cannonPlatformHeight;//inside green cannon

let cannonPlatformImg;		let cannonPlatformSizeFactor=0.5;


//Series of target buildings
let hutImg;					let hutSizeFactor=0.3;
let hutImgInitX=100; //default x		
let barnImg;				let barnSizeFactor=0.5;
let barnImgInitX=100;  //default x

let redCannonImgWidth; let redCannonImgHeight;
let greenCannonImgWidth; let greenCannonImgHeight;
let cannonPlatformImgWidth; let cannonPlatformImgHeight;
let hutImgWidth; let hutImgHeight;
let barnImgWidth; let barnImgHeight;

let distFromPlatform=2; //gap between a cannon and its platform
let distFromCannon=60; //dist between a cannon from next obj
let distFromObj=10;	   //dist between 2 objects


//////////game control sliders

//horizontal range of movement, 100 for desktop...50 for Android Mob
const cannonMinMove=0;  const cannonMaxMove=250;  //1500 for 800x400, 250 for 1000x500 canvas

const cannonMinAngle=0; const cannonMaxAngle=90;  //init to 0
const cannonMinForce=0; const cannonMaxForce=200;  //init to 0

//players' game control sliders
const sliderYSpace=20; //vertical space for a slider (for both red and green players)

//red player controls
let redSliderX=redCannonInitX;  //X coord of all red player's sliders
const redMoveSliderY=canvasHeight-desktopGameControlHeight+10; //Y coord of slider for x axis movement of cannon (top of game control area with padding of sliderYSpace)
const redAngleSliderY=redMoveSliderY+sliderYSpace; //Y coord of slider for cannon elevation angle
const redForceSliderY=redAngleSliderY+sliderYSpace; //Y coord of slider for cannon launch force

//green player controls
let greenSliderX=greenCannonInitX  //X coord of all green player's sliders
const greenMoveSliderY=canvasHeight-desktopGameControlHeight+10; //Y coord of slider for x axis movement of cannon (top of game control area with padding of sliderYSpace)
const greenAngleSliderY=greenMoveSliderY+sliderYSpace; //Y coord of slider for cannon elevation angle
const greenForceSliderY=greenAngleSliderY+sliderYSpace; //Y coord of slider for cannon launch force


function preload() {

	// The background image must be the same size as the parameters
	// into the createCanvas() method. In this program, the size of
	// the image is 720x400 pixels.
	bg = loadImage('../assets/mountain_scene_background.png');  


	redCannonImg=loadImage('../assets/red_cannon.png');
	greenCannonImg=loadImage('../assets/green_cannon.png');
	cannonPlatformImg=loadImage('../assets/cannon_platform.png');
	hutImg=loadImage('../assets/hut.png');
	barnImg=loadImage('../assets/barn_house.png');
	projectileImg=loadImage('../assets/rubber_chick.png');
}


//constructor of gameSpace object
class GameSpaceObj {
	constructor() {
		this.redProjectile = {};
		this.greenProjectile = {};

		this.redCannon = {};
		this.greenCannon = {};

		this.redTargets = [];
		this.greenTargets = [];

		this.redMoveSlider = {};
		this.redAngleSlider = {};
		this.redForceSlider = {};
		this.greenMoveSlider = {};
		this.greenAngleSlider = {};
		this.greenForceSlider = {};

		this.redPlayerScore=0;
		this.greenPlayerScore=0;
	}

	drawPlayerStatus() {
		let redShotsLeft=this.redCannon.shotsLeft;
		let greenShotsLeft=this.greenCannon.shotsLeft;
		let txtPadding=6;			//add space for the 2 data points
		let distFromForceSlider=40; //vertical distances below last slider
	
		let redPlayStatusStr=`Total Points: ${this.redPlayerScore}   Shots left: ${redShotsLeft}`
		//red player status
		text(redPlayStatusStr, redCannonInitX, redForceSliderY+distFromForceSlider, textWidth(redPlayStatusStr)+txtPadding);

		let greenPlayStatusStr=`Total Points: ${this.greenPlayerScore}   Shots left: ${greenShotsLeft}`
		//red player status
		text(greenPlayStatusStr, greenCannonInitX-textWidth(greenPlayStatusStr), greenForceSliderY+distFromForceSlider, textWidth(greenPlayStatusStr)+txtPadding);
	}
}

//////////////////////// Initial gameSpace ///////////////////
let gameSpace = new GameSpaceObj();


scoreBoard = {
	w:200,
	h:200,
	cornerRadius:10,
	//center the scoreboad display
	x: 0,
	y: 0,
	on: false,  //default to now show scoreboard
	closeBtn: {},

	drawScoreBoard() {

		this.x=Math.floor((canvasWidth-this.w)/2);
		this.y=Math.floor((canvasHeight-this.h)/2);

		//show scoreboard only when it is on
		if (!this.on) {
			return;
		}

		push();
			rect(this.x, this.y, this.w, this.h, this.cornerRadius);
			fill(255, 255, 255,   //fill with white color
				200);  				//for opacity/transparency
		pop();

		push();
			fill(0, 0, 255);
			let scoreboardTitle="Scores";
			let redPlayerScore=`Red Player: ${gameSpace.redPlayerScore}`;
			let greenPlayerScore=`Green Player: ${gameSpace.greenPlayerScore}`;
			let winnerDecl="It is a tie!";
			if (redPlayerScore>greenPlayerScore) {
				winnerDecl="Winner is Red Player!" 
			};
			if (redPlayerScore<greenPlayerScore) {
				winnerDecl="Winner is Green Player!" 
			};

			let line1Height=30;
			let line2Height=40;  let=line3Height=20;
			let line4Height=50;

			let scoreX=this.x+Math.floor((this.w-textWidth(scoreboardTitle))/2);
			let prtX=scoreX;
			let prtY=this.y+line1Height; 
			text(scoreboardTitle, prtX, prtY);

			prtX=this.x+Math.floor((this.w-textWidth(redPlayerScore))/2)-10;
			prtY=prtY+line2Height; 
			text(redPlayerScore, prtX, prtY); 

			//keep prtX unchanged for the rest of the box
			prtY=prtY+line3Height; 
			text(greenPlayerScore, prtX, prtY);
			prtY=prtY+line4Height; 
			text(winnerDecl, prtX, prtY);
		pop();

		this.closeBtn=createButton("Close");
		this.closeBtn.style('background-color', color(255,218,185));
		this.closeBtn.position(scoreX-8, prtY+line1Height);	//horizontally align with scoreboard title
		this.closeBtn.mousePressed(restartGame);
	}
}

function restartGame() {
	window.location.href="../index.html";
}

class gameControlSlider {
	x=0
	y=0
	min=0
	max=0
	initValue=0
	slider={}
	constructor (x, y, min, max, initValue) {
		this.x=x; this.y=y;
		this.slider=createSlider(min, max, initValue);
		if (this.isGreenSlider()) { //this on right side of canvas
			this.x=x-this.slider.width+Math.floor(greenCannonImgWidth*greenCannonSizeFactor); 
			this.y=y;  
		} 
		this.slider.position(this.x, this.y)
		this.min=min; this.max=max;
		this.initValue=initValue;
	}

	isRedSlider () {
		return(this.x<canvasWidth/2); //this is red slider on the left of screen)
	}
	isGreenSlider () {
		return(this.x>canvasWidth/2); //this is green slider on the right of screen)
	}

	drawLabel(str) {
		let sliderTxtSpacing=20;
		const textPadding=18;
		if (this.isRedSlider()) { //this is on left side of canvas, put text on right of slider
			text(`${this.slider.value()} - `+str, this.x+this.slider.width+sliderTxtSpacing, this.y+textPadding);
		} else {  //this is on right side of canvas, put text on left of slider
			text(str+` - ${this.slider.value()}`, this.x-this.slider.width-Math.floor(textWidth(str))-sliderTxtSpacing+115, this.y+textPadding);
		}
	}
}

function launchRedProjectile() {
	let redCannon=gameSpace.redCannon;
	let rProjectile=gameSpace.redProjectile;

	if (redCannon.shotsLeft<=0) {
		return; //no more shots left
	}

	//initialize position to be resting inside cannon
	rProjectile.resetProjectileInCannon(redCannon);
	rProjectile.isAlive=true;

	//initialize velocity and xSpeed using slider settings
	rProjectile.velocity= Math.floor(redCannon.force/5); 
	rProjectile.ySpeed= -1 * Math.floor(rProjectile.velocity * abs(sin(redCannon.angle))); //negative y speed to shoot up
	rProjectile.xSpeed= Math.floor(rProjectile.velocity * abs(cos(redCannon.angle))); //positive x speed to shoot to right of screen

	//reduce shots remaining
	redCannon.shotsLeft--;

}

function launchGreenProjectile() {
	let greenCannon=gameSpace.greenCannon;
	let gProjectile=gameSpace.greenProjectile;

	if (greenCannon.shotsLeft<=0) {
		return; //no more shots left
	}

	//initialize position to be resting inside cannon
	gProjectile.resetProjectileInCannon(greenCannon);
	gProjectile.isAlive=true;

	//initialize velocity and xSpeed using slider settings
	gProjectile.velocity= Math.floor(greenCannon.force/5); 
	gProjectile.ySpeed= -1 * Math.floor(gProjectile.velocity * abs(sin(greenCannon.angle))); //negative y speed to shoot up
	gProjectile.xSpeed= -1 * Math.floor(gProjectile.velocity * abs(cos(greenCannon.angle))); //negative x speed to shoot to left of screen

	//reduce shots remaining
	greenCannon.shotsLeft--;
}

function stopGame() {
	scoreBoard.on=true;
}


function layoutGameSpaceOnDesktop() {

	//create red player game controls
	gameSpace.redMoveSlider=new gameControlSlider(redSliderX, redMoveSliderY, cannonMinMove, cannonMaxMove, 0);
	gameSpace.redAngleSlider=new gameControlSlider(redSliderX, redAngleSliderY, cannonMinAngle, cannonMaxAngle, 0);
	gameSpace.redForceSlider=new gameControlSlider(redSliderX, redForceSliderY, cannonMinForce, cannonMaxForce, 0);

	
	//create green player game controls
	gameSpace.greenMoveSlider=new gameControlSlider(greenSliderX, greenMoveSliderY,
		cannonMinMove, cannonMaxMove, 0);
	gameSpace.greenAngleSlider=new gameControlSlider(greenSliderX, greenAngleSliderY, cannonMinAngle, cannonMaxAngle, 0);
	gameSpace.greenForceSlider=new gameControlSlider(greenSliderX, greenForceSliderY, cannonMinForce, cannonMaxForce, 0);

	//create control buttons - after creating the sliders
	let canCenter=Math.floor(canvasWidth/2);
	let distFromCenter=100;   //distance of launch buttons from center of canvas
	let launchBtnLabel="Launch";
	let launchBtnWidth=Math.floor(textWidth(launchBtnLabel))+6;

	//red cannon launcher button
	let redLaunchBtn=createButton(launchBtnLabel);
	redLaunchBtn.style('background-color', color(255,99,71));
	redLaunchBtn.position(canCenter-distFromCenter-launchBtnWidth, redAngleSliderY);
	redLaunchBtn.mousePressed(launchRedProjectile);

	//green cannon launcher button
	let greenLaunchBtn=createButton(launchBtnLabel);
	greenLaunchBtn.style('background-color', color(50,205,50));
	greenLaunchBtn.position(canCenter+distFromCenter-launchBtnWidth, greenAngleSliderY);
	greenLaunchBtn.mousePressed(launchGreenProjectile);

	//stop game button
	let stopBtnLabel="Stop Game";
	let stopBtnWidth=Math.floor(textWidth(stopBtnLabel))+6;
	let stopGameBtn=createButton(stopBtnLabel);
	stopGameBtn.style('background-color', color(255,218,185));
	stopGameBtn.position(canCenter-stopBtnWidth+10, redForceSliderY+sliderYSpace*2);
	stopGameBtn.mousePressed(stopGame);

	//create the projectile object -- default to be inside red cannon
	gameSpace.redProjectile=new Projectile(redCannonInitX, projectileImg, projectileImgSizeFactor);
	gameSpace.redProjectile.isAlive=false; //do not draw until projectile is airborne

	
	//create the projectile object -- default to be inside red cannon
	gameSpace.greenProjectile=new Projectile(greenCannonInitX- 
		Math.floor(greenCannonImgWidth*greenCannonSizeFactor), projectileImg, projectileImgSizeFactor);
	gameSpace.greenProjectile.isAlive=false; //do not draw until projectile is airborne

	//create target buildings for green cannon (located to the right of red cannon)
	//layout target objects from right to left
	let currentX=redCannonInitX+Math.floor(redCannonImg.width*redCannonSizeFactor) //red cannon at init x + width of cannon
				+distFromCannon; //space to the right of red cannon
	let hut1=new GameObj(currentX, hutImg, hutSizeFactor);
	let currentObj=hut1;

	currentX=currentObj.x+currentObj.w+distFromObj;
	let barn1=new GameObj(currentX, barnImg, barnSizeFactor);
	currentObj=barn1;

	currentX=currentObj.x+currentObj.w+distFromObj;
	let hut2=new GameObj(currentX, hutImg, hutSizeFactor);

	gameSpace.greenTargets.push(hut1);
	gameSpace.greenTargets.push(barn1);
	gameSpace.greenTargets.push(hut2);


	//create target buildings for red cannon (located to the left of green cannon)
	//layout target objects from left to right
	currentX=greenCannonInitX-(hutImg.width*hutSizeFactor)-distFromCannon; //space to the left of green cannon, (cannon.x already points to green cannon left side=> account for width of hut, instead of width of cannon)
	hut3=new GameObj(currentX, hutImg, hutSizeFactor);
	currentObj=hut3;

	currentX=currentObj.x-(barnImg.width*barnSizeFactor)-distFromObj;
	barn2=new GameObj(currentX, barnImg, barnSizeFactor);
	currentObj=barn2;

	currentX=currentObj.x-(hutImg.width*hutSizeFactor)-distFromObj;
	hut4=new GameObj(currentX, hutImg, hutSizeFactor);

	gameSpace.redTargets.push(hut3);
	gameSpace.redTargets.push(barn2);
	gameSpace.redTargets.push(hut4);

	//create red cannon and its platform
	gameSpace.redCannon=new Cannon(redCannonInitX, redCannonInitAngle, initialShotsCount, redCannonImg, redCannonSizeFactor, cannonPlatformImg, cannonPlatformSizeFactor);
	//create green cannon and its platform
	gameSpace.greenCannon=new Cannon(greenCannonInitX, greenCannonInitAngle, initialShotsCount, greenCannonImg, greenCannonSizeFactor, cannonPlatformImg, cannonPlatformSizeFactor);




}

function layoutGameSpaceoOnAndroidMobile() {

}



/*

Launch a ball in any direction and use gravity to make the ball fall down. Make the ball bounce as it hits the surface before coming to
a complete stop.

*/


var ball;
var clicked = false;

class GameObj {
	//x, y point to upper left corner of object image
	x=0 //horizontal px position (left corner of obj)
	y=groundLevel
	w=0 //horizontal px width
	h=0 //height, vertical px position, i.e. y=h
	objImg=null	//image for the object
	imgSizeFactor=1
	score=10

	isAlive=true; //whether to show the object on canvas

	constructor(x, img, imgSizeFactor) {
		this.x=x; this.y=groundLevel; 
		this.objImg=img;
		this.imgSizeFactor=imgSizeFactor;
		this.w=Math.floor(this.objImg.width*imgSizeFactor);
		this.h=Math.floor(this.objImg.height*imgSizeFactor);
	}

	// get x() {
	// 	return this.x;
	// }
	// get y() {
	// 	return this.y;
	// }
	// get w() {
	// 	return this.w;
	// }
	// get h() {
	// 	return this.h;
	// }
	// get isAlive() {
	// 	return this.isAlive;
	// }
	// /**
	//  * @param {number} x
	//  */
	// set x(x) {
	// 	this.x=x;
	// }
	// /**
	//  * @param {number} y
	//  */
	// set y(y) {
	// 	this.y=y
	// }
	// /**
	//  * @param {boolean} status
	//  */
	// set isAlive(status) {
	// 	this.isAlive=status;
	// }


	drawObj() {
		if (!this.isAlive) {
			return; //do not draw inactive object, e.g. projectile in rest state
		}

		image(this.objImg, this.x, this.y-this.h,  
			this.w, this.h); //height of object
	}

}

class Projectile extends GameObj {
	xSpeed=0
	ySpeed=0
	velocity=0
	gravity=1
	isRedProjectile=true //initial x position determins red vs green projectile
	isGreenProjectile=false

	constructor(x, img, imgSizeFactor) {
		super(x, img, imgSizeFactor);
		this.y-=cannonPlatformHeight; //on cannon plaform (above ground level); otherwise it is considered detonated (not alive)
		
		this.isRedProjectile=this.x<canvasWidth/2;
		this.isGreenProjectile=this.x>canvasWidth/2;
	}
	resetProjectileInCannon(cannon) {

		//do not reset isAlive bool. Let calling function decides
		if (cannon.isRedCannon()) {
			this.x=cannon.x;
			this.y=groundLevel-cannonPlatformHeight;
		} else { //put projectile inside green cannon
			this.x=cannon.x+Math.floor(greenCannonImgWidth*greenCannonSizeFactor);
			this.y=groundLevel-cannonPlatformHeight;
		}
		this.xSpeed=0;
		this.ySpeed=0;
		this.velocity=0;
	}
	drawProjectile() {
		if (!this.isAlive) {
			return; //do not draw if not active
		}

		if (this.isRedProjectile) {
			let redCannon=gameSpace.redCannon;
			if (redCannon.force==0) { //draw projectile only if force is not zero
				this.isAlive=false;
				//reset position to inside the cannon
				this.resetProjectileInCannon(gameSpace.redCannon);	
			} else {
				this.drawObj();
			}
		}
		if (this.isGreenProjectile) {
			let greenCannon=gameSpace.greenCannon;
			if (greenCannon.force==0) { //draw projectile only if force is not zero
				this.isAlive=false;
				//reset position to inside the cannon
				this.resetProjectileInCannon(gameSpace.greenCannon);	
			} else {
				this.drawObj();
			}
		}
console.log(`x: ${(this.x).toFixed(4)} y: ${(this.y).toFixed(4)} xSpd: ${(this.xSpeed).toFixed(4)} ySpd: ${(this.ySpeed).toFixed(4)} V: ${(this.velocity).toFixed(4)}`);
	

		this.ySpeed += this.gravity;

		if(this.y >= groundLevel){ //the projectile reach ground level and detonated
			this.isAlive=false;   	//stop drawing the projectile
			//reset position to inside the cannon
			if (this.isRedProjectile) {
				this.resetProjectileInCannon(gameSpace.redCannon);	
			} else {
				this.resetProjectileInCannon(gameSpace.greenCannon);	
			}
		} else {
			this.x += this.xSpeed;
			this.y += this.ySpeed;
		}

		if(this.x >= canvasWidth || this.x <= 0){ //outside left or right of screen
			this.isAlive=false;  	//stop drawing the projectile

			//reset position to inside the cannon
			if (this.isRedProjectile) {
				this.resetProjectileInCannon(gameSpace.redCannon);	
			} else {
				this.resetProjectileInCannon(gameSpace.greenCannon);	
			}

		}
	}
}

class Cannon extends GameObj{
	shotsLeft=0
	angle=0 //degree
	force=0 
	cannonPlatform={}  //the platform that moves with the cannon
	
	constructor(x, angle, shots, cannonImg, cannonSizeFactor, platformImg, platformSizeFactor) {
		super(x, cannonImg, cannonSizeFactor);
		this.angle=angle;
		this.shotsLeft=shots;
		this.cannonPlatform=new GameObj(Math.floor(x), platformImg, platformSizeFactor);

		this.y=groundLevel-this.cannonPlatform.h-distFromPlatform //cannon is on platform (platform defaults to groundLevel)
	}
	move(x) {  //move BOTH cannon and platform to new x
		let d=x-this.x;
		this.x += d;
		this.cannonPlatform.x += d;
	}
	turn(a) { //turn by an angle. positive for clockwise
		this.angle=a;
	}
	mountForce(f) { //charge up the cannon with force
		this.force=f;
	}
	isRedCannon() {
		return (this.x<canvasWidth/2); //this is red cannon on the left of screen
	}
	isGreenCannon() {
		return (this.x>canvasWidth/2); //angle > 0 => this is green cannon on the right of screen
	}
	drawCannon() {
		if (!this.isAlive) {
			return; //do not draw inactive object
		}

		//draw cannon

		//key to rotate: translate&rotate before drawing the image
		push(); //save canvas settings
		if (this.isRedCannon()) { //this is red cannon on the left of screen
			translate(this.x, this.y-this.h/2); //move origin of rotate to left of cannon at H. center line
			rotate(this.angle);

			//draw the object image
			image(this.objImg, 0, -this.h/2,  //on platform at ground level
				this.w, this.h); //height of cannon

			/* image(img, x, y, w, h) */
		}
		if (this.isGreenCannon()) { //angle > 0 => this is green cannon on the right of screen
			translate(this.x+this.w, this.y-this.h/2); //move origin of rotate to right of cannon at H. center line
			rotate(this.angle);

			//draw the object image
			image(this.objImg, -this.w, -this.h/2,  //on platform at ground level
				this.w, this.h); //height of cannon

			/* image(img, x, y, w, h) */
		}
		
		pop(); //restore canvas settings

		//draw platform
		image(this.cannonPlatform.objImg, this.cannonPlatform.x, this.cannonPlatform.y-this.cannonPlatform.h, this.cannonPlatform.w, this.cannonPlatform.h); 
	}
}



function setup() {
	
	//initialize image dimensions
	redCannonImgWidth=redCannonImg.width;
	redCannonImgHeight=redCannonImg.height;
	greenCannonImgWidth=greenCannonImg.width;
	greenCannonImgHeight=greenCannonImg.height;
	cannonPlatformImgWidth=cannonPlatformImg.width;
	cannonPlatformImgHeight=cannonPlatformImg.height;
	hutImgWidth=hutImg.width;
	hutImgHeight=hutImg.height;
	barnImgWidth=barnImg.width;
	barnImgHeight=barnImg.height;

	angleMode(DEGREES); //to specify angles in degrees

	if (isOnAndroidMobile()) {
		createCanvas(AndroidMobileWidth, AndroidMobileHeight);
		canvasWidth=AndroidMobileWidth;
		canvasHeight=AndroidMobileHeight;
		layoutGameSpaceoOnAndroidMobile();
	} else {
		let can=createCanvas(desktopBackgroundWidth, desktopBackgroundHeight);
			canvasWidth=desktopBackgroundWidth;
			canvasHeight=desktopBackgroundHeight;

		canvasOrigin=can.position(0,0); //put canvas at upper left corner of window viewport
	
		layoutGameSpaceOnDesktop();
	}

} 

 
function windowResized() {

	console.log(`resized new W: ${windowWidth}, H: ${windowHeight}`);
	
		if (isOnAndroidMobile()) {
			resizeCanvas(AndroidMobileWidth, AndroidMobileHeight)
		} else {
			resizeCanvas(desktopBackgroundWidth, desktopBackgroundHeight);
		}
	
		//resizeCanvas(w, h, [noRedraw])
	}
	
	
	function isOnAndroidMobile() {
	
		if (windowWidth<=(AndroidMobileWidth + AndroidMobileWidthTriggerMargin)) {
			console.log(`****Width at ${windowWidth}, Android Mobile Layout used`);
			return true;
		} else {
			console.log(`****Width at ${windowWidth}, Desktop Layout Layout used`);
			return false;
		}
	}


function draw() {
	background(bg);

	//draw tareget objects for red cannon (next to green cannon)
	for (let i=0; i<gameSpace.redTargets.length; i++) {
		gameSpace.redTargets[i].drawObj();
	}

	//draw game control slider lables
	gameSpace.redMoveSlider.drawLabel('H Position');
	gameSpace.redAngleSlider.drawLabel('Angle');
	gameSpace.redForceSlider.drawLabel('Force');


	//draw target objects for green cannon (next to red cannon)
	for (let i=0; i<gameSpace.greenTargets.length; i++) {
		gameSpace.greenTargets[i].drawObj();
	}

	
	//draw game control slider lables
	gameSpace.greenMoveSlider.drawLabel('H Position');
	gameSpace.greenAngleSlider.drawLabel('Angle');
	gameSpace.greenForceSlider.drawLabel('Force');

	//draw player scores and shots left during game in progress
	gameSpace.drawPlayerStatus();

	//draw scoreboard 
	scoreBoard.drawScoreBoard();


	//////////////Transformations: Update cannon position and angle
	//update red cannon status
	let rCannon=gameSpace.redCannon;
	rCannon.move(redCannonInitX+gameSpace.redMoveSlider.slider.value());
	rCannon.turn(-1 * gameSpace.redAngleSlider.slider.value()); //negative angle to turn counter clockwise
	rCannon.mountForce(gameSpace.redForceSlider.slider.value());

	//update green cannon status
	let gCannon=gameSpace.greenCannon;
	gCannon.move(greenCannonInitX-gameSpace.greenMoveSlider.slider.value()); //negative move to shift to left
	gCannon.turn(gameSpace.greenAngleSlider.slider.value()); //postive angle to turn  clockwise
	gCannon.mountForce(gameSpace.greenForceSlider.slider.value());

	/////////////draw the cannons
	gameSpace.redCannon.drawCannon();
	gameSpace.greenCannon.drawCannon();

	/////////////draw the projectile
	gameSpace.redProjectile.drawProjectile();
	gameSpace.greenProjectile.drawProjectile();
}