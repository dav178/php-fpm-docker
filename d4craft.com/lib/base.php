<?php
    function appIncludeFile($file){
        $ext=explode(".",$file);
        $file=appFileVersion($file);
        switch($ext[count($ext)-1]){
            case 'js' : case 'json' : return '<script type="text/javascript" src="'.$file.'"></script>'; break;
            case 'css' : return '<link rel="stylesheet" type="text/css" href="'.$file.'"/>'; break;
        }
    }

    function appFileVersion($file){
        return "$file?v=".filemtime($file);
    }

    function appFriendlyURL($name){
        return strtolower(str_replace(" ","-",$name));
    }

    function appGetParentPath($lind,$page,$appstruct,$mkey){
        $path=appFriendlyURL($page["title"][$lind]);
        if(isset($page["parent"])){
            $path=appGetParentPath($lind,$appstruct[$mkey][$page["parent"]],$appstruct,$mkey).$path;
        }
        return $path;
    }

    function appGenIndexes($appstruct){
        $index=array("ind"=>array(),"rev"=>array(),"landing"=>false);

        foreach($appstruct as $mkey=>$pages){
            $index["rev"][$mkey]=array();
            foreach($pages as $pkey=>$page){
                if(isset($page["landing"])){
                    $index["landing"]=array("mkey"=>$mkey,"pkey"=>$pkey);
                }
                $index["rev"][$mkey][$pkey]=array();
                $lind=0;
                foreach($page["title"] as $title){
                    $fullpath=appGetParentPath($lind,$page,$appstruct,$mkey);
                    $index["rev"][$mkey][$pkey][$lind]=$fullpath;
                    $index["ind"][$fullpath]=array("mkey"=>$mkey,"pkey"=>$pkey);
                    $lind++;
                }
            }
        }

        return $index;
    }

    function appGetPageDat($page,$index,$appstruct){
        if($page){
            if(isset($index["ind"][$page])){
                $dat=$appstruct[$index["ind"][$page]["mkey"]][$index["ind"][$page]["pkey"]];
                $dat["mkey"]=$index["ind"][$page]["mkey"];
                $dat["pkey"]=$index["ind"][$page]["pkey"];
                return $dat;
            }else{
                return array("page"=>"notfound","landing"=>true);
            }
        }else{
            return array("page"=>"homepage","landing"=>true);
        }
    }

    function appApplyTemplate($pagedat,$appstruct){
        $pout="";
        if(isset($pagedat["page"])){
            require("pages/{$pagedat["page"]}.php");
        }

        $template=(!isset($pagedat["template"]))?"main":$pagedat["template"];
        $html=file_get_contents("templates/$template.html");

        $html=str_replace(
            array("[CONTENT]"),
            array($pout),
            $html
        );

        $re = '/\[MENU:(.*)\]/m';
        preg_match_all($re, $html, $matches, PREG_SET_ORDER, 0);

        if($matches){
            foreach($matches as $match){
                if(isset($match[1])){
                    if(isset($appstruct[$match[1]])){
                        $replace=json_encode(array("mkey"=>$match[1],"struct"=>$appstruct[$match[1]]));
                    }else{
                        $replace="[MENU NOT FOUND:{$match[1]}]";
                    }
                    $html=str_replace("[MENU:{$match[1]}]",$replace,$html);
                }
            }
        }

        return $html;
    }

    function appGetTemplate($name){
        return file_get_contents("templates/$name.html");
    }
?>