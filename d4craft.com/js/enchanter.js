const enchantMultiplierAfterScaling=22.5;

function enc_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='app_options'></div>");
    item_selector($(cntzone).find("#app_options"),function(){enc_setup();},false,54);
    ilvl_setter($(cntzone).find("#app_options"),function(){enc_setup();});
    sellvalue_setter($(cntzone).find("#app_options"),function(){enc_setup();});
    itemtag_toggler($(cntzone).find("#app_options"),function(){enc_setup();});
    searcher_control($(cntzone).find("#app_options"),function(){enc_setup();});
    $(cntzone).find("#app_options").append("<div id='appEnchantResetButton' class='appbtn reset_btn mshadow' onClick='reset_url()'>"+appTranslate("Reset")+"</div>");
    $(cntzone).append("<div id='enc_result'></div>");
    $(cntzone).append("<div id='enc_setup'></div>");
    enc_params["req"]=enc_get_params("r");
    enc_params["bld"]=enc_get_params("a");
    enc_setup();
    reset_btn_state();
    $(window).resize(function(){
        enc_resize();
    });
}

function enc_resize(){
    enc_order_by_columns($("#enc_setup"));
}

function enc_get_params(what){
    if(aconsts["get"][what]){
        return jQuery.parseJSON(aconsts["get"][what]);
    }else{
        return {};
    }
}

var enc_mpool=null;
function enc_setup(){
    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    var ilvl=ilvl_setter_get();
    var sell=sellvalue_setter_get();
    var search=searcher_get_functionnal_value();

    if(base){
        var vh="";

        if(cls!==""){
            cls=parseInt(cls);
        }else{
            cls=null;
        }

        // Create an array that can be sorted by name
        var arrmods=[];
        var arrmods_disabled=[];
        var arrmods_class=[];
        var arrmods_aspect=[];
        var arrmods_fixed=[];
        var arrmods_inherent=[];

        var numberOfValidMods=0;
        $.each(d4cdat["affixes"]["bybase"][base],function(k,v){
            var skip=false;
            var mod=d4cdat["affixes"]["seq"][v];

            if(search){
                var search_name=mod["pn"].toLowerCase();
                for(var i=0;i<search.length;i++){
                    if(search_name.indexOf(search[i])>-1){}else{
                        skip=true;
                        break;
                    }
                }
            }

            if(!skip){
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
                // Filter classes
                var pass=true;
                var classAffix=false;
                if(cls!==null){
                    if(mod["c"]!==false&&mod["c"][cls]==undefined){
                        pass=false;
                    }
                    if(mod["c"][cls]){
                        classAffix=true;
                    }
                }else{
                    if(mod["c"]!==false){
                        pass=false;
                    }
                }
                if(mod["h"]){
                    pass=false;
                }
                
                if(pass){
                    if(!mod["e"]||((mod["fl"]==12||mod["fl"]==36)&&!mod["un"])){
                        arrmods_disabled.push(amod);
                    }else{
                        if(mod["ih"]&&mod["fl"]>=4){
                            arrmods_inherent.push(amod);
                        }else{
                            if(mod["un"]&&mod["fl"]>=4){
                                mod["ty"]=2;
                            }
                            switch(mod["ty"]){
                                case 0 :
                                    if(mod["fl"]==4){
                                        arrmods_disabled.push(amod);
                                    }else{
                                        if(classAffix){
                                            arrmods_class.push(amod);
                                        }else{
                                            arrmods.push(amod);
                                        }
                                    }
                                break;
                                case 1 : 
                                    arrmods_aspect.push(amod); 
                                break;
                                case 2 : 
                                    if(mod["iu"]){
                                        arrmods_fixed.push(amod); 
                                    }else{
                                        arrmods_disabled.push(amod); 
                                    }
                                break;
                            }
                        }
                    }
                }
                numberOfValidMods++;
            }
        });

        if(numberOfValidMods>0){
            arrmods.sort(enc_sort_by_name);
            arrmods_class.sort(enc_sort_by_name);
            arrmods_disabled.sort(enc_sort_by_name);
            arrmods_aspect.sort(enc_sort_by_name);
            arrmods_fixed.sort(enc_sort_by_name);
            arrmods_inherent.sort(enc_sort_by_name);

            var mdata={
                "core":arrmods,
                "disabled":arrmods_disabled,
                "class":arrmods_class,
                "aspect":arrmods_aspect,
                "fixed":arrmods_fixed,
                "inherent":arrmods_inherent
            };
            enc_mpool=mdata;

            vh+="<div id='appEnchanterInstructions'>";
            vh+="<div><div class='pick icon'>+</div>"+appTranslate("Click to add or remove an affix as a <span class='color-diablo-red'>desired</span> outcome.")+"</div>";
            vh+="<div><div class='present icon'>L</div>"+appTranslate("Click to add or remove an affix as being <span class='color-rarity-magic'>present</span> on the item (Leave out the affix being rerolled).")+"</div>";
            vh+="</div>";

            vh+="<div id='enc_mods'>";
            vh+=enc_build_affixes(mdata,"core",appTranslate("Core"),ilvl,appTranslate("Can appear on any item of the current base."),base);
            vh+=enc_build_affixes(mdata,"class",appTranslate("Class"),ilvl,appTranslate("Can appear for the current class on the current base."),base);
            vh+=enc_build_affixes(mdata,"fixed",appTranslate("Special"),ilvl,appTranslate("Appears on specific items, usually uniques."),base);
            vh+=enc_build_affixes(mdata,"aspect",appTranslate("Aspect"),ilvl,appTranslate("Can appear on any legendary drop of current base."),base);
            vh+=enc_build_affixes(mdata,"inherent",appTranslate("Inherent"),ilvl,appTranslate("Appears as a fixed implicit affix on some items on the current base."),base);
            vh+=enc_build_affixes(mdata,"disabled",appTranslate("Disabled"),ilvl,appTranslate("Present in the dataset but otherwise not enabled on any item."),base);
            vh+="</div>";
        }else{
            vh+="<div id='search_no_result'>"+appTranslate("There are no valid modifiers for this search.")+"</div>";
        }

        $("#enc_setup").html(vh);

        enc_order_by_columns($("#enc_setup"));

        // Apply behaviors
        $("#enc_setup").find(".mtype.core, .mtype.class").find(".pick").click(function(){enc_set_req($(this));});
        $("#enc_setup").find(".mtype.core, .mtype.class").find(".present").click(function(){enc_set_aff($(this));});

        //enc_set_params();

        appInitTooltips($("#enc_setup"));
        d4cInitItemTooltips($("#enc_setup"));
    }else{
        if(!$("#d4cSelBase").find(".opts").is(":visible")){
            $("#d4cSelBase").find(".current").click();
        }
        $("#enc_setup").html("<div style='text-align:center'>"+appMessage(appTranslate("Please choose an item base to begin."))+"</div>");
    }

    enc_compute_enchanter();
}

