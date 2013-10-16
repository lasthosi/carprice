<?php
require_once('common.config.php');
function db(){
	$sqli = mysqli_init();
	$sqli->options(MYSQLI_INIT_COMMAND,"SET NAMES 'utf8'");
	$sqli->real_connect(DB_HOST,DB_USER,DB_PWD,DB_NAME);
	if($err=$sqli->connect_errno){
		// 错误
		$sqli->close();
		return false;
	}
	return $sqli;
}
?>
