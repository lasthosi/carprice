<?php
/*
	sumamry:载入指定国别的品牌
*/
function pinpai_list($db,&$list,$pid){
	$stmt = $db->prepare('SELECT `id`, `sort`, `name`, `code`, `series_code_pos`, `series_code_len`, `bodywork_code_pos`, `bodywork_code_len`, `sc_code_pos`, `sc_code_len`, `egnum_code_pos`, `egnum_code_len`, `trnum_code_pos`, `trnum_code_len` FROM `pinpai` WHERE `pid`=?');
	$stmt->bind_param('i',$pid);
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id, $sort, $name, $code, $series_code_pos, $series_code_len, $bodywork_code_pos, $bodywork_code_len, $sc_code_pos, $sc_code_len, $egnum_code_pos, $egnum_code_len, $trnum_code_pos, $trnum_code_len);
		while($stmt->fetch()){
			$list[]=array('id'=>$id, 'sort'=>$sort, 'name'=>$name, 'code'=>$code, 'series_code_pos'=>$series_code_pos, 'series_code_len'=>$series_code_len, 'bodywork_code_pos'=>$bodywork_code_pos, 'bodywork_code_len'=>$bodywork_code_len, 'sc_code_pos'=>$sc_code_pos, 'sc_code_len'=>$sc_code_len, 'egnum_code_pos'=>$egnum_code_pos, 'egnum_code_len'=>$egnum_code_len, 'trnum_code_pos'=>$trnum_code_pos, 'trnum_code_len'=>$trnum_code_len);
		}
	}
	$stmt->close();
	return $r;
}

function pinpai_add_list($db,&$list){
	$stmt = $db->prepare('INSERT INTO `pinpai`(`sort`, `name`, `code`, `pid`, `series_code_pos`, `series_code_len`, `bodywork_code_pos`, `bodywork_code_len`, `sc_code_pos`, `sc_code_len`, `egnum_code_pos`, `egnum_code_len`, `trnum_code_pos`, `trnum_code_len`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('issiiiiiiiiiii',$data['sort'], $data['name'], $data['code'], $data['pid'], $data['series_code_pos'], $data['series_code_len'], $data['bodywork_code_pos'], $data['bodywork_code_len'], $data['sc_code_pos'], $data['sc_code_len'], $data['egnum_code_pos'], $data['egnum_code_len'], $data['trnum_code_pos'], $data['trnum_code_len']);
		if($stmt->execute()){
			$v['result'] = true;
			$v['id'] = $stmt->insert_id;
			$v['cid'] = $data['id'];
			$v['data'] = false;
		}else{
			$v['error']=$db->error;
			$v['cid'] = $data['id'];
			$v['result'] = false;
			$v['data'] = false;
		}
	}
	$stmt->close();
}
function pinpai_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `pinpai` SET `sort`=?,`name`=?,`code`=?,`series_code_pos`=?,`series_code_len`=?,`bodywork_code_pos`=?,`bodywork_code_len`=?,`sc_code_pos`=?,`sc_code_len`=?,`egnum_code_pos`=?,`egnum_code_len`=?,`trnum_code_pos`=?,`trnum_code_len`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('issiiiiiiiiiii',$data['sort'],$data['name'],$data['code'],$data['series_code_pos'],$data['series_code_len'],$data['bodywork_code_pos'],$data['bodywork_code_len'],$data['sc_code_pos'],$data['sc_code_len'],$data['egnum_code_pos'],$data['egnum_code_len'],$data['trnum_code_pos'],$data['trnum_code_len'],$data['id']);
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
function pinpai_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `pinpai` WHERE `id`=?');
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
function pinpai_save($db,&$list){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	pinpai_remove_list($db,$op_list['-1']);
	pinpai_add_list($db,$op_list['1']);
	pinpai_update_list($db,$op_list['0']);
	return true;
}
?>
