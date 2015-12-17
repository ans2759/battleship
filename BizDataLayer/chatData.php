<?php
	//include dbInfo (ONLY real gotcha on this - make sure the path is to YOUR database
	//require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/chatData.php");
require_once("/home/ans2759/dbCon.php");
	//include exceptions
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/exception.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/utilData.php");
	
	function getChatData($room){
		global $mysqli;

    $sql = " SELECT bs_chat.userId, bs_chat.text, bs_chat.createdAt, bs_users.userName
             FROM bs_chat, bs_users
             WHERE bs_chat.userId = bs_users.userId AND roomNumber = ?
             ORDER BY bs_chat.createdAt DESC ";
		try {
			if($stmt=$mysqli->prepare($sql)){
                $stmt->bind_param("i", $room);
				return returnJson($stmt);
                $stmt->close();
				$mysqli->close();
      }else {
        throw new Exception("An error occurred while fetching record data");
      }
			//echo $c;
    }catch (Exception $e) {
      log_error($e, $sql, null);
			return false;
    }
		
	}
	
function sendChatData($r, $u, $t){
    //update db with new chat
    global $mysqli;

    $sql = "INSERT INTO bs_chat SET roomNumber = ?, userId = ?, text = ?";
    try {
      if($stmt=$mysqli->prepare($sql)){
        $stmt->bind_param("iss", $r, $u, $t);
        $stmt->execute();
        return $mysqli->affected_rows;
        $stmt->close();
        $mysqli->close();
      }else {
        throw new Exception("An error occurred while fetching record data");
      }
      //echo $c;
    }catch (Exception $e) {
      log_error($e, $sql, null);
      return false;
    }
}

function checkUsersData() {
    global $mysqli;

    $sql = " SELECT id, challenge, userName, createdAt
             FROM bs_active
             ORDER BY createdAt DESC ";
    try {
        if($stmt=$mysqli->prepare($sql)){
            return returnJson($stmt);
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred while active user data");
        }
    }catch (Exception $e) {
        log_error($e, $sql, null);
        return false;
    }
}

function createChallengeData($user, $opp, $name, $game) {
    global $mysqli;

    $sql = "INSERT INTO bs_active SET id = ?, challenge = ?, userName = ?, gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("iiss", $user, $opp, $name, $game);
            $stmt->execute();
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred while creating challenge");
        }
        //echo $c;
    }catch (Exception $e) {
        log_error($e, $sql, array($user, $opp, $name, $game));
        return false;
    }
}

function getGameId($user, $opp) {
    global $mysqli;

    $sql = " SELECT gameId
             FROM bs_active
             WHERE id = ? AND challenge = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("ii", $opp, $user);
            $stmt->execute();
            return returnJson($stmt);
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred getting challenge info");
        }
    }catch (Exception $e) {
        log_error($e, $sql, array($opp, $user));
        return false;
    }
}

function deleteChallengeData($user, $opp) {
    global $mysqli;

    $sql = "DELETE FROM bs_active WHERE id = ? AND challenge = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("ii", $opp, $user);
            $stmt->execute();
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred while deleting challenge info");
        }
    }catch (Exception $e) {
        log_error($e, $sql, array($opp, $user));
        return false;
    }
}

?>