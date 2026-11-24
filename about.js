$(function () {

  $(".tab").on("click", function () {
    $(".tab").removeClass("active");
    $(this).addClass("active");

    $(".tab-isi").prop("hidden", true);
    $("#tab-" + $(this).data("tab")).prop("hidden", false);
  });

  $(".faq-tanya").on("click", function () {
    $(this).next(".faq-jawab").slideToggle(200);
  });

});