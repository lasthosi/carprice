<?php
function peijian_list_by_pinpai($db,&$list,$pinpai_id){
	$stmt = $db->prepare('SELECT `id`, `num`, `code`, `price_mtime`, `define_id`, `price_4s`, `price_of`, `price_df`, `price_chop`, `price_repair` FROM `peijian` WHERE `pinpai_id`=?');
	$stmt->bind_param('i',$pinpai_id);
	if($r = $stmt->execute()){
		$list = array();
		$stmt->bind_result($id, $num, $code, $price_mtime, $define_id, $price_4s, $price_of, $price_df, $price_chop, $price_repair);
		while($stmt->fetch()){
			$list[]=array('id'=>$id, 'num'=>$num, 'code'=>$code, 'price_mtime'=>$price_mtime, 'define_id'=>$define_id, 'price_4s'=>$price_4s, 'price_of'=>$price_of, 'price_df'=>$price_df, 'price_chop'=>$price_chop, 'price_repair'=>$price_repair);
		}
	}
	$stmt->close();
	return $r;
}

function peijian_add_list($db,&$list,$pinpai_id){
	if(!count($list))return;
	$stmt = $db->prepare('INSERT INTO `peijian`(`pinpai_id`, `num`, `code`, `price_mtime`, `define_id`, `price_4s`, `price_of`, `price_df`, `price_chop`, `price_repair`) VALUES (?,?,?,?,?,?,?,?,?,?)');
	foreach($list as &$v){
		$data = &$v['data'];
		$data['price_mtime']=time();
		$stmt->bind_param('issiiiiiii',$pinpai_id, $data['num'], $data['code'], $data['price_mtime'], $data['define_id'], $data['price_4s'], $data['price_of'], $data['price_df'], $data['price_chop'], $data['price_repair']);
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
function peijian_update_list($db,&$list){
	if(!count($list))return;
	$stmt = $db->prepare('UPDATE `peijian` SET `code`=?,`num`=?,`price_mtime`=?,`price_4s`=?,`price_of`=?,`price_df`=?,`price_chop`=?,`price_repair`=? WHERE `id`=?');
	foreach($list as &$v){
		$data = &$v['data'];
		$data['price_mtime']=time();
		$stmt->bind_param('ssiiiiiii',$data['code'],$data['num'],$data['price_mtime'],$data['price_4s'],$data['price_of'],$data['price_df'],$data['price_chop'],$data['price_repair'],$data['id']);
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
function peijian_is_used($db,$id){
	$stmt = $db->prepare('SELECT `chexi_id` FROM `chexi_peijian` WHERE `peijian_id`=? LIMIT 0,1');
	$stmt->bind_param('i',$id);
	$r = true;
	if($stmt->execute()){
		if(!$stmt->fetch())$r = false;
	}
	$stmt->close();
	return $r;
}
function peijian_remove_list($db,&$list){
	if(!count($list))return;
	$db->autocommit(false);
	$stmt = $db->prepare('DELETE FROM `peijian` WHERE `id`=?');
	foreach($list as &$v){
		$id = $v['data']['id'];
		if(peijian_is_used($db,$id)){
			$v['result'] = false;
			$v['id'] = $v['data']['id'];
			$v['data'] = false;
			continue;
		}
		$stmt->bind_param('i',$id);
		if($stmt->execute()){
			$v['result'] = true;
			$v['id'] = $v['data']['id'];
			$v['data'] = false;
		}else{
			$v['result'] = false;
			$v['id'] = $v['data']['id'];
			$v['data'] = false;
		}
		if(peijian_is_used($db,$id)){
			$v['result'] = false;
			$db->rollback();
		}else{
			$db->commit();
		}
	}
	$stmt->close();
	$db->autocommit(true);
}
function peijian_save($db,&$list,$pinpai_id){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	peijian_remove_list($db,$op_list['-1']);
	peijian_add_list($db,$op_list['1'],$pinpai_id);
	peijian_update_list($db,$op_list['0']);
	return true;
}
function peijian_list_by_xilie($db,&$list,$xilie_id){
	$list = array();
	$stmt = $db->prepare('SELECT `peijian_id` FROM `chexi_peijian` WHERE `chexi_id`=?');
	$stmt->bind_param('i',$xilie_id);
	if($r = $stmt->execute()){
		$stmt->bind_result($peijian_id);
		while($stmt->fetch()){
			$list[]=$peijian_id;
		}
	}
	$stmt->close();
	return $r;
}
function peijian_remove_list_from_xilie($db,&$list,$xilie_id){
	if(empty($list))return true;
	$stmt = $db->prepare('DELETE FROM `chexi_peijian` WHERE `chexi_id`=? AND `peijian_id`=?');
	foreach($list as &$v){
		$stmt->bind_param('ii',$xilie_id,$v['data']['id']);
		$v['id'] = $v['data']['id'];
		if($stmt->execute()){
			$v['result'] = true;
		}else{
			$v['result'] = false;
		}
		$v['data'] = false;
	}
	$stmt->close();
	return true;
}
function peijian_add_list_to_xilie($db,&$list,$xilie_id){
	if(empty($list))return true;
	$stmt = $db->prepare('INSERT INTO `chexi_peijian`(`chexi_id`, `peijian_id`) VALUES (?,?)');
	foreach($list as &$v){
		$stmt->bind_param('ii',$xilie_id,$v['data']['id']);
		$v['cid'] = $v['id'] = $v['data']['id'];
		if($stmt->execute()){
			$v['result'] = true;
		}else{
			$v['result'] = false;
		}
		$v['data'] = false;
	}
	$stmt->close();
	return true;
}
function xilie_save($db,&$list,$xilie_id){
	$op_list = array(
		'-1'=>array(),
		'0' =>array(),
		'1' =>array()
	);
	foreach($list as &$v){
		$op_list[$v['state']][] = &$v;
	}
	peijian_remove_list_from_xilie($db,$op_list['-1'],$xilie_id);
	peijian_add_list_to_xilie($db,$op_list['1'],$xilie_id);
	peijian_update_list($db,$op_list['0']);
	return true;
}
?>
