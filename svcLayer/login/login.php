<?php 
require_once ("/home/ans2759/Sites/759/battleship/BizDataLayer/loginData.php");

/**login
 *
 * @param $data
 * @param $ip
 *
 * @return int  1 if successful, -1 if not
 *
 */
function login($data, $ip){
  //separate data
  if($obs = json_decode($data, true)){

    //sanitization

    $user = htmlentities(preg_replace("/[^a-zA-Z ]*/", "", $obs['n']), ENT_QUOTES, "utf-8");
    $pw = htmlentities(preg_replace("/[^a-zA-Z ]*/", "", $obs['p']), ENT_QUOTES, "utf-8");

    //retrieve pass and id from DB
    $res = json_decode(processLogin($user), true);
    $dbPass = $res[0]['password'];
    $id = $res[0]['userId'];

    //hash entered password
    $cPass = hashPass($pw);
   
    //compare hashed pws
    if($cPass == $dbPass){
        //generate token
          $token = createToken($ip, $id);
          //set cookie to token value
          $time = time() + (86400 / 2);
          setcookie("token", $token, $time, "/");
        session_start();
          setLoginData($_SESSION['user_id'], $user);
          return 1;
    }
    else {
      setcookie("token", " ", time()-1);
        return -1;
    }
  }
  else return -1;
}

/**hashPass
 *
 * @param $pw
 *
 * @return string
 *
 * probably should use a string other than salt as my salt
 */
function hashPass($pw){
  return crypt($pw, "salt");
}

/**logout
 *
 * @return bool
 *
 * logs user out and removes from active users
 */
function logout(){
  session_start();
    logoutData($_SESSION['user_id']);
  session_destroy();
  setcookie("token", " ", time()-1);

  return true;
}

?>
