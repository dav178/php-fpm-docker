const tradeItemBaseDummies={
    "DruidOffhand":183
};

var trd_params={"req":{}};

function trd_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='app_options'></div>");
    item_selector($(cntzone).find("#app_options"),function(){trd_setup();},false,54);
    isize_selector($(cntzone).find("#app_options"));
    ilvl_setter($(cntzone).find("#app_options"),function(){trd_setup();});
    searcher_control($(cntzone).find("#app_options"),function(){trd_setup();});
    $(cntzone).find("#app_options").append("<div id='appTradeAffixButton' class='appbtn affix_btn mshadow' onClick='trd_addAffix()'>"+appTranslate("Add Affix")+"</div>");
    $(cntzone).find("#app_options").append("<div id='appTradeResetButton' class='appbtn reset_btn mshadow' onClick='reset_url()'>"+appTranslate("Reset")+"</div>");
    $(cntzone).append("<div id='trdaff_setup'></div>");
    $(cntzone).append("<div id='trd_reqaffs'></div>");
    $(cntzone).append("<div id='trd_setup'></div>");
    trd_params["req"]=trd_get_params("r");
    trd_load();
    trd_reqaffs();
    trd_setup();
    isize_change();
    reset_btn_state();
}

function trd_get_params(what){
    if(aconsts["get"][what]){
        return jQuery.parseJSON(aconsts["get"][what]);
    }else{
        return {};
    }
}

var baseIndex=null;
function trd_load(){
    baseIndex={};
    $.each(d4cdat["bases"]["seq"],function(index,base){
        baseIndex[base["n"]]=index;
    });
}

function trd_setup(){
    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    var isize=d4c_picker_get_val($("#d4cSelISize"));
    var ilvl=ilvl_setter_get(false);
    var search=searcher_get_functionnal_value();

    var baseKey=d4cdat["bases"]["ind"][base];

    if(base){
        $("#appTradeAffixButton").show();
        var vh="";

        var numitems=0;
        $.each(pagedata,function(index,item){
            if(baseIndex[item["base"]]==baseKey){
                var pass=true;

                // Check power
                if(ilvl){
                    if(item["power"]<ilvl){
                        pass=false;
                    }
                }

                // Match affixes

                // Find item base

                if(pass){
                    vh+="<div class='item rarity_rare base_"+base+"' uid='"+tradeItemBaseDummies[base]+"'>";
                    vh+=d4c_trade_output({
                        "id":tradeItemBaseDummies[base],
                        "name":item["name"],
                        "level":item["level"],
                        "rarity":"rare",
                        "inherent":item["inherent"],
                        "affixes":item["affixes"],
                        "extended":{
                            "power":item["power"],
                            "upgraded":item["upgraded"],
                            "ign":item["ign"],
                            "price":item["price"]
                        }
                    },isize);
                    vh+="</div>";

                    numitems++;
                }
            }
        });

        if(numitems==0){

        }else{

        }

        vh="<div id='trd_result' class='"+((numitems==0)?"noitems":"")+"'><span class='number'>"+numitems+"</span> "+appTranslate("Items")+"</div>"+vh;

        $("#trd_setup").html(vh);
    }else{
        $("#appTradeAffixButton").hide();
        if(!$("#d4cSelBase").find(".opts").is(":visible")){
            $("#d4cSelBase").find(".current").click();
        }
        $("#trd_setup").html("<div style='text-align:center'>"+appMessage(appTranslate("Please choose an item base to search the database."))+"</div>");
    }
}

