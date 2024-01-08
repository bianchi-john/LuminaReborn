$(document).ready(function () {
    addEventListeners();
    function addEventListeners() {
        $('.openSidenav').on("click", function () {
            var sidenavWidth = $('#mySidenav').width();
            if (sidenavWidth === 0) {
                $('#mySidenav').css("width", "250px");
            }
        });


        // Quando viene cliccato l'elemento con classe 'closebtn'
        $('.closebtn').on("click", function () {
            $('#mySidenav').css("width", "0");
        });
        $('.logout').on("click", function () {
            document.cookie = "jwt=; path=/;";
            location.reload();

        });

        //* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
        var dropdown = document.getElementsByClassName("dropdown-btn");
        var i;

        for (i = 0; i < dropdown.length; i++) {
            dropdown[i].addEventListener("click", function () {
                this.classList.toggle("active");
                var dropdownContent = this.nextElementSibling;
                if (dropdownContent.style.display === "block") {
                    dropdownContent.style.display = "none";
                } else {
                    dropdownContent.style.display = "block";
                }
            });
        }
    }

});

