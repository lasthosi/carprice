<?php
function search_help($db,$ids){
	
}

function search_help_get_classs($db,$define_ids){

}

function search_by_xilie($db,$xilie_id){
	$stmt = $db->prepare('SELECT `peijian_id` FROM `chexi_peijian` WHERE `chexi_id`=?');
	$stmt->bind_param('i',$xilie_id);
	if($r = $stmt->execute()){
		$stmt->bind_result($id);
		$ids = array();
		while($stmt->fetch()){
			$ids[]=$id;
		}
	}
	$stmt->close();
	if(!$r)return $r;
	
}
?>
