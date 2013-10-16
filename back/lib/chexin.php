<?php
function chexin_list($db,&$list,$pid){
	$stmt = $db->prepare('SELECT `id`, `sort`, `code`, `name` FROM `chexin` WHERE `pid`=?');
	$stmt->bind_param('i',$pid);
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id, $sort, $code, $name);
		while($stmt->fetch()){
			$list[]=array('id'=>$id, 'sort'=>$sort, 'code'=>$code, 'name'=>$name);
		}
	}
	$stmt->close();
	return $r;
}

function chexin_add_list($db,&$list){
	$stmt = $db->prepare('INSERT INTO `chexin`(`pid`, `sort`, `code`, `name`) VALUES (?,?,?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('iiss',$data['pid'],$data['sort'],$data['code'],$data['name']);
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
function chexin_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `chexin` SET `sort`=?,`code`=?,`name`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('issi',$data['sort'],$data['code'],$data['name'],$data['id']);
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
function chexin_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `chexin` WHERE `id`=?');
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
function chexin_save($db,&$list){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	chexin_remove_list($db,$op_list['-1']);
	chexin_add_list($db,$op_list['1']);
	chexin_update_list($db,$op_list['0']);
	return true;
}
?>
