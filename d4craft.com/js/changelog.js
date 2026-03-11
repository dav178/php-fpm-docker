const regexImportance = /\+/gm;

function log_init(){
    var cntzone=$("#content").children("div.swrap");
    $(cntzone).append("<div id='textContent'><h1>Changelog</h1><div id='log_setup'></div></div>");

    console.log(pagedata);

    var vh="";
    $.each(pagedata,function(ldate,elements){
        vh+="<div class='log'>";
        vh+=    "<div class='date'><div class='text'>"+ldate+"</div><div class='spacer'></div></div>";
        vh+=    "<div class='elements'>";
        $.each(elements,function(index,elem){
            var importance=log_get_element_importance(elem);
            var icon="side_quest";
            switch(importance){
                case 1 : icon="landmark";break;
                case 2 : icon="quest_objective";break;
                case 3 : icon="priority_quest";break;
            }
            vh+="<div class='element importance"+importance+"'><div class='ficon "+icon+"'></div>"+log_filter_element(elem)+"</div>";
        });
        vh+=    "</div>";
        vh+="</div>";
    });

    $("#log_setup").html(vh);

    var tminc=150;
    var tm=100;
    $.each($("#log_setup").find(".log"),function(){
        var vThis=$(this);
        setTimeout(function(){
            $(vThis).fadeIn({"duration":250});
        },tm);
        tm+=tminc;
    });
}

function log_get_element_importance(elem){
    let m;
    var count=0;
    while ((m = regexImportance.exec(elem)) !== null) {
        if (m.index === regexImportance.lastIndex) {regexImportance.lastIndex++;}
        m.forEach(() => {
            count++;
        });
    }
    return count;
}

function log_filter_element(elem){
    return elem.replace(regexImportance, "");
}