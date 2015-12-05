////ajax util/////
//d is data sent, looks like {name:value,name2:val2}
////////////////
function ajaxCall(GetPost,d,callback){
	$.ajax({
 		type: GetPost,
 		async: true,
  		cache:false,
  		url: "mid.php",
  		data: d,  
  		dataType: "json",
  		success: callback
	});
}
////initGameAjax/////
//d is data sent, looks like {name:value,name2:val2}
//this is my starter call
//goes out and gets all pertinant information about the game (FOR ME)
//callback is callbackInit()
////////////////
/*function initGameAjax(whatMethod,val){
	//data is gameId
	ajaxCall("POST",{method:whatMethod,a:"game",data:val},callbackInit);
}*/
////callbackInit/////
//callback for initGameAjax
////////////////
function callbackInit(jsonObj){
	//compare the session name to the player name to find out my playerId;
	turn = jsonObj[0].whoseTurn;
	if(player == jsonObj[0].player1_name){
		player2 = jsonObj[0].player0_name;
		playerId = 1;
	}else{
		player2 = jsonObj[0].player1_name;
		playerId = 0;
	}
	//document.getElementById('output2').firstChild.data='playerId '+playerId+ ' turn '+turn;
	//start building the game (board and piece)
    gameInit();
}
////finalizePositionAjax//////
// send finalized ship alignment to server
/////////////////
function finalizePositionAjax() {
	var d = '';
	for(var i = 0; i < pieceArrLen; i++) {
		if(i != 0) {
			d += ',';
		}
		d += pieceArr[i].orientation + pieceArr[i].current_cell.id;
	}
	ajaxCall("POST", {method: "finalizePosition", a: "game", data: d }, fpCallback);
}

function fpCallback(data) {
	if(data !== 1) {
		//handle errors
	}
	else {
		checkTurnAjax(-1);
	}
}

////changeServerTurnAjax/////
//change the turn on the server
//no callback
////////////////
function changeServerTurnAjax(whatMethod,val){
	ajaxCall("POST",{method:whatMethod,a:"game",data:val},null);
	//change the color of the names to be the other guys turn
	document.getElementById('youPlayer').setAttributeNS(null,'fill',"black");
	document.getElementById('opponentPlayer').setAttributeNS(null,'fill',"orange");
}
////changeBoardAjax/////
//change the board on the server
//no callback
////////////////
function changeBoardAjax(pieceId,boardI,boardJ,whatMethod,val){
	//data: gameId~pieceId~boardI~boardJ~playerId
	ajaxCall("POST",{method:whatMethod,a:"game",data:val+"~"+pieceId+"~"+boardI+"~"+boardJ+"~"+playerId},null);
}
////checkTurnAjax/////
//check to see whose turn it is
//callback is callbackcheckTurn
////////////////
function checkTurnAjax(turn){
	//if(turn!=playerId){
	ajaxCall("GET",{method:"checkTurn",a:"game",data:turn},callbackcheckTurn);
	//}
	//setTimeout(function(){checkTurnAjax('checkTurn',gameId)},3000);
}
////callbackcheckTurn/////
//callback for checkTurnAjax
////////////////
function callbackcheckTurn(data){
	//update in-game chat
	var chatData = JSON.parse(data[0]),
		chatString = '';
    if(!chatData) {
        //no chat data
        chatString = "Nobody has Said anything Yet";
    }
    else {
    	for(var i = 0; i < chatData.length; i++) {
    		chatString+=chatData[i].userName+' says: '+chatData[i].text + '<span style="color:gray"> at time ' +chatData[i].createdAt+'</span><br/>';
    	}
    }
	$("#messages").html(chatString);

	//check to see if turn changed on server
	if(data[1] === 1) {
		//it is my turn
		turn = 1;
		setTimeout(function () {
			checkTurnAjax();
		}, 3000);
		//get data from last turn
		getMoveAjax();
		$(".shot").mouseover(function() {
			cell = getCell(this.id);
			cell.displayCross();
		});
	}
	else {
		//not turn
		setTimeout(function () {
			checkTurnAjax(-1);
		}, 3000);
	}
/*	if(jsonObj[0].whoseTurn == playerId){
		//switch turns
		//turn=jsonObj[0].whoseTurn;
		//get the data from the last guys move
		//getMoveAjax('getMove',gameId);
	}*/
}

////////fireAjax////////
function fireAjax () {
    var test = true,
        str = '';
    for(var i = 0; i < shotsArrLen; i++) {
        if(shotsArr[i] !== undefined) {
            if(totalShots.indexOf(shotsArr[i]) === -1) {
                //we have not taken this shot before
                if(i !== 0) {
                    str += "|";
                }
                str += shotsArr[i];
            }
            else {
                //we have already taken shot at this cell
                test = false;
                break;
            }
        }
    }
    //shots are valid, send ajax
    if(test) {
        var d = gameNumber + "~" + str;
        ajaxCall("POST", {method: "fireShots", a: "game", data: d }, fireCallback);
    }
}

function fireCallback (data) {
	if(data) {
		var oppHealth = data[0],
				hits = data[1];

		if(oppHealth === 0) {
			//you win
			alert("YOU WIN!!!");
		}

		$("#status").html("opp ships: " + oppHealth);
		$("#messages").html(hits + " hits");
	}
}

//get the last move
//-called after I find out it is my turn
//callback is callbackGetMove
////////////////
function getMoveAjax(whatMethod,val){
	//ajaxCall("GET",{method:whatMethod,a:"game",data:val},callbackGetMove);
}
////callbackGetMove/////
//callback for getMoveAjax
////////////////
function callbackGetMove(jsonObj){
	//tests to see what I'm getting back!
	//alert(jsonObj[0]['player'+Math.abs(playerId-1)+'_pieceID']);
    //alert(jsonObj[0]['player'+Math.abs(playerId-1)+'_boardI']);
    //alert(jsonObj[0]['player'+Math.abs(playerId-1)+'_boardJ']);
    
    //change the text output on the side for whose turn it is
	//var hold='playerId '+playerId+ ' turn '+turn;
	//document.getElementById('output2').firstChild.data=hold;
	
	//change the color of the names for whose turn it is:
	document.getElementById('youPlayer').setAttributeNS(null,'fill',"orange");
	document.getElementById('opponentPlayer').setAttributeNS(null,'fill',"black");
	
	//make the other guys piece move to the location
	//first, clear the other guy's cell
	var toMove=getPiece(jsonObj[0]['player'+Math.abs(playerId-1)+'_pieceID']);
	toMove.current_cell.notOccupied();
	//now, actually move it! 
	var x=boardArr[jsonObj[0]['player'+Math.abs(playerId-1)+'_boardI']][jsonObj[0]['player'+Math.abs(playerId-1)+'_boardJ']].getCenterX();
	var y=boardArr[jsonObj[0]['player'+Math.abs(playerId-1)+'_boardI']][jsonObj[0]['player'+Math.abs(playerId-1)+'_boardJ']].getCenterY();
	setTransform(jsonObj[0]['player'+Math.abs(playerId-1)+'_pieceID'],x,y);
		
	//now, for me, make the new cell occupied!
	//Piece.prototype.changeCell = function(newCell,row,col){
	getPiece(jsonObj[0]['player'+Math.abs(playerId-1)+'_pieceID']).changeCell('cell_'+jsonObj[0]['player'+Math.abs(playerId-1)+'_boardI']+jsonObj[0]['player'+Math.abs(playerId-1)+'_boardJ'],jsonObj[0]['player'+Math.abs(playerId-1)+'_boardI'],jsonObj[0]['player'+Math.abs(playerId-1)+'_boardJ']);
}











