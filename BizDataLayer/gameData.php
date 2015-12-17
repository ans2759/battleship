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
            $stmt->bind_param("sssi", $board, $ships, $gameId, $playerId);
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
        log_error($e, $sql, array($gameId, $playerId, $board, $ships));
        return false;
    }
}


///////////
function checkTurnData($game) {
    global $mysqli;
    $sql = "SELECT player, turn FROM bs_game WHERE gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("s", $game);
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
            $stmt->bind_param("ssi", $shots, $game, $user);
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
        log_error($e, $sql, array($user, $game, $shots));
        return false;
    }
}

function getGameData($game) {
    global $mysqli;
    $sql = "SELECT player, board, ships, shots, turn, finalized, gameOver FROM bs_game WHERE gameId = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("s", $game);
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
            $stmt->bind_param("sssi", $board, $ships, $game, $player);
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

function initiateGameData($p, $game) {
    global $mysqli;
    $sql = "INSERT INTO bs_game SET gameId = ?, player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("si", $game, $p);
            $stmt->execute();
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }
        else {
            throw new Exception("An error occurred while game init");
        }
    }
    catch (Exception $e) {
        log_error($e, $sql, array($game, $p));
        return false;
    }
}

function makeTurnData($player, $game) {
    global $mysqli;
    $sql = "UPDATE bs_game SET turn = 1 WHERE gameId = ? AND player = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("si", $game, $player);
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
        log_error($e, $sql, array( $game, $player));
        return false;
    }
}

function endGameData($game) {
    global $mysqli;
    $sql = "UPDATE bs_game SET gameOver = 1 WHERE gameId = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("si", $game, $player);
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
        log_error($e, $sql, array( $game, $player));
        return false;
    }
}

function addWinData($id) {
    global $mysqli;
    $sql = "UPDATE bs_users SET wins = wins + 1 WHERE userId = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $id);
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
        log_error($e, $sql, array( $id));
        return false;
    }
}

function addLossData($id) {
    global $mysqli;
    $sql = "UPDATE bs_user SET losses = losses + 1 WHERE userId = ?";

    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $id);
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
        log_error($e, $sql, array( $id));
        return false;
    }
}
 ?>