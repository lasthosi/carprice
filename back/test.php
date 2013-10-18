<?php
define('ROOT_PATH',dirname(dirname(__file__)));
define('PAGE_ACCESS',1000);
require('lib/common.config.php');
require('lib/db.php');
require('lib/peijian_math.php');
$db = db();
$stmt = $db->prepare('INSERT INTO `test`(`num`) VALUES (?)');
$stmt->bind_param('i',$num);
$num = 9999;
$stmt->execute();
$stmt->close();
$db->close();
?>