<?php
/*
@db			数据库连接 mysqli
@xilie_id	系列ID
@list		{引用}，保存查询结果
@page_index	结果分页的页码，页码从0开始计算。提交false将返回全部结果。
@page_size	结果分页的每页结果数量。
*/
function search_xilie_ids($db,$xilie_id,&$list){
	$stmt = $db->prepare('SELECT `peijian_id`,`define_id` FROM `chexi_peijian` WHERE `chexi_id`=?');
	$stmt->bind_param('i',$xilie_id);
	if($r = $stmt->execute()){
		$stmt->bind_result($id,$define_id);
		$list = array();
		while($stmt->fetch()){
			$list[]=array('id'=>$id,'did'=>$define_id);
		}
	}
	$stmt->close();
	return $r;
}
function search_read_one($db,$id){
	$stmt = $db->prepare('');
	
	$stmt->close();
}
?>
