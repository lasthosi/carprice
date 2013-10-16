<?php
function peijian_dict_list($db,&$data){
	$data['classs']=array();
	$data['list']=array();
	$cs = &$data['classs'];
	$list = &$data['list'];
	$stmt = $db->prepare('SELECT `id`, `name`, `sort` FROM `peijian_class`');
	if($r = $stmt->execute()){
		$stmt->bind_result($id, $name, $sort);
		while($stmt->fetch()){
			$cs[]=array('id'=>$id, 'name'=>$name, 'sort'=>$sort);
		}
	}
	$stmt->close();
	$stmt = $db->prepare('SELECT `id`, `class`, `sort`, `name`, `desc` FROM `peijian_dict`');
	if($r = $stmt->execute()){
		$stmt->bind_result($id, $class, $sort, $name, $desc);
		while($stmt->fetch()){
			$list[]=array('id'=>$id, 'class'=>$class, 'sort'=>$sort, 'name'=>$name, 'desc'=>$desc);
		}
	}
	$stmt->close();
	return $r;
}
function peijian_class_exist($db,$class_id){
	$stmt = $db->prepare('SELECT `id` FROM `peijian_class` WHERE `id`=?');
	$stmt->bind_param('i',$class_id);
	if($r=($stmt->execute())){
		$r = $stmt->fetch();
	}
	$stmt->close();
	return $r;
}
function peijian_dict_add_list($db,&$list,$class_id){
	if(!peijian_class_exist($db,$class_id))return;
	// 开始事务
	$db->autocommit(false);
	// 验证 class_id
	$stmt = $db->prepare('INSERT INTO `peijian_dict`(`class`, `sort`, `name`, `desc`) VALUES (?,?,?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('iiss',$class_id,$data['sort'],$data['name'],$data['desc']);
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
	if(peijian_class_exist($db,$class_id)){
		$db->commit();
	}else{
		$db->rollback();
		foreach($list as &$v){
			$v['result'] = false;
		}
	}
	$db->autocommit(true);
}
function peijian_class_add($db,&$class){
	$stmt = $db->prepare('INSERT INTO `peijian_class`(`name`, `sort`) VALUES (?,?)');
	$data = &$class['data'];
	$stmt->bind_param('si',$data['name'],$data['sort']);
	if($stmt->execute()){
		$class['result'] = true;
		$class['id'] = $stmt->insert_id;
		$class['cid'] = $data['id'];
		$class['data'] = false;
	}else{
		$class['error']=$db->error;
		$class['cid'] = $data['id'];
		$class['result'] = false;
		$class['data'] = false;
	}
	$stmt->close();
}
function peijian_class_update($db,&$class){
	$stmt = $db->prepare('UPDATE `peijian_class` SET `name`=?,`sort`=? WHERE `id`=?');
	$data = &$class['data'];
	$stmt->bind_param('sii',$data['name'],$data['sort'],$data['id']);
	if($stmt->execute()){
		$class['result'] = true;
		$class['id'] = $data['id'];
		$class['data'] = false;
	}else{
		$class['result'] = false;
		$class['id'] = $data['id'];
		$class['data'] = false;
	}
	$stmt->close();
}
function peijian_dict_update_list($db,&$list){
	$stmt = $db->prepare('UPDATE `peijian_dict` SET `sort`=?,`name`=?,`desc`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$stmt->bind_param('issi',$data['sort'],$data['name'],$data['desc'],$data['id']);
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
function peijian_class_used($db,$class_id){
	$r = true;
	$stmt = $db->prepare('SELECT `id` FROM `peijian_dict` WHERE `class`=? LIMIT 0,1');
	$stmt->bind_param('i',$class_id);
	if($stmt->execute()){
		if(!$stmt->fetch())$r = false;
	}
	$stmt->close();
	return $r;
}
function peijian_class_remove($db,&$class){
	if(peijian_class_used($db,$class['data']['id']))return;
	$db->autocommit(false);
	$stmt = $db->prepare('DELETE FROM `peijian_class` WHERE `id`=?');
	$stmt->bind_param('i',$class['data']['id']);
	if($stmt->execute()){
		$class['result'] = true;
		$class['id'] = $class['data']['id'];
		$class['data'] = false;
	}else{
		$class['result'] = false;
		$class['id'] = $class['data']['id'];
		$class['data'] = false;
	}
	$stmt->close();
	if(peijian_class_used($db,$class['id'])){
		$class['result'] = false;
		$db->rollback();
	}else{
		$class['result'] = true;
		$db->commit();
	}
	$db->autocommit(true);
}
function peijian_dict_used($db,$id){
	$r = true;
	$stmt = $db->prepare('SELECT `id` FROM `peijian` WHERE `define_id`=? LIMIT 0,1');
	$stmt->bind_param('i',$id);
	if($stmt->execute()){
		if(!$stmt->fetch())$r=false;
	}
	$stmt->close();
	return $r;
}
function peijian_dict_remove_list($db,&$list){
	$stmt = $db->prepare('DELETE FROM `peijian_dict` WHERE `id`=? AND !EXISTS(SELECT `peijian`.`define_id` FROM `peijian` WHERE `peijian`.`define_id`=? LIMIT 0,1)');
	foreach($list as &$v){
		$stmt->bind_param('ii',$v['data']['id'],$v['data']['id']);
		if($stmt->execute() && $stmt->affected_rows>0){
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
function peijian_dict_save($db,&$list){
	foreach($list as &$class){
		$arr = &$class['list'];
		$op_list = array(
			'-1'=>array(),
			'0' =>array(),
			'1' =>array()
		);
		foreach($arr as &$v){
			$op_list[$v['state']][] = &$v;
		}
		peijian_dict_remove_list($db,$op_list['-1']);
		peijian_dict_update_list($db,$op_list['0']);
		$class_id = $class['data']['id'];
		if(isset($class['state'])){
			switch($class['state']){
				case -1:
					peijian_class_remove($db,$class);
					break;
				case 0:
					peijian_class_update($db,$class);
					break;
				case 1:
					peijian_class_add($db,$class);
					$class_id = $class['id'];
				break;
			}
		}else{
			$class['id']=$class['data']['id'];
			$class['data']=false;
		}
		peijian_dict_add_list($db,$op_list['1'],$class_id);
	}
	return true;
}
?>