function enc_order_by_columns(vNode){
    var columns=3;
    if(windowSize["width"]<=1000){
        columns=2;
        if(windowSize["width"]<=700){
            columns=1;
        }
    }
    $(vNode).find(".mtype").each(function(){
        var npcol=Math.ceil($(this).find(".affixes").find(".affix").length/columns);
        if(npcol<1){npcol=1;}

        if($(this).find(".affixesByColumn").length==0){
            var colhtml="";
            for(var i=0;i<3;i++){
                colhtml+="<div class='affix_column'></div>";
            }
            $(this).find(".affixes").append("<div class='affixesByColumn'>"+colhtml+"</div>");
        }

        var curcol=0;
        var curcnt=0;
        $(this).find(".affix").each(function(){
            if(curcnt>=npcol){
                curcol++;curcnt=0;
                if(curcol>=columns){
                    curcol=0;
                }
            }
            $(this).appendTo($(this).parents(".affixes").find(".affixesByColumn").children(".affix_column:eq("+curcol+")"));
            curcnt++;
        });
    });
}

function enc_filter_mtiers(mtiers,ilvl){
    $.each(mtiers,function(k,v){
        mtiers[k]["active"]=(v["lvl"]>ilvl)?false:true;
    });
    return mtiers;
}

function enc_build_affixes(affs,mtype,title,ilvl,desc,currentBase=null){
    var vh="";

    var applyFactorToValues=1;
    if(currentBase){
        if(d4cdat["bases"]["bybase"][currentBase][9]&&(mtype=="core"||mtype=="class")){
            applyFactorToValues=2;
        }
    }

    if(affs[mtype].length>0){
        vh+="<div class='mtype "+mtype+"' mtype='"+mtype+"'>";

            vh+="<div class='title'>"+title+"<div class='suffix'>"+appTranslate("Affixes")+"</div><div class='desc'>"+desc+"</div></div>";
            vh+="<div class='affixes'>";  

            var cnt=0;
            $.each(affs[mtype],function(i,v){
                var weight=0;
                var tiers="";
                var ntinvalid=0;
                var ilvlinvalid=0;
                var maxilvl=0;
                var truemaxilvl=0;
                var embers={};
                var epcts={};
                var erem=0;
                var ttoggled=false;
                var picktier=null;

                // Filter tiers according to minimum item Power
                var minPower=v["minPower"];
                var validTiers=[];
                $.each(v["tiers"],function(ti,tv){
                    if(tv["p"]<minPower){
                        var bringUp=false;
                        if(v["tiers"][ti+1]){
                            if(v["tiers"][ti+1]["p"]<=minPower){
                                // Skip
                            }else{
                                bringUp=true;
                            }
                        }else{
                            bringUp=true;
                        }
                        if(bringUp){
                            tv["p"]=minPower;
                            validTiers.push(tv);
                        }
                    }else{
                        validTiers.push(tv);
                    }
                });

                $.each(validTiers,function(ti,tv){
                    if(ilvl>=tv["p"]){
                        picktier=tv;
                    }
                    var addcls="";
                    var nospawn=false;
                    if(tv["weight"]==0||tv["lvl"]>ilvl){
                        nospawn=true;
                        addcls+=" nospawn";
                    }else{
                        if(ttoggled){
                            addcls+=" areq";
                        }
                    }
                    if(enc_params["req"][v["id"]]==ti){
                        if(nospawn){
                            delete enc_params["req"][v["id"]];
                        }else{
                            addcls+="req";
                            ttoggled=true;
                        }
                    }
                    tiers+="<div class='tier extra aid"+v["id"]+" "+((enc_params["bld"][v["id"]]==ti)?"bld":"")+" "+addcls+"' aid="+v["id"]+" tier="+ti+">";
                    tiers+=  "<div class='name'><div>"+enc_parse_name(v["name"],tv["v"],applyFactorToValues)+"</div></div>";
                    tiers+=  "<div class='tiers'><div>"+(validTiers.length-ti)+"</div></div>";
                    tiers+=  "<div class='ilvl'><div>"+tv["p"]+"</div></div>";
                    tiers+="</div>";
                    if(tv["lvl"]>ilvl){
                        ilvlinvalid++;
                    }
                });
                var truentiers=validTiers.length-ntinvalid;
                var classIcons="";
                var hasClasses=false;
                var affixClasses="";
                if(d4cdat["affixes"]["seq"][v["id"]]["c"]){
                    classIcons+="<div class='classes'>";
                    var classcnt=0;
                    $.each(d4cdat["affixes"]["seq"][v["id"]]["c"],function(key,bool){
                        classIcons+="<div class='icon'><img src='images/classes/"+d4cdat["classes"]["seq"][key]["n"]+".png' class='apptt' apptt='"+d4cdat["classes"]["seq"][key]["n"]+" Affix'/></div>";
                        affixClasses+= " cl"+key;
                        classcnt++;
                    });
                    if(classcnt==1){
                        affixClasses+= " exclusive";
                    }
                    classIcons+="</div>";
                    hasClasses=true;
                }else{
                    affixClasses+= " global";
                }
                if(picktier!=null){
                    // Build classes for searching
                    var bases="";
                    var items="";
                    var nbases=0;
                    var lastbase=0;
                    var prefix="";
                    $.each(v["bases"],function(bkey,bbool){
                        lastbase=bkey;
                        nbases++;

                        affixClasses+=" bs"+bkey;
                    });

                    var tierValues=picktier["v"];
                    if(v["progressive"]){
                        tierValues=[];
                        $.each(picktier["bv"],function(ind,grp){
                            if(Array.isArray(grp)){
                                var gval=[];
                                $.each(grp,function(gind,val){
                                    gval.push(d4c_getPowerScalingValue(ilvl,val));
                                });
                                tierValues.push(gval);
                            }else{
                                tierValues.push(d4c_getPowerScalingValue(ilvl,grp));
                            }
                        });
                        affixClasses+=" progressive";
                        prefix+="<div class='ficon priority_quest apptt' apptt='"+appTranslate("Progressive scaling")+"'></div>";
                    }

                    vh+="<div class='affix "+affixClasses+" "+((hasClasses)?"classAffix":"")+" "+((cnt%2)?"even":"odd")+" ty"+v["type"]+" "+((enc_params["bld"][v["id"]]!==undefined)?"bld":"")+"  "+((enc_params["req"][v["id"]]!==undefined)?"req":"")+" "+((truentiers-ilvlinvalid<=0)?"nospawn":"")+" aid"+v["id"]+" mtype_"+mtype+"' aid='"+v["id"]+"' key='"+v["key"]+"' mtype='"+mtype+"'><div class='wrapper mshadow noselect'>";

                    var affixName=enc_parse_name(v["name"],tierValues,applyFactorToValues);

                    vh+=  "<div class='name'><div>"+"<div class='tyname'>"+d4cdat["types"]["seq"][d4cdat["types"]["ind"][v["type"]]]["n"]+"</div><div class='fluff'>"+v["fluff"]+"</div>"+prefix+affixName+classIcons+"</div></div>";
                    vh+=  "<div class='tiers'><div>"+validTiers.length+"</div></div>";
                    vh+=  "<div class='ilvl'><div>"+picktier["p"]+"</div></div>";
                    vh+=  "<div class='actions'>";
                    vh+=    "<div class='pick apptt' apptt='"+appTranslate("Add as requirement")+"'>+</div>";
                    vh+=    "<div class='present apptt' apptt='"+appTranslate("Add to item")+"'>L</div>";
                    vh+=    "<div class='toggle apptt' onClick='enc_toggle_affix(this)' apptt='"+appTranslate("Toggle tiers")+"'>T</div>";
                    vh+=  "</div>";
                    // List on which bases this affix is found as well with links to change to that base
                    if(nbases==1){
                        bases=appTranslate("Exclusive (<c class='game-color-gray'>"+d4cdat["bases"]["seq"][lastbase]["i"]+"</c>)");
                    }else{
                        $.each(v["bases"],function(bkey,bbool){
                            if(d4cdat["bases"]["seq"][bkey]["i"]==currentBase){
                                bases+="<span class='current'>"+currentBase+"</span>";
                            }else{
                                bases+="<a href='javascript:enc_change_current_base(\""+d4cdat["bases"]["seq"][bkey]["i"]+"\")'>"+d4cdat["bases"]["seq"][bkey]["n"]+"</a>";
                            }
                        });
                    }
                    // Bases
                    if(bases){
                        bases="<div class='elem bases mshadow'><div><span class='label'>"+appTranslate("Bases")+"</span>"+bases+"</div></div>";
                    }
                    // Items
                    if(d4cdat["affixes"]["usage"][v["id"]]){
                        var found={};
                        $.each(d4cdat["affixes"]["usage"][v["id"]],function(i,k){
                            if(found[d4cdat["items"]["seq"][k]["n"]]==undefined){
                                found[d4cdat["items"]["seq"][k]["n"]]=true;
                                items+="<a href='javascript:enc_go_to_item("+k+")' class='d4c_item_tooltip_trigger' iid='"+k+"'>"+d4cdat["items"]["seq"][k]["n"]+"</a>";
                            }
                        });
                        if(items){
                            items="<div class='elem items mshadow'><div><span class='label'>"+appTranslate("Items")+"</span>"+items+"</div></div>";
                        }
                    }
                    // Extra info
                    var extraInfo="<div><span class='label'>"+appTranslate("Unique Key")+"</span>"+v["key"]+"</div>";
                    extraInfo+="<div><span class='label'>"+appTranslate("Flag")+"</span>"+v["flags"]+"</div>";
                    extraInfo+="<div><span class='label'>"+appTranslate("Power range")+"</span>"+v["minPower"]+" - "+v["maxPower"]+"</div>";
                    var info="<div class='info aid"+v["id"]+" extra'><div>"+bases+items+"<div class='elem ukey mshadow'>"+extraInfo+"</div></div></div>";
                    vh+="</div>"+tiers+info+"</div>";
                    cnt++;
                }
            });
            vh+="</div>";

        vh+="</div>";
    }

    return vh;
}

