<?php
define('ROOT_PATH',dirname(dirname(__file__)));
define('PAGE_ACCESS',1000);
require('lib/common.config.php');
require('lib/db.php');
$response = array();
$db = db();
// 用户权限验证
include('lib/access.php');
if($response['access']){
	
	include('lib/peijian_dict.php');
	include('lib/input.php');
	$response['ok'] = false;
	if(input_tryStr('act',$act,$_GET) || input_tryStr('act',$act,$_POST)){
		switch($act){
			case 'list':
				$response['ok'] = peijian_dict_list($db,$response['result']);
				break;
			case 'save':
				if(input_tryStr('data',$data,$_POST)){
					$data = json_decode($data,true);
					$response['ok'] = peijian_dict_save($db,$data);
					$response['result'] = &$data;
				}
				break;
		}
	}
}
$db->close();
ob_start();
header('Content-Type:text/json');
header('Content-Encoding:'.Encoding);
header('Cache-Control:no-cache');
echo json_encode($response);
ob_end_flush();
?>