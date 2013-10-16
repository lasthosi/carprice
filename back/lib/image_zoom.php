<?php
///block:image_zoom
function image_zoom($srcPath,$ext,$zt,$z1,$z2){
	switch($ext){
		case 'jpg':
			$img = imagecreatefromjpeg($srcPath);
			break;
		case 'png':
			$img = imagecreatefrompng($srcPath);
			break;
	}
	if($img === false) return false;
	$srcx=$srcy=0;
	$srcw = imagesx($img);
	$srch = imagesy($img);
	$toh=$tow=1;
	$tox=$toy=0;
	switch($zt){
		case 'h':
			$toh = $z2;
			$tow = max(round($toh/$srch*$srcw),1);
			break;
		case 'w':
			$tow = $z1;
			$toh = max(round($tow/$srcw*$srch),1);
			break;
		case 'wh':
			if($srcw/$srch>$z1/$z2){
				$toh = $z2;
				$tow = $z1;
				$srcw_n=$tow*$srch/$toh;
				$srcx = round(($srcw-$srcw_n)/2);
				$srcw=$srcw_n;
				$srcy = 0;
			}else{
				$toh = $z2;
				$tow = $z1;
				$srch_n=$toh*$srcw/$tow;
				$srcy = round(($srch-$srch_n)/2);
				$srch=$srch_n;
				$srcx = 0;
			}
			break;
		case 'box':
			if($srcw/$srch>$z1/$z2){
				$tow = $z1;
				$toh = max(round($tow/$srcw*$srch),1);
			}else{
				$toh = $z2;
				$tow = max(round($toh/$srch*$srcw),1);
			}
			break;
		default:
			$tow = max(round($srcw*$z1),1);
			$toh = max(round($srch*$z2),1);
			break;
	}
	$toimg = imagecreatetruecolor($tow,$toh);
	if($toimg === false) {
		imagedestroy($img);
		return false;
	}
	if(imagecopyresampled($toimg,$img,$tox,$toy,$srcx,$srcy,$tow,$toh,$srcw,$srch) === false) {
		imagedestroy($img);
		imagedestroy($toimg);
		return false;
	}
	imagedestroy($img);
	return $toimg;
}
///end
?>