function enc_parse_ember(ember){
    return "<div class='icn ember apptt' apptt='"+cinflng["embers"][ember]+" Ember'><img src='images/embers/"+d4cdat["embers"]["rec"][d4cdat["embers"]["ind"][ember]]["img"]+".png'/></div>";
}

function enc_parse_pct(pct){
    return (Math.round(pct*10000)/100)+"%";
}

const valueRegEx=/(\+?)#(%?)/m;
const valueReplace="<div class='value game-color-random'>$1[VALUES]$2</div>";
function enc_parse_name(name,values,applyFactorToValues){
    var valCounter=0;
    while ((m = valueRegEx.exec(name)) !== null) {
        if(Array.isArray(values[valCounter])){
            if(values[valCounter][0]==values[valCounter][1]){
                var value=enc_parse_value_two(values[valCounter][0],applyFactorToValues);
            }else{
                var value=enc_parse_value_two(values[valCounter][0],applyFactorToValues)+"<div class='dash'>-</div>"+enc_parse_value_two(values[valCounter][1],applyFactorToValues);
            }
        }else{
            var value=enc_parse_value_two(values[valCounter],applyFactorToValues);
        }
        name=name.replace(valueRegEx,valueReplace.replace("[VALUES]",value));
        valCounter++;
    }

    return name;
}

