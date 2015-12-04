<?php 
require_once ("/home/ans2759/Sites/759/battleship/BizDataLayer/loginData.php");

function login($data, $ip){
  //separate data
  if($obs = json_decode($data, true)){

    $user = $obs['n'];
    $pw = $obs['p'];

    //retrieve pass and id from DB
    $res = processLogin($user, $pw);
    $dbPass = $res[0];
    $id = $res[1];

    //hash entered password
    $cPass = hashPass($pw);
   
    //compare hashed pws
    if($cPass == $dbPass){
      //generate token
      $token = createToken($ip, $id);
      //set cookie to token value
      setcookie("token", $token, time() + (86400 / 2), "/");
      return 1;
    }
    else {
      setcookie("token", " ", time()-1);
      return -1;
    }
  }
  else return -1;
}

function hashPass($pw){
  return crypt($pw, "salt");
}

function logout(){
  session_start();
  session_destroy();
  setcookie("token", " ", time()-1);

  return true;
}

?>