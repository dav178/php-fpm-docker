/*************/
/* CONSTANTS */
/*************/
const powerSysCap=2000;
const topPower=825;
const defaultILvl=725;
const minILvl=1;
const twoHandWeaponGroup=9;
const itemsSizes={
    "small":"Small Items",
    "medium":"Medium Items",
    "big":"Big Items"
};
const classItemMode={
    "usableby":"Usable by",
    "exclusive":"Exclusive to"
}
const itemTags={
    "legendary":"Legendary",
    "sacred":"Sacred",
    "ancestral":"Ancestral"
}
const equipmentGroupId=54;

var enc_params={"req":{},"bld":{}};

/********/
/* INIT */
/********/
function custom_init(){
    if(aconsts["debug"]){
        console.log(d4cdat);
    }

    switch(aconsts["pagedat"]["pkey"]){
        case 'affixes' : 
            aff_init();
        break;
        case 'enchanter' : 
            enc_init();
        break;
        case 'items' : 
            itm_init();
        break;
        case 'recipes' : 
            rcp_init();
        break;
        case 'trading' : 
            trd_init();
        break;
        case 'compare' : 
            cmp_init();
        break;
        case 'changelog' : 
            log_init();
        break;
    }
}

/**********/
/* PICKER */
/**********/
function d4c_picker(seldat,id,label,val){
    var html="";

    html+="<div id='"+id+"' class='cinfsel' label='"+label+"' value='"+((val==undefined)?"":val)+"'>";
    html+=  "<div class='current mshadow'></div><div class='opts'>";
    $.each(seldat,function(v,k){
        html+="<div class='opt mshadow sid"+k["id"]+" "+((val==k["id"])?"sel":"")+"' sid='"+k["id"]+"'>"+k["label"]+"</div>";
    });
    html+="</div></div>";

    return html;
}

function d4c_picker_init(picker,change){
    var val=$(picker).attr("value");
    var current=(val==="")?$(picker).attr("label"):$(picker).find(".sid"+val).text();
    if(val===""){$(picker).addClass("init");}
    $(picker).children(".current").click(function(){
        $(picker).children(".current").hide();
        $(this).parent().children(".opts").show();
    }).html(current);
    $(picker).find(".opt").click(function(){
        $(this).parent().find(".sel").removeClass("sel");
        var val=$(this).addClass("sel").attr("sid");
        $(this).parent().parent().attr("value",val);
        $(this).parent().parent().removeClass("init").children(".current").html($(this).text()).show();
        $(this).parent().hide();
        change();
    });
}

function d4c_picker_setto(picker,val){
    $(picker).attr("value",val);
    $(picker).removeClass("init").children(".current").html($(picker).find(".opt.sid"+val).text()).show();
    $(picker).find(".opts").hide();
}

function d4c_picker_get_val(picker){
    return $(picker).attr("value");
}

function d4c_picker_reset(picker){
    $(picker).attr("value","").find(".sel").removeClass("sel");
    $(picker).addClass("init").children(".current").html($(picker).attr("label"));
}

/*****************/
/* ITEM SELECTOR */
/*****************/
var item_change_function=null;
function item_selector(append,change,noBaseOption=false,limitToGrouping=false){
    var html="";

    var seldat=[];
    if(noBaseOption){
        seldat=[{"id":-1,"label":"None"}];
    }
    $.each(d4cdat["bases"]["seq"],function(k,v){
        var pass=true;
        if(limitToGrouping){
            if(!d4cdat["bases"]["bytype"][limitToGrouping][v["i"]]){
                pass=false;
            }
        }
        if(pass){
            if(v["e"]){
                seldat.push({"id":v["i"],"label":"<div class='icon'><img src='images/bases/"+v["i"].toLowerCase()+".png'/></div>"+v["n"]});
            }
        }
    });
    html+=d4c_picker(seldat,"d4cSelBase",appTranslate("Base"),aconsts["get"]["b"]);
    
    var seldat=[{"id":-1,"label":"None"}];
    $.each(d4cdat["classes"]["seq"],function(k,v){
        seldat.push({"id":v["i"],"label":"<div class='icon'><img src='images/classes/"+v["n"]+".png'/></div>"+v["n"]});
    });
    html+=d4c_picker(seldat,"d4cSelClass",appTranslate("Class"),aconsts["get"]["c"]);

    $(append).append(html);

    // Apply behaviors
    d4c_picker_init($("#d4cSelBase"),function(){item_base_change(false);});
    d4c_picker_init($("#d4cSelClass"),function(){item_class_change(false);});

    if(aconsts["get"]["b"]){
        d4c_picker_setto($("#d4cSelBase"),aconsts["get"]["b"]);
        item_base_change(true);
    }

    if(aconsts["get"]["c"]){
        d4c_picker_setto($("#d4cSelClass"),aconsts["get"]["c"]);
        item_class_change(true);
    }
    
    item_change_function=change;
}

