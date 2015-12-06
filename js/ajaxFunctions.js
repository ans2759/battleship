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
    $("#finalize").hide();
}

function fpCallback(data) {
	if(data !== 1) {
		//handle errors
	}
}

////checkTurnAjax/////
//check to see whose turn it is
//callback is callbackcheckTurn
////////////////
function checkTurnAjax(turn){
	ajaxCall("GET",{method:"checkTurn",a:"game",data:turn},callbackcheckTurn);
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
        $("#messages").append("Your turn <br/>");
		setTimeout(function () {
			checkTurnAjax();
		}, 3000);
		//get data from last turn
		getMoveAjax();
		$(".shot").on("mouseover", function() {
			cell = getCell(this.id);
			cell.displayCross();
            $(this).off();
		});
	}
	else {
		//not turn

		setTimeout(function () {
			checkTurnAjax(-1);
		}, 2000);
	}
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
        // hide fire button
        $("#fire").hide();
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

		//$("#messages").append(hits + " hits");
        var hLen = hits.length,
				sLen = shotsArr.length;
        if(hLen > 0) {
            for (var i = 0; i < sLen; i++) {
				var hit = false;
                for (var j = 0; j < hLen; j++) {
                    if (hits[j] == shotsArr[i].substr(11)) {
						$("#gameInfo").append("hit on : " + hits[j] + "<br/>");
                        document.getElementById("shots_cell_" + hits[j]).style.fill = "red";
						hit = true;
                    }
                }
				if(!hit) {
					$("#gameInfo").append("miss on: " + shotsArr[i] + "<br/>");
					document.getElementById(shotsArr[i]).style.fill = "blue";
				}
            }
        }
        else {
            //no hits
            for (var i = 0; i < sLen; i++) {
                document.getElementById("shots_cell_" + hits[j]).style.fill = "blue";
            }
        }
	}
}

///////////////Chat Utilities ////////////////////
function callbackLogout(data, status){
	location.href = "./login.html";
}

function getChat(){
	ajaxCall("GET",{method:"getChat",a:"chat"},callbackChat);
}

function getUsers(){
	ajaxCall("GET", {method: "checkUsers", a:"chat"}, callbackUsers);
}

function callbackUsers(data, staus){
	var h = '';
	for(i=0;i<data.length;i++){
		h += data[i].userName + "<br/>";
	}
	$('#users').html(h);
	setTimeout(getUsers, 10000);
}

function sendChatAjax(text, room) {
    if(!text){
        //form validation
        console.log("no chat data");
    }
    else {
        $('#chatText').val("");
        var d = '{"text" : "' + text + '", "room" : "'+ room + '" }';
        ajaxCall("POST", {method:"sendChat", a:"chat", data: d}, callbackChat);
    }
}

function callbackChat(data, status){
	var h='';
	for(i=0;i<data.length;i++){
		h+=data[i].userName+' says: '+data[i].text + '<span style="color:gray"> at time ' +data[i].createdAt+'</span><br/>';
	}
	if(!window.location.href.indexOf("game.php") > -1) {
		//we are in the main lobby
		$('#text').html(h);
		setTimeout('getChat()',2000);
	}
}


///////////////////////////////////////////////////////////////////////



//get the last move
//-called after I find out it is my turn
//callback is callbackGetMove
////////////////
function getMoveAjax(gameId){
    gameId = (gameId) ? gameId : 14;
    ajaxCall("GET",{method:"getMove",a:"game",data:gameId},callbackGetMove);
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










