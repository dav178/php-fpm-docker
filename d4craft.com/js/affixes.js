function aff_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='app_options'></div>");
    //type_selector($(cntzone).find("#app_options"),function(){});
    item_selector($(cntzone).find("#app_options"),function(){aff_setup();},true,54);
    classmode_selector($(cntzone).find("#app_options"));
    $("#d4cSelClassMode").insertBefore($("#d4cSelClass"));
    searcher_control($(cntzone).find("#app_options"),function(){aff_setup();});
    $(cntzone).find("#app_options").append("<div id='appAffixResetButton' class='appbtn reset_btn mshadow' onClick='reset_url()'>"+appTranslate("Reset")+"</div>");
    $(cntzone).append("<div id='aff_setup'></div>");
    aff_load();
    aff_setup();
    reset_btn_state();
}

/*****************/
/* TYPE SELECTOR */
/*****************/
function type_selector(append,change){
    var html="";

    var seldat=[];
    $.each(d4cdat["types"]["seq"],function(k,v){
        seldat.push({"id":v["i"],"label":v["n"]});
    });
    html+=d4c_picker(seldat,"d4cSelType",appTranslate("Type"),aconsts["get"]["t"]);

    $(append).append(html);

    // Apply behaviors
    d4c_picker_init($("#d4cSelType"),function(){/*item_base_change(false);*/});

    if(aconsts["get"]["t"]){
        d4c_picker_setto($("#d4cSelType"),aconsts["get"]["t"]);
        //item_base_change(true);
    }
    
    item_change_function=change;
}

/***************/
/* AFFIX SETUP */
/***************/
function aff_load(){
    var vh="<div id='aff_result'></div>";

    var arrmods=[];
    var arrmods_disabled=[];
    var arrmods_class=[];
    var arrmods_aspect=[];
    var arrmods_fixed=[];
    var arrmods_inherent=[];

    $.each(d4cdat["affixes"]["seq"],function(k,mod){
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
        var classAffix=(mod["c"])?true:false;
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
    });

    var mdata={
        "core":arrmods,
        "disabled":arrmods_disabled,
        "class":arrmods_class,
        "aspect":arrmods_aspect,
        "fixed":arrmods_fixed,
        "inherent":arrmods_inherent
    };
    enc_mpool=mdata;

    vh+="<div id='enc_mods' class='nobuilder'>";
    vh+=enc_build_affixes(mdata,"core",appTranslate("Core"),topPower,appTranslate("Can appear on any item."));
    vh+=enc_build_affixes(mdata,"class",appTranslate("Class"),topPower,appTranslate("Can only appear for the classes they belong to."));
    vh+=enc_build_affixes(mdata,"fixed",appTranslate("Special"),topPower,appTranslate("Appears on specific items, usually uniques."));
    vh+=enc_build_affixes(mdata,"aspect",appTranslate("Aspect"),topPower,appTranslate("Can appear on any legendary drop."));
    vh+=enc_build_affixes(mdata,"inherent",appTranslate("Inherent"),topPower,appTranslate("Appears as a fixed implicit affix on some items."));
    vh+=enc_build_affixes(mdata,"disabled",appTranslate("Disabled"),topPower,appTranslate("Present in the dataset but otherwise not enabled on any item."));
    vh+="</div>";

    $("#aff_setup").html(vh);

    appInitTooltips($("#aff_setup"));
    d4cInitItemTooltips($("#aff_setup"));
}

function aff_reorder(){
    var columns=3;
    if(windowSize["width"]<=1000){
        columns=2;
        if(windowSize["width"]<=700){
            columns=1;
        }
    }
    $("#aff_setup").find(".mtype").each(function(){
        var npcol=Math.floor($(this).find(".affixes").find(".affix:not(.hidden)").length/columns);
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
        $(this).find(".affix:not(.hidden)").each(function(){
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

function aff_setup(){
    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    var search=searcher_get_functionnal_value();

    $("#aff_setup").find(".affix").removeClass("tentative").addClass("hidden");
    
    var selector="";
    var filter="";

    if(base){
        selector+=".bs"+d4cdat["bases"]["ind"][base];
    }

    if(cls){
        $("#d4cSelClassMode").show();
        var clsmode=d4c_picker_get_val($("#d4cSelClassMode"));

        if(clsmode=="usableby"){
            filter+=".cl"+cls+", .global";
        }else{
            filter+=".cl"+cls+".exclusive";
        }
    }else{
        $("#d4cSelClassMode").hide();
    }

    if(selector||filter){
        if(!filter){filter=".affix";}
        $("#aff_setup").find(".affix"+selector).filter(filter).addClass("tentative");
    }else{
        $("#aff_setup").find(".affix").addClass("tentative");;
    }

    var search=searcher_get_functionnal_value();

    if(search){
        $("#aff_setup").find(".affix.tentative").each(function(){
            var search_name=$(this).find(".name").text().toLowerCase();
            for(var i=0;i<search.length;i++){
                if(search_name.indexOf(search[i])>-1){}else{
                    $(this).removeClass("tentative");
                    break;
                }
            }
        });
    }

    if(!selector&&!filter&&!search){
        $("#aff_setup").find(".affix").addClass("tentative");
    }

    $("#aff_setup").find(".affix.tentative").removeClass("hidden");
    $("#aff_setup").find(".affix.tentative").removeClass("tentative");

    var naffixes=0;
    $("#aff_setup").find(".mtype").each(function(){
        var nvis=$(this).find(".affix:not(.hidden)").length;
        naffixes+=nvis;
        if(nvis==0){
            $(this).hide();
        }else{
            $(this).show();
        }
    });

    $("#aff_result").removeClass("noaffixes").html("<span class='number'>"+naffixes+"</span> "+appTranslate("Affixes"));
    if(naffixes==0){
        $("#aff_result").addClass("noaffixes");
    }

    aff_reorder();
}