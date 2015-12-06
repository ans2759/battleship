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
             WHERE bs_chat.userId = bs_users.userId AND roomNumber = ?";
		try {
			if($stmt=$mysqli->prepare($sql)){
                $stmt->bind_param("i", $room);
				return returnJson($stmt);
                $stmt->close();
				$mysqli->close();
      }else if (!$data) {
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
        $stmt->close();
        $mysqli->close();
      }else if (!$data) {
        throw new Exception("An error occurred while fetching record data");
      }
      //echo $c;
    }catch (Exception $e) {
      log_error($e, $sql, null);
      return false;
    }
}

/*function checkRoomData($id){
    global $mysqli;

    $sql = "SELECT gameId FROM bs_users WHERE userId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($gameId);
            $stmt->fetch();
            return $gameId;
            $stmt->close();
            $mysqli->close();
        }else if (!$data) {
            throw new Exception("An error occurred while fetching record data");
        }
        //echo $c;
    }catch (Exception $e) {
        log_error($e, $sql, null);
        return false;
    }
}*/

/*function checkUsersData($roomId){
    global $mysqli;

    $sql = "SELECT userName FROM bs_users WHERE gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $roomId);
            return returnJson($stmt);
            $stmt->close();
            $mysqli->close();
        }else if (!$data) {
            throw new Exception("An error occurred while fetching record data");
        }
        //echo $c;
    }catch (Exception $e) {
        log_error($e, $sql, null);
        return false;
    }
}*/
    


/*********************************Utilities*********************************/
/*************************
	returnJson
	takes: prepared statement
		-parameters already bound
	returns: json encoded multi-dimensional associative array
*/
/*function returnJson ($stmt){
	$stmt->execute();
	$stmt->store_result();
 	$meta = $stmt->result_metadata();
    $bindVarsArray = array();
	//using the stmt, get it's metadata (so we can get the name of the name=val pair for the associate array)!
	while ($column = $meta->fetch_field()) {
    	$bindVarsArray[] = &$results[$column->name];
    }
	//bind it!
	call_user_func_array(array($stmt, 'bind_result'), $bindVarsArray);
	//now, go through each row returned,
	while($stmt->fetch()) {
    	$clone = array();
        foreach ($results as $k => $v) {
        	$clone[$k] = $v;
        }
        $data[] = $clone;
    }
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
	header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
	header("Cache-Control: no-store, no-cache, must-revalidate");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
	//MUST change the content-type
	header("Content-Type:text/plain");
	// This will become the response value for the XMLHttpRequest object
    return json_encode($data);
}*/
?>