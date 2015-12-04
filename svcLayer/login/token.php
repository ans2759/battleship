<?php

//key for zipping and unzipping token (integers 0-35 randomly sequenced no repeats)
$zKey = array(25, 5, 32, 22, 20, 21, 26, 11, 6, 31, 10, 33, 
  30, 4, 28, 7, 16, 24, 1, 27, 35, 34, 15, 3, 18, 19, 0, 8, 
  12, 9, 2, 14, 17, 29, 23, 13);


function checkToken($ip, $token){
    session_start();
    $id = $_SESSION['user_id'];
  global $zKey;
  //split token into token and hash
  $t = substr($token, 0, 36);
  $hash = substr($token, 36);

  //unzip token to original state
  $unzip = "";
  for($i = 0; $i < strlen($t); $i++){
    $unzip .= substr($t, array_search($i, $zKey),1);
  }

  //ignore 10 0's
  $res['id'] = base_convert(substr($unzip, 22, 2), 11, 10);
  
  //ignore first 3 0's
  $res['ip'] = base_convert(substr($unzip, 3, 9), 13, 10);

  //ignore 5 0's
  $res['time'] = base_convert(substr($unzip, 29, 7), 25, 10);

  //remove periods from ip
  $ip = str_replace(".", "", $ip);
  
  //hash token value and compare to hash that was sent
  if(sha1($t) != $hash){
    return false;
  }
  //check if id of token matches the user ID
  elseif($id != $res['id']) {
    return false;
  }
  //compare ip addresses
  elseif($ip != $res['ip']){
  	return false;
  }
  //check if token was created more than 12 hours ago
  elseif(time() - (60 * 60 * 12) > $res['time']){
  	return false;
  }
  else
    return true;

/*Use to debug token checking  

if(sha1($t) != $hash){
    return "hash compfail";
  }
  //check if id of token matches the user ID
  elseif($id != $res['id']) {
    return "id fail";
  }
  elseif($ip != $res['ip']){
  	return "ip fail";
  }
  elseif(time() - (60 * 60 * 12) > $res['time']){
  	return "timestamp expired";
  }
  else
    return $res;*/
}


function createToken($ip, $id){
  //store id in session
  session_start();
  $_SESSION['user_id'] = $id;


  //convert ip address to base 13
  $cIp = base_convert($ip, 10, 13);
  //convert timestamp to base 25
  $date = date_create();
  $cTime = base_convert(date_timestamp_get($date), 10, 25);
  //convert id to base 11
  $cId = base_convert($id, 10, 11);
  $ipLen = strlen($cIp);
  $timeLen = strlen($cTime);
  $idLen = strlen($cId);

  //normalize lengths
  $add = 12 - $ipLen;
  $os = "";
  for($i = 0; $i < $add; $i++){
    $os .= "0";
  }
  $os .= $cIp;
  $cIp = $os;

  $add = 12 - $timeLen;
  $os2 = "";
  for($i = 0; $i < $add; $i++){
    $os2 .= "0";
  }
  $os2 .= $cTime;
  $cTime = $os2;

  $add = 12 - $idLen;
  $os3 = "";
  for($i = 0; $i < $add; $i++){
    $os3 .= "0";
  }
  $os3 .= $cId;
  $cId = $os3;

  //token prior to zipping
  $preZip .= "$cIp";
  $preZip .= "$cId";
  $preZip .= "$cTime";

  global $zKey;

  //zip pieces
  foreach($zKey as $val){
    $token .= substr($preZip, $val, 1);
  }

  //hash token and append to end
  $hash = sha1($token);
  $token .= $hash;
  return $token;
}

?>