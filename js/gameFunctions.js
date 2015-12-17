var mover=''; //the piece I'm currently dragging
var myX, myY; //record my original location
var ROWS=10; //10 x 10 for now, possibly, let users decide game size 
var COLS=10;
var CELLSIZE=25;
var SHOTSBOARDX=150;
var SHOTSBOARDY=50;
var SHIPSBOARDX=150;
var SHIPSBOARDY=350;
var shotsBoardArr=new Array();
var shipsBoardArr = new Array();
var pieceArr = new Array();
var pieceArrLen = 5;
var shotsArr = new Array();
var shotsArrLen = 5;
var totalShots = new Array();
var turn = 0;
var positionsfinalized = false;

				
function start(){
	//add eventListener to svg tag for mousemove
	document.getElementsByTagName('svg')[0].addEventListener('mousemove',move,false);
	//add listner to entire svg background to drop
	document.getElementsByTagName('svg')[0].addEventListener('mouseup',stopDrag,false);


	//build a group to put the board into...
	var shotsEle=document.createElementNS(svgns,'g');
	shotsEle.setAttributeNS(null,'transform','translate('+SHOTSBOARDX+','+SHOTSBOARDY+')');
	shotsEle.setAttributeNS(null,'id','shots_');

	var shipsEle=document.createElementNS(svgns,'g');
	shipsEle.setAttributeNS(null,'transform','translate('+SHIPSBOARDX+','+SHIPSBOARDY+')');
	shipsEle.setAttributeNS(null,'id','ships_');
	
	//stick on the board....
	document.getElementsByTagName('svg')[0].appendChild(shotsEle);
	document.getElementsByTagName('svg')[0].appendChild(shipsEle);

	//build board to see your shots taken
	//function Cell(parent,id,size,row,col)
	for(i=0;i<ROWS;i++){
		shotsBoardArr[i]=new Array();
		for(j=0;j<COLS;j++){
			shotsBoardArr[i][j]=new Cell(document.getElementById('shots_'),'shots_cell_'+i+j,CELLSIZE,i,j);
		}
	}

	//build a board to show your ship alignment
	for(i=0;i<ROWS;i++){
		shipsBoardArr[i]=new Array();
		for(j=0;j<COLS;j++){
			shipsBoardArr[i][j]=new Cell(document.getElementById('ships_'),'ships_cell_'+i+j,CELLSIZE,i,j);
		}
	}

	//build the pieces
	pieceArr = new Array();
	for(var i = 0; i < pieceArrLen; i++) {
			pieceArr[i] = new Piece(i);
	}	
}	
		
function startDrag(id){
	mover=id;
	//un occupy the current cells the ship is in
	for(i=0;i<ROWS;i++){
		for(j=0;j<COLS;j++){
			if(shipsBoardArr[i][j].occupied === mover){
				shipsBoardArr[i][j].notOccupied();
			}
		}
	}

	//for the translate...
	xy = getTransform(id);
	myX = xy[0]; //holds original position
	myY = xy[1];
	getPiece(id).putOnTop();
}
		
function move(evt){
	//console.log(evt);
	if(mover!='' && !positionsfinalized){
		setTransform(mover, evt.layerX, evt.layerY);

		$(".water").on("mouseover", highlight);
	}
}

function highlight(evt){
	//console.log(evt.target.id);		
	if(mover != ''&& !positionsfinalized) {
		//parse id to obtain reference to hovered cell
		var i = evt.target.id.substr(11,1);
		var j = evt.target.id.substr(12,1);
		shipsBoardArr[i][j].checkDrop(mover);
	}
}
function stopDrag(evt){
	evt.target.removeEventListener(evt, highlight, false);
	if(mover!=''&& !positionsfinalized){
        var hit = checkHit(evt.layerX, evt.layerY, mover);

		if(hit == true) {
			//check ships array to see if all ships have been placed
			var test = true;
			for(var i = 0; i < pieceArrLen; i++) {
				if(pieceArr[i].current_cell === '') {
					test = false;
					break;
				}
			}
			//if all ships have been placed, display button to finalize ship alignment and send to server
			if(test) {
				$("#finalize").show().click(finalizePositionAjax).css("cursor", "pointer");
			}

		}
		else {
			//move back
			setTransform(mover, myX, myY);
		}
		mover='';
	}
}

function checkHit(x,y,which){
	//lets change the x and y coords (mouse) to match the transform
	x=x-SHIPSBOARDX;
	y=y-SHIPSBOARDY;
	//go through ALL of the board
	for(i=0;i<ROWS;i++){
		for(j=0;j<COLS;j++){
			var drop = shipsBoardArr[i][j].myBBox;
			if(x>drop.x && x<(drop.x+drop.width) && y>drop.y && y<(drop.y+drop.height) && shipsBoardArr[i][j].droppable && shipsBoardArr[i][j].occupied == '' && shipsBoardArr[i][j].checkDrop(which)){
				//put me to the center....
				setTransform(which,shipsBoardArr[i][j].getCenterX(),shipsBoardArr[i][j].getCenterY());

				//fill the new cell
				getPiece(which).place(shipsBoardArr[i][j].id,i,j);

				return true;
			}	
		}
	}
	return false;
}

function addShot(cellId){
	//if it is my turn and I still have shots remaining
	if(turn === 1 && shotsArr.length < shotsArrLen && shotsArr.indexOf(cellId) === -1) {
		shotsArr.push(cellId);
		$("#targeting").append(cellId + "<br/>");
		$("#"+cellId).css("fill", "yellow").click(removeShot);
		if(shotsArr.length === shotsArrLen) {
			$("#fire").show().click(fireAjax).css("cursor", "pointer");
		}
	}
}

function removeShot (evt) {
    var targId = evt.target.id;
	shotsArr.splice(shotsArr.indexOf(targId), 1);
	var target = $("#targeting").html("");
	$.each(shotsArr, function(i){
		target.append(shotsArr[i] + "<br/>");
	});
	evt.target.style.fill = "white";
	evt.target.addEventListener("click", function(){
        addShot(targId);
    })
}



///////////////////////////////Utilities////////////////////////////////////////


////get Piece/////
//	get the piece (object) from the id and return it...
//	id looks like "piece_0|3"
////////////////
function getPiece(id) {
	var index = parseInt(id.substring(6));
	return pieceArr[index];
}

function getCell(id) {
	var i = parseInt(id.substr(11, 1)),
			j = parseInt(id.substr(12,1));
	return shipsBoardArr[i][j];
}
			
////get Transform/////
//	look at the id of the piece sent in and work on it's transform
////////////////
function getTransform(id) {
	var retVal = new Array();
	var trans = document.getElementById(id).getAttributeNS(null, 'transform');
	retVal[0] = trans.substring( (trans.search(/\(/)+1), trans.search(/,/) );
	retVal[1] = trans.substring( (trans.search(/,/)+1), trans.search(/\)/) );

	return retVal;
}
		
////set Transform/////
//	look at the id, x, y of the piece sent in and set it's translate
////////////////
function setTransform(id, x, y) {
	document.getElementById(id).setAttributeNS(null, 'transform', 'translate('+x+','+y+')');
}
