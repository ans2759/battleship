<?php 

require_once("/home/ans2759/dbCon.php");
//include exceptions
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/exception.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/utilData.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/chatData.php");

function setBoardData($gameId, $playerId, $board, $ships)  {
    global $mysqli;
    $sql = "INSERT INTO bs_game SET gameId = ?, player = ?, board = ?, ships = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("iiss", $gameId, $playerId, $board, $ships);
            $stmt->execute(); 
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }
        else if (!$data) {
            throw new Exception("An error occurred while inserting board data data");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($gameId, $playerId, $board));
        return false;
    }
}


///////////
function checkTurnData($game) {
    global $mysqli;
    $sql = "SELECT player, turn FROM bs_game WHERE gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $game);
            $stmt->execute(); 
            return returnJson($stmt);
            $stmt->close();
            $mysqli->close();
        }
        else if (!$data) {
            throw new Exception("An error occurred while checking turn data");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($gameId, $playerId, $board));
        return false;
    }
}


function setTurnData($user, $game) {
    global $mysqli;
    $sql = "UPDATE bs_game SET turn = 1 WHERE gameId = ? AND player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("ii", $game, $user);
            $stmt->execute(); 
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }
        else if (!$data) {
            throw new Exception("An error occurred while setting turn");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($gameId, $playerId, $board));
        return false;
    }
}

function getGameData($game) {
    global $mysqli;
    $sql = "SELECT player, board, ships, shots, turn FROM bs_game WHERE gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $game);
            $stmt->execute(); 
            return returnJson($stmt);
            $stmt->close();
            $mysqli->close();
        }
        else if (!$data) {
            throw new Exception("An error occurred getting game data");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($gameId, $playerId, $board));
        return false;
    }
}

 ?>