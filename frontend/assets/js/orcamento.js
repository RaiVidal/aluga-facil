(function () {
    const ORCAMENTO_API_URL = "http://127.0.0.1:8000/api";

    const budgetForm = document.getElementById("budget-form");

    function onlyNumbers(value) {
        return value.replace(/\D/g, "");
    }

    function maskPhone(value) {
        value = onlyNumbers(value).slice(0, 11);
        value = value.replace(/(\d{2})(\d)/, "($1) $2");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        return value;
    }

    function getLoggedUserForBudget() {
        const user = localStorage.getItem("alugaFacilUser");
        return user ? JSON.parse(user) : null;
    }

    window.addEventListener("DOMContentLoaded", function () {
        const user = getLoggedUserForBudget();
        const phoneInput = document.getElementById("phone");

        if (phoneInput) {
            phoneInput.addEventListener("input", () => {
                phoneInput.value = maskPhone(phoneInput.value);
            });
        }

        if (user) {
            document.getElementById("name").value = user.name || "";
            document.getElementById("phone").value = maskPhone(user.phone || "");
        }
    });

    if (budgetForm) {
        budgetForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const user = getLoggedUserForBudget();

            if (!user || !user.id) {
                alert("Você precisa fazer login para enviar uma solicitação.");
                window.location.href = "login.html";
                return;
            }

            const button = budgetForm.querySelector("button[type=submit]");
            button.disabled = true;
            button.textContent = "Enviando...";

            const data = {
                user_id: user.id,
                name: document.getElementById("name").value,
                phone: onlyNumbers(document.getElementById("phone").value),
                vehicle: document.getElementById("vehicle").value,
                start_date: document.getElementById("start_date").value,
                end_date: document.getElementById("end_date").value,
                message: document.getElementById("message").value,
            };

            try {
                const response = await fetch(`${ORCAMENTO_API_URL}/budget-requests`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(result.message || "Erro ao enviar orçamento.");
                    button.disabled = false;
                    button.textContent = "Enviar solicitação";
                    return;
                }

                alert("Orçamento enviado com sucesso!");
                budgetForm.reset();
                window.location.href = "dashboard-cliente.html";

            } catch (error) {
                console.error("Erro na conexão:", error);
                alert("Erro na conexão com o servidor.");
                button.disabled = false;
                button.textContent = "Enviar solicitação";
            }
        });
    }
})();