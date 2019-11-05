$(document).ready(function(){
    $("#btn1").addClass("padrao-1");
    $("#btn1").width($(document).width()/4);
    $("#btn1").height(($(document).height()/5)*2);
    $("#btn2").addClass("padrao-2");
    $("#btn2").width($(document).width()/4);
    $("#btn2").height(($(document).height()/5)*2);
    $("#btn3").addClass("padrao-3");
    $("#btn3").width($(document).width()/4);
    $("#btn3").height(($(document).height()/5)*2);
    $("#btn4").addClass("padrao-4");
    $("#btn4").width($(document).width()/4);
    $("#btn4").height(($(document).height()/5)*2);

    $("#btn1").hover(function(){
        $("#btn1").removeClass("padrao-1");
        $("#btn1").addClass("padrao-1-clicked");
    }, function(){
        $("#btn1").removeClass("padrao-1-clicked");
        $("#btn1").addClass("padrao-1");
    })
    $("#btn2").hover(function(){
        $("#btn2").removeClass("padrao-2");
        $("#btn2").addClass("padrao-2-clicked");
    }, function(){
        $("#btn2").removeClass("padrao-2-clicked");
        $("#btn2").addClass("padrao-2");
    })
    $("#btn3").hover(function(){
        $("#btn3").removeClass("padrao-3");
        $("#btn3").addClass("padrao-3-clicked");
    }, function(){
        $("#btn3").removeClass("padrao-3-clicked");
        $("#btn3").addClass("padrao-3");
    })
    $("#btn4").hover(function(){
        $("#btn4").removeClass("padrao-4");
        $("#btn4").addClass("padrao-4-clicked");
    }, function(){
        $("#btn4").removeClass("padrao-4-clicked");
        $("#btn4").addClass("padrao-4");
    })
    
})