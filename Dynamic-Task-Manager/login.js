
// GET HTML ELEMENTS

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

const message = document.getElementById("message");


// SHOW AND HIDE PASSWORD

togglePassword.addEventListener("click", function() {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        togglePassword.textContent = "Hide";

    } else {

        passwordInput.type = "password";
        togglePassword.textContent = "Show";

    }

});


// LOGIN FORM

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {

        message.textContent = "Please fill all the fields!";
        return;

    }

    // Demo login only - no real authentication

    sessionStorage.setItem("taskManagerLoggedIn", "true");
    sessionStorage.setItem("taskManagerEmail", email);

    message.style.color = "#6FAD8B";
    message.textContent = "Login successful! Welcome ♡";

    setTimeout(function() {

        window.location.href = "index.html";

    }, 700);

});
