$(function () {
    $("#btnSubmit").click(function () {
        var password = $("#password").val();
        var confirmPassword = $("#cnfrmpassword").val();
        if (password != confirmPassword) {
            alert("Passwords do not match.");
            return false;
        }
        return true;
    });
});