//BELOW ARE GRAPHICS VARIABLES
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

//stop context menu from coming up on right click.
canvas.oncontextmenu = function (e) 
{
    e.preventDefault();
};

const TILEHEIGHT = 787;
const TILEWIDTH = 790;

//BELOW ARE ALL GAME RELATED INSTANCE VALUES
var spriteTable, board, scoreboard, menu, clock, dialogueBox, audioTable;

//current holds the board position of the 'current' tile.
var current = [0, 0];
//mouseMove is a boolean that tells whether client is using keys or mouse.
var mouseMove, roundEnd, roundAdvance, mouseOverTile, titleScreenOn;


//is there an animation happening right now?
var animating = false;

const States = {
			DEFAULT: 'default',
			ABOUT: 'about',
			RULES: 'rules',
			SOUND: 'sound',
			RESET: 'reset',
			CONTROLS: 'controls',
			BACK: 'back'
		}

//dimension of each tile is a global variable.
var dimension = calculateDim();

var mouseX = 0;
var mouseY = 0;
const delta = 8;
const SIZE = 6;

window.addEventListener("mousedown", onClick, false);
window.addEventListener('resize', resizeCanvas, false);
window.addEventListener('keydown', keyDown, false);
window.addEventListener('mousemove', updateXY, false);

function updateXY(event)
{
	mouseX = event.clientX;
	mouseY = event.clientY;
	mouseMove = true;
	
	if(menu.checkMouseOverMenuIcon(mouseX, mouseY))
	{	
		return;
	}
	
	
	if (!menu.viewToggle && !dialogueBox.viewToggle)
	{
		for(let i = 0; i < 5; i++)
		{
			for(let j = 0; j < 5; j++)
			{
				let currentMouseX = event.clientX;
				let currentMouseY = event.clientY;
			
				//let currentX = board.tileSet[i][j].point.x + 10; 
				//let currentY = board.tileSet[i][j].point.y + 10; //IF TILES ARE ACTING FUCKY WHEN BEING CLICKED THEN TRY ADDING SOME OFFSET.
			
				let currentX = board.tileSet[i][j].point.x; 
				let currentY = board.tileSet[i][j].point.y;
			
				if(isValid(currentX, currentY, currentMouseX, currentMouseY, dimension)) 
				{
					current[0] = i; 
					current[1] = j;
					//mouseOverTile = true;
					break;
				}
			}
		}
	}
	
	
}

function calculateDim()
{
	//return (window.innerHeight + (window.innerWidth * 1.2)) / 25;
	return (window.innerHeight + (window.innerWidth * 1.2)) * .0325;

}

//EACH TIME A TILE IS CLICKED, THIS METHOD IS CALLED.
function onClick(event)
{
	event.preventDefault();
	//if title scren is on then get rid of it.
	if (titleScreenOn) 
	{
		titleScreenOn = false;
		audioTable['theme'].play();
		return;
	}
	console.log("Mouse x: " + event.clientX);
	console.log("Mouse y: " + event.clientY);
	
	//ALL CONDITIONAL GAME STATE STUFF BELOW HERE.
	if(roundEnd)
	{
		
		dialogueBox.clicks++;
		//catch scoreboard < 1
		//let temp = scoreboard.level - 1;
		if(scoreboard.level == 1) 
		{
			dialogueBox.setString('Resetting Collected Coins');
			scoreboard.totalScore = 0;
		}
		else
		{
			dialogueBox.setString('Dropping to level ' + (scoreboard.level - 1) + '.');
		}
		
		
		board.flipAll();
		return;
	}
	
	if(roundAdvance)
	{
		dialogueBox.clicks++;
		dialogueBox.setString("You've found all hidden cards!");
		board.flipAll();
		return;
	}
	
	//check if it is the menuIcon button being clicked.
	if (menu.checkMouseOverMenuIcon(mouseX, mouseY))
	{
		menu.viewToggle = true;
		return;
	}
	
	//disable clicking if the options menu is open.
	if(menu.viewToggle)
	{
		menu.setHighlightedItem();
		menu.doAction();
		return;
	}
	
	
	//GAME STATE FUNCTIONS END HERE.
	//check all tile coordinates, add dimension size to each point 
	for(let i = 0; i < 5; i++)
	{
		for(let j = 0; j < 5; j++)
		{
			let currentMouseX = event.clientX;
			let currentMouseY = event.clientY;
			
			//let currentX = board.tileSet[i][j].point.x + 10; 
			//let currentY = board.tileSet[i][j].point.y + 10; //IF TILES ARE ACTING FUCKY WHEN BEING CLICKED THEN TRY ADDING SOME OFFSET.
			
			let currentX = board.tileSet[i][j].point.x; 
			let currentY = board.tileSet[i][j].point.y;
			
			if(isValid(currentX, currentY, currentMouseX, currentMouseY, dimension)) 
			{
				if(event.button == 0) //left click.
				{
					let curTile = board.tileSet[i][j];
					flipTile(curTile);
				}
				else if(event.button == 2) //right click.
				{
					let curTile = board.tileSet[i][j];
					curTile.markedDead = !curTile.markedDead; //just flip the signs.
				}
				break;
			}
		}
	}
}
//KEY LISTENERS FOR KEYBOARD. IMPORTANT: Whenever the keyboard is used, mouseMove is set to false.
function keyDown(event)
{
	if (titleScreenOn) 
	{
		event.preventDefault();
		audioTable['theme'].play();
		titleScreenOn = false;
		return;
	}
	
	//when the menu is open, do these actions.
	if(menu.viewToggle)
	{
		//if the mouse is hovering over the 'back' icon, then dont allow movement.
		
		
		mouseMove = false;
		event.preventDefault();
		audioTable['select'].play();
		
		switch (event.code)
		{
			case 'Escape':
				if (menu.currentState != States.DEFAULT) menu.currentState = States.DEFAULT;
				else menu.viewToggle = !menu.viewToggle;
				break;
			case 'ArrowUp':
				if (menu.selectedIndex == 0)
				{
					menu.selectedIndex = 4;
					menu.selectedItem = 'Reset';
				}
				else
				{
					menu.selectedIndex--;
					menu.selectedItem = menu.optionItems[menu.selectedIndex];
				}
				break;
			case 'ArrowDown':
				if (menu.selectedIndex == 4)
				{
					menu.selectedIndex = 0;
					menu.selectedItem = 'About';
				}
				else
				{
					menu.selectedIndex++;
					menu.selectedItem = menu.optionItems[menu.selectedIndex];
				}
				break;
			case 'Enter':
			case 'Space':
				//menu.setHighlightedItem();
				menu.doAction();
				break;
			case 'ArrowLeft':
				if(menu.selectedItem != 'Back') menu.selectedItem = 'Back';
				break;
			case 'ArrowRight':
				if (menu.selectedItem == 'Back') 
				{
					menu.selectedItem = 'About';
					menu.selectedIndex = 0;
				}	
				break;
		}
		audioTable['select'].play();
		return;
	}
	
	if(roundEnd)
	{
		event.preventDefault();
		if (event.code =='Space' || event.code == 'Enter')
		{
			dialogueBox.clicks++;
			dialogueBox.setString('Dropping to level 1');
			board.flipAll();
			
		}
		return; //abort after performing these actions.
	}
	
	if(roundAdvance)
	{
		if (event.code == 'Space' || event.code == 'Enter')
		{
			
			event.preventDefault();
			dialogueBox.clicks++;
			dialogueBox.setString("You've found all hidden cards!");
			board.flipAll();
			//audioTable['select'].play();
		}
		return;
	}
	
	
	//all three event codes.
	if(event.code == 'Digit1' || event.code == 'Digit2'
	   || event.code == 'Digit3' || event.code == 'Backquote')
	{
		//if using the mouse to move.
		if(mouseMove)
		{
			for(let i = 0; i < 5; i++)
			{
				for(let j = 0; j < 5; j++)
				{
					let currentX = board.tileSet[i][j].point.x + 10;
					let currentY = board.tileSet[i][j].point.y + 10;
				
					let curTile = board.tileSet[i][j];
				
					if(isValid(currentX, currentY, mouseX, mouseY, dimension))
					{
						markTile(event.code, curTile);
					}
				}
			}
		}
		else if(!mouseMove) //if using arrowKeys
		{
			let curTile = board.tileSet[current[0]][current[1]];
			markTile(event.code, curTile);
		}
	}
	else if (event.code == 'ArrowRight' || event.code == 'ArrowLeft'
			 || event.code == 'ArrowDown' || event.code == 'ArrowUp')
	{
		//stop arrows from moving task bar.
		event.preventDefault();
		let i = current[0];
		let j = current[1];
		
		mouseMove = false;
		
		board.tileSet[i][j].current = false;
		switch(event.code)
		{
			case 'ArrowRight':
				if (j + 1 < 5) 
				{
					board.tileSet[i][j + 1].current = true;
					current[1] = j + 1;
				}
				break;
			case 'ArrowLeft':
				if (j - 1 >= 0)
				{
					board.tileSet[i][j - 1].current = true;
					current[1] = j - 1;
				}
				break;
			case 'ArrowUp':
				if (i - 1 >= 0)
				{
					board.tileSet[i - 1][j].current = true;
					current[0] = i - 1;
				}
				break;
			case 'ArrowDown':
				if (i + 1 <= 4)
				{
					board.tileSet[i + 1][j].current = true;
					current[0] = i + 1;
				}
				break;
		}
		audioTable['select'].play();
	}
	else if(event.code == 'Space' || event.code == 'Enter')
	{
		event.preventDefault();
		let curTile = board.tileSet[current[0]][current[1]];
		flipTile(curTile);
	}
	else if(event.code == 'Escape')
	{
		menu.viewToggle = !menu.viewToggle;
	}
}

