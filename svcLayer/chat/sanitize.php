<?php 
/*
* type 1: username & password
*   -only A-Z, a-z, 0-9
*   -username at least 5
*   -password at least 8
*/

function sanitize ($data, $type) {
    if($type == 1){
        for($i = 0; $i < count($data); $i++) {
            $data[$i] = (string)$data[$i]; //ensure is string$
            $data[$i] = preg_replace("/[^a-zA-Z0-9 .!\/]*/","", $data[$i]); //remove any characters that are not a-z, A-Z, 0-9...
            $data[$i] = substr($data[$i], 0, 20);//restrict length to 20 characters
            $data[$i] = htmlentities($data[$i], ENT_QUOTES, 'utf-8');
            $data[$i] = filter_var($data[$i], FILTER_SANITIZE_STRING);
        }
        //username must be longer than 5 
        //password must be 8 characters or more

        if(strlen($data[0]) < 5 || strlen($data[1]) < 8) {
            return false;
        }
        else {
            return $data;
        }
    }
}

function input ($data, $lenth) {

}

/*echo "<pre>";
var_dump(sanitize(array("alexstucki", "alexs176"), 1));
echo "</pre>";*/

 ?>