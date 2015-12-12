//////////////////////////////////////////////////////
// Class: Cell										//
// Description:  This will create a cell object		// 
// (board square) that you can reference from the 	//
// game. 											//
// Arguments:										//
//		size - tell the object it's width & height	//
//		??
//		??
//		??
//		??
//////////////////////////////////////////////////////

function Cell(parent,id,size,row,col){
	this.parent=parent;
	this.id=id;
	this.size=size;
	this.row=row;
	this.col=col;
	//initialize other instance vars...
	this.occupied='';
	this.y=this.size*this.row;
	this.x=this.size*this.col;
	this.cross = false;
	this.shotAt = false;
	this.droppable=(id.substring(0,5) === 'ships')?true:false;

	
	//create 'em...
	this.object=this.create();
	this.parent.appendChild(this.object);
	//store my bounding box
	this.myBBox = this.getMyBBox();

}


//////////////////////////////////////////////////////
// Cell : Methods									//
// Description:  All of the methods for the			// 
// Cell Class (remember WHY we want these to be		//
// seperate from the object constructor!)			//
//////////////////////////////////////////////////////

Cell.prototype={
	create:function(){
		var r=document.createElementNS(svgns,'rect');
		r.setAttributeNS(null,'x',this.x+'px');
		r.setAttributeNS(null,'y',this.y+'px');
		r.setAttributeNS(null,'width',this.size+'px');
		r.setAttributeNS(null,'height',this.size+'px');
		if(this.droppable) {
			r.setAttributeNS(null,'class','water');
		}
		else {
			r.setAttributeNS(null, 'class', 'shot');
			r.addEventListener("click", function() {
				addShot(this.id);
			}, null);
/*			r.addEventListener("mouseover", function() {

			}, null);*/
		}
		r.setAttributeNS(null,'id',this.id);
		return r;
	},
	getMyBBox:function(){
		return this.object.getBBox();
	},
	getCenterY:function(){
		return (SHIPSBOARDY + this.y);
/*		if(this.orientation === 'ns') {
			return (SHIPSBOARDY + this.y);
		}
		else {
			return (SHIPSBOARDY + this.y);
		}*/
	},
	getCenterX:function(){
		return (SHIPSBOARDX + this.x);
/*		if(this.orientation === 'ns') {
			return (SHIPSBOARDX + this.x);
		}
		else {
			return (SHIPSBOARDX + this.x);
		}*/
	},
	makeOccupied:function(pieceId, first){
		//first run creates a loop that populates the covered cells
		if(first) {
			//make other cells that contain the ship occupied
			var piece = getPiece(pieceId),
				ori = piece.orientation,
				health = piece.health;

			if(ori === 'ns') {
				for(var i = this.row; len = this.row + health > i; i++) {
					shipsBoardArr[i][this.col].makeOccupied(pieceId, false);
				}
			}
			else {
				for(var i = this.col; len = this.col + health > i; i++) {
					shipsBoardArr[this.row][i].makeOccupied(pieceId, false);
				}
			}
		}
		else {
			this.occupied=pieceId;
		}

	},
	notOccupied:function(){
		this.occupied='';
	},
	checkDrop : function(pieceId, noStyle) {
		var piece = getPiece(pieceId),
			ori = piece.orientation,
			health = piece.health,
			row = this.row,
			col = this.col,
			cells = [],
			cellsMem = [],
			test = true,
			len;

		if(row === undefined || col === undefined) {
			return false;
		}

		if (ori === 'ns') {
			for(var i = row; len = row + health > i; i++) {
				if(shipsBoardArr[i][col]){
					var cell = document.getElementById(shipsBoardArr[i][col].id);
					cells.push(cell);
					cellsMem.push(shipsBoardArr[i][col]);
					if (shipsBoardArr[i][col].droppable !== true || shipsBoardArr[i][col].occupied !== '') {
						test = false;
					}
				}
			}
		}
		else {
			for(var j = col; len = col + health > j; j++) {
				if(shipsBoardArr[row][j]){
					var cell = document.getElementById(shipsBoardArr[row][j].id);
					cells.push(cell);
					cellsMem.push(shipsBoardArr[row][j]);
					if (shipsBoardArr[row][j].droppable !== true || shipsBoardArr[row][j].occupied !== '') {
						test = false;
					}
				}
			}
		}

		//check whether cells are droppable or not to determine color of cells
		for(var i = 0; i < health; i++) {
			if(cells[i]) {
				if(!test) {
					cells[i].style.fill = "Red";
				}
				else {
					cells[i].style.fill = "Chartreuse";
				}
			}
		}

		cells[0].addEventListener("mouseout", changeBack, false);
		function changeBack() {
			cells[0].removeEventListener("mouseout", changeBack, false);
			for (var i = 0; i < health; i++) {
				if(cells[i]){
					cells[i].style.fill = "Blue";
				}
			}
		}

		return test;
	},
	takeShot : function () {
		this.shotAt = true;
	},
	displayCross : function () {
		//build group, circle and lines to make cross hairs
		var cir = document.createElementNS(svgns, "circle"),
			g = document.createElementNS(svgns, "g")
			h = document.createElementNS(svgns, "line"),
			v = document.createElementNS(svgns, "line");

		g.setAttributeNS(null, "class", "cross");
		g.setAttributeNS(null, "id", "cross_" + this.id);

		cir.setAttributeNS(null, "cx", SHOTSBOARDX + this.x + this.size/2);
		cir.setAttributeNS(null, "cy", SHOTSBOARDY + this.y + this.size/2);
		cir.setAttributeNS(null, "r", this.size/2 - 2);
		cir.setAttributeNS(null, "fill", "none");
		cir.setAttributeNS(null, "stroke", "red");
		cir.setAttributeNS(null, "stroke-width", "2");

		h.setAttributeNS(null, "y1", SHOTSBOARDY + this.y + this.size/2);
		h.setAttributeNS(null, "x1", SHOTSBOARDX + this.x);
		h.setAttributeNS(null, "y2", SHOTSBOARDY + this.y + this.size/2);
		h.setAttributeNS(null, "x2", SHOTSBOARDX + this.x + this.size);
		h.setAttributeNS(null, "stroke", "red");
		h.setAttributeNS(null, "stroke-width", "1");

		v.setAttributeNS(null, "y1", SHOTSBOARDY + this.y);
		v.setAttributeNS(null, "x1", SHOTSBOARDX + this.x + this.size/2);
		v.setAttributeNS(null, "y2", SHOTSBOARDY + this.y + this.size);
		v.setAttributeNS(null, "x2", SHOTSBOARDX + this.x + this.size/2);
		v.setAttributeNS(null, "stroke", "red");
		v.setAttributeNS(null, "stroke-width", "1");

		g.appendChild(cir);
		g.appendChild(h);
		g.appendChild(v);
		var svg = document.getElementsByTagName("svg")[0];
		svg.appendChild(g);

		var cell = document.getElementById(this.id);
		cell.addEventListener("mouseout", hide, null);
		function hide() {
			if(g.parentNode == svg)
			svg.removeChild(g);
			cell.removeEventListener("mouseout", hide);
		}
	},
    displayShot : function() {
        this.shotAt = true;
        var cir = document.createElementNS(svgns, "circle");

        cir.setAttributeNS(null, "cx", SHIPSBOARDX + this.x + this.size/2);
        cir.setAttributeNS(null, "cy", SHIPSBOARDY + this.y + this.size/2);
        cir.setAttributeNS(null, "r", this.size/2 - 4);
        cir.setAttributeNS(null, "fill", "orange");

        document.getElementsByTagName(svg)[0].appendChild(cir);
    },
	PI:3.1415697
}

/*
Cell.prototype.create=function(){

}

Cell.prototype.getMyBBox=function(){

}

...
*/







