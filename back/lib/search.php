<?php
function search_help($db,$ids){
	
}
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
function search_by_xilie($db,$xilie_id){
	
}
?>
