<?php 

require_once("/home/ans2759/dbCon.php");
//include exceptions
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/exception.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/utilData.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/chatData.php");

function setBoardData($gameId, $playerId, $board, $ships)  {
    global $mysqli;
    // will need to be changed to update when game init is done
    $sql = "UPDATE bs_game SET  board = ?, ships = ?, finalized = 1 WHERE gameId = ? AND player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("ssii", $board, $ships, $gameId, $playerId);
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


function setTurnData($user, $game, $shots) {
    global $mysqli;
    $sql = "UPDATE bs_game SET turn = 0, shots = ? WHERE gameId = ? AND player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("sii", $shots, $game, $user);
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
        else {
            throw new Exception("An error occurred getting game data");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($game));
        return false;
    }
}

function setGameData ($game, $player, $board, $ships) {
    global $mysqli;
    $sql = "UPDATE bs_game SET board = ?, ships = ?, turn = 1 WHERE gameId = ? AND player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("ssii", $board, $ships, $game, $player);
            $stmt->execute();
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }
        else {
            throw new Exception("An error occurred while setting turn");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($board, $ships, $game, $player));
        return false;
    }
}

 ?>