<?php
function peijian_code22int(&$code,&$a,&$b,&$c,&$d,&$e){
	$c = '1'.$code;
	$len = strlen($c);
	if($len<13){
		$a = 0;
		$b = peijian_code2int($c);
	}else{
		$ca = substr($c,0,$len-12);
		$cb = substr($c,-12);
		$a = peijian_code2int($ca);
		$b = peijian_code2int($cb);
	}
}
?>