function d4c_trade_output(params,isize){
    var item=d4cdat["items"]["seq"][params["id"]];

    var html="";

    var outputType="common";
    var outputName="";

    switch(params["rarity"]){
        case 'rare' : 
            outputType="rare";
            outputName=appTranslate("Rare")+" ";
        break;
    }

    html+='<div class="itemOutput item-output-'+outputType+' '+isize+'">';
    var image=(item["img"])?' style="background-image: url(images/items/'+item["img"]+'.webp);"':"";
    html+=  '<div class="item-icon"'+image+'></div>';
    html+=  '<div class="item-output-header game-color-'+outputType+'">';
    html+=      '<div class="title game-color-unique">'+params["name"]+'</div>';
    html+=      '<div class="subtitle">'+outputName+d4cdat["bases"]["seq"][item["b"]]["n"]+'</div>';
    html+=      '<div class="power">'+params["extended"]["power"]+((params["extended"]["upgraded"])?"+"+params["extended"]["upgraded"]:"")+' '+appTranslate("Item Power")+'</div>';
    html+=  '</div>';
    html+=  '<div class="separator short"></div>';
    if(params["inherent"]){
        html+='<ul>';
        $.each(params["inherent"],function(i,k){
            html+='<li class="affix-list game-color-gray">'+k+'</li>';
        });
        html+='</ul>';
        html+='<div class="separator"></div>';
    }
    if(params["affixes"]){
        html+='<ul>';
        $.each(params["affixes"],function(i,k){
            html+='<li class="affix-list game-color-gray">'+k+'</li>';
        });
        html+='</ul>';
    }
    html+='<div class="required_level">'+appTranslate("Requires Level")+" "+params["level"]+'</div>';
    html+='<div class="separator"></div>';

    if(params["extended"]){
        html+="<div class='extendedInfo'>";
        if(params["extended"]["ign"]){
            html+="<div><label>"+appTranslate("IGN")+"</label>"+params["extended"]["ign"]+"</div>";
        }
        if(params["extended"]["price"]){
            html+="<div><label>"+appTranslate("Asking price")+"</label>"+trd_format_pricing(params["extended"]["price"])+"<div class='gold_icon'><img src='images/currency/gold.png'/></div></div>";
        }
        html+="</div>";
    }

    html+='</div>';

    return html;
}

function trd_format_pricing(pricing){
    return pricing.toLocaleString('en-US');
}

function trd_closeAffixAdder(){
    $("#appTradeAffixButton").removeClass("toggled");
    $("#trdaff_setup").html("");
}

function trd_addAffix(){
    if($("#appTradeAffixButton").hasClass("toggled")){
        trd_closeAffixAdder();
    }else{
        $("#appTradeAffixButton").addClass("toggled");

        var base=d4c_picker_get_val($("#d4cSelBase"));

        var arrmods=[];
        $.each(d4cdat["affixes"]["bybase"][base],function(k,v){
            var mod=d4cdat["affixes"]["seq"][v];

            var pass=true;

            var classAffix=false;
            if(mod["c"]){
                classAffix=true;
            }
            if(mod["h"]){
                pass=false;
            }

            if(trd_params["req"][mod["id"]]!==undefined){
                pass=false;
            }
            
            var amod={
                "id":mod["id"],
                "key":mod["k"],
                "name":mod["hn"],
                "fluff":mod["fn"],
                "pure":mod["pn"],
                "purest":mod["pn"].replace(/[^a-z]/gi, ''),
                "tiers":mod["t"],
                "type":mod["ty"],
                "bases":mod["b"],
                "flags":mod["fl"],
                "progressive":mod["pv"],
                "minPower":mod["mnp"],
                "maxPower":mod["mxp"],
            };

            if(pass){
                if(!mod["e"]||((mod["fl"]==12||mod["fl"]==36)&&!mod["un"])){

                }else{
                    if(mod["ih"]&&mod["fl"]>=4){

                    }else{
                        switch(mod["ty"]){
                            case 0 :
                                if(mod["fl"]==4){
                                    
                                }else{
                                    if(classAffix){
                                        arrmods.push(amod);
                                    }else{
                                        arrmods.push(amod);
                                    }
                                }
                            break;
                        }
                    }
                }
            }
        });
        arrmods.sort(enc_sort_by_name);

        var vh="";

        vh+="<div id='appEnchanterInstructions'>";
        vh+="<div><div class='pick icon'>+</div>"+appTranslate("Click to add an affix as a <span class='color-diablo-red'>requirement</span> to the trade search.")+"</div>";
        vh+="</div>";

        vh+="<div class='mtype core'><div class='affixes'>";
        var mtype="core";

        $.each(arrmods,function(k,v){
            var affixClasses="";

            var hasClasses=false;
            var classIcons="";
            if(d4cdat["affixes"]["seq"][v["id"]]["c"]){
                classIcons+="<div class='classes'>";
                $.each(d4cdat["affixes"]["seq"][v["id"]]["c"],function(key,bool){
                    classIcons+="<div class='icon'><img src='images/classes/"+d4cdat["classes"]["seq"][key]["n"]+".png' class='apptt' apptt='"+d4cdat["classes"]["seq"][key]["n"]+" Affix'/></div>";
                    affixClasses+= " cl"+key;
                });
                classIcons+="</div>";
                hasClasses=true;
            }

            var affixName=trd_parse_name(v["name"]);

            vh+="<div class='affix "+affixClasses+" "+((hasClasses)?"classAffix":"")+" ty"+v["type"]+" aid"+v["id"]+" mtype_"+mtype+"' aid='"+v["id"]+"' key='"+v["key"]+"' mtype='"+mtype+"'><div class='wrapper mshadow noselect'>";
            vh+=  "<div class='name'><div>"+"<div class='tyname'>"+d4cdat["types"]["seq"][d4cdat["types"]["ind"][v["type"]]]["n"]+"</div><div class='fluff'>"+v["fluff"]+"</div>"+affixName+classIcons+"</div></div>";
            vh+=  "<div class='actions'>";
            vh+=    "<div class='pick'>+</div>";
            vh+=  "</div>";
            vh+="</div></div>";
        });

        vh+="</div></div>";

        $("#trdaff_setup").html(vh);

        $("#trdaff_setup").find(".affix").click(function(){
            trd_addAffixCommit($(this));
        });

        enc_order_by_columns($("#trdaff_setup"));
    }
}