function enc_parse_value_two(value,applyFactorToValues){
    if(isNaN(value)){
        return "???";
    }
    return parseFloat(Math.round(value*100*applyFactorToValues)/100);
}

function enc_sort_by_name(a, b) {
    if (a["purest"] === b["purest"]) {
        return 0;
    }else{
        return (a["purest"] < b["purest"]) ? -1 : 1;
    }
}

function enc_toggle_affix(affix){
    var parent=$(affix).parent().parent().parent();
    var aid=$(parent).attr("aid");
    if($(parent).hasClass("toggled")){
        $(parent).removeClass("toggled");
        $(parent).parent().find(".extra.aid"+aid).hide();
    }else{
        $(parent).addClass("toggled");
        $(parent).parent().find(".extra.aid"+aid).css({"display":"flex"});
    }
}

function enc_set_req(tier){
    var parent=$(tier).parent().parent().parent();
    var aid=$(parent).attr("aid");
    if(!$(parent).hasClass("req")){
        $(parent).addClass("req");
        $("#enc_setup").find(".aid"+aid).removeClass("bld");
        delete enc_params["bld"][aid];
        enc_params["req"][aid]=0;
    }else{
        $("#enc_setup").find(".aid"+aid).removeClass("req");
        delete enc_params["req"][aid];
    }
    enc_set_tooltips($("#enc_setup").find(".aid"+aid),"req");
    enc_set_params();
    enc_compute_enchanter();
}

