<?php
    $bpath="";
    require("lib/header.php");

    $includes="";

    if($debug){
        $includes.=appIncludeFile("ext/jquery-3.6.1.min.js");
        $packages=json_decode(file_get_contents("json/packages.json"),1);
        $js="";
        $css="";
        foreach($packages as $package){
            $js.=appIncludeFile("js/{$package}.js");
            $css.=appIncludeFile("css/{$package}.css");
        }
        $css.=appIncludeFile("css/media.css");
        $includes.=$js;
        $includes.=appIncludeFile("json/datamap.json");
        $includes.=$css;
    }else{
        $includes.=appIncludeFile("packages/package.js");
        $includes.=appIncludeFile("json/datamap.json");
        $includes.=appIncludeFile("packages/package.css");
    }

    $page=(isset($_GET["page"]))?$_GET["page"]:null;
    $appstruct=json_decode(file_get_contents("json/appstruct.json"),1);
    $index=appGenIndexes($appstruct);
    $pagedat=appGetPageDat($page,$index,$appstruct);

    if(isset($pagedat["landing"])&&$index["landing"]){
        $pagedat=appGetPageDat($index["landing"]["pkey"],$index,$appstruct);
    }

    $appConsts=array(
        "lng"=>0,
        "pagedat"=>$pagedat,
        "index"=>$index,
        "baseurl"=>$baseurl,
        "debug"=>$debug,
        "get"=>$_GET
    );
    
    $includes.='<link href="https://fonts.googleapis.com/css?family='.$google_font.'" rel="stylesheet">';

    $ho='<!DOCTYPE html>';
	$ho.='<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">';
	$ho.="<head>";
    $ho.=   "<title>{$site_title}</title>";
	$ho.=   "<meta name=\"title\" property=\"og:title\" content=\"{$site_title}\"/>";
	$ho.=   '<meta http-equiv="content-type" content="text/html; charset=utf-8"/>';
    $ho.=   '<meta name="viewport" content="width=device-width, initial-scale=1">';
    $ho.=   "<base href=\"{$baseurl}\"/>";
    $ho.=   "<meta name=\"keywords\" content=\"{$meta_keys}\"/>";
	$ho.=   "<meta name=\"description\" property=\"og:description\" content=\"{$meta_desc}\"/>";
	$ho.=   "<meta name=\"og:title\" content=\"{$site_title}\"/>";
	$ho.=   "<meta name=\"og:description\" content=\"{$meta_desc}\"/>";
    $ho.=   "<link rel=\"icon\" type=\"image/x-icon\" href=\"images/favicon.ico\">";
    $ho.=$includes;
    if(isset($pagedat["json"])){
        $ho.="<script language='javascript'>var pagedata=".file_get_contents("json/{$pagedat["json"]}.json").";</script>";
    }
    if($online){
        $ho.="<!-- Google tag (gtag.js) --><script async src=\"https://www.googletagmanager.com/gtag/js?id=G-3RJNN2PT9R\"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-3RJNN2PT9R');</script>";
    }
    $ho.="</head>";
    $ho.="<body>";

    $ho.="<div id='appConstants' class='hidden'>".json_encode($appConsts)."</div>";

    $ho.=appApplyTemplate($pagedat,$appstruct);

    $ho.=   '<script type="text/javascript">';
    $ho.=       '$(document).ready(function(){';
    $ho.=           'app_init();';
    $ho.=       '});';
	$ho.=   '</script>';
    $ho.="</body>";
    $ho.="</html>";

    echo($ho);
?>