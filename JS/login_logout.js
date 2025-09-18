const UsersStorage = "users";
const CurrentUserStorage = "currentUser";

function loadUsers() {
  const raw = localStorage.getItem(UsersStorage);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(UsersStorage, JSON.stringify(users));
}

function validateEmail(email) {
  if (/^[^a-zA-Z0-9]/.test(email)) {
    return { valid: false, msg: "Email cannot start with special characters" };
  }
  if (!/@(gmail\.com|yahoo\.com|outlook\.com)$/.test(email)) {
    return {
      valid: false,
      msg: "Email must end with @gmail.com, @yahoo.com, or @outlook.com",
    };
  }
  return { valid: true, msg: "Valid email ✅" };
}

function validatePassword(password) {
  return (
    /[0-9]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password) &&
    password.length >= 8
  );
}

function attachSignUpHandler() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  const emailMsg = document.getElementById("email-msg");
  const passMsg = document.getElementById("pass-msg");
  const confirmMsg = document.getElementById("confirm-msg");

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      const check = validateEmail(emailInput.value.trim());
      if (emailMsg) emailMsg.textContent = check.msg;
      if (check.valid) {
        emailMsg && emailMsg.classList.remove("text-danger");
        emailMsg && emailMsg.classList.add("text-success");
      } else {
        emailMsg && emailMsg.classList.add("text-danger");
        emailMsg && emailMsg.classList.remove("text-success");
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      if (!validatePassword(passwordInput.value)) {
        passMsg && (passMsg.textContent = "Password must have number, uppercase, symbol, and ≥8 chars");
        passMsg && passMsg.classList.add("text-danger");
        passMsg && passMsg.classList.remove("text-success");
      } else {
        passMsg && (passMsg.textContent = "Strong password ✅");
        passMsg && passMsg.classList.remove("text-danger");
        passMsg && passMsg.classList.add("text-success");
      }
    });
  }

  if (confirmInput && passwordInput) {
    confirmInput.addEventListener("input", () => {
      if (confirmInput.value !== passwordInput.value) {
        confirmMsg && (confirmMsg.textContent = "Passwords do not match");
        confirmMsg && confirmMsg.classList.add("text-danger");
        confirmMsg && confirmMsg.classList.remove("text-success");
      } else {
        confirmMsg && (confirmMsg.textContent = "Passwords match ✅");
        confirmMsg && confirmMsg.classList.remove("text-danger");
        confirmMsg && confirmMsg.classList.add("text-success");
      }
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const confirmPassword = confirmInput ? confirmInput.value : "";

    const check = validateEmail(email);
    if (!check.valid || !validatePassword(password) || password !== confirmPassword) {
      Swal.fire({ icon: "error", title: "Fix validation errors first" });
      return;
    }

    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      Swal.fire({ icon: "error", title: "Email already registered" });
      return;
    }

    users.push({ email, password, createdAt: new Date().toISOString() });
    saveUsers(users);

    Swal.fire({
      icon: "success",
      title: "Account created",
      showConfirmButton: false,
      timer: 1000,
    }).then(() => {
      window.location.href = "login.html";
    });
  });
}

function attachLoginHandler() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    const check = validateEmail(email);
    if (!check.valid || !validatePassword(password)) {
      Swal.fire({ icon: "error", title: "Invalid email or password format" });
      return;
    }

    const users = loadUsers();
    const userByEmail = users.find((u) => u.email === email);

    if (!userByEmail) {
      Swal.fire({ icon: "error", title: "User does not exist" });
      return;
    }

    if (userByEmail.password !== password) {
      Swal.fire({ icon: "error", title: "Invalid email or password" });
      return;
    }

    const currentUser = { email, loggedAt: new Date().toISOString() };
    localStorage.setItem(CurrentUserStorage, JSON.stringify(currentUser));

    Swal.fire({
      icon: "success",
      title: "Signed in",
      showConfirmButton: false,
      timer: 900,
    }).then(() => {
      window.location.replace("HomeLoggedin.html");
    });
  });
}

function LogOut() {
  localStorage.removeItem("currentUser");
  try { sessionStorage.clear(); } catch(e) {}

  Swal.fire({
    position: "center",
    icon: "success",
    title: "You have been logged out",
    showConfirmButton: false,
    timer: 1200,
  }).then(() => {
    window.location.replace("login.html");
    setTimeout(() => {
      history.pushState(null, "", "login.html");
      window.addEventListener("popstate", function () {
        history.pushState(null, "", "login.html");
      });
    }, 0);
  });
}


function setupPasswordToggles() {
  const eye1 = document.getElementById("togglePassword");
  const eye2 = document.getElementById("toggleConfirmPassword");
  const eye3 = document.getElementById("toggleLoginPassword");

  if (eye1){
    eye1.addEventListener("click" , () => {
      let input = document.getElementById("password");
      if (!input) return;
      let type = input.type === "password" ? "text" : "password";
      input.type = type;
      let icon = eye1.querySelector("i");
      if (!icon) return;
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }

  if (eye2){
    eye2.addEventListener("click" , () => {
      let input = document.getElementById("confirmPassword");
      if (!input) return;
      let type = input.type === "password" ? "text" : "password";
      input.type = type;
      let icon = eye2.querySelector("i");
      if (!icon) return;
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }

  if (eye3){
    eye3.addEventListener("click" , () => {
      let input = document.getElementById("password");
      if (!input) return;
      let type = input.type === "password" ? "text" : "password";
      input.type = type;
      let icon = eye3.querySelector("i");
      if (!icon) return;
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();
  attachSignUpHandler();
  attachLoginHandler();
});

function GoToCart() {
    window.location.href = "Cart.html";
}