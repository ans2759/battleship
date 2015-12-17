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
	var d = gameId + "~";
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
        positionsfinalized = true;

        //ships can no longer be moved
        /*var svg = document.getElementsByTagName("svg")[0];
        svg.removeEventListener('mousemove',move,false);
        svg.removeEventListener('mouseup',stopDrag,false);
        for(var i = 0; i < pieceArrLen; i++) {
            document.getElementById(pieceArr[i].id).removeEventListener()
        }
        $(".water").off("mouseover", highlight);*/

    }
}

////checkTurnAjax/////
//check to see whose turn it is
//callback is callbackcheckTurn
////////////////
function checkTurnAjax(){
    var d = turn + "|" + gameId;
    //if turn is 0, we will only check db for chat, not for turn
    ajaxCall("GET",{method:"checkTurn",a:"game",data:d},callbackcheckTurn);
    setTimeout(checkTurnAjax, 2000);
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
    	/*for(var i = 0; i < chatData.length; i++) {
    		chatString+=chatData[i].userName+' says: '+chatData[i].text + '<span style="color:gray"> at time ' +chatData[i].createdAt+'</span><br/>';
    	}*/
        callbackChat(chatData);
    }

	//check to see if turn changed on server
	if(data[1] === 1) {
		//it is my turn

        if(turn != 1) {
            //get data from last turn
            getMoveAjax();
        }
        turn = data[1];

        $("#nyt").hide();
        $("#yt").show();
		/*$(".shot").on("mouseover", function() {
			cell = getCell(this.id);
			//cell.displayCross();
            $(this).off();
		});*/
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
        var d = gameId + "~" + str;
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
            $("#myModalLabel").html = "Congratulations, You sunk your opponents fleet";
			$("#myModal").modal();
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
                if(shotsArr[i]) {
                    document.getElementById(shotsArr[i]).style.fill = "blue";
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

    if(data) {
        var activeUsers = document.getElementById("active_users");
        activeUsers.innerHTML = "";
        var cList = document.getElementById("challenge_list");
        cList.innerHTML = "";
        var len = data.length;
        for(var i = 0; i < len; i++) {
            if(data[i].challenge != 0) {
                //this is a challenge
                var li = document.createElement("li"),
                    mb = document.createElement("div"),
                    m = document.createElement("div"),
                    mb2 = document.createElement("div"),
                    h5 = document.createElement("h5"),
                    s = document.createElement("small"),
                    userText = document.createTextNode(data[i].userName + " challenges you"),
                    atText = document.createTextNode("Challenge sent at: " + data[i].createdAt);

                li.setAttribute("class", "media challenge_li");
                mb.setAttribute("class", "media-body");
                m.setAttribute("class", "media");
                mb2.setAttribute("class", "media-body");
                s.setAttribute("class", "text-muted");
                h5.id = data[i].id;


                h5.addEventListener("click", function(evt) {
                    acceptChallengeAjax(evt.target.id);
                }, false);

                h5.appendChild(userText);
                s.appendChild(atText);
                mb2.appendChild(h5);
                mb2.appendChild(s);
                m.appendChild(mb2);
                mb.appendChild(m);
                li.appendChild(mb);
                cList.appendChild(li);
            }
            else {
                //clear list
                //not a challenge, add user to active users list
                var li = document.createElement("li"),
                    mb = document.createElement("div"),
                    m = document.createElement("div"),
                    mb2 = document.createElement("div"),
                    h5 = document.createElement("h5"),
                    s = document.createElement("small"),
                    userText = document.createTextNode(data[i].userName),
                    atText = document.createTextNode("Signed-in at: " + data[i].createdAt);

                li.setAttribute("class", "media users_li");
                mb.setAttribute("class", "media-body");
                m.setAttribute("class", "media");
                mb2.setAttribute("class", "media-body");
                s.setAttribute("class", "text-muted");
                h5.id = data[i].id;

                h5.addEventListener("click", function(evt){
                    createChallengeAjax(evt.target.id);
                }, false);

                h5.appendChild(userText);
                s.appendChild(atText);
                mb2.appendChild(h5);
                mb2.appendChild(s);
                m.appendChild(mb2);
                mb.appendChild(m);
                li.appendChild(mb);
                activeUsers.appendChild(li);
            }
        }
    }
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
    var chatBod = document.getElementById("chat_body");
    chatBod.innerHTML = "";
	for(i=0;i<data.length;i++){
        //build template for message
        var li = document.createElement("li"),
            mb = document.createElement("div"),
            m = document.createElement("div"),
            mb2 = document.createElement("div"),
            s = document.createElement("small"),
            br = document.createElement("br"),
            hr = document.createElement("hr");

        if(data[i].challenge > 0){
            //handle challenge
            var textChat = document.createTextNode(data[i].userName + " has challenged " + data[i].challenge),
                textUser = document.createTextNode(data[i].userName + " | " + data[i].createdAt);
        }
        else {
            var textChat = document.createTextNode(data[i].text),
                textUser = document.createTextNode(data[i].userName + " | " + data[i].createdAt);
        }

        li.setAttribute("class", "media");
        mb.setAttribute("class", "media-body");
        m.setAttribute("class", "media");
        mb2.setAttribute("class", "media-body");
        s.setAttribute("class", "text-muted");
        s.appendChild(textUser);
        s.appendChild(hr);
        mb2.appendChild(textChat);
        mb2.appendChild(br);
        mb2.appendChild(s);
        m.appendChild(mb2);
        mb.appendChild(m);
        li.appendChild(mb);
        chatBod.appendChild(li);
	}
	if(window.location.href.indexOf("game.php") === -1) {
		//we are in the main lobby
		setTimeout('getChat()',2000);
	}
}

function createChallengeAjax(id) {
    ajaxCall("POST", {method: "createChallenge", a:"chat", data:id},callbackCreateChallenge);
}

function callbackCreateChallenge(data, status) {
    console.log("create cb: " + data + ", "+status);
    if(data) {
        location.href = "./game.php?gameId=" + data;
    }
}

function acceptChallengeAjax(id) {
    ajaxCall("POST", {method: "acceptChallenge", a:"chat", data:id}, callbackAcceptChallenge);
}

function callbackAcceptChallenge(data) {
    console.log(data);
    if(data) {
        location.href = "./game.php?gameId=" + data[0].gameId;
    }
}

///////////////////////////////////////////////////////////////////////



//get the last move
//-called after I find out it is my turn
//callback is callbackGetMove
////////////////
function getMoveAjax(){
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
        if(shotsArrLen === 0) {
            //you lost
            $("#myModalLabel").html = "You Lose! Your fleet was destroyed";
            $("#myModal").modal();
        }
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










