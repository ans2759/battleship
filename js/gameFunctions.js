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
var gameNumber = 14;

				
function start(){
	//add eventListener to svg tag for mousemove
	document.getElementsByTagName('svg')[0].addEventListener('mousemove',move,false);
	//add listner to entire svg background to drop
	document.getElementsByTagName('svg')[0].addEventListener('mouseup',stopDrag,false);
	//document.getElementsByTagName('body')[0].addEventListener('mouseup',stopDrag,false);


	//build a group to put the board into...
	var shotsEle=document.createElementNS(svgns,'g');
	shotsEle.setAttributeNS(null,'transform','translate('+SHOTSBOARDX+','+SHOTSBOARDY+')');
	shotsEle.setAttributeNS(null,'id','shots_'+gameId);

	var shipsEle=document.createElementNS(svgns,'g');
	shipsEle.setAttributeNS(null,'transform','translate('+SHIPSBOARDX+','+SHIPSBOARDY+')');
	shipsEle.setAttributeNS(null,'id','ships_'+gameId);
	
	//stick on the board....
	document.getElementsByTagName('svg')[0].appendChild(shotsEle);
	document.getElementsByTagName('svg')[0].appendChild(shipsEle);

	//build board to see your shots taken
	//function Cell(parent,id,size,row,col)
	for(i=0;i<ROWS;i++){
		shotsBoardArr[i]=new Array();
		for(j=0;j<COLS;j++){
			shotsBoardArr[i][j]=new Cell(document.getElementById('shots_'+gameId),'shots_cell_'+i+j,CELLSIZE,i,j);
		}
	}

	//build a board to show your ship alignment
	for(i=0;i<ROWS;i++){
		shipsBoardArr[i]=new Array();
		for(j=0;j<COLS;j++){
			shipsBoardArr[i][j]=new Cell(document.getElementById('ships_'+gameId),'ships_cell_'+i+j,CELLSIZE,i,j);
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
	//get my original position and record it...
	////////////Needs Work!	
	/*myX=document.getElementById(id).getAttributeNS(null,'cx');
	myY=document.getElementById(id).getAttributeNS(null,'cy');*/

	//for the translate...
	xy = getTransform(id);
	myX = xy[0]; //holds original position
	myY = xy[1];
	getPiece(id).putOnTop();
}
		
function move(evt){
	//console.log(evt);
	if(mover!=''){
		//I should be dragging something! (id)
		//setTransform(mover, evt.clientX, evt.clientY);
		setTransform(mover, evt.layerX, evt.layerY);
		//checkHover(mover, evt.layerX, evt.layerY);

		//var piece = getPiece(pieceId);
		$(".water").on("mouseover", highlight);
	}
}

function highlight(evt){
	//console.log(evt.target.id);		
	if(mover != '') {
		//parse id to obtain reference to hovered cell
		var i = evt.target.id.substr(11,1);
		var j = evt.target.id.substr(12,1);
		shipsBoardArr[i][j].checkDrop(mover);
	}
}
function stopDrag(evt){
	evt.target.removeEventListener(evt, highlight, false);
	if(mover!=''){
		if(turn == playerId) {
			var hit = checkHit(evt.layerX, evt.layerY, mover);
		}
		else {
			var hit = false;
			//nytwarning();
		}

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

		/*var me=document.getElementById(mover);
		var curX=parseInt(me.getAttributeNS(null,'cx'));
		var curY=parseInt(me.getAttributeNS(null,'cy'));
		var hit=checkHit(curX, curY);
		if(hit){
			//? call the cell and put me to center?
		}else{
			////////////Needs Work!	
			//put back to original loc
			me.setAttributeNS(null,'cx',myX);
			me.setAttributeNS(null,'cy',myY);
		}*/
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
			//document.getElementById('output2').firstChild.nodeValue+=x +":"+drop.x+"|";
			//console.log("x:"+ x + " drop.x:" + drop.x +" drop.width:"+drop.width + " Y:"+y+" drop.y:"+ drop.y+" drop.heaight:"+drop.height+" droppable?:"+ shipsBoardArr[i][j].droppable + " occupied?:" +shipsBoardArr[i][j].occupied);
			//console.dir(shipsBoardArr[i][j]);
			if(x>drop.x && x<(drop.x+drop.width) && y>drop.y && y<(drop.y+drop.height) && shipsBoardArr[i][j].droppable && shipsBoardArr[i][j].occupied == '' && shipsBoardArr[i][j].checkDrop(which)){
				//NEED - check is it a legal move???
				//console.log("hit on: " + shipsBoardArr[i][j].id);

				//if it is - then
				//put me to the center....
				setTransform(which,shipsBoardArr[i][j].getCenterX(),shipsBoardArr[i][j].getCenterY());

				//fill the new cell
				getPiece(which).place(shipsBoardArr[i][j].id,i,j);

				//change other's board 
				//changeBoardAjax(which,i,j,'changeBoard',gameId);
				
				//change who's turn it is
				//changeTurn();
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
		$("#"+cellId).css("fill", "yellow").click(removeShot);
		if(shotsArr.length === shotsArrLen) {
			$("#fire").show().click(fireAjax).css("cursor", "pointer");
		}
	}
}

function removeShot (evt) {
	shotsArr.splice(shotsArr.indexOf(evt.target.id), 1);
	evt.target.style.fill = "white";
	evt.target.removeEventListener("click", removeShot);
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

/*function getCell(id) {
	var i = parseInt(id.substr(11, 1)),
		j = parseInt(id.substr(12,1));
	return shotsBoardArr[i][j];
}*/
function getCell(id) {
	var i = parseInt(id.substr(11, 1)),
			j = parseInt(id.substr(12,1));
	return shipsBoardArr[i][j];
}


//getShipsCell()
			
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


////change turn////
//	change who's turn it is
//////////////////


/////////////////////////////////Messages to user/////////////////////////////////


////nytwarning (not your turn)/////
//	tell player it isn't his turn!
////////////////
/*function nytwarning(){
	if(document.getElementById('nyt').getAttributeNS(null,'display') == 'none'){
		document.getElementById('nyt').setAttributeNS(null,'display','inline');
		setTimeout('nytwarning()',2000);
	}else{
		document.getElementById('nyt').setAttributeNS(null,'display','none');
	}
}

////nypwarning (not your piece)/////
//	tell player it isn't his piece!
////////////////
function nypwarning(){
	if(document.getElementById('nyp').getAttributeNS(null,'display') == 'none'){
		document.getElementById('nyp').setAttributeNS(null,'display','inline');
		setTimeout('nypwarning()',2000);
	}else{
		document.getElementById('nyp').setAttributeNS(null,'display','none');
	}
}*/