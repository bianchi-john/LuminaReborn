function toggleAdvancedSearch() {
    var advancedSearchFields = document.getElementById("advancedSearchFields");
    var generalSearchBar = document.getElementById("generalSearch");
    var advancedSearchButton = document.getElementById("advancedSearchButton");

    if (advancedSearchFields.style.display === "none") {
        advancedSearchFields.style.display = "block";
        generalSearchBar.style.display = "none";
        advancedSearchButton.innerText = "General Search";
        advancedSearchButton.style.backgroundColor = "#2e1273"; 
        advancedSearchButton.style.borderColor = "#2e1273"; 


    } else {
        advancedSearchFields.style.display = "none";
        generalSearchBar.style.display = "block";
        advancedSearchButton.innerText = "Advanced Search";
        advancedSearchButton.style.backgroundColor = "#007bff"; 
        advancedSearchButton.style.borderColor = "#007bff"; 
    }
}

$(document).ready(function () {
    var button = document.getElementById("advancedSearchButton");
    button.addEventListener("click", toggleAdvancedSearch);
});
