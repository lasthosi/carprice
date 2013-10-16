<?php
function xilie_list($db,&$list,$pid){
	$stmt = $db->prepare('SELECT `id`, `sort`, `name`, `code` FROM `chexi` WHERE `pid`=?');
	$stmt->bind_param('i',$pid);
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id,$sort,$name,$code);
		while($stmt->fetch()){
			$list[]=array('id'=>$id,'sort'=>$sort,'name'=>$name,'code'=>$code);
		}
	}
	$stmt->close();
	return $r;
}

function xilie_add_list($db,&$list){
	$stmt = $db->prepare('INSERT INTO `chexi`(`pid`, `sort`, `name`, `code`) VALUES (?,?,?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('iiss',$data['pid'],$data['sort'],$data['name'],$data['code']);
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
function xilie_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `chexi` SET `sort`=?,`name`=?,`code`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('issi',$data['sort'],$data['name'],$data['code'],$data['id']);
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
function xilie_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `chexi` WHERE `id`=?');
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
function xilie_save($db,&$list){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	xilie_remove_list($db,$op_list['-1']);
	xilie_add_list($db,$op_list['1']);
	xilie_update_list($db,$op_list['0']);
	return true;
}
?>
