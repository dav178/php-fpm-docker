var recipeLevels={"recipees":""};
function rcp_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='app_options'></div>");
    $(cntzone).append("<div id='rcp_setup'></div>");
    rcp_load();
    d4cInitItemTooltips($("#rcp_setup"));
    if(aconsts["get"]["rcp"]){
        var rcp=jQuery.parseJSON(aconsts["get"]["rcp"]);
        $.each(rcp,function(k,v){
            $("#"+k).addClass("toggled");
            $("#recipeeSelector").find(".group.parent_"+k).css({"display":"inline-block"});
        });
        rcp_setup();
    }else{
        rcp_select_group($("#app_options").find(".group:first").click());
    }
}

function rcp_load(){
    $.each(d4cdat["recipes"]["map"],function(k,v){
        rcp_output_recipe_group(k,v,0);
    });

    var hv="<div id='recipeeSelector'>";
    $.each(recipeLevels,function(k,v){
        if(k!="recipees"){
            hv+="<div class='level' id='level"+k+"'>";
            hv+=v;
            hv+="</div>";
        }
    });
    hv+="</div>";

    $("#app_options").html(hv);
    $("#rcp_setup").html(recipeLevels["recipees"]);

    $("#recipeeSelector").find(".group").click(function(){
        rcp_select_group($(this));
    });
}

function rcp_setup(){
    var key=$("#recipeeSelector").find(".group.toggled:last").attr("key");
    $("#rcp_setup").find(".recipe").hide();
    $("#rcp_setup").find(".recipe.parent_"+key).show();
}

function rcp_select_group(vGroup){
    if(!$(vGroup).hasClass("toggled")){
        $(vGroup).parent().find(".toggled").removeClass("toggled");
        $(vGroup).addClass("toggled");
        var vInc=parseInt($(vGroup).attr("inc"));
        var vKey=$(vGroup).attr("key");
        $("#recipeeSelector").find(".group.inc_"+(vInc+1)).hide().removeClass("toggled");
        if($("#app_options").find(".group.inc_"+(vInc+1)+".parent_"+vKey).length>0){
            $("#recipeeSelector").find(".group.inc_"+(vInc+1)+".parent_"+vKey).css({"display":"inline-block"});
            $("#recipeeSelector").find(".group.inc_"+(vInc+1)+".parent_"+vKey+":first").click();
        }else{
            rcp={};
            $("#recipeeSelector").find(".toggled").each(function(){
                rcp[$(this).attr("key")]=true;
            });
            update_url({"rcp":JSON.stringify(rcp)});
            rcp_setup();
        }
    }
}

function rcp_output_recipe_group(key,group,level,parent=null,icon=null){
    if(!recipeLevels[level]){
        recipeLevels[level]="";
    }

    var hv="";
    hv+="<div id='"+key+"' class='group parent_"+parent+" key_"+key+" inc_"+level+"' inc='"+level+"' parent='"+parent+"' key='"+key+"'>";
    if(group["icon"]||icon){
        hv+="<div class='ficon "+((group["icon"])?group["icon"]:icon)+"'></div>";    
    }
    hv+=    "<div class='name'>"+group["name"]+"</div>";
    $.each(group["childs"],function(k,v){
        if(v["childs"]){
            rcp_output_recipe_group(k,v,level+1,key,group["icon"]);
        }else{
            recipeLevels["recipees"]+=rcp_output_recipe(k,v,key);
        }
    });
    hv+="</div>";

    recipeLevels[level]+=hv;
}

