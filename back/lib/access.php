<?php
$access=1000;
// 检查权限，如果没有权限，要求用户重新登陆　{access:0} 1表示有权限
$response['access']=$access<PAGE_ACCESS?0:1;
?>
