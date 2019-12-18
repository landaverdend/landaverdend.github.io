//BELOW ARE GRAPHICS VARIABLES
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

//stop context menu from coming up on right click.
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};

//BELOW ARE ALL GAME RELATED INSTANCE VALUES
var spriteTable, board, scoreboard, rulesViewer;

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
}

function calculateDim()
{
	return (window.innerHeight + (window.innerWidth * 1.2)) / 25;
}


//EACH TIME A TILE IS CLICKED, THIS METHOD IS CALLED.
function onClick(event)
{
	console.log("Mouse x: " + event.clientX);
	console.log("Mouse y: " + event.clientY);
	1
	//check all tile coordinates, add dimension size to each point 
	for(let i = 0; i < 5; i++)
	{
		for(let j = 0; j < 5; j++)
		{
			let currentMouseX = event.clientX;
			let currentMouseY = event.clientY;
			
			let currentX = board.tileSet[i][j].point.x + 10;
			let currentY = board.tileSet[i][j].point.y + 10;
			
			if(isValid(currentX, currentY, currentMouseX, currentMouseY)) 
			{
				if(event.button == 0) //left click.
				{
					let curTile = board.tileSet[i][j];
					
					switch(curTile.value)
					{
						case 'tapped1':
							break;
						case 'tapped2':
							if(!curTile.clicked)
							{
								scoreboard.score *= 2;
								scoreboard.flippedCards++;
							}
							break;
						case 'tapped3':
							if(!curTile.clicked)
							{
								scoreboard.score *= 3;
								scoreboard.flippedCards++;
							}
							break;
						case 'tappedLose':
							endRound();
							break;
					}
					curTile.clicked = true;
				}
				else if(event.button == 2) //right click.
				{
					let curTile = board.tileSet[i][j];
					curTile.markedDead = !curTile.markedDead; //just flip the signs.
					
				}
				//update();
				break;
			}
		}
	}
}

function keyDown(event)
{
	//all three event codes.
	if(event.code == 'Digit1' || event.code == 'Digit2'
		|| event.code == 'Digit3')
	{
		for(let i = 0; i < 5; i++)
		{
			for(let j = 0; j < 5; j++)
			{
				let currentX = board.tileSet[i][j].point.x + 10;
				let currentY = board.tileSet[i][j].point.y + 10;
				
				let curTile = board.tileSet[i][j];
				
				if(isValid(currentX, currentY, mouseX, mouseY))
				{
					console.log('working');
					switch(event.code)
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
					}
					
				}
			}
		}
	}
	
}

//CHECKS IF GIVEN POINTS ARE A VALID TILE
function isValid(pointX, pointY, currentMouseX, currentMouseY)
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
	
	rulesViewer.updateViewer();
	scoreboard.updateViewer();
	board.updateBoard();
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
			
			//BELOW THIS ARE ONLY TILE-SPECIFIC FIELDS.
			//OUTSIDE: keep track of total losses on each row.
			this.lossTiles = lossTiles;
			//OUTSIDE: keep track of total point count in row.
			this.totalPoints  = 0;
			//ALL CLICKABLE TILES: keep track of whether or not this tile was clicked.
			this.clicked = false;
			//OUTSIDE TILES: keep track of whether or not this tile is an outside one.
			this.outside = false;
			//MEMO USAGE BELOW:
			this.markedOne = false;
			this.markedTwo = false;
			this.markedThree = false;
			this.markedDead = false;
			
			
		}
		
		paint(context)
		{
			let curX = this.point.x;
			let curY = this.point.y;
			
			//update dimension value at draw time.
			dimension = calculateDim();
			
			//if this tile is an outside one
			if(this.outside)
			{
				this.drawOutside(context, curX, curY);
			}
			//if tile is clickable but not yet clicked.
		    else if(!this.clicked)
			{
				this.drawUnclicked(context, curX, curY);
			}
			//tile is clickable and already clicked.
			else
			{
				context.drawImage(spriteTable[this.value], curX, curY, dimension, dimension);
			}	
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
					t.paint(context);
				}
			}
		}
	}
	
	loadBoard()
	{
		var xGap = dimension * 1.15;
		var xCounter = (window.innerWidth * .2) + (window.innerWidth / 5);
		var yGap = (dimension * 1.1);
		var yCounter = 2;
		
		for(var i = 0; i < SIZE; i++)
		{
			for(var j = 0; j < SIZE; j++, xCounter += xGap)
			{
				board.tileSet[i][j] = new Tile(0, 'tapped1', spriteTable['default'], new Point(xCounter, yCounter));
				//set outside tiles to true.
				if ((i == SIZE - 1) || (j == SIZE - 1))
				{
					board.tileSet[i][j].outside = true;
				}
			}
			
			xCounter = (window.innerWidth * .2) + (window.innerWidth / 5);
			yCounter += yGap;	
		}
		
		//generate the randomly placed spots once the board has been loaded.
		generateSpots(scoreboard.level);
	}
	
	//utility to reload new points without compromising game state.
	updateBoard()
	{
		var xGap = dimension * 1.15;
		var xCounter = (window.innerWidth * .2) + (window.innerWidth / 5);
		var yGap = (dimension * 1.1);
		var yCounter = 2;	
	
		for(let i = 0; i < SIZE; i++)
		{
			for(let j = 0; j < SIZE; j++, xCounter += xGap)
			{
				board.tileSet[i][j].point.x = xCounter;
				board.tileSet[i][j].point.y = yCounter;
			}
			xCounter = (window.innerWidth * .2) + (window.innerWidth / 5);
			yCounter += yGap;
		}
	}
}