function markTile(code, curTile)
{
	switch(code)
	{
		case 'Digit1':
			curTile.markedOne = !curTile.markedOne;
			break;
		case 'Digit2':
			curTile.markedTwo = !curTile.markedTwo;
			break;
		case 'Digit3':
			curTile.markedThree = !curTile.markedThree;
			break;
		case 'Backquote':
			curTile.markedDead = !curTile.markedDead;
			break;
	}
}

function flipTile(curTile)
{
	if(curTile.clicked) return;	
	//disable below line if you want to be able to do multiple flips
	if(animating) return;
	
	switch(curTile.value)
	{
		case 'tapped1':
			break;
		case 'tapped2':
			if(!curTile.clicked)
			{
				scoreboard.score *= 2;
				scoreboard.flippedCards++;
				scoreboard.scoreThisRound *= 2;
				//dialogueBox.setString('x2! Received ' + scoreboard.score + ' coins!');
				//dialogueBox.enableTimed();
			}
			break;
		case 'tapped3':
			if(!curTile.clicked)
			{
				scoreboard.score *= 3;
				scoreboard.scoreThisRound *= 3;
				scoreboard.flippedCards++;
				//dialogueBox.setString('x3! Received ' + scoreboard.scoreThisRound + ' coins!');
				//dialogueBox.enableTimed();
			}
			break;		
		case 'tappedLose':
			dialogueBox.enable();
			dialogueBox.setString('Oh no! You get 0 coins!');
			roundEnd = true; //DISABLE ME IF YOU WANT TO NEVER LOSE
			break;
	}
	
	curTile.clicked = true;
	curTile.startAnimate = true;
	
	if(scoreboard.scoreThisRound == scoreboard.maxRoundScore)
	{
		dialogueBox.enable();
		dialogueBox.setString('Game Clear!');
		roundAdvance = true;
	}
	
}

//CHECKS IF GIVEN POINTS ARE A VALID TILE
function isValid(pointX, pointY, currentMouseX, currentMouseY, dimension)
{
	return currentMouseX >= (pointX) &&	
				currentMouseX <= (pointX + Math.floor(dimension)) &&
				currentMouseY >= pointY && 
				currentMouseY <= (pointY + Math.floor(dimension));
}

//METHOD TO RESIZE CANVAS AFTER WINDOW HAS CHANGED. HANDLES DIMENSION, CANVAS WIDTH AND HEIGHT.
function resizeCanvas()
{
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	dimension = calculateDim();
		
	scoreboard.updateViewer();
	board.updateBoard();
	menu.updateViewer();
	dialogueBox.updateBox();
}
//HOLDER CLASS FOR X AND Y COORDINATES OF PAGE ELEMENTS
class Point
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
	
	toString()
	{
		return "(" + this.x + ", " + this.y + ")";
	}
}

//TILE HANDLES: EACH SPOT ON THE BOARD IS A TILE OBJECT, TILE PAINTS STUFF.
class Tile
{
		constructor(lossTiles, value, img, point)
		{
			this.value = value;
			this.img = img;
			this.point = point;
			
			// BELOW THIS ARE ONLY TILE-SPECIFIC FIELDS.
			// OUTSIDE: keep track of total losses on each row.
			this.lossTiles = lossTiles;
			// OUTSIDE: keep track of total point count in row.
			this.totalPoints  = 0;
			// ALL CLICKABLE TILES: keep track of whether or not this tile was clicked.
			this.clicked = false;
			
			// OUTSIDE TILES: keep track of whether or not this tile is an outside one.
			this.outside = false;
			
			// MEMO USAGE BELOW:
			this.markedOne = false;
			this.markedTwo = false;
			this.markedThree = false;
			this.markedDead = false;
			
			// CURRENT TILE
			this.current = false;
			
			// ANIMATE STUFF
			this.startAnimate = false;
			this.flipBackwards = false;
			this.alreadyAnimated = false;
			this.kaboomDisable = false;
			this.loopIndex = 0; //used to keep track of current frame.
			this.maxFrame = 14;
		}
		