function item_base_change(init){
    var val=d4c_picker_get_val($("#d4cSelBase"));

    if(val==-1){
        $("#d4cSelBase").addClass("init").attr("value","").find(".current").html($("#d4cSelBase").attr("label"));
    }

    if(!init){
        item_change();
    }
}

function item_class_change(init){
    var val=d4c_picker_get_val($("#d4cSelClass"));

    if(val==-1){
        $("#d4cSelClass").addClass("init").attr("value","").find(".current").html($("#d4cSelClass").attr("label"));
    }

    if(!init){
        item_change();
    }
}

function item_change(){
    var params={};
    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    params["b"]=(base)?base:null;
    params["c"]=(cls)?cls:null;
    update_url(params);
    if(item_change_function){
        item_change_function();
    }
}

/***************/
/* ILVL SETTER */
/***************/
var ilvl_change_function=null;
function ilvl_setter(append,change){
    var html="";

    html+="<div id='d4cILvler' class='app_input'>";
    html+=  "<input tabindex='0' type='text' id='d4cIlvlInput' maxlength='3' initerm='Power' class=''/>";
    html+=  "<div tabindex='0' class='clear' onclick='ilvl_setter_clear()'><div>X</div></div>";
    html+="</div>";

    $(append).append(html);
    $("#d4cILvler").append("<div class='label'>"+$("#d4cILvler").find("input").attr("initerm")+"</div>");

    $("#d4cIlvlInput").focus(function(){
        if($(this).parent().hasClass("init")){
            $(this).parent().removeClass("init");
            $(this).val("");
        }
        $(this).parent().find(".clear").show();
    }).blur(function(event){
        if(!$(event.relatedTarget).hasClass("clear")){
            if(!$(this).val().trim()){
                $(this).parent().addClass("init")
                $(this).val($(this).attr("initerm"));
            }
            $(this).parent().find(".clear").hide();
        }
    }).keypress(function(e){
        if(/^\d*$/.test(String.fromCharCode(e.keyCode))||e.keyCode==8||e.keyCode==46){}else{
            e.preventDefault();
        }
    }).keyup(function(){
        var val=$(this).val().trim();
        val=(val)?val:null;
        update_url({"ilvl":val});
        if(ilvl_change_function){
            ilvl_change_function();
        }
    });

    ilvl_setter_set(aconsts["get"]["ilvl"]);

    ilvl_change_function=change;
}

function ilvl_setter_clear(){
    ilvl_setter_set("");
    $("#d4cILvler").find(".clear").hide();
    update_url({"ilvl":null});
    if(ilvl_change_function){
        ilvl_change_function();
    }
}

function ilvl_setter_set(ilvl){
    if(ilvl){
        $("#d4cIlvlInput").parent().removeClass("init");
        $("#d4cIlvlInput").val(ilvl);
    }else{
        $("#d4cIlvlInput").parent().addClass("init");
        $("#d4cIlvlInput").val($("#d4cIlvlInput").attr("initerm"));
    }
}

function ilvl_setter_get(useDefault=true){
    var ilvl=null;
    if(useDefault){
        ilvl=defaultILvl;
    }   
    if(!$("#d4cIlvlInput").hasClass("init")){
        ilvl=parseInt($("#d4cIlvlInput").val());
        if(isNaN(ilvl)){
            ilvl=defaultILvl;
        }else{
            if(ilvl<minILvl){
                ilvl=minILvl;
            }
        }
    }
    return ilvl;
}

/******************/
/* URL MANAGEMENT */
/******************/
function update_url(params){
    var qparams=get_query();
    $.each(params,function(k,v){
        if(v===null||v==-1){
            if(qparams[k]!==undefined){
                delete qparams[k];
            }
        }else{
            qparams[k]=v;
        }
    });
    var query="";
    $.each(qparams,function(k,v){
        query+="&"+k+"="+encodeURIComponent(v);
    });
    if(query){query="?"+query.substring(1,query.length);}
    var url = document.location.href;
    if(url.indexOf('?')>-1){
        url=url.split("?");
        url=url[0];
    }
    url+=query;
    reset_btn_state();

    var title="D4 Craft";
    if(qparams){
        if(qparams["b"]){
            title+=" - "+d4cdat["bases"]["seq"][d4cdat["bases"]["ind"][qparams["b"]]]["n"];
        }
        if(qparams["c"]){
            title+=" - "+d4cdat["classes"]["seq"][qparams["c"]]["n"];
        }
    }

    window.history.pushState("","",url);
    document.title=title;
}

