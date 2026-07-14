
document.querySelectorAll(".close").forEach(button => {
    button.addEventListener("click", function () {
        this.parentElement.remove();
    });
});
