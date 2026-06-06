(function () {
    const API_URL = window.API_URL || "http://127.0.0.1:8000/api";

    function getLoggedUser() {
        const user = localStorage.getItem("alugaFacilUser");
        return user ? JSON.parse(user) : null;
    }

    function formatStatus(status) {
        const statusMap = {
            pendente: "Pendente",
            em_analise: "Em análise",
            aprovado: "Aprovado",
            rejeitado: "Rejeitado",
            concluido: "Concluído",
        };

        return statusMap[status] || "Pendente";
    }

    function getStatusClass(status) {
        const classMap = {
            pendente: "badge",
            em_analise: "badge",
            aprovado: "badge dark",
            rejeitado: "badge dark",
            concluido: "badge dark",
        };

        return classMap[status] || "badge";
    }

    async function carregarDashboardCliente() {
        const user = getLoggedUser();

        if (!user) {
            window.location.href = "login.html";
            return;
        }

        document.getElementById("client-name").textContent = user.name || "-";
        document.getElementById("client-email").textContent = user.email || "-";
        document.getElementById("client-phone").textContent = user.phone || "-";
        document.getElementById("client-cnh").textContent = user.cnh_category || "-";

        const container = document.getElementById("client-requests-container");

        try {
            const response = await fetch(`${API_URL}/budget-requests/user/${user.id}`);
            const requests = await response.json();

            document.getElementById("total-requests").textContent = requests.length;

            if (!requests.length) {
                container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
                return;
            }

            container.innerHTML = "";

            requests.forEach(item => {
                container.innerHTML += `
                    <div class="list-row">
                        <div>
                            <strong>${item.vehicle || "Veículo não informado"}</strong>
                            <div class="small">
                                Retirada: ${item.start_date || "-"} • Devolução: ${item.end_date || "-"}
                            </div>
                        </div>

                        <span class="${getStatusClass(item.status)}">${formatStatus(item.status)}</span>
                    </div>
                `;
            });

        } catch (error) {
            console.error("Erro ao carregar solicitações:", error);
            container.innerHTML = "<p>Erro ao carregar solicitações.</p>";
        }
    }

    carregarDashboardCliente();
})();