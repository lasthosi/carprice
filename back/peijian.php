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
	
	include('lib/peijian.php');
	include('lib/input.php');
	$response['ok'] = false;
	if(input_tryStr('act',$act,$_GET) || input_tryStr('act',$act,$_POST)){
		switch($act){
			case 'list':
				$response['ok'] = input_tryInt('pinpai_id',$pinpai_id,$_GET) && peijian_list_by_pinpai($db,$response['result'],$pinpai_id);
				break;
			case 'save':
				if(input_tryStr('data',$data,$_POST) && input_tryInt('pinpai_id',$pinpai_id,$_POST)){
					$data = json_decode($data,true);
					$response['ok'] = peijian_save($db,$data,$pinpai_id);
					$response['result'] = &$data;
				}
				break;
			case 'list-xilie':
				$response['ok'] = input_tryInt('xilie_id',$xilie_id,$_GET) && peijian_list_by_xilie($db,$response['result'],$xilie_id);
				break;
			case 'save-xilie':
				if(input_tryStr('data',$data,$_POST) && input_tryInt('xilie_id',$xilie_id,$_POST)){
					$data = json_decode($data,true);
					$response['ok'] = xilie_save($db,$data,$xilie_id);
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