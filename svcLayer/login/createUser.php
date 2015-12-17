<?php
require_once ("/home/ans2759/Sites/759/battleship/BizDataLayer/userData.php");

function createUser($data){
    if($obs = json_decode($data, true)) {
        $user = htmlentities(preg_replace("/[^a-zA-Z]*/", "", $obs['u']), ENT_QUOTES, "utf-8");
        $pw = htmlentities(preg_replace("/[^a-zA-Z]*/", "", $obs['p']), ENT_QUOTES, "utf-8");
        $cp = htmlentities(preg_replace("/[^a-zA-Z]*/", "", $obs['cp']), ENT_QUOTES, "utf-8");

        if(strlen($user) < 6 || strlen($pw) < 6 || strlen($user) > 20 || strlen($pw) > 20){
          return -1;
        }

        if($pw != $cp) {
            return -1;
        }
        elseif(checkUsername($user) > 0){
            return -1;
        }
        else {
            $cPass = hashPass($pw);
            if(!storeNewUser($user, $cPass)){
                return -1;
            }
            else{
                //account successfully created, so we will automatically log them in
                if(login(json_encode(array("n" => $user, "p" => $pw)), $_SERVER['REMOTE_ADDR']) == 1){
                    return 1;
                }
                else
                    return -1;
            }
        }
    }
    else return -1;
}
?>