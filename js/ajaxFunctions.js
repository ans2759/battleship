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
	else{
        checkTurnAjax(-1);

        //ships can no longer be moved
        var svg = document.getElementsByTagName("svg")[0];
        svg.removeEventListener('mousemove',move,false);
        svg.removeEventListener('mouseup',stopDrag,false);
        for(var i = 0; i < pieceArrLen; i++) {
            document.getElementById(pieceArr[i].id).removeEventListener()
        }
        $(".water").off("mouseover", highlight);

    }
}

////checkTurnAjax/////
//check to see whose turn it is
//callback is callbackcheckTurn
////////////////
function checkTurnAjax(t){
	ajaxCall("GET",{method:"checkTurn",a:"game",data:t},callbackcheckTurn);
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

        if(turn != 1) {
            //get data from last turn
            getMoveAjax();
        }
        turn = data[1];
        $("#messages").append("Your turn <br/>");
        if(turnClear2 && turnClear2 != 0)
            clearTimeout(turnClear2);
		turnClear1 = setTimeout(function () {
			checkTurnAjax();
		}, 3000);
		/*$(".shot").on("mouseover", function() {
			cell = getCell(this.id);
			//cell.displayCross();
            $(this).off();
		});*/
	}
	else {
		//not turn
        if(turnClear1 && turnClear1 != 0)
            clearTimeout(turnClear1);
        console.log("elsey");
        //turn = 0;
		turnClear2 = setTimeout(function () {
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
    console.log(data);
	if(data) {
		var oppHealth = data[0],
				hits = data[1];

		if(oppHealth === 0) {
			//you win
			alert("YOU WIN!!!");
		}

		$("#opp_ships").html(oppHealth);

		//$("#messages").append(hits + " hits");
        var hLen = hits.length,
				sLen = shotsArr.length;
        if(hLen > 0) {
            var prev_shots = $("#prev_shots").html("");
            for (var i = 0; i < sLen; i++) {
				var hit = false;
                for (var j = 0; j < hLen; j++) {
                    if (hits[j] == shotsArr[i].substr(11)) {
						prev_shots.append("hit on : " + hits[j] + "<br/>");
                        document.getElementById("shots_cell_" + hits[j]).style.fill = "red";
						hit = true;
                    }
                }
				if(!hit) {
					prev_shots.append("miss on: " + shotsArr[i] + "<br/>");
					document.getElementById(shotsArr[i]).style.fill = "blue";
				}
            }
        }
        else {
            //no hits
            for (var i = 0; i < sLen; i++) {
                console.log("shots_cell_"+hits[i]);
                if(hits[i]) {
                    document.getElementById("shots_cell_" + shotsArr[i]).style.fill = "blue";
                }
            }
        }
        $("#targeting").html("");
        shotsArr = [];
        turn = 0;
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
function callbackGetMove(data){
    if(!data) {
        //error
    }
    else {
        //update your ship count
        shotsArrLen = parseInt(data[0]);
        $("#your_ships").html(shotsArrLen);
        if(data[1]) {
            var oppShots = data[1].split("|");
            for (var i = 0; i < oppShots.length; i++) {
                var cell = getCell(oppShots[i]);
                cell.displayShot();
            }
        }

    }
}










