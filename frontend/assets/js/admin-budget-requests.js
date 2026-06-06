(function () {
    const API_URL = window.API_URL || "http://127.0.0.1:8000/api";

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

    async function carregarDashboardAdmin() {
        const totalVehicles = document.getElementById("admin-total-vehicles");

        if (!totalVehicles) return;

        try {
            const response = await fetch(`${API_URL}/admin/stats`);
            const data = await response.json();

            document.getElementById("admin-total-vehicles").textContent = data.vehicles_total ?? 0;
            document.getElementById("admin-total-clients").textContent = data.clients_total ?? 0;
            document.getElementById("admin-total-requests").textContent = data.budget_requests_total ?? 0;

            document.getElementById("admin-available-vehicles").textContent = data.vehicles_available ?? 0;
            document.getElementById("admin-unavailable-vehicles").textContent = data.vehicles_unavailable ?? 0;
            document.getElementById("admin-operational-requests").textContent = data.budget_requests_total ?? 0;
            document.getElementById("admin-operational-clients").textContent = data.clients_total ?? 0;

            const recentContainer = document.getElementById("recent-requests-container");
            const recent = data.budget_requests_recent || [];

            if (!recentContainer) return;

            if (recent.length === 0) {
                recentContainer.innerHTML = "<p>Nenhuma solicitação recente.</p>";
                return;
            }

            recentContainer.innerHTML = "";

            recent.forEach(item => {
                recentContainer.innerHTML += `
                    <div class="list-row">
                        <div>
                            <strong>${item.vehicle || "Veículo não informado"}</strong>
                            <div class="small">
                                ${item.name || "Cliente"} • ${item.start_date || "-"} a ${item.end_date || "-"}
                            </div>
                        </div>
                        <span class="${getStatusClass(item.status)}">${formatStatus(item.status)}</span>
                    </div>
                `;
            });

        } catch (error) {
            console.error("Erro ao carregar dashboard admin:", error);
        }
    }

    async function carregarOrcamentos() {
        const container = document.getElementById("budget-requests-container");

        if (!container) return;

        try {
            const response = await fetch(`${API_URL}/budget-requests`);
            const requests = await response.json();

            if (!requests.length) {
                container.innerHTML = "<p>Nenhuma solicitação encontrada.</p>";
                return;
            }

            container.innerHTML = "";

            requests.forEach(item => {
                container.innerHTML += `
                    <div class="stat-card">
                        <span class="${getStatusClass(item.status)}">${formatStatus(item.status)}</span>

                        <h3 style="margin-top:12px;">${item.name || "Cliente"}</h3>

                        <p><strong>Telefone:</strong> ${item.phone || "-"}</p>
                        <p><strong>Veículo:</strong> ${item.vehicle || "-"}</p>
                        <p><strong>Retirada:</strong> ${item.start_date || "-"}</p>
                        <p><strong>Devolução:</strong> ${item.end_date || "-"}</p>
                        <p><strong>Observação:</strong> ${item.message || "Sem observações"}</p>

                        <div style="margin-top:14px; display:flex; gap:8px; flex-wrap:wrap;">
                            <button onclick="updateStatusOrcamento(${item.id}, 'pendente')" class="btn btn-secondary">Pendente</button>
                            <button onclick="updateStatusOrcamento(${item.id}, 'em_analise')" class="btn btn-secondary">Em análise</button>
                            <button onclick="updateStatusOrcamento(${item.id}, 'aprovado')" class="btn btn-primary">Aprovar</button>
                            <button onclick="updateStatusOrcamento(${item.id}, 'rejeitado')" class="btn btn-secondary">Rejeitar</button>
                            <button onclick="updateStatusOrcamento(${item.id}, 'concluido')" class="btn btn-dark">Concluir</button>
                        </div>
                    </div>
                `;
            });

        } catch (error) {
            console.error("Erro ao carregar orçamentos:", error);
            container.innerHTML = "<p>Erro ao carregar solicitações.</p>";
        }
    }

    window.updateStatusOrcamento = async function (id, status) {
        try {
            const response = await fetch(`${API_URL}/budget-requests/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                alert("Erro ao atualizar status.");
                return;
            }

            await carregarDashboardAdmin();
            await carregarOrcamentos();

        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            alert("Erro na conexão com o servidor.");
        }
    };

    carregarDashboardAdmin();
    carregarOrcamentos();
})();