function enc_set_aff(tier){
    var parent=$(tier).parent().parent().parent();
    var aid=$(parent).attr("aid");
    if(!$(parent).hasClass("bld")){
        $(parent).addClass("bld");
        $("#enc_setup").find(".aid"+aid).removeClass("req");
        delete enc_params["req"][aid];
        enc_params["bld"][aid]=0;
    }else{
        $("#enc_setup").find(".aid"+aid).removeClass("bld");
        delete enc_params["bld"][aid];
    }
    enc_set_tooltips($("#enc_setup").find(".aid"+aid),"bld");
    enc_set_params();
    enc_compute_enchanter();
}

function enc_set_tooltips(vNode,vType){
    var vTooltip="";
    if(vType=="req"){
        if($(vNode).hasClass("req")){
            vTooltip="Remove requirement";
        }else{
            vTooltip="Add as requirement";
        }   
        $(vNode).find(".pick").attr("apptt",appTranslate(vTooltip));
        $("#appTooltip").children(".wrap").html(appTranslate(vTooltip));
        appAdjustToolTipCenter($(vNode).find(".pick"));
    }else{
        if($(vNode).hasClass("bld")){
            vTooltip="Remove from item";
        }else{
            vTooltip="Add to item";
        }   
        $(vNode).find(".present").attr("apptt",appTranslate(vTooltip));
        $("#appTooltip").children(".wrap").html(appTranslate(vTooltip));
        appAdjustToolTipCenter($(vNode).find(".present"));
    }
}

function enc_set_params(){
    var params={"r":null,"a":null};
    if(enc_params["req"]){
        params["r"]={};
        $.each(enc_params["req"],function(k,v){
            params["r"][k]=v;
        });
        params["r"]=JSON.stringify(params["r"]);
    }
    if(enc_params["bld"]){
        params["a"]={};
        $.each(enc_params["bld"],function(k,v){
            params["a"][k]=v;
        });
        params["a"]=JSON.stringify(params["a"]);
    }
    update_url(params);
}

function enc_change_current_base(base){
    d4c_picker_setto($("#d4cSelBase"),base);
    update_url({"b":base});
    enc_setup();
}

/*********************/
/* SELL VALUE SETTER */
/*********************/
var sellvalue_change_function=null;
function sellvalue_setter(append,change){
    var html="";

    html+="<div id='d4cSellValuer' class='app_input'>";
    html+=  "<input tabindex='0' type='text' id='d4cSellValueInput' maxlength='11' initerm='Sell value' class=''/>";
    html+=  "<div tabindex='0' class='clear' onclick='sellvalue_setter_clear()'><div>X</div></div>";
    html+="</div>";

    $(append).append(html);
    $("#d4cSellValuer").append("<div class='label'>"+$("#d4cSellValuer").find("input").attr("initerm")+"</div>");

    $("#d4cSellValueInput").focus(function(){
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
        update_url({"sell":val});
        if(sellvalue_change_function){
            sellvalue_change_function();
        }
    });

    sellvalue_setter_set(aconsts["get"]["sell"]);

    sellvalue_change_function=change;
}

