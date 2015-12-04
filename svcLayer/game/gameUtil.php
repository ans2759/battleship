<?php
//ALL game goes in this folder
/*function checkTurn($d,$ip,$token){
	//check the token, should they be here?
	
	//if so...
	//split the data?  $d=gameId|userId
	$h=explode('|',$d);
	$gameId=$h[0];
	$userId=$h[1];
	
	//go to the data layer and actually get the data I want
	require_once('BizDataLayer/checkTurn.php');
	echo(checkTurnData($gameId,$userId));
}

function changeTurn($d,$ip,$token){
	//check the token, should they be here?
	//change the turn.... (when?)
	
	//if so...
	//split the data?  $d=gameId|userId
	$h=explode('|',$d);
	$gameId=$h[0];
	$userId=$h[1];
	
	//go to the data layer and actually get the data I want
	require_once('BizDataLayer/changeTurn.php');
	changeTurnData($gameId,$userId);//would change the turn in the db
	
	//now what?
	checkTurn($d,$ip,$token);
}*/

require_once("/home/ans2759/Sites/759/battleship/svcLayer/login/token.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/gameData.php");

function finalizePosition($d, $ip, $token) {
	$gameId = 14;
	//check token
	if(!checkToken($ip, $token)) {
		return "verification_error";
	}
	else {
		$ships = array();
		$ROWS = 10;
		$COLS = 10;
		//token verified. Continue...

		//parse ship data
		$arr = explode(",", $d);
		if(count($arr) != 5) {
			//do we have 5 ships?
			return "ship_local_error";
		}
		for($i =0; $i < 5; $i++) {
			$ori = substr($arr[$i], 0, 2);
			$cellRow = substr($arr[$i], 13, 1);
			$cellCol = substr($arr[$i], 14, 1);
			//set correct lengths of ships
			switch($i) {
				case 0:
					$len = 2;
					break;
				case 1:
					$len = 3;
					break;
				case 2:
					$len = 3;
					break;
				case 3: 
					$len = 4;
					break;
				case 4:
					$len = 5;
					break;
			}
			array_push($ships, array("ori" => $ori, "row" => $cellRow, "col" => $cellCol,"len" => $len));
		}

		//build board
		$board = array();
		for($i = 0; $i < $ROWS;$i++) {
			$r = array();
			for($j = 0; $j < $COLS; $j++) {
				array_push($r, 0);
			}
			array_push($board, $r);
		}

		//check ships locations
		for($num = 0; $num < count($ships); $num++) {
			$ship = $ships[$num];
			if($num != 0) {
				$shipStr .= "|";
			}
			if($ship['ori'] == 'ns') {
				for($i = $ship['row']; $i < $ship['len'] + $ship['row']; $i++) {
					if($board[$i][$ship['col']] != 0 || $i > $ROWS - 1 || $i < 0) {
						return "ship_local_error";
					}
					else {
						if($i != $ship['row']) {
							$shipStr .= ",";
						}
						//point is clear, now mark as occupied
						$board[$i][$ship['col']] = 1;
						//add ship's position to array
						$shipStr .= $i . $ship['col'];
					}
				}			
			}
			elseif($ship['ori'] == 'ew'){
				for($j = $ship['col']; $j < $ship['len'] + $ship['col']; $j++) {
					if($board[$ship['row']][$j] != 0 || $j > $COLS - 1 || $j < 0) {
						return "ship_local_error";
					}
					else {
						if($j != $ship['col']) {
							$shipStr .= ",";
						}
						//point is clear, now mark as occupied
						$board[$ship['row']][$j] = 1;
						// add ship's position to array
						$shipStr .= $ship['row'] . $j;
					}
				}
			}
			else {
				//data error
				return "ship_local_error";
			}
		}

		// transfer board array to string for storage in DB
		$boardStr = "";
		$ct = 0;
		foreach($board as $row) {
			if($ct != 0) {
				$boardStr .= ",";
			}
			$ct++;
			$boardStr .= implode($row);
		}
		
		//we have our board string and shipt location string, so lets send it to DB
		if(setBoardData($gameId, $_SESSION['user_id'], $boardStr, $shipStr) > 0) {
			//board is set proceed
			return 1;
		}
		else {
			//error setting board data in DB
			return -1;
		}
	}
}

function checkTurn($d, $ip, $token) {
	$gameId = 14;
	//check token
	if(!checkToken($ip, $token)) {
		return "verification_error";
	}
	else {
		if($d == -1) {// -1 signifies it is not my turn on client
			$turn = 0;
			//it is not my turn, so I will check the DB to see if it has changed
			$turnData = json_decode(checkTurnData($gameId));
			//there should be 2 results returned, we will iterate results to select correct row based upon player ID
			foreach($turnData as $player) {
				if($player->player == $_SESSION['user_id']) {
					//this is the correct row
					$turn = $player->turn;
				}
			}
		}
		// we will still check chat data for the game regardless of turn
		$chat = getChatData($gameId);
		if(is_null($chat)) {
			$chat = "no chat";
		}
		$res = array($chat, $turn);
		return json_encode($res);
	}
}

function fireShots($d, $ip, $token) {
	if(!checkToken($ip, $token)) {
		return "verification_error";
	}
	else { 
		$ROWS = 10;
		$COLS = 10;
		$data = explode("~", $d);
		$gameId = $data[0];
		$shots = explode("|", $data[1]);

		//we need to retrieve game data to check against shots
		$game = json_decode(getGameData($gameId));
		foreach($game as $player) {
			if($player->player == $_SESSION['user_id']) {
				//these are your boards
				$you = $player;
			}
			else {
				//these are opponents
				$opp = $player;
			}
		}

		//is it my turn?
		if($you->turn == 0) {
			//it's not my turn
			return "turn_error";
		}
		else {
			//it is my turn

			//check if shots are legal
			$boardArr = array();
			$arr = explode(",",$opp->board);
			foreach($arr as $row) {
				array_push($boardArr, str_split($row, 1));
			}

			/*$ships = array();
			$arr = explode("|", $opp->ships);
			foreach($arr as $ship) {
				array_push($ships, explode(",", $ship));
			}
			for($i = 0; $i < count($arr); $i++) {
				$ship = explode(",", $)
			}*/

			foreach($shots as $shot) {
				$row = substr($shot, 11, 1);
				$col = substr($shot, 12, 1);
				$shotConcat = substr($shot, 11, 2);

				if($boardArr[$row][$col] == -1) {
					//this shot has already been taken, it is illegal
					return "shot_error";
				}
				elseif($boardArr[$row][$col] == 1) {
					// its a hit
					foreach($ships as $ship) {
						return $index = !array_search($shotConcat, $ship); // needs work///////////////////////////////////
						if(!$index) {
							return "shot_error";
						}
						else {
							return "hit on ".$index;
						}
					}
				}
				else {
					//miss
					return "miss";
				}
			}
		}
	}
}

echo "<pre>";
var_dump(fireShots("14~shots_cell_99|shots_cell_02|shots_cell_03|shots_cell_04|shots_cell_00", $_SERVER['REMOTE_ADDR'], $_COOKIE['token']));
echo "</pre>";
?>