//SCOREBOARD HANDLES: CURRENT SCORE, CURRENT LEVEL
class Scoreboard
{
	constructor(viewer)
	{
		this.level = 1;
		this.score = 1;
		this.viewer = viewer;
		
		this.point = new Point(window.innerWidth / 70, window.innerHeight / 70);
		
		this.width = window.innerWidth / 2.65;
		//console.log('SCOREBOARD WIDTH: ' + (this.width - this.point.x));
		this.height = window.innerHeight / 2;
		//console.log('SCOREBOARD HEIGHT: ' + (this.height - this.point.y));
		this.flippedCards = 0;
		//this.point = new Point(window.innerWidth /4, window.innerHeight / 2) 
	}
	
	paint(context)
	{
		context.drawImage(this.viewer, this.point.x, this.point.y, this.width, this.height);
		//calculate point/dimension for 'your coins:'
		let coinsWidth = (this.width - this.point.x) * .5;
		let coinsHeight = (this.height - this.point.y) * .3;
		let coinsX = this.point.x + (this.width * .275);
		let coinsY = this.point.y + (this.height * .025);
		
		context.drawImage(spriteTable['yourCoins'], coinsX, coinsY, coinsWidth, coinsHeight);
		
		this.drawScore(context);
		this.drawLevel(context);
	}
	
	updateViewer()
	{
		this.point = new Point(window.innerWidth / 70, window.innerHeight / 70);
		this.width = window.innerWidth / 2.65;
		this.height = window.innerHeight / 2;
	}
	
	//draws the score board
	drawScore(context)
	{
		let scoreWidth = (this.width - this.point.x) * .15;
		let scoreHeight = (this.height - this.point.y) * .45;
		
		let scoreX = this.point.x + (this.width * .125)
		let scoreY = this.point.y + (this.height * .25);
		
		let temp = this.score.toString();
		while(temp.length < 5) temp = "0" + temp;
		
		
		for(let i = 0; i <= 4; i++)
		{
			
			let sprite = "score" + temp.charAt(i);
			context.drawImage(spriteTable[sprite], scoreX + (i * this.width / 6.5), scoreY, scoreWidth, scoreHeight);
		}
	}
	
	drawLevel(context)
	{
		let levelWidth = (this.width - this.point.x) * .5;
		let levelHeight = (this.height - this.point.y) * .3;
		let levelX = this.point.x + (this.width * .275);
		let levelY = this.point.y + (this.height * .7);
		
		context.drawImage(spriteTable['levelCount'], levelX, levelY, levelWidth, levelHeight);
	}
	
}

class TutorialViewer
{
	constructor()
	{
		this.point = new Point(window.innerWidth * .045, window.innerHeight * .55);
		this.height = window.innerHeight * .32;
		this.width = window.innerWidth * .32;
	}
	
	paint(context)
	{
		context.drawImage(spriteTable['rules'], this.point.x, this.point.y, this.width, this.height);
	}
	
	updateViewer()
	{
		this.point = new Point(window.innerWidth * .05, window.innerHeight * .55);
		this.height = window.innerHeight * .32;
		this.width = window.innerWidth * .32;
	}
	
}

