(function () {
  const API_URL = window.API_URL || "http://127.0.0.1:8000/api";

  async function carregarClientes() {
      const tabela = document.getElementById("tabelaClientes");

      try {
          const response = await fetch(`${API_URL}/users`);
          const clientes = await response.json();

          if (!response.ok) {
              tabela.innerHTML = `<tr><td colspan="7">Erro ao carregar clientes.</td></tr>`;
              return;
          }

          document.getElementById("total").textContent = clientes.length;
          document.getElementById("ativos").textContent = clientes.length;
          document.getElementById("inativos").textContent = 0;

          if (clientes.length === 0) {
              tabela.innerHTML = `<tr><td colspan="7">Nenhum cliente cadastrado.</td></tr>`;
              return;
          }

          tabela.innerHTML = "";

          clientes.forEach(cliente => {
              tabela.innerHTML += `
                  <tr>
                      <td>${cliente.name || "-"}</td>
                      <td>${cliente.cpf || "-"}</td>
                      <td>${cliente.phone || "-"}</td>
                      <td>${cliente.email || "-"}</td>
                      <td>${cliente.cnh || "-"}</td>
                      <td>${cliente.cnh_category || "-"}</td>
                      <td><span class="badge">Ativo</span></td>
                  </tr>
              `;
          });

      } catch (error) {
          console.error("Erro ao carregar clientes:", error);
          tabela.innerHTML = `<tr><td colspan="7">Erro na conexão com o servidor.</td></tr>`;
      }
  }

  carregarClientes();
})();