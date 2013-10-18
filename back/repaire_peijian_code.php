<?php
define('ROOT_PATH',dirname(dirname(__file__)));
define('PAGE_ACCESS',1000);
require('lib/common.config.php');
require('lib/db.php');
require('lib/peijian_math.php');
$db = db();
$stmt = $db->prepare('SELECT `id`, `code` FROM `peijian` WHERE 1');
$list = array();
if($stmt->execute()){
	$stmt->bind_result($id,$code);
	while($stmt->fetch()){
		$list[] = array('id'=>$id,'code'=>$code);
	}
}
$stmt->close();
$stmt = $db->prepare('UPDATE `peijian_code` SET `code1`=CONV(?,16,10)+0,`code2`=CONV(?,16,10)+0 WHERE `id`=?');
$stmt->bind_param('ssi',$code1,$code2,$id);
foreach($list as &$item){
	$id = $item['id'];
	$code = md5($item['code']);
	$code1 = substr($code,0,16);
	$code2 = substr($code,-16,16);
	$stmt->execute();
}
$stmt->close();
$db->close();
?>