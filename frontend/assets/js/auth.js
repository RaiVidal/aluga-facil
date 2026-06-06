(function () {
    const AUTH_API_URL = "http://127.0.0.1:8000/api";

    function onlyNumbers(value) {
        return value.replace(/\D/g, "");
    }

    function maskCPF(value) {
        value = onlyNumbers(value).slice(0, 11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        return value;
    }

    function maskPhone(value) {
        value = onlyNumbers(value).slice(0, 11);
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        return value;
    }

    function isAlphaNumericPassword(password) {
        return /[A-Za-z]/.test(password) && /\d/.test(password) && password.length >= 6;
    }

    function saveUser(user) {
        localStorage.setItem("alugaFacilUser", JSON.stringify(user));
    }

    function getUser() {
        const user = localStorage.getItem("alugaFacilUser");
        return user ? JSON.parse(user) : null;
    }

    function logout() {
        localStorage.removeItem("alugaFacilUser");
        localStorage.removeItem("alugaFacilToken");
        window.location.href = "./login.html";
    }

    function protectPage(requiredRole = null) {
        const user = getUser();

        if (!user) {
            window.location.href = "./login.html";
            return;
        }

        if (requiredRole && user.role !== requiredRole) {
            window.location.href = user.role === "admin" ? "./dashboard-admin.html" : "./dashboard-cliente.html";
        }
    }

    window.logout = logout;
    window.protectPage = protectPage;
    window.getUser = getUser;

    const cpfInput = document.getElementById("signup-cpf");
    const phoneInput = document.getElementById("signup-phone");
    const cnhInput = document.getElementById("signup-cnh");

    if (cpfInput) cpfInput.addEventListener("input", () => cpfInput.value = maskCPF(cpfInput.value));
    if (phoneInput) phoneInput.addEventListener("input", () => phoneInput.value = maskPhone(phoneInput.value));
    if (cnhInput) cnhInput.addEventListener("input", () => cnhInput.value = onlyNumbers(cnhInput.value).slice(0, 11));

    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const btnSubmit = loginForm.querySelector("button[type=submit]");
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Entrando...";

            const data = {
                email: document.getElementById("login-email").value,
                password: document.getElementById("login-password").value,
            };

            try {
                const response = await fetch(`${AUTH_API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(result.message || "E-mail ou senha inválidos.");
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Entrar";
                    return;
                }

                saveUser(result.user);

                if (result.token) {
                    localStorage.setItem("alugaFacilToken", result.token);
                }

                window.location.href = result.user.role === "admin"
                    ? "./dashboard-admin.html"
                    : "./dashboard-cliente.html";

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Entrar";
            }
        });
    }

    const signupForm = document.getElementById("signup-form");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const btnSubmit = signupForm.querySelector("button[type=submit]");
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Criando conta...";

            const password = document.getElementById("signup-password").value;
            const confirmPassword = document.getElementById("signup-confirm-password").value;

            if (!isAlphaNumericPassword(password)) {
                alert("A senha deve ter no mínimo 6 caracteres, com letras e números.");
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Criar conta";
                return;
            }

            if (password !== confirmPassword) {
                alert("As senhas não conferem.");
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Criar conta";
                return;
            }

            const data = {
                name: document.getElementById("signup-name").value,
                cpf: onlyNumbers(document.getElementById("signup-cpf").value),
                email: document.getElementById("signup-email").value,
                phone: onlyNumbers(document.getElementById("signup-phone").value),
                cnh: onlyNumbers(document.getElementById("signup-cnh").value),
                cnh_category: document.getElementById("signup-category").value,
                password: password,
                role: "cliente",
            };

            try {
                const response = await fetch(`${AUTH_API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(result.message || "Erro ao criar conta.");
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Criar conta";
                    return;
                }

                saveUser(result.user);

                if (result.token) {
                    localStorage.setItem("alugaFacilToken", result.token);
                }

                window.location.href = "./dashboard-cliente.html";

            } catch (error) {
                alert("Erro ao conectar com o servidor.");
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Criar conta";
            }
        });
    }
})();