function get_query(){
    var url = document.location.href;
    if(url.indexOf('?')>-1){
        var qs = url.substring(url.indexOf('?') + 1).split('&');
        for(var i = 0, result = {}; i < qs.length; i++){
            qs[i] = qs[i].split('=');
            result[qs[i][0]] = decodeURIComponent(qs[i][1]);
        }
        return result;
    }else{
        return {};
    }
}

function reset_url(){
    var url = document.location.href;
    if(url.indexOf('?')>-1){
        url=url.split("?");
        url=url[0];
        window.location=url;
    }
}


function reset_btn_state(){
    var url = document.location.href;
    if(url.indexOf('?')>-1){
        $(".reset_btn").show();
    }else{
        $(".reset_btn").hide();
    }
}

/////////////////
// ITEM OUTPUT //
/////////////////
function d4cInitItemTooltips(node){
    $(node).find(".d4c_item_tooltip_trigger").hover(function(){
        var ilvl=($("#d4cILvler").length>0)?ilvl_setter_get():defaultILvl;
        var item=d4c_item_output($(this).attr("iid"),"big",false,ilvl);
        var offset=$(this).offset();
        $("<div>").attr("id","d4cItemTooltip").html("<div class='wrapper'>"+item+"</div>").appendTo($("body"));
        $("#d4cItemTooltip").css({
            "visibility":"hidden",
            "display":"block"
        });
        var dim={
            "height":$("#d4cItemTooltip").height()*0.75,
            "width":$("#d4cItemTooltip").width()
        };
        var pos={
            "top":offset.top-(($("#d4cItemTooltip").height()*0.75)/2),
            "left":offset.left+$(this).outerWidth()+20
        };
        if(pos["top"]<windowScroll["top"]+10){
            pos["top"]=windowScroll["top"]+10;
        }else{
            var diff=(pos["top"]+dim["height"])-(windowScroll["top"]+windowSize["height"]);
            if(diff>-10){
                pos["top"]-=(diff+10);
            }
        }
        if(pos["left"]+dim["width"]>windowSize["width"]){
            pos["right"]=windowSize["width"]-offset.left-10;
        }
        var css={
            "top":pos["top"],
            "display":"none",
            "visibility":"visible"
        };
        if(pos["right"]){
            css["right"]=pos["right"];
            $("#d4cItemTooltip").addClass("right");
        }else{
            css["left"]=pos["left"];
        }
        $("#d4cItemTooltip").css(css).fadeIn({"duration":250});
    },function(){
        $("#d4cItemTooltip").remove();
    });
}

