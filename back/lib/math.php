<?php
function math_peijian_code2int(&$str){
	$p = strlen($str);
	$n = 0;
	for($i=0;$i<$p;$i++){
		$c = ord($str[$i]);
		if($c===45){
			$si = 10;
		}else if($c<58){
			$si = $c - 48;
		}else if($c<91){
			$si = $c - 54;
		}else if($c<123){
			$si = $c - 86;
		}
		$n += $si*pow(37,$p-$i-1);
	}
	return $n;
}
?>
