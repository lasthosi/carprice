<?php
function input_tryInt($name,&$value,&$input,$min=false,$max=false){
	$v = &$input[$name];
	if(!isset($v)){return false;}if(!is_numeric($v)){return false;}$value = intval($input[$name]);
	if($min!==false){if($value < $min){return false;}}if($max!==false){if($value > $max){return false;}}
	return true;
}
function input_tryStr($name,&$value,&$input){
	$v = &$input[$name];
	if(!isset($v)){return false;}
	if(get_magic_quotes_gpc()){$value=stripslashes($v);}else{$value = $v;}
	return true;
}
function &input_switch($name,&$input,&$switchArray,$defaultKey=false){
	$key = &$input[$name];
	$val = &$switchArray[$key];
	if(isset($val)){return $val;}
	if($defaultKey===false) return $defaultKey;
	$val = &$switchArray[$defaultKey];
	if(isset($val)){return $val;}
	$val=false;return $val;
}
?>