		paint(context, i, j)
		{
			let curX = this.point.x;
			let curY = this.point.y;
			
			//animate stuff.
			if(this.startAnimate)
			{
				animating = true;
				
				clock.countFrames();
				if (clock.frameCounter > clock.fps * 1.25) //this right here decides duration
														   //of the animation. Higher = longer animation
				{
					this.loopIndex++;
					clock.frameCounter = 0;	
				}
			}
			
			//update dimension value at draw time.
			dimension = calculateDim();
			
			//if this tile is an outside one
			if (this.outside)
			{
				this.drawOutside(context, curX, curY);
			}
			// if tile is clickable but not yet clicked.
		    else if (!this.clicked)
			{
				this.drawUnclicked(context, curX, curY);
			}
			
		    if ( (this.startAnimate && !this.alreadyAnimated) || this.flipBackwards) //animation time but not already animated.
			{
				if(this.loopIndex == this.maxFrame) //base case: end animation.
				{
					context.drawImage(spriteTable[this.value], curX, curY, dimension, dimension);
					this.startAnimate = false;
					this.alreadyAnimated = true;
					this.loopIndex = 0;
					animating = false; //reset global back to false.
				}
				else //regular animation.
				{
					if (!this.kaboomDisable) //if kabooms are enabled
					{
						this.animateKaboom(context, curX, curY);
					}
					else if(!this.flipBackwards)
					{
						context.drawImage(spriteTable[this.value], curX, curY, dimension, dimension);
					}
					else if(this.flipBackwards)
					{
						this.animateBackwards(context, curX, curY);
					}
					
					if(this.flipBackwards)
					{
						this.animateBackwards(context, curX, curY);
					}
					else
					{
						this.animateFlip(context, curX, curY);
					}
				}
			}
			//tile is clickable and already clicked.
			else if (this.clicked || this.kaboomDisable)
			{
				context.drawImage(spriteTable[this.value], curX, curY, dimension, dimension);
			}
			
			//this guy last because he is drawn on top of other tiles.
			if (this.checkHover(i, j) && menu.viewToggle == false)
			{
				this.drawHover(context, curX, curY);
				if(this.startAnimate && !this.kaboomDisable) this.animateKaboom(context, curX, curY, i, j);
			}

		}
		
		drawHover(context, curX, curY)
		{
			context.drawImage(spriteTable['tileHover'], curX, curY, dimension, dimension);
		}
		
		checkHover(i, j)
		{
			return i == current[0] && j == current[1];
		}
		
		drawOutside(context, curX, curY)
		{
			context.drawImage(this.img, curX, curY, dimension, dimension);
			//rescale the image size.
			let edgeDim = dimension * .27;
			//get offsets for calculating current point.
			let edgeX = dimension * .63;
			let edgeY = dimension * .5;
			//lossTile calculation
			let str = 'spriteCount' + this.lossTiles;
			context.drawImage(spriteTable[str], curX + edgeX , curY + edgeY, edgeDim, edgeDim);
			
			//TOTAL POINTS IN ROW
			str = this.totalPoints.toString();
			while(str.length < 2) str = "0" + str;
				
			edgeX = dimension * .3;
			edgeY = dimension * .075;
			context.drawImage(spriteTable['spriteCount' + str.charAt(0)], curX + edgeX, curY + edgeY, edgeDim, edgeDim);
				
			edgeX = dimension * .61;
			edgeY = dimension * .075;
			context.drawImage(spriteTable['spriteCount' + str.charAt(1)], curX + edgeX, curY + edgeY, edgeDim, edgeDim);
			
			//draw the voltorb last.
			edgeDim = dimension * .62;
			edgeX = dimension * .05;
			edgeY = dimension * .375;
			context.drawImage(spriteTable['voltorb'], curX + edgeX, curY + edgeY, edgeDim, edgeDim);
		}
		
		drawUnclicked(context, curX, curY)
		{
			context.drawImage(this.img, curX, curY, dimension, dimension);
			//context.drawImage(spriteTable['tile1'], 0, 0, TILEWIDTH, TILEHEIGHT, curX, curY, dimension, dimension);
			
			let smallDim = dimension * .20;
			let smallPoint = dimension * .125;
			
			if(this.markedDead) context.drawImage(spriteTable['dead'], curX + smallPoint, curY + smallPoint, smallDim, smallDim);
			smallDim = dimension * .17;
		    smallPoint = dimension * .15;
			let xOffset = dimension * .70;
			if(this.markedOne) context.drawImage(spriteTable['memo1'], curX + xOffset, curY + smallPoint, smallDim, smallDim);
			
			smallPoint = dimension * .7;
			if(this.markedTwo) context.drawImage(spriteTable['memo2'], curX + smallPoint, curY + smallPoint, smallDim, smallDim);
			
			xOffset = dimension * .15;
			if(this.markedThree) context.drawImage(spriteTable['memo3'], curX + xOffset, curY + smallPoint, smallDim, smallDim);
			
		}
		
		drawClicked(context, curX, curY)
		{
			context.drawImage(spriteTable[this.value], curX, curY, dimension, dimension);
		}
		
		animateFlip(context, curX, curY)
		{	
			//changing the values here decides how long to draw each image for.
			if (this.loopIndex == 0)
			{
				context.drawImage(this.img, curX, curY, dimension, dimension);
			}
			else if (this.loopIndex == 1)
			{
				context.drawImage(spriteTable['flipAnim1'], curX, curY, dimension, dimension);
			}
			else if (this.loopIndex == 2)
			{
				context.drawImage(spriteTable['flipAnim2'], curX, curY, dimension, dimension);
			}
			else if (this.loopIndex == 3)
			{
				context.drawImage(spriteTable['flipAnim3'], curX, curY, dimension, dimension);
			}
		}
		
		animateKaboom(context, curX, curY, i, j)
		{
			//kaboom dimensions are bigger than regular tile.
			let kDim = dimension * 1.5;
			let kX = curX - (dimension * .23);
			let kY = curY - (dimension * .23);
			let bool = this.checkHover(i, j);
			
			if (this.loopIndex >= 4 && this.loopIndex <= 5)
			{
				this.drawClicked(context, curX, curY);
				if(bool) this.drawHover(context, curX, curY);
			}
			else if (this.loopIndex  >= 6 && this.loopIndex <= 8)
			{
				this.drawClicked(context, curX, curY);
				if(bool) this.drawHover(context, curX, curY);
				context.drawImage(spriteTable['kaboom1'], kX, kY, kDim, kDim);
			}
			else if (this.loopIndex >= 9 && this.loopIndex <= 11)
			{
				this.drawClicked(context, curX, curY);
				if(bool) this.drawHover(context, curX, curY);
				context.drawImage(spriteTable['kaboom2'], kX, kY, kDim, kDim);
			}
			else if (this.loopIndex >= 12)
			{
				this.drawClicked(context, curX, curY);
				if(bool) this.drawHover(context, curX, curY);
				context.drawImage(spriteTable['kaboom3'], kX, kY, kDim, kDim);
			}
		}
		
		animateBackwards(context, curX, curY)
		{
			switch(this.loopIndex)
			{
				case 0:
					this.drawClicked(context, curX, curY);
					break;
				case 1:
					context.drawImage(spriteTable['flipAnim3'], curX, curY, dimension, dimension);
					break;
				case 2:
					context.drawImage(spriteTable['flipAnim2'], curX, curY, dimension, dimension);
					break;
				case 3:
					context.drawImage(spriteTable['flipAnim1'], curX, curY, dimension, dimension);
					this.value =  'default';
					//this.flipBackwards = false;
					break;
			}
		}
	}

//KEEPS TRACK OF FRAME DATA
class Clock
{
	constructor()
	{
		this.secondsPassed = 0;
		this.fps = 0;
		this.oldTimeStamp = 0;
		this.frameCounter = 0;
	}
	
	updateFields(timeStamp)
	{
		//console.log('old stamp ' + this.oldTimeStamp);
		this.secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
		this.oldTimeStamp = timeStamp;
		
		this.fps = Math.round( 1 / this.secondsPassed);
	}
	
	
	//used to track how many frames go by for animations.
	countFrames()
	{
		this.frameCounter += this.fps;
	}
	
