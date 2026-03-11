function app_init(){
    app_initConstants();
    app_initMenus();
    $(window).resize(function(){app_resize();});
    app_resize();
    $(window).scroll(function(){app_scroll();});
    app_scroll();
    $("#mobileMenu").click(function(){app_toggleMobileMenu();});
    setTimeout(function(){custom_init();},1);
}

var windowSize=null;
function app_resize(){
    windowSize={
        "width":$(window).width(),
        "height":$(window).height()
    };
    if(windowSize["width"]>850){
        $("#mainMenu").show();
    }else{
        $("#mainMenu").hide();
    }
    if(windowSize["width"]>475){
        $("#topMenu").appendTo($("#top").children(".swrap"));
    }else{
        $("#topMenu").appendTo($("#mainMenu"));
    }
}

var windowScroll=null;
function app_scroll(){
    windowScroll={
        "top":$(window).scrollTop()
    };
}

function app_toggleMobileMenu(){
    if($("#mobileMenu").hasClass("toggled")){
        $("#mobileMenu").removeClass("toggled");
        $("#mainMenu").hide();
    }else{
        $("#mobileMenu").addClass("toggled");
        $("#mainMenu").show();
    }
}

var aconsts=null;
function app_initConstants(){
    aconsts=jQuery.parseJSON($("#appConstants").html());
}

function app_initMenus(){
    $(".appmenu").each(function(){
        try {
            var mdat=jQuery.parseJSON($(this).html());
            var vHTML="";
            $.each(mdat["struct"],function(k,v){
                var pass=true;
                if(v["debug"]&&!aconsts["debug"]){
                    pass=false;
                }
                if(pass){
                    vHTML+="<div class='item "+((aconsts["pagedat"]["mkey"]==mdat["mkey"]&&aconsts["pagedat"]["pkey"]==k)?"selected":"")+"' onClick='app_goTo(\""+aconsts["index"]["rev"][mdat["mkey"]][k][aconsts["lng"]]+"\")'><div>"+v["title"][aconsts["lng"]]+"</div></div>";
                }
            });
            $(this).html(vHTML);
        }
        catch (e) {
            
        }
        if($(this).hasClass("inline-block")){
            $(this).css({"display":"inline-block"});
        }else{
            $(this).show();
        }
    });
}

function app_goTo(vTo){
    document.location=aconsts["baseurl"]+vTo;
}

function app_goHome(){
    document.location=aconsts["baseurl"];
}

function appMessage(msg){
    return "<div class='appmsg mshadow'>"+msg+"</div>";
}

function appTranslate(term){
    return term;
}

function appInitTooltips(vNode){
    $(vNode).find(".apptt").hover(function(){
        $("#appTooltip").remove();
        $("<div>").attr("id","appTooltip").addClass("mshadow").html("<div class='wrap'>"+$(this).attr("apptt")+"</div>").appendTo($("body"));
        var tdim=appGetHiddenDims($("#appTooltip"));
        var ndim={"width":$(this).outerWidth(),"height":$(this).outerHeight()};
        var tpos=$(this).offset();
        $("#appTooltip").css({"top":tpos["top"]+ndim["height"],"left":(tpos["left"]+(ndim["width"]/2))-(tdim["width"]/2)}).stop(true,false).fadeIn({"duration":250});
    },function(){
        $("#appTooltip").stop(true,false).fadeOut({"duration":150,"complete":function(){
            
        }});
    });
}

function appGetHiddenDims(vNode){
    $(vNode).css({"visibility":"hidden","display":"block"});
    var tdims={"width":$(vNode).outerWidth(),"height":$(vNode).outerHeight()};
    $(vNode).css({"visibility":"visible","display":"none"});
    return tdims;
}

function appAdjustToolTipCenter(vNode){
    var tdim={"width":$("#appTooltip").outerWidth(),"height":$("#appTooltip").outerHeight()};
    var ndim={"width":$(vNode).outerWidth(),"height":$(vNode).outerHeight()};
    var tpos=$(vNode).offset();
    $("#appTooltip").css({"left":(tpos["left"]+(ndim["width"]/2))-(tdim["width"]/2)});
}