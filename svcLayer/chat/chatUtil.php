<?php
//ALL chat goes in this folder
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/chatData.php");
require_once("/home/ans2759/Sites/759/battleship/svcLayer/login/token.php");
session_start();//pretty sure this is needed

function getChat(){
   // if(checkToken($))
	//split $d - would probably hold null if just looking for latest chat, $userId|$message if a new message...  (split like we are doing in game)
	
	
	//go to the data layer and actually get the data I want
	echo(getChatData(1));
}

function sendChat($d, $ip, $token){
  if($obs = json_decode($d, true)){
    
    //need validation

    if(!checkToken( $_SERVER['REMOTE_ADDR'], $_COOKIE['token'])){
      echo "error sending chat";
    }
    else{
      //check user room num before sending chat
      $room = $obs['room'];
          //checkRoomData($_SESSION['user_id']);



      sendChatData($room, $_SESSION['user_id'], $obs['text']);
      echo getChatData();
    }
  }
  else
    echo "error with json string";
}

function checkUsers(){
  //echo checkRoomData($_SESSION['user_id']);
}

/*echo"<pre>";
var_dump(getChat());
echo "</pre>";*/

?>