	reset()
	{
		this.secondsPassed = 0;
		this.fps = 0;
		this.oldTimeStamp = 0;
		this.frameCounter = 0;
	}
	
}

//BOARD HANDLES: TILE PLACEMENT, TILE TYPE, DIFFICULTY/SPOT GENERATION.
class Board
{
	constructor()
	{
		this.tileSet = new Array();
		
		for(let i = 0; i < SIZE; i++)
		{
			this.tileSet[i] = new Array();
		}
	}	

	paint(context)
	{
		for(let i = 0; i < SIZE; i++)
		{
			//this.tileSet[i].paint(context);		
			for(let j = 0; j < SIZE; j++)
			{
				let t = this.tileSet[i][j];
				if( (i != SIZE - 1) || (j != SIZE - 1))
				{
					t.paint(context, i, j);
				}
			}
		}
	}
	
	loadBoard()
	{
		let xGap = dimension * 1.15;
		let xCounter = this.calculateTileSetX();
		let yGap = (dimension * 1.1);
		let yCounter = 2;
		
		for(let i = 0; i < SIZE; i++)
		{
			for(let j = 0; j < SIZE; j++, xCounter += xGap)
			{
				board.tileSet[i][j] = new Tile(0, 'tapped1', spriteTable['default'], new Point(xCounter, yCounter));
				//set outside tiles to true.
				if ((i == SIZE - 1) || (j == SIZE - 1))
				{
					board.tileSet[i][j].outside = true;
				}
			}
			
			xCounter = this.calculateTileSetX();
			yCounter += yGap;	
		}
		
		//generate the randomly placed spots once the board has been loaded.
		generateSpots(scoreboard.level);
	}
	
	//utility to reload new points without compromising game state.
	updateBoard()
	{
		let xGap = dimension * 1.15;
		let xCounter = this.calculateTileSetX();
		let yGap = (dimension * 1.1);
		let yCounter = 2;	
	
		for(let i = 0; i < SIZE; i++)
		{
			for(let j = 0; j < SIZE; j++, xCounter += xGap)
			{
				board.tileSet[i][j].point.x = xCounter;
				board.tileSet[i][j].point.y = yCounter;
			}
			xCounter = this.calculateTileSetX();
			yCounter += yGap;
		}
	}
	
	calculateTileSetX()
	{
		return (window.innerWidth * .5);
	}
	
	//Dude I have no clue why it doesn't just work the normal way but for now he works.
	flipAll()
	{
		
		for (let i = 0; i <= 4; i++)
		{	
			this.flipRow(i);
		}
	}
	
	flipRow(col)
	{
		for (let i = 0; i <= 4; i++)
		{
			this.tileSet[col][i].kaboomDisable = true;
			this.tileSet[col][i].clicked = true;
			this.tileSet[col][i].startAnimate = true;
			//console.log('flipped ' + i + ' ' + col);
		}
	}
	
	flipBackwards()
	{
		for(let i = 0; i <= 4; i++)
		{
			for(let j = 0; j <= 4; j++)
			{
				this.tileSet[j][i].kaboomDisable = true;
				this.tileSet[j][i].clicked = false;
				this.tileSet[j][i].startAnimate = true;
				this.tileSet[j][i].flipBackwards = true;
				animating = true;
			}							
		}
		
		if(roundEnd) endRound();
		if(roundAdvance) advanceRound();
		
		animating = false;
	}
}

//SCOREBOARD HANDLES: CURRENT SCORE, CURRENT LEVEL
class Scoreboard
{
	constructor(viewer)
	{
		this.level = 1;
		
		this.viewer = viewer;
		
		this.point;
		
		this.width;
		this.height;
		this.flippedCards = 0;
		
		//global trackers
		this.maxRoundScore = 0;
		this.scoreThisRound = 1;
		this.totalScore = 0;
		
		this.updateViewer();
	}
	
	paint(context)
	{
		context.drawImage(this.viewer, this.point.x, this.point.y, this.width, this.height);
		
		this.drawText(context);
		this.drawRoundScore(context);
		this.drawTotalScore(context);
		this.drawLevel(context);
	}
	
	//updates the viewer when window is resized. make sure it matches all fields in constructor!
	updateViewer()
	{
		
		
		
		//this.width = window.innerWidth / 2.65;
		this.width = dimension * 6.25;
		let x = board.calculateTileSetX() - (this.width * 1.05);
		
		this.point = new Point(x, window.innerHeight * .01);
		this.height = dimension * 6.25;
	}
	
	drawText(context)
	{
		//calculate point/dimension for 'collected coins'
		let coinsX = this.point.x + (this.width * .325);
		let coinsY = this.point.y + (this.height * .5);
		
		let coinsWidth = dimension * 2.5;
		let coinsHeight = dimension * .6;
		
		context.drawImage(spriteTable['yourCoins'], coinsX, coinsY, coinsWidth, coinsHeight);
		
		//recalculate all stuff for collected coins.
		coinsX = this.point.x + (this.width * .275);
		coinsY = this.point.y + (this.height * .0575);
		
		coinsWidth = dimension * 3;
		coinsHeight = (this.height - this.point.y) * .2;
		
		
		context.drawImage(spriteTable['collectedCoins'], coinsX, coinsY, coinsWidth, coinsHeight);
	}
	
	drawTotalScore(context)
	{
		let scoreWidth = dimension * .8;
		let scoreHeight = (this.height - this.point.y) * .225;
		
		let scoreX = this.point.x + (this.width * .175);
		let scoreY = this.point.y + (this.height * .6125);
		
		let temp = this.scoreToString(this.totalScore);
		
		for (let i = 0; i <= 4; i++)
		{
			let sprite = "score" + temp.charAt(i);
			
			context.drawImage(spriteTable[sprite], scoreX, scoreY, scoreWidth, scoreHeight);
			
			scoreX += scoreWidth * 1.07;
		}
	}
	
	//draws the score board
	drawRoundScore(context)
	{
		let scoreWidth = dimension * .8;
		let scoreHeight = dimension * 1.25;
		
		let scoreX = this.point.x + (this.width * .175);
		let scoreY = this.point.y + (this.height * .265);
		
		//let temp = this.scoreThisRound.toString();
		let temp = this.scoreToString(this.scoreThisRound);
		
		for(let i = 0; i <= 4; i++)
		{	
			let sprite = "score" + temp.charAt(i);
			context.drawImage(spriteTable[sprite], scoreX, scoreY, scoreWidth, scoreHeight);
			
			scoreX += scoreWidth * 1.07;
		}
	}
	
	drawLevel(context)
	{
		let levelWidth = (this.width - this.point.x) * .3;
		let levelHeight = (this.height - this.point.y) * .075;
		let levelX = this.point.x + (this.width * .425);
		let levelY = this.point.y + (this.height * .85);
		
		
		context.drawImage(spriteTable['levelCount' + this.level], levelX, levelY, levelWidth, levelHeight);
	}
	
	scoreToString(score)
	{
		let temp = score.toString();
		while(temp.length < 5) temp = "0" + temp;
		return temp;
	}
	
}

