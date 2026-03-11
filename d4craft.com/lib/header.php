<?php
    session_start();

    $debug=false;
    $online=true;

    $server=$_SERVER["SERVER_NAME"];
    if($server=="localhost"){
        $debug=true;
        $online=false;
    }

    require("{$bpath}lib/config.php");
    require("{$bpath}lib/base.php");

    if(!$online){
        $baseurl="http://localhost/d4craft.com/";
    }
?>