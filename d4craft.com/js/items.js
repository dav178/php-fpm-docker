function itm_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='app_options'></div>");
    item_selector($(cntzone).find("#app_options"),function(){itm_setup();},true);
    classmode_selector($(cntzone).find("#app_options"));
    $("#d4cSelClassMode").insertBefore($("#d4cSelClass"));
    rarity_selector($(cntzone).find("#app_options"));
    isize_selector($(cntzone).find("#app_options"));
    searcher_control($(cntzone).find("#app_options"),function(){itm_setup();});
    $(cntzone).find("#app_options").append("<div id='appItemResetButton' class='appbtn reset_btn mshadow' onClick='reset_url()'>"+appTranslate("Reset")+"</div>");
    $(cntzone).append("<div id='itm_setup'></div>");
    itm_build_unique_drop_tables();
    itm_load();
    itm_setup();
    isize_change();
    reset_btn_state();
}

var itmTotalUniqueWeightPerClass=null;
function itm_build_unique_drop_tables(){
    itmTotalUniqueWeightPerClass={};
    $.each(d4cdat["classes"]["seq"],function(index,cls){
        itmTotalUniqueWeightPerClass[index]=0;
    });
    $.each(d4cdat["items"]["seq"],function(index,item){
        if(item["t"]=="unique"){
            if(item["dw"]){
                if(item["c"]){ 
                    $.each(item["c"],function(index,vbool){
                        itmTotalUniqueWeightPerClass[index]+=item["dw"];
                    });
                }else{
                    $.each(itmTotalUniqueWeightPerClass,function(index,val){
                        itmTotalUniqueWeightPerClass[index]+=item["dw"];
                    });
                }
            }
        }
    });
}

function itm_load(){
    var html="<div id='itm_result'></div>";

    $.each(d4cdat["items"]["seq"],function(index,item){
        var classes="";
        if(item["c"]){
            var cnt=0;
            $.each(item["c"],function(k,b){
                classes+=" class_"+k;
                cnt++;
            });
            if(cnt==1){
                classes+=" exclusive";
            }
        }else{
            classes+=" global";
        }

        var extended=true;

        if(item["t"]=="unique"){
            extended="";
            if(item["c"]){
                $.each(item["c"],function(k,b){
                    var chance=itmTotalUniqueWeightPerClass[k]/item["dw"];
                    extended+="<div><label>"+d4cdat["classes"]["seq"][k]["n"]+" "+appTranslate("drop chance")+"</label>~ 1 / "+Math.ceil(chance)+"</div>";
                });
            }else{
                $.each(itmTotalUniqueWeightPerClass,function(k,v){
                    var chance=v/item["dw"];
                    extended+="<div><label>"+d4cdat["classes"]["seq"][k]["n"]+" "+appTranslate("drop chance")+"</label>~ 1 / "+Math.ceil(chance)+"</div>";
                });
            }
        }

        html+="<div class='item rarity_"+item["t"]+" base_"+item["b"]+classes+"' uid='"+index+"'>";
        html+=d4c_item_output(item["id"],"big",extended);
        html+="</div>";
    });

    $("#itm_setup").html(html);
}

