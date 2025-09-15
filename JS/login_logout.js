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

// ========== Sign Up ==========
function attachSignUpHandler() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  const emailMsg = document.getElementById("email-msg");
  const passMsg = document.getElementById("pass-msg");
  const confirmMsg = document.getElementById("confirm-msg");

  emailInput.addEventListener("input", () => {
    const check = validateEmail(emailInput.value.trim());
    emailMsg.textContent = check.msg;
    if (check.valid) {
      emailMsg.classList.remove("text-danger");
      emailMsg.classList.add("text-success");
    } else {
      emailMsg.classList.add("text-danger");
      emailMsg.classList.remove("text-success");
    }
  });

  passwordInput.addEventListener("input", () => {
    if (!validatePassword(passwordInput.value)) {
      passMsg.textContent =
        "Password must have number, uppercase, symbol, and ≥8 chars";
      passMsg.classList.add("text-danger");
      passMsg.classList.remove("text-success");
    } else {
      passMsg.textContent = "Strong password ✅";
      passMsg.classList.remove("text-danger");
      passMsg.classList.add("text-success");
    }
  });

  confirmInput.addEventListener("input", () => {
    if (confirmInput.value !== passwordInput.value) {
      confirmMsg.textContent = "Passwords do not match";
      confirmMsg.classList.add("text-danger");
      confirmMsg.classList.remove("text-success");
    } else {
      confirmMsg.textContent = "Passwords match ✅";
      confirmMsg.classList.remove("text-danger");
      confirmMsg.classList.add("text-success");
    }
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

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

// ========== Login ==========
function attachLoginHandler() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const emailMsg = document.getElementById("login-email-msg");
  const passMsg = document.getElementById("login-pass-msg");

  emailInput.addEventListener("input", () => {
    const check = validateEmail(emailInput.value.trim());
    emailMsg.textContent = check.msg;
    if (check.valid) {
      emailMsg.classList.remove("text-danger");
      emailMsg.classList.add("text-success");
    } else {
      emailMsg.classList.add("text-danger");
      emailMsg.classList.remove("text-success");
    }
  });

  passwordInput.addEventListener("input", () => {
    if (!validatePassword(passwordInput.value)) {
      passMsg.textContent =
        "Password must have number, uppercase, symbol, and at least 8 chars";
      passMsg.classList.add("text-danger");
      passMsg.classList.remove("text-success");
    } else {
      passMsg.textContent = "Strong password ✅";
      passMsg.classList.remove("text-danger");
      passMsg.classList.add("text-success");
    }
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const check = validateEmail(email);
    if (!check.valid || !validatePassword(password)) {
      Swal.fire({ icon: "error", title: "Invalid email or password format" });
      return;
    }

    const users = loadUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      Swal.fire({ icon: "error", title: "Invalid credentials" });
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
      window.location.href = "Home.html";
    });
  });
}

// ========== Logout ==========
// ============================
// ============================
function LogOut() {
  Swal.fire({
    position: "center",
    icon: "success",
    title: "You have been logged out",
    showConfirmButton: false,
    timer: 1200,
  }).then(() => {
    localStorage.removeItem(CurrentUserStorage);
    window.location.replace("login.html");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();
  attachSignUpHandler();
  attachLoginHandler();
});


// ========= Eye Icon =========
// ============================
// ============================


const eye1 = document.getElementById("togglePassword");
const eye2 = document.getElementById("toggleConfirmPassword");
const eye3 = document.getElementById("toggleLoginPassword");

if (eye1){
    eye1.addEventListener("click" , () => {
        let input = document.getElementById("password");
        let type = input.type === "password" ? "text" : "password";
        input.type = type;
        let icon = eye1.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });
}

if (eye2){
    eye2.addEventListener("click" , () => {
        let input = document.getElementById("confirmPassword");
        let type = input.type === "password" ? "text" : "password";
        input.type = type;
        let icon = eye2.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });
}

if (eye3){
    eye3.addEventListener("click" , () => {
        let input = document.getElementById("password");
        let type = input.type === "password" ? "text" : "password";
        input.type = type;
        let icon = eye3.querySelector("i");
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");
    });
}