class Menu
{
	constructor()
	{
		this.iconPoint;
		
		this.viewToggle = false;
		
		this.box = spriteTable['menuBackground'];
		//fields for locating shtuff.
		this.boxX, this.boxY, this.boxHeight, this.boxWidth, this.fontSize, this.itemX, this.menuIconWidth, this.menuIconHeight;
		//fields for back button location
		this.backX, this.backY, this.backDim;
		
		//itemYArray is useful because it keeps track of each menu items y-location so it doesn't have to constantly be recalculated. if window is resized then it is recalculated.
		this.itemYArray = [0, 0, 0, 0, 0];
		
		//just the current state of the menu. Probably a better way to do it but this works fine.
		this.currentState = States.DEFAULT;
		
		this.optionItems = [ 'About', 'Rules', 'Sound', 'Controls', 'Reset'];
		
		//selected option is a field that holds the currently selected value. Initialized to default.
		this.selectedItem = 'About';
		this.selectedIndex = 0;
		
		this.setDimensions();
	}
	
	paint(context)
	{
		context.drawImage(spriteTable['menuIcon'], this.iconPoint.x, this.iconPoint.y, this.menuIconWidth, this.menuIconHeight);
		this.paintMenuHover(context);
		
		
		if(this.viewToggle)
		{	
			context.save();
			//fill in screen with opaque.
			context.fillStyle = 'rgb(0, 0, 0, 0.5)';
			context.fillRect(0, 0, canvas.width, canvas.height);
			document.body.style.backgroundColor = "rgb(0, 0, 0, 0.5)";
			
			
			//draw the actual menu box.
			context.drawImage(this.box, this.boxX, this.boxY, this.boxWidth, this.boxHeight);
			
			let tempX, tempY, tempH, tempW = 0;
			
			switch (this.currentState)
			{
				case States.DEFAULT:
					this.setHighlightedItem();
					this.paintMenuItems(context);
					this.highlight(context);
					break;
				case States.CONTROLS:
					tempX = this.boxX * 3.5;
					tempY = this.boxY * 1.5;
					tempH = this.boxHeight * .9;
					tempW = this.boxWidth * .375;
					context.drawImage(spriteTable['controls'], tempX, tempY, tempW, tempH);
					break;
				case States.RULES:
					tempX = this.boxX * 3.125;
					tempY = this.boxY * 1.5;
					tempH = this.boxHeight * .9;
					tempW = this.boxWidth * .45;
					context.drawImage(spriteTable['rules'], tempX, tempY, tempW, tempH);
					break;
				case States.ABOUT: 
					tempX = this.boxX * 3.25;
					tempY = this.boxY * 1.5;
					tempH = this.boxHeight * .6;
					tempW = this.boxWidth * .4;
					context.drawImage(spriteTable['about'], tempX, tempY, tempW, tempH);
					break;
				case States.SOUND:
					this.displaySound();
					break;
			}

			//make 'back' hover work on all states.
			if ((this.checkMouseOverBack(mouseX, mouseY) && mouseMove ) || (this.selectedItem == 'Back' && !mouseMove))
			{
				
				
				context.beginPath();
				context.strokeStyle = "red";
				context.rect(this.backX - (.02 * this.backX), this.backY - (.02 * this.backY), this.backDim * 1.2, this.backDim * 1.1);
				context.stroke();
			}
			
			//Back is visible from every menu option. 
			this.paintBackIcon(context);
			
			context.restore();	
		}
	}
	
	setDimensions()
	{
		//all control menu dimensions.

		this.menuIconWidth = dimension * .75;
		this.menuIconHeight = dimension * .75;
		this.iconPoint = new Point(board.tileSet[5][5].point.x, board.tileSet[5][5].point.y * 1.01);
		
		//all control box/viewer dimensions.
		this.boxX = window.innerWidth * .1;
		this.boxY = window.innerHeight *.1;
		this.boxHeight = window.innerHeight * .75;
		this.boxWidth = window.innerWidth * .75;
		
		//calculating position for back button. Make sure comes after box calculations.
		this.backX = this.boxX * 1.4;
		this.backY = this.boxY * 1.5;
		this.backDim = this.boxHeight / 10;
		
		//generate all y-coordinates.
		let temp = this.boxY + (this.boxHeight * .185);
		for (let i = 0; i < this.optionItems.length; i++, temp += (this.boxHeight * .185))
		{
			this.itemYArray[i] = temp;
		}
		
		//generate x-coordinate. Doesn't change.
		this.itemX = this.boxX + (this.boxWidth * .4);
		
		this.fontSize = this.boxHeight * .06 + this.boxWidth * .06;
	}
	
	//this method will be run and updated constantly whenever the menu is open.
	setHighlightedItem()
	{
		let selectX = this.itemX * .965; //how far outside of the x coordinate can be selected.
		
		if(mouseMove)
		{
			if (mouseX > (selectX) && mouseX < (this.itemX * 1.6) && mouseY > this.itemYArray[0] *.625 && mouseY < this.itemYArray[0] * 1.2)
			{
				this.selectedItem = 'About';
				this.selectedIndex = 0;
			}
			else if (mouseX > (selectX) && mouseX < (this.itemX * 1.6) && mouseY > this.itemYArray[1] * .75 && mouseY < this.itemYArray[1] * 1.2)
			{
				this.selectedItem = 'Rules';
				this.selectedIndex = 1;
			}
			else if (mouseX > (selectX) && mouseX < this.itemX * 1.6 && mouseY > this.itemYArray[2] * .81 && mouseY < this.itemYArray[2] * 1.1)
			{
				this.selectedItem = 'Sound';
				this.selectedIndex = 2;
			}
			else if (mouseX > (selectX) && mouseX < this.itemX * 1.6 && mouseY > this.itemYArray[3] * .85 && mouseY < this.itemYArray[3] * 1.05)
			{
				this.selectedItem = 'Controls';
				this.selectedIndex = 3;
			}
			else if (mouseX > (selectX) && mouseX < this.itemX * 1.5 && mouseY > this.itemYArray[4] * .875 && mouseY < this.itemYArray[4] * 1.2)
			{
				this.selectedItem = 'Reset';
				this.selectedIndex = 4;
			}
			else if (this.checkMouseOverBack(mouseX, mouseY))
			{
				//console.log('working');
				this.selectedItem = 'Back';
			}
			else
			{
				this.selectedItem = 'Nothing';
			}
		}
	}
	
	updateViewer()
	{
		this.point = new Point(window.innerWidth * .9, window.innerHeight * .8);
		this.dimension = (window.innerWidth + window.innerHeight) *
		this.setDimensions();
	}
	
	paintMenuItems(context)
	{
		context.save();
		
		context.font = this.fontSize + 'px DSFONT';
		context.fillStyle = '#4d4d55';
		
		for (let i = 0; i < this.optionItems.length; i++)
		{
			context.fillText(this.optionItems[i], this.itemX, this.itemYArray[i]);
		}
		
		context.restore();
	}
	
