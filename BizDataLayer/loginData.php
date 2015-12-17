<?php 
require_once("/home/ans2759/dbCon.php");
require_once('exception.php');
require_once("/home/ans2759/Sites/759/battleship/BizDataLayer/utilData.php");


/**
 * @param $user
 * @return bool|string
 */
function processLogin($user){
  global $mysqli;
  $sql = "SELECT password, userId FROM bs_users WHERE userName = ?";
  try {
    if($stmt=$mysqli->prepare($sql)) {
        $stmt->bind_param("s",$user);
        $stmt->execute();
        return returnJson($stmt);
        $stmt->close();
        $mysqli->close();
          }else {
              throw new Exception("An error occurred while comparing user record data");
          }
    //echo $c;
  }catch (Exception $e) {
    log_error($e, $sql, $user);
    return false;
  }

  return $res;
}

/**
 * @param $id
 * @param $name
 * @return bool
 *
 * inserts user into active users table
 */
function setLoginData ($id, $name) {
    global $mysqli;

    $sql = "INSERT INTO bs_active SET id = ?, challenge = 0, userName = ?";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("is", $id, $name);
            $stmt->execute();
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred while storing login data");
        }
        //echo $c;
    }catch (Exception $e) {
        log_error($e, $sql, $id, $name);
        return false;
    }
}

/**
 * @param $id
 * @return bool
 *
 * removes user from active users table
 */
function logoutData($id) {
    global $mysqli;

    $sql = "DELETE FROM bs_active WHERE id = ? AND challenge = 0";
    try {
        if($stmt=$mysqli->prepare($sql)){
            $stmt->bind_param("i", $id);
            $stmt->execute();
            return $mysqli->affected_rows;
            $stmt->close();
            $mysqli->close();
        }else {
            throw new Exception("An error occurred while logging out");
        }
        //echo $c;
    }catch (Exception $e) {
        log_error($e, $sql, $id);
        return false;
    }
}

//var_dump(setLoginData(101, 1449464986))

 ?>