function d4c_item_output(id,size="big",extended=false,ilvl=defaultILvl){
    var item=d4cdat["items"]["seq"][id];
    console.log(item);

    if(item["fpl"]){
        ilvl=item["fpl"];
    }

    var html="";

    var outputType="common";
    var outputName="";
    switch(item["t"]){
        case 'unique' : 
            outputType="unique"; 
            outputName=appTranslate("Unique")+" ";
        break;
        default : 
            if(item["a"]){
                if(item["a"].length>=3){
                    outputType="rare";
                    outputName=appTranslate("Rare")+" ";
                    break;
                }
                if(item["a"].length>0){
                    outputType="magic";
                    outputName=appTranslate("Magic")+" ";
                }
            }else{
                switch(item["q"]){
                    case 3 : 
                    case 4 :
                        outputType="rare";
                        outputName=appTranslate("Rare")+" ";
                    break;
                    case 1 : 
                        outputType="magic";
                        outputName=appTranslate("Magic")+" ";
                    break;
                }
            }
        break;
    }

    var itemBase=d4cdat["bases"]["seq"][item["b"]];

    html+='<div class="itemOutput item-output-'+outputType+' '+size+'">';

    var image=(item["img"])?' style="background-image: url(images/items/'+item["img"]+'.webp);"':"";
    html+=  '<div class="item-icon"'+image+'></div>';
    html+=  '<div class="item-output-header game-color-'+outputType+'">';
    html+=      '<div class="title game-color-unique">'+item["n"]+'</div>';
    html+=      '<div class="subtitle">'+outputName+d4cdat["bases"]["seq"][item["b"]]["n"]+'</div>';

    if(d4cdat["bases"]["bytype"][equipmentGroupId][itemBase["i"]]){
        html+=      '<div class="power">'+ilvl+' '+appTranslate("Item Power")+'</div>';
    }

    html+=  '</div>';
    html+=  '<div class="separator short"></div>';

    if(itemBase["w"]){
        var hpScalar=d4cdat["constants"]["interpolate"][ilvl];
        var hpBase=hpScalar*d4cdat["constants"]["healthBase"];
        var minBase=hpBase*itemBase["db"];
        var dmgOffset=minBase*itemBase["df"];
        var minDmg=minBase-dmgOffset;
        var maxDmg=minBase+dmgOffset;
        var dps=minBase*itemBase["ws"];

        html+="<div class='dps'>"+trd_format_pricing(Math.round(dps))+" "+appTranslate("Damage Per Second")+"</div>";
        html+="<div class='subgroup'><div class='subdps game-color-gray'>["+trd_format_pricing(Math.round(minDmg))+" - "+trd_format_pricing(Math.round(maxDmg))+"] "+appTranslate("Damage per Hit")+"</div>";
        html+="<div class='subdps game-color-gray'>"+(Math.round(itemBase["ws"]*100)/100).toFixed(2)+" "+appTranslate("Attacks per Second")+"</div></div>";
        html+='<div class="separator"></div>';
    }

    if(item["i"]){
        html+='<ul>';
        $.each(item["i"],function(i,k){
            html+='<li class="affix-list game-color-gray">'+d4c_getAffixForItem(k)+'</li>';
        });
        html+='</ul>';
        html+='<div class="separator"></div>';
    }
    if(item["a"]){
        html+='<ul>';
        var atend="";
        $.each(item["a"],function(i,k){
            if(d4cdat["affixes"]["seq"][k]["ty"]>0){
                atend+='<li class="star-icon game-color-unique">'+d4c_getAffixForItem(k)+'</li>';
            }else{
                html+='<li class="affix-list game-color-gray">'+d4c_getAffixForItem(k)+'</li>';
            }
        });
        html+=atend;
        html+='</ul>';
    }
    html+=  '';
    if(item["d"]){
        if(Array.isArray(item["d"])){
            html+='<ul>';
            $.each(item["d"],function(ind,aff){
                html+='<li class="affix-list game-color-gray">'+aff+'</li>';
            });
            html+='</ul>';
        }else{
            html+='<div class="description game-color-label">'+item["d"]+'</div>';
        }
    }
    if(item["fl"]){
        html+='<div class="flavor">'+item["fl"]+'</div>';
    }
    if(item["fl"]||item["a"]||item["d"]){
        html+='<div class="separator"></div>';
    }

    if(extended){
        html+="<div class='extendedInfo'>";
        if(item["dw"]){
            html+="<div><label>"+appTranslate("Drop weight")+"</label>"+item["dw"]+"</div>";
        }
        if(item["mnd"]>1){
            html+="<div><label>"+appTranslate("Minimum drop level")+"</label>"+item["mnd"]+"</div>";
        }
        if(item["mwt"]>1){
            html+="<div><label>"+appTranslate("Minimum world tier")+"</label>"+item["mwt"]+"</div>";
        }
        if(item["fpl"]){
            html+="<div><label>"+appTranslate("Fixed power level")+"</label>"+item["fpl"]+"</div>";
        }
        html+=  "<div><label>"+appTranslate("Key")+"</label>"+item["k"]+"</div>";
        if(extended!==true){
            html+=extended;
        }
        html+="</div>";
    }

    html+='</div>';

    return html;
}

function d4c_getAffixForItem(affixId){
    return d4cdat["affixes"]["seq"][affixId]["hn"];
}

