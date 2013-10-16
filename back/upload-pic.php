<?php
set_time_limit(18);
define('ROOT_PATH',dirname(dirname(__file__)));
define('PAGE_ACCESS',1000);
define('PIC_ALLOW_EXT','|jpg|png|');
require('lib/common.config.php');
require('lib/db.php');
require('lib/image_zoom.php');
require('lib/input.php');
header('Content-Encoding:utf-8');
header('Cache-Control:no-cache');
$response = array('isback'=>false,'result'=>false,'has'=>false);
$tables=array(
	'pinpai'=>'pinpai_peijian_class_pic',
	'xilie'=>'chexi_peijian_class_pic'
);
// 用户权限验证
include('lib/access.php');
if($response['access']){
	if(input_tryStr('type',$type,$_GET) && input_tryInt('id',$id,$_GET) && input_tryInt('cid',$cid,$_GET)){
		$db = db();
		$stmt = $db->prepare('SELECT `id` FROM `'.$tables[$type].'` WHERE `id`=? AND `cid`=?');
		$stmt->bind_param('ii',$id,$cid);
		if($r = $stmt->execute()){
			$r = $stmt->fetch();
		}
		$stmt->close();
		$path = CLS_PIC_PATH.$type.'-'.$id.'-'.$cid.'.jpg';
		$response['url']=CLS_PIC_URLPATH.$type.'-'.$id.'-'.$cid.'.jpg';
		$response['has'] = $r;
		if($response['isback']=isset($_POST['ispostback'])){
			if(isset($_FILES['pic'])){
				$file = &$_FILES['pic'];
				if($file['error']!==UPLOAD_ERR_OK){
					$response['error'] = '上传失败';
				}else{
					$ext = strtolower(pathinfo($file['name'],PATHINFO_EXTENSION));
					if(strpos(PIC_ALLOW_EXT,'|'.$ext.'|')===false){
						$response['error']='图片格式不支持，请上传('.PIC_ALLOW_EXT.')图片';echo 'hrer';
					}else{
						if($r){
							$img = image_zoom($file['tmp_name'],$ext,CLS_PIC_ZTYPE,CLS_PIC_W,CLS_PIC_H);
							if(!$img) $r = false;else {
								$r=imagejpeg($img,$path,85);
								imagedestroy($img);
								unset($img);
							}
						}else{
							$db->autocommit(false);
							$stmt = $db->prepare('INSERT INTO `'.$tables[$type].'`(`id`, `cid`) VALUES (?,?)');
							$stmt->bind_param('ii',$id,$cid);
							if($r = ($stmt->execute() && $stmt->affected_rows>0)){
								$img = image_zoom($file['tmp_name'],$ext,CLS_PIC_ZTYPE,CLS_PIC_W,CLS_PIC_H);
								if(!$img) $r = false;else {
									$r=imagejpeg($img,$path,85);
									imagedestroy($img);
									unset($img);
								}
							}
							$stmt->close();
							if($r){
								$db->commit();
							}else{ $db->rollback();$response['result']='写入文件失败';}
							$db->autocommit(true);
						}
						if($r){
							$response['result']=true;
							$response['has']=true;
						}else{
							$response['error']='写入文件失败。';
						}
					}
				}
			}
		}
		$db->close();
	}else $response['error'] = '错误的请求';
}
if(isset($response['error']))$response['error']=htmlspecialchars($response['error'], ENT_COMPAT,'UTF-8');
?>
<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <title></title>
	<link href="style/upload.css" type="text/css" rel="stylesheet" />
</head>
<body>
    <div>
		<?php if($response['access']){?>
		<form id='form' action="upload-pic.php?type=<?php echo $_GET['type']?>&id=<?php echo $_GET['id']?>&cid=<?php echo $_GET['cid']?>" enctype="multipart/form-data" method="post">
			<input type="hidden" id="ispostback" name="ispostback" value="1" />
			<a id="upload" title="图片格式:jpg"><div>上传图片</div><input type="file" name="pic" id="pic"/ ></a><?php if($response['has']){echo "<a id='view' href='{$response['url']}' target='_blank'>查看图片</a>";}if(isset($response['error'])){echo "<span class='error'>{$response['error']}</span>";}?>
		</form>
		<?php }else{?>
		<a onclick="alert('未实现');">请先登录</a><a href="#" onclick="location.reload();">重试</a>
		<?php }?>
    </div>
</body>
</html>
<script type="text/javascript">
	function $(id){
		return document.getElementById(id);
	}
	var view = $('view');
	if(view)view.href+='?rd='+(new Date()).getTime();
	var requesting = false;
	function submit(){
		var waitElt=document.body;
		if(waitElt.hasAttribute('waiting'))return;
		waitElt.setAttribute('waiting',1);
		var form = $('form');
		form.submit();
	}
	function file_onchange(){
		var file = $('pic');
		var path = file.value;
		var i = path.lastIndexOf('.');
		if(i<1) return;
		var ext = path.substring(i+1).toLowerCase();
		switch(ext){
			case 'jpg':case 'png':
				submit();
				break;
			default:
				alert('不支持'+ext+'格式的图片，请转换为jpg或png格式。');
				break;
		}
	}
	$('pic').onchange = file_onchange;
</script>