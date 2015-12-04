<?php
	if(isset($_POST['method']) || isset($_GET['method'])){

		$a = $_POST['a'] ?: $_GET['a'];
		//include all files for needed area (a)
		foreach (glob("./svcLayer/".$a."/*.php") as $filename){
			include $filename;
		}
		$serviceMethod=$_POST['method'] ?: $_GET['method'];
		$data=$_POST['data'] ?: $_GET['data'];
		$result=@call_user_func($serviceMethod,$data,$_SERVER['REMOTE_ADDR'],$_COOKIE['token']);
		if($result){
			//might need the header cache stuff
			header("Content-Type:text/plain");
			echo $result;
		}
	}
?>