function sellvalue_setter_clear(){
    sellvalue_setter_set("");
    $("#d4cSellValuer").find(".clear").hide();
    update_url({"sell":null});
    if(sellvalue_change_function){
        sellvalue_change_function();
    }
}

function sellvalue_setter_set(ilvl){
    if(ilvl){
        $("#d4cSellValueInput").parent().removeClass("init");
        $("#d4cSellValueInput").val(ilvl);
    }else{
        $("#d4cSellValueInput").parent().addClass("init");
        $("#d4cSellValueInput").val($("#d4cSellValueInput").attr("initerm"));
    }
}

function sellvalue_setter_get(){
    var sell=null;
    if(!$("#d4cSellValueInput").hasClass("init")){
        sell=parseInt($("#d4cSellValueInput").val());
        if(isNaN(null)){
            sell=null;
        }
    }
    return sell;
}

function enc_go_to_item(itemId){
    // TODO 
}

/*******************/
/* ENCHANTER LOGIC */
/*******************/
function enc_compute_enchanter(){
    var vh="";

    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    if(cls===""){cls=null;}
    var ilvl=ilvl_setter_get();

    var applyFactorToValues=1;
    if(base){
        if(d4cdat["bases"]["bybase"][base][9]){
            applyFactorToValues=2;
        }
    }

    if(base){
        // Get affix pool number
        var affixPool=$("#enc_mods").find(".mtype.core, .mtype.class").find(".affix:not(.bld)").length;
        var requirePool=$("#enc_mods").find(".mtype.core, .mtype.class").find(".affix.req").length;

        if(requirePool){
            var deductions=0;
            $("#enc_mods").find(".mtype.core, .mtype.class").find(".affix.req").each(function(){
                var aid=$(this).attr("aid");
                var curval=parseFloat(enc_params["req"][aid]);
                if(curval){
                    var affix=d4cdat["affixes"]["seq"][aid];
                    var useValue=null;
                    $.each(affix["t"],function(ind,bp){
                        if(!affix["t"][ind+1]){
                            useValue=bp["v"][0];
                        }else{
                            if(affix["t"][ind+1]["p"]>ilvl){
                                useValue=bp["v"][0];
                            }
                        }
                    });
                    if(Array.isArray(useValue)){
                        $.each(useValue,function(ind,val){
                            useValue[ind]=enc_parse_value_two(useValue[ind],applyFactorToValues);
                        });
                        var min=useValue[0];
                        var max=useValue[1];

                        var range=max-min; 5.6
                        var vrange=curval-min; 3.6
                        deductions+=vrange/range;
                    }
                }
            });

            var baseOdds=affixPool/(requirePool-deductions);
            
            var mtype="core";
            var bestClass=null;

            // Check odds on other classes if pertinentt
            if($("#enc_mods").find(".mtype.class").find(".affix.req").length==0){
                var lowestOdds=(cls)?baseOdds:99999999999999;
                var affixNotClass=$("#enc_mods").find(".mtype.core").find(".affix:not(.bld)").length;
                $.each(d4cdat["classes"]["seq"],function(k,v){
                    if(k!==cls){
                        var numClassAffix=0;
                        $.each(d4cdat["affixes"]["bybase"][base],function(bk,bv){
                            if(d4cdat["affixes"]["seq"][bv]["ty"]==0&&d4cdat["affixes"]["seq"][bv]["fl"]!=4){
                                if(d4cdat["affixes"]["seq"][bv]["c"]){
                                    if(d4cdat["affixes"]["seq"][bv]["c"][k]){
                                        if(d4cdat["affixes"]["seq"][bv]["mnp"]<=ilvl){
                                            numClassAffix++;
                                        }
                                    }
                                }
                            }
                        });
                        var classOdds=(affixNotClass+numClassAffix)/(requirePool-deductions);
                        if(classOdds<lowestOdds){
                            lowestOdds=classOdds;
                            bestClass=k;
                        }
                    }
                });
            }

            if(cls===null){
                baseOdds=lowestOdds;
            }
            var baseCeiledOdds=Math.ceil(baseOdds);

            // Build result output
            vh+="<div class='result_table'>";
            vh+=    "<div class='setup mtype core'><div class='affixes'>";

            vh+="<div class='mtype requirements' mtype='requirements'>";
            vh+="<div class='title'>"+appTranslate("Required")+"<div class='suffix'>"+appTranslate("Affixes")+"</div><div class='desc'>"+appTranslate("The following affixes are set as desired outcomes when enchanting.")+"</div></div>";
            vh+="</div>";

            $.each(enc_params["req"],function(k,v){
                if($("#enc_mods").find(".affix.aid"+k).length>0){
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
                    vh+=    "<div class='value_range'>";
                    vh+=        "<div class='any'>"+appTranslate("Any value")+"</div>";
                    vh+=        "<div class='min'>"+appTranslate("Minimum value")+": <span class='value'></span></div>";
                    vh+=        "<div class='setter'><input type='text' value=''/></div>";
                    vh+=    "</div>";
                    vh+=    "<div class='pick apptt' apptt='"+appTranslate("Remove requirement")+"'>-</div>";
                    vh+=  "</div>";
                    vh+="</div></div>";
                }
            });
            vh+=    "</div></div>";
            vh+=    "<div class='breakdown'><div>";

            vh+="<div class='title blue'>"+appTranslate("Expected")+"<div class='suffix'>"+appTranslate("odds")+"</div></div>";
            vh+="<div class='odds'>~ "+baseCeiledOdds+" "+appTranslate("tries");
            if(cls===null){
                vh+=" <span class='class'>("+d4cdat["classes"]["seq"][bestClass]["n"]+")</span>";
            }
            if(bestClass!==null&&cls!==null){
                var lowestCeiledOdds=Math.ceil(lowestOdds);
                vh+="<div class='best'>~ "+lowestCeiledOdds+" "+appTranslate("tries")+" (Best : "+d4cdat["classes"]["seq"][bestClass]["n"]+")</div>";
            }
            vh+="</div>";

            vh+="<div class='title yellow'>"+appTranslate("Expected")+"<div class='suffix'>"+appTranslate("costs")+"</div></div>";
            vh+="<div class='costs'>"
            var sell=sellvalue_setter_get();
            if(!sell){
                vh+="<div class='error'>"+appTranslate("Enter a sell value for gold costs.")+"</div>";
            }else{
                var scalingIndex=baseCeiledOdds-1;
                var scalingPointer=0;
                var gold=0;
                while(scalingPointer<=scalingIndex){
                    if(!d4cdat["scaling"]["enchant"][scalingPointer]){
                        var factor=d4cdat["scaling"]["enchant"][d4cdat["scaling"]["enchant"].length-1]+((scalingPointer-(d4cdat["scaling"]["enchant"].length-1))*enchantMultiplierAfterScaling);
                    }else{
                        var factor=d4cdat["scaling"]["enchant"][scalingPointer];
                    }
                    gold+=sell*factor;
                    scalingPointer++;
                }
                var gold=enc_get_gold_cost_from_delta(sell,baseCeiledOdds);
                vh+="<div class='gold'>"+trd_format_pricing(gold)+"<div class='gold_icon apptt' apptt='"+appTranslate("Gold")+"'><img src='images/currency/gold.png'/></div>";
                if(!cls){
                    vh+=" <span class='class'>("+d4cdat["classes"]["seq"][bestClass]["n"]+")</span>";
                }
                if(bestClass!==null&&cls!==null){
                    var gold=enc_get_gold_cost_from_delta(sell,lowestCeiledOdds);
                    vh+="<div class='best'>"+trd_format_pricing(gold)+"<div class='gold_icon apptt' apptt='"+appTranslate("Gold")+"'><img src='images/currency/gold.png'/> (Best : "+d4cdat["classes"]["seq"][bestClass]["n"]+")</div>";
                }
                vh+="</div>";
            }

            // Run material costs
            var mats=rcp_run_recipe("Recipe_Enchant",{
                "power":ilvl,
                "tags":itemtag_toggler_get()
            });

            if(mats){
                vh+="<div class='mats'>";
                $.each(mats,function(matId,quantity){
                    if(matId!="gold"){
                        var item=d4cdat["items"]["seq"][matId];
                        vh+="<div class='mat'>"+trd_format_pricing(baseCeiledOdds * quantity)+((bestClass!==null&&cls!==null)?"<span class='best'>("+trd_format_pricing(lowestCeiledOdds * quantity)+")</span>":"")+"<div class='item_icon apptt' apptt='"+item["n"]+"'><img src='images/items/"+item["img"]+".webp'/></div></div>";
                    }
                });
                vh+="</div>";
            }

            vh+="</div>";
            vh+="<div>";
        }
    }

    if(!vh){

    }

    $("#enc_result").html(vh);

    $("#enc_result").find(".mtype.core").find(".pick").click(function(){enc_rem_req($(this));});
    $("#enc_result").find(".value_range").each(function(){
        enc_init_value_ranger($(this),ilvl,applyFactorToValues);
    });

    appInitTooltips($("#enc_result"));
}

