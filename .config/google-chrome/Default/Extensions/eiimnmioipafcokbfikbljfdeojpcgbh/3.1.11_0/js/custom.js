/* JS */

/* Bootstrap toggle */

function initNiceChecks(){
    $('.toggle-button').toggleButtons({
        style: {
            // Accepted values ["primary", "danger", "info", "success", "warning"] or nothing
            enabled: "primary"
        }
    });
    $('.toggle-button-red').toggleButtons({
        style: {
            enabled: "danger"
        }
    });
    $('.toggle-button-blackwhite').toggleButtons({
        width:130,
        style: {
            enabled: "primary",
            disabled: "danger"
        },
        label: {
            enabled: "Whitelist",
            disabled: "Blacklist"
        }
    });
}

/* Uniform - Form Styleing */

/*$(document).ready(function() {
  $(".uni select, .uni input, .uni textarea").uniform();
});


jQuery("a[class^='prettyPhoto']").prettyPhoto({
overlay_gallery: false, social_tools: false
});*/


/* jQuery Notification */

/*$(document).ready(function(){

  setTimeout(function() {noty({text: '<strong>Howdy! Hope you are doing good...</strong>',layout:'topRight',type:'information',timeout:15000});}, 7000);

  setTimeout(function() {noty({text: 'This is an all in one theme which includes Front End, Admin & E-Commerce. Dont miss it. Grab it now',layout:'topRight',type:'alert',timeout:13000});}, 9000);

});*/


/*$(document).ready(function() {

  $('.noty-alert').click(function (e) {
      e.preventDefault();
      noty({text: 'Some notifications goes here...',layout:'topRight',type:'alert',timeout:2000});
  });

  $('.noty-success').click(function (e) {
      e.preventDefault();
      noty({text: 'Some notifications goes here...',layout:'top',type:'success',timeout:2000});
  });

  $('.noty-error').click(function (e) {
      e.preventDefault();
      noty({text: 'Some notifications goes here...',layout:'topRight',type:'error',timeout:2000});
  });

  $('.noty-warning').click(function (e) {
      e.preventDefault();
      noty({text: 'Some notifications goes here...',layout:'bottom',type:'warning',timeout:2000});
  });

  $('.noty-information').click(function (e) {
      e.preventDefault();
      noty({text: 'Some notifications goes here...',layout:'topRight',type:'information',timeout:2000});
  });

});*/