//END CURRENT ROUND
function endRound()
{
	//alert("ROUND OVER!");
	//scoreboard.score = 0;
	//uncomment this line when more difficulties are added
	//scoreboard.level = scoreboard.flippedCards;
	
	//scoreboard.flippedCards = 0;
	//board.loadBoard();
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

//takes the current board field and generates it with all the values.
function generateSpots(level)
{
	var counts;
	
	switch(scoreboard.level)
	{
		case 1:
			//generate locations of LOSE tiles, only 6!
			var count = 0;
			while (count < 6)
			{
				let randX = getRandomRange(5);
				let randY = getRandomRange(5);
				if(board.tileSet[randX][randY].value == 'tapped1') //if default 1 value
				{		
					board.tileSet[randX][randY].value = 'tappedLose';
					count++;
				}
			}
			var coinRange = [24, 27, 32, 36, 48]
			//possiblePlacements[0] = 2's, [1] = 3's
			var possiblePlacements = [[3, 1],
									  [0, 3],
									  [5, 0],
									  [2, 2],
									  [4, 1]];
		    counts = possiblePlacements[getRandomRange(5)];
			break;
	
	}
	
	loadPointTiles(2, counts[0]);
	loadPointTiles(3, counts[1]);
	initOutsideTiles();
}

//LOADS ALL SPRITE IMAGES IN MAIN(). ONLY NEEDS TO RUN ONCE.
function loadSpriteTable()
{	
	spriteTable['default'] = new Image();
	spriteTable['default'].src = 'tile.png';
	
	spriteTable['scoreboard'] = new Image();
	spriteTable['scoreboard'].src = 'scoreboard.png';
	
	spriteTable['rules'] = new Image();
	spriteTable['rules'].src = 'rules.png';
	
	spriteTable['yourCoins'] = new Image();
	spriteTable['yourCoins'].src = 'yourCoins.png';
	
	spriteTable['levelCount'] = new Image();
	spriteTable['levelCount'].src = 'levelCount.png';
	
	spriteTable['voltorb'] = new Image();
	spriteTable['voltorb'].src = 'voltorb.png';
	
	spriteTable['tappedLose'] = new Image();
	spriteTable['tappedLose'].src = 'tappedLose.png';
	//just load through a for loop
	for(let i = 0; i <= 9; i++)
	{
		let scoreVal = 'score' + i;
		spriteTable[scoreVal] = new Image();
		spriteTable[scoreVal].src = scoreVal.concat('.png');
		
		let str = 'spriteCount' + i;
		spriteTable[str] = new Image();
		spriteTable[str].src = str.concat('.png');
		
		//tapped tiles 1-3, and rulesViewer 1 -3
		spriteTable['dead'] = new Image();
		spriteTable['dead'].src = 'dead.png';
		if (i != 0 && i < 4)
		{
			let tapped = 'tapped';
			tapped = tapped + i;
		
			spriteTable[tapped] = new Image();
			spriteTable[tapped].src = tapped.concat('.png');
			
			tapped = 'memo' + i;
			spriteTable[tapped] = new Image();
			spriteTable[tapped].src = tapped.concat('.png');
		}
		
		//outside tiles 1-5
		if (i != 0 && i <= 5)
		{
			let out = 'outsideTile' + i;
			spriteTable[out] = new Image();
			spriteTable[out].src = out.concat('.png');
		}
	}
}


//DRAWS COLORED LINES
function drawColoredLines()
{
	let colors = ["#42ad42", "#efa539", "#3194ff", "#c663e7", "#e77352" ];
	
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
		let lastX = board.tileSet[i][0].point.x + (dimension * .2);
		
		context.rect(board.tileSet[i][0].point.x + 15, point, lastX, dimension * .125);
		context.fillRect(board.tileSet[i][0].point.x + 15, point, lastX, dimension * .125);
		
		context.fillStyle = colors[i];
		context.strokeStyle = '#d0e8e0'; 
	}
	//dont strok inside loops.
	context.stroke();
}

// Main game loop.


function run()
{
	window.requestAnimationFrame(run);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	update();
}

function update()
{
	//clear rect at start of every function
	context.beginPath();
	drawColoredLines();
	board.paint(context);
	scoreboard.paint(context);
	rulesViewer.paint(context);
}

function main()
{
	
	//SPRITE TABLE NEEDS TO COME FIRST.
	spriteTable = new Array();
	loadSpriteTable();
	
	board = new Board();
	//scoreboard comes before 
	scoreboard = new Scoreboard(spriteTable['scoreboard']);
	rulesViewer = new TutorialViewer();
	
	board.loadBoard();
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	//setInterval(run, 33);
	
	run();
}