function enc_rem_req(vNode){
    var mNode=$(vNode).parent().parent().parent();
    var aid=$(mNode).attr("aid");
    $("#enc_mods").find(".affix.aid"+aid).removeClass("req");
    delete enc_params["req"][aid];
    enc_set_params();
    enc_compute_enchanter();
}

const testForNumeric=/\d|\.|¾/g;
function enc_init_value_ranger(vNode,ilvl,applyFactorToValues){
    var mNode=$(vNode).parent().parent().parent();
    var aid=$(mNode).attr("aid");
    var affix=d4cdat["affixes"]["seq"][aid];
    var useValue=null;
    $.each(affix["t"],function(ind,bp){
        if(!affix["t"][ind+1]){
            useValue=bp["v"][0];
        }else{
            if(affix["t"][ind+1]["p"]>ilvl){
                useValue=bp["v"][0];
            }
        }
    });
    if(Array.isArray(useValue)){
        $.each(useValue,function(ind,val){
            useValue[ind]=enc_parse_value_two(useValue[ind],applyFactorToValues);
        });
        var placeholder=useValue[0]+" - "+useValue[1];
        var min=useValue[0];
        var max=useValue[1];
    }else{
        useValue=enc_parse_value_two(useValue,applyFactorToValues);
        var placeholder=useValue;
        var min=useValue;
        var max=useValue;
    }
    var curval=parseFloat(enc_params["req"][aid]);
    if(curval<min&&curval){
        curval=min;
    }
    if(curval>max){
        curval=max;
    }
    $(vNode).click(function(){enc_toggle_value_setter($(this));});
    $(vNode).find("input").attr("placeholder",placeholder).attr("maxlength","8").attr("min",min).attr("max",max).keydown(function(e){
        switch(e.keyCode){
            case 27 : case 13 : 
                enc_close_value_setter($(this));
            break;
            case 8 : case 37 : case 39 : case 46 : break;
            default:
                var char=String.fromCharCode(e.keyCode);
                if(!char.match(testForNumeric)){
                    console.log("mere");
                    e.preventDefault();
                }
            break;
        }
    }).blur(function(){
        enc_close_value_setter($(this));
    });

    if(curval){
        $(vNode).find("input").val(curval);
        $(mNode).find(".any").hide();
        $(mNode).find(".min").find(".value").html(curval);
        $(mNode).find(".min").show();
    }
}