	//highlight just draws the rect. It doesn't handle the coordinate shit. 
	highlight(context)
	{
		context.beginPath();
		context.strokeStyle = "red";
		
		let rectX = this.itemX * .965;
		let rectWidth = this.boxWidth;
		let rectHeight = this.boxHeight;
		context.font = this.fontSize * .8 + 'px DSFONT';
		context.fillStyle = '#4d4d55';
		
		switch(this.selectedItem)
		{
			case this.optionItems[0]: //'About'
				rectWidth = context.measureText('About').width * 1.5;
				context.rect(rectX, this.itemYArray[0] * .625, rectWidth, rectHeight * .15);
				context.stroke();
				break;
			case this.optionItems[1]: //'Rules'
				rectWidth = context.measureText('Rules').width * 1.5;
				context.rect(rectX, this.itemYArray[1] * .75, rectWidth, rectHeight * .15);
				context.stroke();
				break;
			case this.optionItems[2]: //'Sound'
				rectWidth = context.measureText('Sound').width * 1.5;
				context.rect(rectX, this.itemYArray[2] * .81, rectWidth, rectHeight * .15);
				context.stroke();
				break;
			case this.optionItems[3]: //'Controls'
				rectWidth = context.measureText('Controls').width * 1.5;
				context.rect(rectX, this.itemYArray[3] * .85, rectWidth, rectHeight * .15);
				context.stroke();
				break;
			case this.optionItems[4]: //'Reset'
				rectWidth = context.measureText('Reset').width * 1.5;
				context.rect(rectX, this.itemYArray[4] * .875, rectWidth, rectHeight * .15);
				context.stroke();
				break;
			default:
				break;
		}
	}
	
	displaySound()
	{
		let stringX = this.boxX * 2.5;
		let stringY = this.boxY * 2.5;
		let buttonDim = dimension * .4;
		
		context.font = this.fontSize * .8 + 'px DSFONT';
		context.fillStyle = '#4d4d55';
		
		let str1 = 'Music: 100';
		let str2 = 'Sound Effects: 100';
		
		context.fillText(str1, stringX, stringY);
		
		let buttonX = stringX + context.measureText(str1).width * 1.1;
		let buttonY = this.boxY * 2;
		
		context.drawImage(spriteTable['soundDown'], buttonX, buttonY, buttonDim, buttonDim);
		context.drawImage(spriteTable['soundUp'], buttonX + (buttonDim * 1.1), buttonY, buttonDim, buttonDim);
		
		//do it again for second string.
		context.fillText('Sound Effects: 100', stringX, stringY * 1.5);
		
		buttonX = stringX + context.measureText(str2).width * 1.05;
		buttonY = this.boxY * 3.2;
		
		context.drawImage(spriteTable['soundDown'], buttonX, buttonY, buttonDim, buttonDim);
		context.drawImage(spriteTable['soundUp'], buttonX + (buttonDim * 1.1), buttonY, buttonDim, buttonDim);
	}
	
	//just switch the toggle.
	doAction()
	{		
		if (this.selectedItem == 'Back')
		{
			if (this.currentState == States.DEFAULT) this.viewToggle = false;
			else this.currentState = States.DEFAULT;
		}
		
		if (this.currentState == States.DEFAULT)
		{
			switch(this.selectedItem)
			{
				case 'About':
					this.currentState = States.ABOUT;
					break;
				case 'Rules':
					this.currentState = States.RULES;
					break;
				case 'Sound':
					this.currentState = States.SOUND;
					break;
				case 'Controls':
					this.currentState = States.CONTROLS;
					break;
				case 'Reset':
					resetGame();
					alert('Game Reset.');
					break;
			}
		}
	}
	paintBackIcon(context)
	{
		context.drawImage(spriteTable['back'], this.backX, this.backY, this.backDim, this.backDim);
	}
	
	paintMenuHover(context)
	{
		if (this.checkMouseOverMenuIcon(mouseX, mouseY))
		{
			context.drawImage(spriteTable['menuIconHovered'], this.iconPoint.x, this.iconPoint.y, this.menuIconWidth, this.menuIconHeight);
		}
	}
	
	checkMouseOverBack(mouseX, mouseY)
	{ 
		return mouseX >= this.backX && mouseX <= (this.backX + this.backDim) && mouseY >= this.backY && mouseY <= (this.backY + this.backDim);
	}
	
	checkMouseOverMenuIcon(mouseX, mouseY)
	{
		return mouseX >= menu.iconPoint.x + 10 && mouseX <= (menu.iconPoint.x + menu.menuIconWidth + 5) && mouseY >= (menu.iconPoint.y) && mouseY <= (menu.iconPoint.y * 1.02) + menu.menuIconHeight;
	}
}

class DialogueBox
{
	constructor()
	{
		this.viewToggle = false; //toggle for whether or not box is viewable
		this.timedWindow = false;
		
		this.background = spriteTable['dialogueBox'];
		
		this.timer = new Clock();
				
		this.boxHeight = window.innerHeight * .15;
		this.boxWidth = window.innerWidth * .6;
		this.boxX = window.innerWidth * .2;
		this.boxY = window.innerHeight * .8;
		
		
		this.textX = window.innerWidth * .25;
		this.textY = window.innerHeight * .9;
		
		this.fontSize = this.boxHeight * .075 + this.boxWidth * .075;
		
		this.clicks = 0; //keep track of total clicks after box is open.
		this.string = 'Empty.';
	}
	
	paint(context)
	{
		if (this.viewToggle)
		{
			//save the current context values before altering them.
			context.save();
			
			if (roundEnd || roundAdvance) //end of round
			{
				if (this.clicks >= 2 && roundEnd) //advance round from here!
				{
					this.viewToggle = false;
					board.flipBackwards();	
					
					if(!animating)
					{
						this.clicks = 0;
						this.viewToggle = false;
					}
				}
				
				if (this.clicks == 2 && roundAdvance)
				{
					if(scoreboard.level + 1 > 8)
					{
						this.string = 'Congratulations! You won with a score of ' + scoreboard.totalScore;
					}
					else
					{
						this.string = 'Advancing to level ' + (scoreboard.level + 1) + '.';
					}
				}
				else if(this.clicks > 2 && roundAdvance)
				{
					this.viewToggle = false;
					board.flipBackwards();
					
					this.viewToggle = false;
					this.clicks = 0;
				}
				
				//draws the opaque rectangle aroudn the whole screen.
				context.fillStyle = 'rgb(0, 0, 0, 0.5)';
				context.fillRect(0, 0, canvas.width, canvas.height);
				
				this.drawBox(context);
			}
			else if (this.timedWindow)//if window is timed.
			{
				this.timer.countFrames();
				
				if (this.timer.frameCounter < this.timer.fps * 100)
				{
					this.drawBox(context);
				}
				else //stops drawing the dialogue box.
				{
					this.viewToggle = false;
					this.timedWindow = false;
					this.timer.reset();
				}
			}
			
			context.restore(); //reset the context values to previous stuff.
		}
	}
	
	//draws the dialogue box.
	drawBox(context)
	{
		context.drawImage(this.background, this.boxX, this.boxY, this.boxWidth, this.boxHeight);
		context.font = this.fontSize +'px DSFONT';
		context.fillStyle = '#4d4d55';
		context.fillText(this.string, this.textX, this.textY);
	}
	
	setString(string)
	{
		this.string = string;
	}
	
	updateBox()
	{
		this.boxHeight = window.innerHeight * .15;
		this.boxWidth = window.innerWidth * .6;
		this.boxX = window.innerWidth * .2;
		this.boxY = window.innerHeight * .8;
		//text stuff below here.
		this.textX = window.innerWidth * .25;
		this.textY = window.innerHeight * .9;
		
		if(this.fontSize > this.boxHeight)
		{
			this.fontSize = this.boxHeight * .5;
		}
		else if (this.fontSize > this.boxWidth)
		{
			this.fontSize = this.boxWidth * .05; 
		}
		else
		{
			this.fontSize = this.boxHeight * .075 + this.boxWidth * .075;
		}
	}
	