/************/
/* SEARCHER */
/************/
var searcher_function=null;
function searcher_control(append,change){
    var html="";

    html+="<div id='d4cSearcher' class='app_input'>";
    html+=  "<input tabindex='0' type='text' id='d4cSearcherInput' initerm='Search' class=''/>";
    html+=  "<div tabindex='0' class='clear' onclick='searcher_clear()'><div>X</div></div>";
    html+="</div>";

    $(append).append(html);
    $("#d4cSearcher").append("<div class='label'>"+$("#d4cSearcher").find("input").attr("initerm")+"</div>");

    $("#d4cSearcherInput").focus(function(){
        if($(this).parent().hasClass("init")){
            $(this).parent().removeClass("init");
            $(this).val("");
        }
        $(this).parent().find(".clear").show();
    }).blur(function(event){
        if(!$(event.relatedTarget).hasClass("clear")){
            if(!$(this).val().trim()){
                $(this).parent().addClass("init")
                $(this).val($(this).attr("initerm"));
            }
            $(this).parent().find(".clear").hide();
        }
    }).keypress(function(e){
        
    }).keyup(function(){
        var val=$(this).val().trim();
        val=(val)?val:null;
        update_url({"search":val});
        if(searcher_function){
            searcher_function();
        }
    });

    searcher_set(aconsts["get"]["search"]);

    searcher_function=change;
}

function searcher_clear(){
    searcher_set("");
    $("#d4cSearcher").find(".clear").hide();
    update_url({"search":null});
    if(searcher_function){
        searcher_function();
    }
}

function searcher_set(ilvl){
    if(ilvl){
        $("#d4cSearcherInput").parent().removeClass("init");
        $("#d4cSearcherInput").val(ilvl);
    }else{
        $("#d4cSearcherInput").parent().addClass("init");
        $("#d4cSearcherInput").val($("#d4cSearcherInput").attr("initerm"));
    }
}

function searcher_get(){
    var val="";
    if(!$("#d4cSearcherInput").parent().hasClass("init")){
        val=$("#d4cSearcherInput").val().trim();
    }
    return val;
}

function searcher_get_functionnal_value(){
    var search=searcher_get();
    if(search){
        search=search.split(",");
        $.each(search,function(k,v){
            search[k]=v.trim().toLowerCase();
        });
        search_num=search.length;
    }
    return search;
}

/********************/
/* ITEM TAG TOGGLER */
/********************/
var itemtag_change_function=null;
function itemtag_toggler(append,change){
    var html="";
    html+="<div id='d4ItemTagger' class='mshadow'><div class='vertalign'>";
    $.each(itemTags,function(k,v){
        html+=  "<div class='tag "+k+"' value='"+k+"'>"+appTranslate(v)+"</div>";
    });
    html+="</div></div>";

    $(append).append(html);

    $("#d4ItemTagger").find(".tag").click(function(){
        if($(this).hasClass("toggled")){
            $(this).removeClass("toggled");
        }else{
            $(this).addClass("toggled");
            if($(this).hasClass("sacred")){
                $("#d4ItemTagger").find(".ancestral").removeClass("toggled");
            }else{
                if($(this).hasClass("ancestral")){
                    $("#d4ItemTagger").find(".sacred").removeClass("toggled");
                }
            }
        }
        var tags=itemtag_toggler_get();
        update_url({"tags":(tags)?JSON.stringify(tags):null});
        if(itemtag_change_function){
            itemtag_change_function();
        }
    });

    itemtag_toggler_set((aconsts["get"]["tags"])?jQuery.parseJSON(aconsts["get"]["tags"]):null);

    itemtag_change_function=change;
}

function itemtag_toggler_set(tags){
    if(tags){
        $.each(tags,function(k,v){
            $("#d4ItemTagger").find(".tag."+k).addClass("toggled");
        });
    }
}

function itemtag_toggler_get(){
    var tags=null;
    if($("#d4ItemTagger").find(".tag.toggled").length>0){
        tags={};
        $("#d4ItemTagger").find(".tag.toggled").each(function(){
            tags[$(this).attr("value")]=true;
        });
    }
    return tags;
}

/*********/
/* LOGIC */
/*********/
function d4c_ExpectedLevelForIPower(power){
    ilvl=Math.ceil(power/10)-7;
    if(ilvl<1){ilvl=1;}
    return ilvl;
}

function d4c_getScaleFactorFromILvl(ilvl){
    return d4cdat["constants"]["scaling"][ilvl]["hp"];
}

function d4c_getPowerScalingValue(power,value){
    return Math.ceil(d4cdat["constants"]["healthBase"]*d4c_getScaleFactorFromILvl(d4c_ExpectedLevelForIPower(power))*value);
}

/***********/
/* GENERAL */
/***********/
function d4c_gold_icon(){
    return "<div class='gold_icon'><img src='images/currency/gold.png'/></div>";
}

function d4c_item_icon(img,itemId){
    return "<div class='item_icon d4c_item_tooltip_trigger' iid='"+itemId+"'><img src='images/items/"+img+".webp'/></div>";
}