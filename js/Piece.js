//////////////////////////////////////////////////////
// Class: Piece										//
// Description: Using the javascript prototype, you //
// can make a class. This allows objects to be      //
// made which act like classes and can be referenced//
// by the game.										//
//////////////////////////////////////////////////////


// Piece constructor
// creates and initializes each Piece object

function Piece(num){
	//this.player=player;
	//this.type=type; //what kind of piece am I
	//this.current_cell=boardArr[cellRow][cellCol];
	this.current_cell='';
	this.orientation = "ns";
	this.number=num;
	this.isDead=false;
	this.id='piece_'+this.number;
	//this.x = ((num * 50) + 450);
	this.x = ((num * 25) + 150);
	this.y = 350;
	this.e1 = '';
	this.e2 = '';
	//this.current_cell.makeOccupied(this.id);
	//this.x=this.current_cell.getCenterX();
	//this.y=this.current_cell.getCenterY();
	
	
	//based upon the piece type, I need to create a specific kind of piece
	//this.object = new Checker(this);
	switch (num) {
		case 0:
			this.object = new Destroyer(this);
			break;
		case 1:
			this.object = new Sub(this);
			break;
		case 2:
			this.object = new Cruiser(this);
			break;
		case 3:
			this.object = new Battleship(this);
			break;
		case 4:
			this.object = new Carrier(this);
			break;
	}

	this.piece = this.object.myPiece;
	
	this.piece.addEventListener('mousedown', this.grab, false);
	
	document.getElementsByTagName('svg')[0].appendChild(this.piece);
}

//methods
Piece.prototype = {
	createShip : function(parent, len) {
		var rect = document.createElementNS(svgns, 'rect');
		rect.setAttributeNS(null, "width", "20px");
		rect.setAttributeNS(null, "height", (len * 25 - 15) + "px");
		rect.setAttributeNS(null, "fill", "gray");
		rect.setAttributeNS(null, "stroke", "yellow");
		rect.setAttributeNS(null, "stroke-width", "1");
		rect.setAttributeNS(null, "rx", "40");
		rect.setAttributeNS(null, "ry", "40");
		return rect;
	},
	putOnTop : function(){
		//when the user drags, I need to make sure this one is on top
		document.getElementsByTagName('svg')[0].removeChild(this.piece);
		document.getElementsByTagName('svg')[0].appendChild(this.piece);
	}, 
	place : function(cell, row, col) {
		//empty the old in memory
		if(this.current_cell !== '') {
			this.current_cell.notOccupied();
		}
		//get this piece's new current cell
		this.current_cell = shipsBoardArr[row][col];
		//set new current cell to be occupied by me
		this.current_cell.makeOccupied(this.id, true);
	},
	rotate : function(){
		//change in memory
		//change height and width


		//change on screen
		var rect = document.getElementById(this.id).firstChild, 
			width = rect.getAttributeNS(null, "width"),
			height = rect.getAttributeNS(null, "height");
		rect.setAttributeNS(null, "width", height);
		rect.setAttributeNS(null, "height", width);

		//change piece orientation in memory
		this.orientation = (this.orientation === 'ns')? 'ew':'ns';
	},
	addClass : function(ele) {
		ele.setAttributeNS(null, "class", "ship");
	},
	grab : function(evt){
		if(evt.altKey){
			getPiece(this.id).rotate();
		}
		//console.log("evt: " + evt.clientX + ", " + evt.clientY);
		startDrag(this.id);
	}
}

function Destroyer (parent) {
	this.parent = parent;
	this.parent.health = 2;
	this.parent.current_cell = shipsBoardArr[0][0];
    shipsBoardArr[0][0].makeOccupied(this.parent.id);
	shipsBoardArr[1][0].makeOccupied(this.parent.id);
	//create it
	this.myPiece = document.createElementNS(svgns, "g");
	this.myPiece.setAttributeNS(null, 'transform', 'translate('+this.parent.x+','+this.parent.y+')');
	this.myPiece.setAttributeNS(null, "id", "piece_0");
	this.parent.addClass(this.myPiece);

	var ship = this.parent.createShip(parent, parent.health);

	this.myPiece.appendChild(ship);

	return this;
	//shortcut
	//this.piece.setAttributeNS(null,'id',this.id);
}

function Sub (parent) {
	this.parent = parent;
	parent.health = 3;
	this.parent.current_cell = shipsBoardArr[0][1];
    shipsBoardArr[0][1].makeOccupied(this.parent.id);
	shipsBoardArr[1][1].makeOccupied(this.parent.id);
	shipsBoardArr[2][1].makeOccupied(this.parent.id);
	this.myPiece = document.createElementNS(svgns, "g");
	this.myPiece.setAttributeNS(null, 'transform', 'translate('+this.parent.x+','+this.parent.y+')');
	this.myPiece.setAttributeNS(null, "id", "piece_1");
	this.parent.addClass(this.myPiece);

	var ship = this.parent.createShip(parent, parent.health);

	this.myPiece.appendChild(ship);

	return this;
}

function Cruiser (parent) {
	this.parent = parent;
	parent.health = 3;
	this.parent.current_cell = shipsBoardArr[0][2];
    shipsBoardArr[0][2].makeOccupied(this.parent.id);
	shipsBoardArr[1][2].makeOccupied(this.parent.id);
	shipsBoardArr[2][2].makeOccupied(this.parent.id);
	this.myPiece = document.createElementNS(svgns, "g");
	this.myPiece.setAttributeNS(null, 'transform', 'translate('+this.parent.x+','+this.parent.y+')');
	this.myPiece.setAttributeNS(null, "id", "piece_2");
	this.parent.addClass(this.myPiece);

	var ship = this.parent.createShip(parent, parent.health);

	this.myPiece.appendChild(ship);

	return this;
}

function Battleship (parent) {
	this.parent = parent;
	parent.health = 4;
	this.parent.current_cell = shipsBoardArr[0][3];
    shipsBoardArr[0][3].makeOccupied(this.parent.id);
	shipsBoardArr[1][3].makeOccupied(this.parent.id);
	shipsBoardArr[2][3].makeOccupied(this.parent.id);
	shipsBoardArr[3][3].makeOccupied(this.parent.id);
	this.myPiece = document.createElementNS(svgns, "g");
	this.myPiece.setAttributeNS(null, 'transform', 'translate('+this.parent.x+','+this.parent.y+')');
	this.myPiece.setAttributeNS(null, "id", "piece_3");
	this.parent.addClass(this.myPiece);

	var ship = this.parent.createShip(parent, parent.health);

	this.myPiece.appendChild(ship);

	return this;
}

function Carrier (parent) {
	this.parent = parent;
	parent.health = 5;
	this.parent.current_cell = shipsBoardArr[0][4];
    shipsBoardArr[0][4].makeOccupied(this.parent.id);
	shipsBoardArr[1][4].makeOccupied(this.parent.id);
	shipsBoardArr[2][4].makeOccupied(this.parent.id);
	shipsBoardArr[3][4].makeOccupied(this.parent.id);
	shipsBoardArr[4][4].makeOccupied(this.parent.id);
	this.myPiece = document.createElementNS(svgns, "g");
	this.myPiece.setAttributeNS(null, 'transform', 'translate('+this.parent.x+','+this.parent.y+')');
	this.myPiece.setAttributeNS(null, "id", "piece_4");
	this.parent.addClass(this.myPiece);

	var ship = this.parent.createShip(parent, parent.health);

	this.myPiece.appendChild(ship);

	return this;
}













