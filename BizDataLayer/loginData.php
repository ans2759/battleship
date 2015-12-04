<?php 
require_once("/home/ans2759/dbCon.php");
require_once('exception.php');


function processLogin($user, $pw){
  global $mysqli;
  $sql = "SELECT password, userId FROM bs_users WHERE userName = ?";
  try {
    if($stmt=$mysqli->prepare($sql)) {
        $stmt->bind_param("s",$user);
        $stmt->execute();
        $stmt->store_result;
        $stmt->bind_result($dbPass, $userId);
        $stmt->fetch();
        $res = array($dbPass, $userId);
        $stmt->close();
        $mysqli->close();
          }else if (!$dbPass) {
              throw new Exception("An error occurred while Storing record data");
          }
    //echo $c;
  }catch (Exception $e) {
    log_error($e, $sql, null);
    //return false;
    echo 'fail';
  }

  return $res;
}

 ?>