const trdValueRegEx=/(\+?)#(%?)/gm;
const trdValueReplace="<div class='value game-color-random'>$1<span class='hash'>#</span>$2</div>";
function trd_parse_name(name){
    return name.replace(trdValueRegEx,trdValueReplace);
}

function trd_addAffixCommit(vNode){
    trd_closeAffixAdder();
    var aid=$(vNode).attr("aid");
    trd_params["req"][aid]=0;
    trd_set_params();
    trd_reqaffs();
    trd_setup();
}

function trd_set_params(){
    var params={"r":null};
    if(trd_params["req"]){
        params["r"]={};
        $.each(trd_params["req"],function(k,v){
            params["r"][k]=v;
        });
        params["r"]=JSON.stringify(params["r"]);
    }
    update_url(params);
}

function trd_reqaffs(){
    var vh="";
    var mtype="core";
    $.each(trd_params["req"],function(k,v){
        var mod=d4cdat["affixes"]["seq"][k];

        var affixClasses="";

        var hasClasses=false;
        var classIcons="";
        if(mod["c"]){
            classIcons+="<div class='classes'>";
            $.each(mod["c"],function(key,bool){
                classIcons+="<div class='icon'><img src='images/classes/"+d4cdat["classes"]["seq"][key]["n"]+".png' class='apptt' apptt='"+d4cdat["classes"]["seq"][key]["n"]+" Affix'/></div>";
                affixClasses+= " cl"+key;
            });
            classIcons+="</div>";
            hasClasses=true;
        }

        var affixName=trd_parse_name(mod["hn"]);

        vh+="<div class='affix "+affixClasses+" "+((hasClasses)?"classAffix":"")+" ty"+v["type"]+" aid"+mod["id"]+" mtype_"+mtype+"' aid='"+mod["id"]+"' key='"+mod["k"]+"' mtype='"+mtype+"'><div class='wrapper mshadow noselect'>";
        vh+=  "<div class='name'><div>"+"<div class='tyname'>"+d4cdat["types"]["seq"][d4cdat["types"]["ind"][mod["ty"]]]["n"]+"</div>"+affixName+classIcons+"</div></div>";
        vh+=  "<div class='actions'>";
        vh+=    "<div class='value_range'><span class='game-color-gray'>>=</span> 5%</div>";
        vh+=    "<div class='pick apptt' apptt='"+appTranslate("Remove requirement")+"'>-</div>";
        vh+=  "</div>";
        vh+="</div></div>";
    });
    if(vh){
        var prepend="";
        prepend+="<div class='mtype requirements' mtype='requirements'>";
        prepend+="<div class='title'>"+appTranslate("Required")+"<div class='suffix'>"+appTranslate("Affixes")+"</div><div class='desc'>"+appTranslate("The following affixes are set as requirements for the trade search.")+"</div></div>";
        prepend+="</div>";
        vh=prepend+"<div class='mtype core'><div class='affixes'>"+vh+"</div>";
    }
    $("#trd_reqaffs").html(vh);

    $("#trd_reqaffs").find(".mtype.core").find(".pick").click(function(){trd_rem_req($(this));});

    appInitTooltips($("#trd_reqaffs"));
}

function trd_rem_req(vNode){
    var aid=$(vNode).parent().parent().parent().attr("aid");
    delete trd_params["req"][aid];
    $("#appTooltip").remove();
    trd_set_params();
    trd_reqaffs();
    trd_setup();
}