function rcp_output_recipe(rind,rkey,parent){
    var hv="";

    var recipe=d4cdat["recipes"]["seq"][d4cdat["recipes"]["ind"][rkey]];

    if(recipe["g"]||recipe["ig"]){

        hv+="<div id='"+recipe["k"]+"' class='recipe parent_"+parent+"'>";
        hv+=    "<div class='name'>"+recipe["k"]+"</div>";
        // Gold scaling
        if(recipe["g"]){
            hv+="<div class='mat gold'>";
            if(recipe["gs"]){
                hv+="<div class='label'>"+appTranslate("Gold cost according to item power")+" <span class='base'>(Base : "+trd_format_pricing(recipe["g"])+")</span></div>";
                $.each(recipe["gs"],function(ind,bp){
                    hv+="<div class='bp'><span class='power'>>= "+bp["p"]+"</span> : "+trd_format_pricing(bp["v"])+d4c_gold_icon()+"</div>";
                });
            }else{
                hv+="<div class='label'>"+appTranslate("Gold cost")+"</div>";
                hv+="<div class='bp'>"+trd_format_pricing(recipe["g"])+d4c_gold_icon()+"</div>";
            }
            hv+="</div>";
        }
        // Ingredients
        if(recipe["ig"]){
            $.each(recipe["ig"],function(ind,ing){
                var item=d4cdat["items"]["seq"][ing["r"]];
                hv+="<div class='mat reagent'>";
                hv+="<div class='label'><span class='base'>"+appTranslate("Requires")+"</span> : "+item["n"]+"</div>";
                if(ing["bp"]){
                    if(ing["bp"].length>1){
                        $.each(ing["bp"],function(ind,bp){
                            hv+="<div class='bp'><span class='power'>>= "+bp["p"]+"</span> : "+trd_format_pricing(bp["v"])+d4c_item_icon(item["img"],ing["r"])+"</div>";
                        });
                    }else{
                        hv+="<div class='bp'>"+trd_format_pricing(ing["bp"][0]["v"])+d4c_item_icon(item["img"],ing["r"])+"</div>";
                    }
                }
                if(ing["c"]){
                    hv+="<div class='condition'><span>"+appTranslate("Condition to apply")+" :</span> "+rcp_filter_condition_name(ing["c"])+"</div>";
                }
                hv+="</div>";
            });
        }
        // Resulting item
        if(recipe["i"]){
            var item=d4cdat["items"]["seq"][recipe["i"]];
            hv+="<div class='mat item'>";
            hv+="<div class='label'><span class='base'>"+appTranslate("Produces")+"</span> : "+item["n"]+"</div>";
            hv+="<div class='bp'>1"+d4c_item_icon(item["img"],recipe["i"])+"</div>";
            hv+="</div>";
        }
        hv+="</div>";
    }
    
    return hv;
}

function rcp_filter_condition_name(condition){
    switch(condition){
        case 'Item_Is_Legendary' : condition=appTranslate("Item is legendary"); break;
        case 'Item_Is_Sacred_Or_Ancestral' : condition=appTranslate("Item is sacred or ancestral"); break;
        case 'Item_Is_Sacred' : condition=appTranslate("Item is sacred"); break;
        case 'Item_Is_Ancestral' : condition=appTranslate("Item is ancestral"); break;
    }
    return condition;
}

function rcp_run_recipe(rkey,input){
    if(d4cdat["recipes"]["ind"][rkey]){
        var power=(input["power"])?input["power"]:defaultILvl;
        input["tags"]=(!input["tags"])?{}:input["tags"];
        var recipe=d4cdat["recipes"]["seq"][d4cdat["recipes"]["ind"][rkey]];
        // Gold costs   
        var materials={};
        if(recipe["g"]){
            var gold=recipe["g"];
            if(recipe["gs"]){
                gold=rcp_get_breakpoint_value(recipe["gs"],power);
            }
            materials["gold"]=gold;
        }
        // Ingredients
        if(recipe["ig"]){
            $.each(recipe["ig"],function(ind,ingredient){
                var pass=true;
                if(ingredient["c"]){
                    pass=rcp_run_condition(ingredient["c"],input);
                }
                if(pass){
                    var quantity=rcp_get_breakpoint_value(ingredient["bp"],power);
                    materials[ingredient["r"]]=quantity;
                }
            });
        }
        return materials;
    }
    return null;
}

function rcp_run_condition(condition,input){
    switch(condition){
        case 'Item_Is_Legendary' : if(input["tags"]["legendary"]){return true;} break;
        case 'Item_Is_Sacred_Or_Ancestral' : if(input["tags"]["sacred"]||input["tags"]["ancestral"]){return true;} break;
        case 'Item_Is_Sacred' : if(input["tags"]["sacred"]){return true;} break;
        case 'Item_Is_Ancestral' : if(input["tags"]["ancestral"]){return true;} break;
        default:
            console.log("Bad condition : "+condition);
        break;
    }
    return false;
}

function rcp_get_breakpoint_value(breakpoints,power){
    var pnt=0;
    while(breakpoints[pnt]["p"]<power){
        pnt++;
        if(pnt>=breakpoints.length){
            break;
        }
    }
    if(pnt>=breakpoints.length){
        return breakpoints[breakpoints.length-1]["v"];
    }
    return breakpoints[pnt]["v"];
}