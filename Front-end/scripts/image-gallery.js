var modal = document.getElementById("myModal");
var slideIndex = 1;


function closePopup() {
    var modal = $("#myModal");
    modal.style.display = "none";
}

function plusSlides(n) {
    showSlides((slideIndex += n));
}

function currentSlide(n) {
    showSlides((slideIndex = n));
}

function showSlides(n) {
    var i;
    var slides = $(".mySlides");
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    if (n == 1) {
        slideIndex = 1
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
        
    }
    slides[slideIndex - 1].style.display = "contents";
}

function loadImages() {
    $(".close").on("click", function () {
        var modal = document.getElementById("myModal");
        modal.style.display = "none";
    });

    $(".prev").on("click", function () {
        showSlides((slideIndex += -1));
    });

    $(".next").on("click", function () {
        showSlides((slideIndex += +1));
    });


    $(".image").on("click", function () {
        var modal = document.getElementById("myModal");
        var modalImg = document.getElementById("img01");
        var captionText = document.getElementById("caption");
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    });

    showSlides(slideIndex);

}