	enable()
	{
		this.viewToggle = true;
	}
	
	enableTimed()
	{
		this.viewToggle = true;
		this.timedWindow = true;
		this.timer.reset();
	}
	
	disable()
	{
		this.viewToggle = false;
	}
}

function advanceRound()
{		
	
	scoreboard.totalScore += scoreboard.scoreThisRound;
	scoreboard.scoreThisRound = 1;
	scoreboard.flippedCards = 0;
	roundAdvance = false;
	
	if(scoreboard.level != 8)
	{
		scoreboard.level++;
		dialogueBox.disable();
	}
	else
	{
		dialogueBox.enable();
		dialogueBox.setString('Congrats! You won!');
	}
	
	board.loadBoard();
}

//END CURRENT ROUND
function endRound()
{	
	scoreboard.score = 1;
	//uncomment this line when more difficulties are added
	scoreboard.scoreThisRound = 1
	//scoreboard.totalScore = 0;
	
	if (scoreboard.level - 1 == 0) scoreboard.level = 1;
	else scoreboard.level--;
	
	scoreboard.flippedCards = 0;
	roundEnd = false;
	board.loadBoard();
}

function resetGame()
{
	scoreboard.score = 1;
	//uncomment this line when more difficulties are added
	scoreboard.scoreThisRound = 1
	//scoreboard.totalScore = 0;
	scoreboard.level = 1;
	scoreboard.totalScore = 0;
	
	scoreboard.flippedCards = 0;
	roundEnd = false;
	board.loadBoard();
}

//INITIALIZE OUTSIDE TILE VALUES
function initOutsideTiles()
{
	for(let i = 0; i < SIZE - 1; i++)
	{
		for(let j = 0; j < SIZE - 1; j++)
		{
			switch(board.tileSet[i][j].value)
			{
				case 'tappedLose':
					//for each tile at end of row, count total amount of lossTiles in that row.
					board.tileSet[i][5].lossTiles++;
					board.tileSet[5][j].lossTiles++;
					break;
				case 'tapped1':
					board.tileSet[i][5].totalPoints++;
					board.tileSet[5][j].totalPoints++;
					break;
				case 'tapped2':
					board.tileSet[i][5].totalPoints += 2;
					board.tileSet[5][j].totalPoints += 2;
					break;
				case 'tapped3':
					board.tileSet[i][5].totalPoints += 3;
					board.tileSet[5][j].totalPoints += 3;
					break;
			}
			
			let tempI = 'outsideTile' + (i + 1);
			let tempJ = 'outsideTile' + (j + 1);
			board.tileSet[i][5].img = spriteTable[tempI];
			board.tileSet[5][j].img = spriteTable[tempJ];
		}
	}
	
}

//HANDLES WHERE POINT TILES ARE PLACED ON THE BOARD
function loadPointTiles(point, count)
{
	let i = 0;
	
	while((i != count))
	{
		let randX = getRandomRange(5);
		let randY = getRandomRange(5);
		if(board.tileSet[randX][randY].value == 'tapped1')
		{
			board.tileSet[randX][randY].value = 'tapped' + point;
			console.log('Number 2: ' + randX + ', ' + randY);
			i++;
		}
	}
}

//HELPER: RETURNS RANDOM NUMBER FROM 0 TO NUM(EXCLUSIVE OF NUM)
function getRandomRange(num)
{
	return Math.floor(Math.random() * num);
}

//PUTS VOLTORBS ON BOARD
function placeVoltorbs(level)
{
	let count = 0;
	while (count < level)
	{
		let randX = getRandomRange(5);
		let randY = getRandomRange(5);
		if(board.tileSet[randX][randY].value == 'tapped1') //if default 1 value
		{		
			board.tileSet[randX][randY].value = 'tappedLose';
			count++;
		}
	}
}

//takes the current board field and generates it with all the values.
function generateSpots(level)
{
	var counts;
	var possiblePlacements;
	var temp;
	//REFERENCE FOR DIFFICULTIES: https://bulbapedia.bulbagarden.net/wiki/Voltorb_Flip
	switch(scoreboard.level)
	{
		case 1:
			placeVoltorbs(6);
			//var coinRange = [24, 27, 32, 36, 48]
			//possiblePlacements[0] = 2's, [1] = 3's
			possiblePlacements = [[3, 1],
								  [0, 3],
								  [5, 0],
								  [2, 2],
								  [4, 1]];
		    counts = possiblePlacements[getRandomRange(5)];
			break;
		case 2:
			placeVoltorbs(7);
			possiblePlacements = [[1, 3],
								  [6, 0],
								  [3, 2],
								  [0, 4],
								  [5, 1]];
			counts = possiblePlacements[getRandomRange(5)];
			break;
		case 3:
			placeVoltorbs(8);
			possiblePlacements = [[2, 3],
								  [7, 0],
								  [4, 2],
								  [1, 4],
								  [6, 1]];
			counts = possiblePlacements[getRandomRange(5)];
			break;
		case 4: //for level 4, there can be two amounts of voltorbs placed: 8 and 10.
			temp = getRandomRange(5);
			if(temp <= 1) //two options for 8 voltorbs.
			{
				placeVoltorbs(8);
				possiblePlacements = [ [3,3], [0,5] ];
				counts = possiblePlacements[getRandomRange(2)];
			}
			else //three options for 10 voltorbs.
			{
				placeVoltorbs(10);
				possiblePlacements = [ [8, 0], [5, 2], [2, 4] ];
				counts = possiblePlacements[getRandomRange(3)];
			}
			break;
		case 5: //five is all ten voltorbs.
			placeVoltorbs(10);
			possiblePlacements = [[7, 1],
								  [4, 3],
								  [1, 5],
								  [9, 0],
								  [6, 2]];
			counts = possiblePlacements[getRandomRange(5)];
			break;
		case 6:
			placeVoltorbs(10);
			possiblePlacements = [[3, 4],
								  [0, 6],
								  [8, 1],
								  [5, 3],
								  [2, 5]];
			counts = possiblePlacements[getRandomRange(5)];
			break;
		case 7: //level 7 is just like level 4
			temp = getRandomRange(5);
			if(temp <= 1)
			{
				placeVoltorbs(13);
				possiblePlacements = [ [1, 6], [9, 1] ];
				counts = possiblePlacements[getRandomRange(2)];
			}
			else
			{
				placeVoltorbs(10);
				possiblePlacements = [ [7, 2], [4, 4], [6,3] ];
				counts = possiblePlacements[getRandomRange(3)];
			}
			break;
		case 8:
			placeVoltorbs(10);
			possiblePlacements = [[0, 7],
								  [8, 2],
								  [5, 4],
								  [2, 6],
								  [7, 3]];
			counts = possiblePlacements[getRandomRange(5)];
			break;	
	}
	loadPointTiles(2, counts[0]);
	loadPointTiles(3, counts[1]);
	//set the bar for next score to get.
	scoreboard.maxRoundScore = Math.pow(2, counts[0]) * Math.pow(3, counts[1]);
	
	console.log('Score to get to win: ' + scoreboard.maxRoundScore);
	initOutsideTiles();
}

