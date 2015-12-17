<?php
//ALL game goes in this folder
require_once("/home/ans2759/Sites/759/battleship/svcLayer/login/token.php");
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/gameData.php");

function finalizePosition($d, $ip, $token) {
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
        $data = explode("~", $d);
        $gameId = filter_var($data[0], FILTER_SANITIZE_STRING);
		$arr = explode(",", $data[1]);

		//have we already finalized???
		$game = json_decode(getGameData($gameId));
		foreach($game as $player) {
			if($player->player == $_SESSION['user_id'] && $player->finalized == 1) {
				//we have already finalized this board
				return -1;
			}
		}

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
        setBoardData($gameId, $_SESSION['user_id'], $boardStr, $shipStr);

        //check if opponent has finalized board
        $res = json_decode(getGameData($gameId));
        if(count($res) == 0){
            return "no db";
        }
        $test = true;
        foreach($res as $player) {
            if($player->finalized != 1) {
                $test = false;
            }
            if($player->player == $_SESSION['user_id']){
                //you
                $you = $player;
            }
            else {
                $opp = $player;
            }
        }
        if($test) {
            //both players are ready
            if(makeTurnData($opp->player, $gameId) > 0) {
                //opponent was ready first, so it will be their turn
                return 1;
            }
            else {
                return $opp->player . "error";
            }
        }
        else {
            //opp isn't ready yet
            return 1;
        }
	}
}

/*echo "<pre>";
var_dump(finalizePosition("10156721abbe8310~nsships_cell_00,nsships_cell_01,nsships_cell_02,nsships_cell_03,nsships_cell_04", $_SERVER['REMOTE_ADDR'], $_COOKIE['token']));
echo "</pre>";*/
//var_dump(makeTurnData(109, "10156721abbe8310"));

function checkTurn($data, $ip, $token) {
	//check token
	if(!checkToken($ip, $token)) {
		return "verification_error";
	}
	else {
        $data = explode("|", $data);
        $d = $data[0];
        $gameId = $data[1];
		if($d == 0) {// 0 signifies it is not my turn on client
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
		$shots = explode("|", $data[1]);
        $gameId = $data[0];
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
		if(is_null($you) || $you->turn == 0) {
			//it's not my turn
			return "turn_error";
		}
		else {
			//it is my turn//how many shots do I get?
            if(count($shots) > checkShipsArray(buildShipsArr($you->ships)) || count($shots) < 1) {
                //there are too many shots in the array
                //return "shots_error";
            }

			//build board array
			$boardArr = boardStringToArray($opp->board);

			//build array of ship positions
			$ships = buildShipsArr($opp->ships);

            //check if shots are legal
            $hits = array(); //tracks number of hits
            $shipStr = ''; //str representation of ships board
            $ct = 0;
            for($i = 0; $i < count($ships);$i++) {
                if($i != 0) {
                    $shipStr .= "|";
                }
                for($j = 0; $j < count($ships[$i]); $j++) {
                    $ct++;
                    if($j != 0) {
                        $shipStr .= ",";
                    }
                    if($ships[$i][$j] != -1) {
                        foreach ($shots as $shot) {
                            $row = substr($shot, 11, 1);
                            $col = substr($shot, 12, 1);
                            $shotConcat = substr($shot, 11, 2);
                            if ($boardArr[$row][$col] != 0) {
                                // its a hit
                                if ($shotConcat == $ships[$i][$j]) {
                                    //we have hit the ship on this cell
                                    $ships[$i][$j] = -1;
                                    array_push($hits, $shotConcat);
                                    break;
                                }
                                else {
                                    //shot was a miss
                                    array_push($hits, $shotConcat . "|" . 0);
                                }
                            }
                            //we shot at this spot, mark it as so
                            $boardArr[$row][$col] = 2;
                        }
                    }
                    $shipStr .= $ships[$i][$j];
                }
            }
            $oppHealth = checkShipsArray($ships);

            //change board array back to string
            $boardStr = boardArrayToString($boardArr);

            //we have updated shots and ships boards, send to db
            if(setGameData($gameId, $opp->player, $boardStr, $shipStr)) {
                //game data updated, it is no longer your turn
                if(setTurnData($_SESSION['user_id'], $gameId, $data[1])) {
                    //success
                    return json_encode(array($oppHealth, $hits));
                }
            }
			//return json_encode(array($oppHealth, $hits));
		}
	}
}

/**
 * @param $ships
 * @return int
 *
 * Returns the number of ships still alive in a ships array
 */
function checkShipsArray ($ships) {
    $shipsLeft = 0;
    foreach($ships as $ship) {
        $alive = false;
        foreach($ship as $cell) {
            if($cell != -1) {
                $alive = true;
            }
        }
        if($alive) {
            $shipsLeft++;
        }
    }
    return $shipsLeft;
}

/**
 * @param $shipStr
 * @return array
 *
 * takes string representation of ship's positions and returns it as a 2D array
 */
function buildShipsArr ($shipStr) {
    $ships = array();
    $arr = explode("|", $shipStr);
    foreach($arr as $ship) {
        array_push($ships, explode(",", $ship));
    }
    return $ships;
}

/**
 * @param $boardArr
 * @return string
 *
 * takes an array representing the board array and returns a string
 */
function boardArrayToString($boardArr){
    $boardStr = '';
    for($i = 0; $i < count($boardArr); $i++) {
        if($i != 0) {
            $boardStr .= ",";
        }
        for($j = 0; $j < count($boardArr[$i]); $j++) {
            $boardStr .= $boardArr[$i][$j];
        }
    }
    return $boardStr;
}

/**
 * @param $str
 * @return array
 *
 * takes board string and returns array representation
 */
function boardStringToArray($str) {
    $boardArr = array();
    $arr = explode(",",$str);
    foreach($arr as $row) {
        array_push($boardArr, str_split($row, 1));
    }
    return $boardArr;
}

function getMove($d, $ip, $token) {
    //do we need to verify identity here?
    //need to start session if we don't check token
    session_start();
    //retrieve updated game info from DB
    $gameId = filter_var($d, FILTER_SANITIZE_STRING);
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
	$yourHealth = checkShipsArray(buildShipsArr($you->ships));
    if($yourHealth == 0){
        //you lose
        endGame($opp->player, $_SESSION['user_id'], $gameId);
    }
    //return the number of ships you have left and the previous round of shots fired by opponent
    return json_encode(array($yourHealth, $opp->shots));
}

function endGame($win, $los, $gameId) {
    if(!checkToken($_SERVER['REMOTE_ADDR'], $_COOKIE['token'])) {
        return "verification_error";
    }
    else {
        //check to make sure this hasn't been ended already
        $game = getGameData($gameId);
        foreach($game as $player){
            if($player->gameOver == 1){
                return -1;
            }
        }
        //end game in DB
        if(endGameData($gameId) > 0) {

            //update wins
            addWinData($win);

            //update loss
            addLossData($los);
        }
    }
}


?>