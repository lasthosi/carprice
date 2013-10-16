<?php
/*
	sumamry:载入所有国别
*/
function guobie_list($db,&$list){
	$stmt = $db->prepare('SELECT `id`, `sort`, `name` FROM `guobie`');
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id,$sort,$name);
		while($stmt->fetch()){
			$list[]=array('id'=>$id,'sort'=>$sort,'name'=>$name);
		}
	}
	$stmt->close();
	return $r;
}

function guobie_add_list($db,&$list){
	$stmt = $db->prepare('INSERT INTO `guobie`(`sort`, `name`) VALUES (?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('is',$data['sort'],$data['name']);
		if($stmt->execute() && $stmt->affected_rows===1){
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
function guobie_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `guobie` SET `sort`=?,`name`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('isi',$data['sort'],$data['name'],$data['id']);
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
function guobie_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `guobie` WHERE `id`=?');
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
function guobie_save($db,&$list){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	guobie_remove_list($db,$op_list['-1']);
	guobie_add_list($db,$op_list['1']);
	guobie_update_list($db,$op_list['0']);
	return true;
}
?>