//LOADS ALL SPRITE IMAGES IN MAIN(). ONLY NEEDS TO RUN ONCE.
function loadSpriteTable()
{	
	spriteTable['default'] = new Image();
	spriteTable['default'].src = './sprites/tile.png';
	
	spriteTable['scoreboard'] = new Image();
	spriteTable['scoreboard'].src = './sprites/scoreboard.png';
	
	spriteTable['titleScreen'] = new Image();
	spriteTable['titleScreen'].src = './sprites/titleScreen.png';
	
	spriteTable['menuBackground'] = new Image();
	spriteTable['menuBackground'].src = './sprites/menuBackground.png';
	
	
	spriteTable['soundUp'] = new Image();
	spriteTable['soundUp'].src = './sprites/soundUp.png';
	
	spriteTable['soundDown'] = new Image();
	spriteTable['soundDown'].src = './sprites/soundDown.png';
	
	spriteTable['about'] = new Image();
	spriteTable['about'].src = './sprites/about.png';
	
	spriteTable['rules'] = new Image();
	spriteTable['rules'].src = './sprites/rules.png';
	
	spriteTable['menuIcon'] = new Image();
	spriteTable['menuIcon'].src = './sprites/menuIcon.png';
	
	spriteTable['menuIconHovered'] = new Image();
	spriteTable['menuIconHovered'].src = './sprites/menuIconHovered.png';
	
	spriteTable['yourCoins'] = new Image();
	spriteTable['yourCoins'].src = './sprites/yourCoins.png';
	
	spriteTable['collectedCoins'] = new Image();
	spriteTable['collectedCoins'].src = './sprites/collectedCoins.png';
	
	spriteTable['controls'] = new Image();
	spriteTable['controls'].src = './sprites/controls.png';
	
	spriteTable['back'] = new Image();
	spriteTable['back'].src = './sprites/back.png';
	
	spriteTable['voltorb'] = new Image();
	spriteTable['voltorb'].src = './sprites/voltorb.png';
	
	spriteTable['tileHover'] = new Image();
	spriteTable['tileHover'].src = './sprites/tileHover.png';
	
	spriteTable['tappedLose'] = new Image();
	spriteTable['tappedLose'].src = './sprites/tappedLose.png';
	
	
	spriteTable['loseText'] = new Image();
	spriteTable['loseText'].src = './sprites/loseText.png';
	
	
	spriteTable['dialogueBox'] = new Image();
	spriteTable['dialogueBox'].src = './sprites/dialogueBox.png';
	
	spriteTable['gameOverText'] = new Image();
	spriteTable['gameOverText'].src = './sprites/gameOverText.png';
	
	//just load through a for loop
	for(let i = 0; i <= 9; i++)
	{
		let scoreVal = 'score' + i;
		spriteTable[scoreVal] = new Image();
		spriteTable[scoreVal].src = './sprites/' + scoreVal.concat('.png');
		
		let str = 'spriteCount' + i;
		spriteTable[str] = new Image();
		spriteTable[str].src = './sprites/' + str.concat('.png');
		
		//tapped tiles 1-3, and menu 1 -3
		spriteTable['dead'] = new Image();
		spriteTable['dead'].src = './sprites/dead.png';
		if (i != 0 && i < 4)
		{
			let temp = 'tapped';
			temp = temp + i;
		
			spriteTable[temp] = new Image();
			spriteTable[temp].src = './sprites/' + temp.concat('.png');
			
			temp = 'memo' + i;
			spriteTable[temp] = new Image();
			spriteTable[temp].src = './sprites/' + temp.concat('.png');
			
			temp = 'kaboom' + i;
			spriteTable[temp] = new Image();
			spriteTable[temp].src = './sprites/' + temp.concat('.png');
			
			
			temp = 'flipAnim' + i;
			spriteTable[temp] = new Image();
			spriteTable[temp].src = './sprites/' + temp.concat('.png');
			
		}
		
		//outside tiles 1-5
		if (i != 0 && i <= 5)
		{
			let out = 'outsideTile' + i;
			spriteTable[out] = new Image();
			spriteTable[out].src = './sprites/' + out.concat('.png');
		}
		
		if (i <= 8 && i > 0)
		{
			let level = 'levelCount' + i;
			console.log(level);
			spriteTable[level] = new Image();
			spriteTable[level].src = './sprites/' + level.concat('.png');
		}
		
	}
}

function loadAudioTable()
{
	audioTable = new Array();

	audioTable['theme'] = new Audio('./audio/theme.mp3');
	audioTable['select'] = new Audio('./audio/select.mp3');
	audioTable['theme'].volume = .6;
}

function setMouseType()
{	
	if (mouseOverTile) document.body.style.cursor = "pointer";
	else document.body.style.cursor = "default";
}

//DRAWS COLORED LINES  
function drawColoredLines()
{
	let colors = ["#42ad42", "#efa539", "#3194ff", "#c663e7", "#e77352" ];
	let barWidth = (board.tileSet[0][5].point.x - board.tileSet[0][0].point.x);
	
	for (let i = 0; i < 5; i++)
	{
		
		//vertical bars.
		let point = board.tileSet[0][i].point.x + (dimension / 2.25); //2.25 maps to center. Dont ask why it just works.
		let lastY = board.tileSet[5][i].point.y + (dimension * .2);
		
		context.rect(point, board.tileSet[0][i].point.y + 15, dimension * .125 , lastY);
		context.lineWidth = dimension * .045;
		
		context.fillRect(point, board.tileSet[0][i].point.y, dimension * .125 , lastY);

		//horizontal bars
	    point = board.tileSet[i][0].point.y + dimension / 2.25;
		//let lastX = board.tileSet[i][0].point.x + (dimension * .2);
		
		context.rect(board.tileSet[i][0].point.x + 15, point, barWidth, dimension * .125);
		context.fillRect(board.tileSet[i][0].point.x + 15, point, barWidth, dimension * .125);
		
		context.fillStyle = colors[i];
		context.strokeStyle = '#d0e8e0'; 
	}
	//dont stroke inside loops.
	context.stroke();
}

// Main game loop.
function run(timeStamp)
{
	if(titleScreenOn) context.drawImage(spriteTable['titleScreen'], 0, 0, window.innerWidth, window.innerHeight);
	else 
	{
		//update these values.
		clock.updateFields(timeStamp);
		dialogueBox.timer.updateFields(timeStamp);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();
		update();
	}
	window.requestAnimationFrame(run);
}

function update()
{
	setMouseType();
	
	//clear rect at start of every function
	context.beginPath();
	drawColoredLines();
	board.paint(context);
	scoreboard.paint(context);
	menu.paint(context);
	dialogueBox.paint(context);
}

function main()
{
	//SPRITE TABLE NEEDS TO COME FIRST.
	spriteTable = new Array();
	loadSpriteTable();
	loadAudioTable();
	
	board = new Board();
	
	//scoreboard comes after.
	
	scoreboard = new Scoreboard(spriteTable['scoreboard']);
	board.loadBoard();
	menu = new Menu();
	dialogueBox = new DialogueBox();
	clock = new Clock();
	
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	//initialize all game states here.
	roundAdvance = false;
	roundEnd = false;
	titleScreenOn = true;
	run();
}