<?php
require_once("/home/ans2759/dbCon.php");
require_once('exception.php');

function storeNewUser($DBuser, $DBpass){
    global $mysqli;
    $sql = "INSERT INTO bs_users SET userName = ?, password = ?";
    try{
        if($stmt = $mysqli->prepare($sql)) {
            $stmt->bind_param("ss", $DBuser, $DBpass);
            $stmt->execute();
            return true;
            $stmt->close();
            $mysqli->close();
        }else{
            throw new Exception("An error occurred while Storing record data");
        }
    }catch (Exception $e) {
        log_error($e, $sql, null);
        return false;
    }
}

function checkUsername($user){
    global $mysqli;

    $sql = "SELECT userName FROM bs_users WHERE userName = ?";
    try{
        if($stmt = $mysqli->prepare($sql)) {
            $stmt->bind_param("s", $user);
            $stmt->execute();
            $stmt->store_result();
            $rows = $stmt->num_rows;
            return $rows;
            $stmt->close();
            $mysqli->close();
        }
    }catch (Exception $e) {
        log_error($e, $sql, null);
        //return false;
        echo 'fail';
    }
}

?>