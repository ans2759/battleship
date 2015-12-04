<?php
require_once ("/home/ans2759/Sites/759/battleship/BizDataLayer/userData.php");

function createUser($data){
    if($obs = json_decode($data, true)) {
        $user = $obs['u'];
        $pw = $obs['p'];
        $cp = $obs['cp'];

        if($pw != $cp){
            return "Passwords do not match";
        }
        elseif(checkUsername($user) > 0){
            return "Invalid username";
        }
        else {
            $cPass = hashPass($pw);
            if(!storeNewUser($user, $cPass)){
                return "error creating account";
            }
            else{
                //account successfully created, so we will automatically log them in
                if(login(json_encode(array("n" => $user, "p" => $pw)), $_SERVER['REMOTE_ADDR']) == 1){
                    return 1;
                }
                else
                    return "Created Username";
            }
        }
    }
    else return "json failure";
}
?>