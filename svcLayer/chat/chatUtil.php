<?php
//ALL chat goes in this folder
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/chatData.php");
require_once("/home/ans2759/Sites/759/battleship/svcLayer/login/token.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/gameData.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/userData.php");
session_start();//pretty sure this is needed

/**
 * retrieves chat data from db
 */
function getChat(){
	
	//go to the data layer and actually get the data I want
	echo(getChatData(1));
}

function sendChat($d, $ip, $token){
  if($obs = json_decode($d, true)){

    if(!checkToken( $ip, $token)){
      return -1;
    }
    else{
      //check user room num before sending chat
      $room = filter_var($obs['room'], FILTER_SANITIZE_STRING);
        $text = htmlentities(preg_replace("/[^a-zA-Z ]*/", "", $obs['text']), ENT_QUOTES, "utf-8");

      if(sendChatData($room, $_SESSION['user_id'], $text) > 0) {
          echo getChatData();
      }
        else {
            return -1;
        }
    }
  }
  else
    return -1;
}

/**
 * @return string
 */
function checkUsers() {
    session_start();
    $res = json_decode(checkUsersData());
    $return = array();

    foreach($res as $record) {
        if(($record->challenge == 0 && $record->id != $_SESSION['user_id']) || $record->challenge == $_SESSION['user_id']) {

            //this is a active user or a challenge for us and not our own listing, so add to list
            array_push($return, $record);
        }
        //only other option is challenge not for us, so we ignore
    }
    return json_encode($return);
}

/**
 * @param $d
 * @param $ip
 * @param $token
 * @return string
 */
function createChallenge($d, $ip, $token) {
    if(!checkToken($ip, $token)){
        echo "verification error";
    }
    else{
        $opp = filter_var($d, FILTER_SANITIZE_NUMBER_INT);
        //generate game id (challenger's ID is prefix)
        $game = uniqid($_SESSION['user_id']);
        if(initiateGameData($_SESSION['user_id'], $game) > 0 && initiateGameData($opp, $game) > 0) {
            //insert challenge into active user table
            $res = json_decode(getUsernameData($_SESSION['user_id']));
            $userName = $res[0]->userName;
            if(createChallengeData($_SESSION['user_id'], $opp, $userName, $game) > 0) {
                return json_encode($game);
            }
            else {
                return "error creating challenge";
            }
        }
        else {
            return "error initiating game";
        }

    }
}

//var_dump(createChallenge(101, $_SERVER['REMOTE_ADDR'], $_COOKIE['token']));

/**
 * @param $d
 * @param $ip
 * @param $token
 * @return bool|string
 */
function acceptChallenge($d, $ip, $token) {
    if(!checkToken($ip, $token)){
        echo "verification error";
    }
    else{
        $opp = $d;

        //we need to find the game Id and return it
        $game = getGameId($_SESSION['user_id'], $opp);

        acceptChallengeData($_SESSION['user_id'], $opp);

        deleteChallengeData($game);

        return $game;
    }
}

/**
 * @param $d
 * @return bool|string
 */
function checkChallenge($d) {
    $gameId = filter_var($d, FILTER_SANITIZE_STRING);

    $res = checkChallengeData($gameId);

    return $res;
}


?>