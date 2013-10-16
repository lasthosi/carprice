<?php
function vin_field2id($field){
	static $fs = array('year','pinpai','series','bodywork','sc','egnum','trnum','oass','batch','pofp');
	return array_search($field,$fs);
}
function vin_id2field($id){
	static $fs = array('year','pinpai','series','bodywork','sc','egnum','trnum','oass','batch','pofp');
	return $fs[$id];
}
function vin_list_options($db,&$list,$pinpai_id){
	$stmt = $db->prepare('SELECT `id`, `field`, `sort`, `code`, `value` FROM `vin_opts` WHERE `pinpai_id`=?');
	$stmt->bind_param('i',$pinpai_id);
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id, $field, $sort, $code, $value);
		while($stmt->fetch()){
			$list[]=array('id'=>$id, 'field'=>vin_id2field($field), 'sort'=>$sort, 'code'=>$code, 'value'=>$value);
		}
	}
	$stmt->close();
	return $r;
}
function vin_add_list($db,&$list){
	$stmt = $db->prepare('INSERT INTO `vin_opts`(`pinpai_id`, `field`, `sort`, `code`, `value`) VALUES (?,?,?,?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$field = vin_field2id($data['field']);
		if($field===false){
			$v['cid'] = $data['id'];
			$v['result'] = false;
			$v['data'] = false;
			continue;
		}
		$stmt->bind_param('iiiss',$data['pinpai_id'],$field,$data['sort'],$data['code'],$data['value']);
		if($stmt->execute()){
			$v['result'] = true;
			$v['id'] = $stmt->insert_id;
			$v['cid'] = $data['id'];
			$v['data'] = false;
		}else{
			$v['cid'] = $data['id'];
			$v['result'] = false;
			$v['data'] = false;
		}
	}
	$stmt->close();
}
function vin_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `vin_opts` SET `pinpai_id`=?,`field`=?,`sort`=?,`code`=?,`value`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$field=vin_field2id($data['field']);
		$stmt->bind_param('iiissi',$data['pinpai_id'],$field,$data['sort'],$data['code'],$data['value'],$data['id']);
		if($stmt->execute()){
			$v['result'] = true;
			$v['id'] = $data['id'];
			$v['data'] = false;
		}else{
			$v['result'] = false;
			$v['id'] = $data['id'];
			$v['data'] = false;
		}
	}
	$stmt->close();
}
function vin_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `vin_opts` WHERE `id`=?');
	foreach($list as &$v){
		$stmt->bind_param('i',$v['data']['id']);
		if($stmt->execute()){
			$v['result'] = true;
			$v['id'] = $v['data']['id'];
			$v['data'] = false;
		}else{
			$v['result'] = false;
			$v['id'] = $v['data']['id'];
			$v['data'] = false;
		}
	}
	$stmt->close();
}
function vin_save($db,&$list){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	vin_remove_list($db,$op_list['-1']);
	vin_add_list($db,$op_list['1']);
	vin_update_list($db,$op_list['0']);
	return true;
}
?>