function enc_close_value_setter(vNode){
    var val=$(vNode).val();
    var mNode=$(vNode).parent().parent();
    $(mNode).find(".setter").hide();
    var aid=$(mNode).parent().parent().parent().attr("aid");
    if(!isNaN(val)&&val){
        var min=parseFloat($(vNode).attr("min"));
        var max=parseFloat($(vNode).attr("max"));
        if(val<min){
            val=min;
        }else{
            if(val>max){
                val=max;
            }
        }
    }

    var param=0;
    if(isNaN(val)||!val){
        $(vNode).val("");
        $(mNode).find(".any").show();
    }else{
        $(vNode).val(val);
        param=val;
        $(mNode).find(".min").find(".value").html(val);
        $(mNode).find(".min").show();
    }
    enc_params["req"][aid]=val;
    enc_set_params();
    enc_compute_enchanter();
}

function enc_toggle_value_setter(vNode){
    if($(vNode).find(".any:visible, .min:visible").length>0){
        $(vNode).find(".min").hide();
        $(vNode).find(".any").hide();
        $(vNode).find(".setter").show();
        $(vNode).find(".setter").find("input").select();
    }
}

function enc_get_gold_cost_from_delta(sell,tries){
    var scalingIndex=tries-1;
    var scalingPointer=0;
    var gold=0;
    while(scalingPointer<=scalingIndex){
        if(!d4cdat["scaling"]["enchant"][scalingPointer]){
            var factor=d4cdat["scaling"]["enchant"][d4cdat["scaling"]["enchant"].length-1]+((scalingPointer-(d4cdat["scaling"]["enchant"].length-1))*enchantMultiplierAfterScaling);
        }else{
            var factor=d4cdat["scaling"]["enchant"][scalingPointer];
        }
        gold+=sell*factor;
        scalingPointer++;
    }
    return Math.ceil(gold);
}