function itm_setup(){
    var base=d4c_picker_get_val($("#d4cSelBase"));
    var cls=d4c_picker_get_val($("#d4cSelClass"));
    var rarity=d4c_picker_get_val($("#d4cSelRarity"));
 
    $("#itm_setup").find(".item").removeClass("tentative").hide();
    
    var selector="";
    var filter="";

    if(base){
        selector+=".base_"+d4cdat["bases"]["ind"][base];
    }

    if(rarity&&rarity!=="0"){
        selector+=".rarity_"+rarity;
    }

    if(cls){
        $("#d4cSelClassMode").show();
        var clsmode=d4c_picker_get_val($("#d4cSelClassMode"));

        if(clsmode=="usableby"){
            filter+=".class_"+cls+", .global";
        }else{
            filter+=".class_"+cls+".exclusive";
        }
    }else{
        $("#d4cSelClassMode").hide();
    }

    if(selector||filter){
        if(!filter){filter=".item";}
        $("#itm_setup").find(".item"+selector).filter(filter).addClass("tentative");
    }else{
        $("#itm_setup").find(".item").addClass("tentative");;
    }

    var search=searcher_get_functionnal_value();

    if(search){
        $("#itm_setup").find(".item.tentative").each(function(){
            var search_name=$(this).find(".title").text().toLowerCase();
            for(var i=0;i<search.length;i++){
                if(search_name.indexOf(search[i])>-1){}else{
                    $(this).removeClass("tentative");
                    break;
                }
            }
        });
    }

    $("#itm_setup").find(".item.tentative").css('display','inline-block');
    var numitems=$("#itm_setup").find(".item.tentative").length;
    $("#itm_setup").find(".item.tentative").removeClass("tentative");

    $("#itm_result").removeClass("noitems").html("<span class='number'>"+numitems+"</span> "+appTranslate("Items"));
    if(numitems==0){
        $("#itm_result").addClass("noitems");
    }
}

/*******************/
/* RARITY SELECTOR */
/*******************/
function rarity_selector(append,change=null){
    var html="";

    var seldat=[];
    seldat=[{"id":0,"label":"All"}];
    $.each(d4cdat["items"]["rarity"],function(k,v){
        seldat.push({"id":k,"label":v});
    });
    html+=d4c_picker(seldat,"d4cSelRarity",appTranslate("Rarity"),aconsts["get"]["r"]);

    $(append).append(html);

    // Apply behaviors
    d4c_picker_init($("#d4cSelRarity"),function(){rarity_change();});

    if(aconsts["get"]["r"]){
        d4c_picker_setto($("#d4cSelRarity"),aconsts["get"]["r"]);
    }else{
        d4c_picker_setto($("#d4cSelRarity"),"unique");
    }
}

function rarity_change(){
    var val=d4c_picker_get_val($("#d4cSelRarity"));

    update_url({"r":val});

    item_change();
}

/***********************/
/* CLASS MODE SELECTOR */
/***********************/
function classmode_selector(append){
    var html="";

    var seldat=[];
    $.each(classItemMode,function(k,v){
        seldat.push({"id":k,"label":v});
    });
    html+=d4c_picker(seldat,"d4cSelClassMode",appTranslate("Class mode"),aconsts["get"]["cm"]);

    $(append).append(html);

    // Apply behaviors
    d4c_picker_init($("#d4cSelClassMode"),function(){classmode_change();});

    if(aconsts["get"]["cm"]){
        d4c_picker_setto($("#d4cSelClassMode"),aconsts["get"]["cm"]);
    }else{
        d4c_picker_setto($("#d4cSelClassMode"),"usableby");
    }
}

function classmode_change(){
    var val=d4c_picker_get_val($("#d4cSelClassMode"));

    update_url({"cm":val});

    item_change();
}

/**********************/
/* ITEM SIZE SELECTOR */
/**********************/
function isize_selector(append){
    var html="";

    var seldat=[];
    $.each(itemsSizes,function(k,v){
        seldat.push({"id":k,"label":v});
    });
    html+=d4c_picker(seldat,"d4cSelISize",appTranslate("Item size"),aconsts["get"]["isize"]);

    $(append).append(html);

    // Apply behaviors
    d4c_picker_init($("#d4cSelISize"),function(){isize_change();});

    if(aconsts["get"]["isize"]){
        d4c_picker_setto($("#d4cSelISize"),aconsts["get"]["isize"]);
    }else{
        d4c_picker_setto($("#d4cSelISize"),"medium");
    }
}

function isize_change(){
    var val=d4c_picker_get_val($("#d4cSelISize"));

    $(".itemOutput").removeClass("big small medium").addClass(val);

    update_url({"isize":val});
}