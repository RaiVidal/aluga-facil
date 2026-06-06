(function () {
  const API_URL = window.API_URL || "http://127.0.0.1:8000/api";

  function formatStatus(status) {
      const map = {
          pendente: "Pendente",
          confirmada: "Confirmada",
          em_andamento: "Em andamento",
          concluida: "Concluída",
          cancelada: "Cancelada",
      };

      return map[status] || status || "-";
  }

  function getVehicleName(vehicle) {
      return vehicle.name || vehicle.nome || "Veículo sem nome";
  }

  function getVehicleBrand(vehicle) {
      return vehicle.brand || vehicle.marca || "-";
  }

  function getVehicleModel(vehicle) {
      return vehicle.model || vehicle.modelo || "-";
  }

  function getVehiclePrice(vehicle) {
      return vehicle.price_per_day || vehicle.preço_por_dia || vehicle.preco_por_dia || 0;
  }

  function isVehicleAvailable(vehicle) {
      return (
          vehicle.available === true ||
          vehicle.available === 1 ||
          vehicle.disponível === true ||
          vehicle.disponível === 1 ||
          vehicle.disponivel === true ||
          vehicle.disponivel === 1
      );
  }

  async function carregarClientesSelect() {
      const select = document.getElementById("cliente");

      try {
          const response = await fetch(`${API_URL}/users`);
          const clientes = await response.json();

          select.innerHTML = `<option value="">Selecione um cliente</option>`;

          clientes.forEach(cliente => {
              select.innerHTML += `
                  <option value="${cliente.id}">
                      ${cliente.name || "-"} - ${cliente.email || "-"}
                  </option>
              `;
          });

      } catch (error) {
          console.error("Erro ao carregar clientes:", error);
          select.innerHTML = `<option value="">Erro ao carregar clientes</option>`;
      }
  }

  async function carregarVeiculosSelect() {
      const select = document.getElementById("veiculo");

      try {
          const response = await fetch(`${API_URL}/vehicles`);
          const vehicles = await response.json();

          select.innerHTML = `<option value="">Selecione um veículo</option>`;

          const disponiveis = vehicles.filter(isVehicleAvailable);

          if (disponiveis.length === 0) {
              select.innerHTML = `<option value="">Nenhum veículo disponível</option>`;
              return;
          }

          disponiveis.forEach(vehicle => {
              select.innerHTML += `
                  <option value="${vehicle.id}">
                      ${getVehicleName(vehicle)} - ${getVehicleBrand(vehicle)} ${getVehicleModel(vehicle)} - R$ ${Number(getVehiclePrice(vehicle)).toFixed(2)}/dia
                  </option>
              `;
          });

      } catch (error) {
          console.error("Erro ao carregar veículos:", error);
          select.innerHTML = `<option value="">Erro ao carregar veículos</option>`;
      }
  }

  async function carregarReservas() {
      const tabela = document.getElementById("tabelaReservas");

      try {
          const response = await fetch(`${API_URL}/reservations`);
          const reservas = await response.json();

          if (!reservas.length) {
              tabela.innerHTML = `<tr><td colspan="8">Nenhuma reserva encontrada.</td></tr>`;
              return;
          }

          tabela.innerHTML = "";

          reservas.forEach(r => {
              tabela.innerHTML += `
                  <tr>
                      <td>${r.client_name || "-"}</td>
                      <td>${r.vehicle_name || "-"}</td>
                      <td>${r.start_date || "-"}</td>
                      <td>${r.end_date || "-"}</td>
                      <td>${r.total_days || 0} dia(s)</td>
                      <td>R$ ${Number(r.total_value || 0).toFixed(2)}</td>
                      <td>${formatStatus(r.status)}</td>
                      <td>
                          <button onclick="atualizarStatusReserva(${r.id}, 'confirmada')" class="btn btn-primary" style="font-size:11px;padding:6px 10px;margin:2px;">Confirmar</button>
                          <button onclick="atualizarStatusReserva(${r.id}, 'concluida')" class="btn btn-secondary" style="font-size:11px;padding:6px 10px;margin:2px;">Concluir</button>
                          <button onclick="atualizarStatusReserva(${r.id}, 'cancelada')" class="btn btn-secondary" style="font-size:11px;padding:6px 10px;margin:2px;">Cancelar</button>
                      </td>
                  </tr>
              `;
          });

      } catch (error) {
          console.error("Erro ao carregar reservas:", error);
          tabela.innerHTML = `<tr><td colspan="8">Erro ao carregar reservas.</td></tr>`;
      }
  }

  window.atualizarStatusReserva = async function (id, status) {
      try {
          const response = await fetch(`${API_URL}/reservations/${id}/status`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ status })
          });

          const result = await response.json();

          if (!response.ok) {
              alert(result.message || result.error || "Erro ao atualizar status.");
              return;
          }

          await carregarReservas();
          await carregarVeiculosSelect();

      } catch (error) {
          console.error("Erro ao atualizar status:", error);
          alert("Erro na conexão.");
      }
  };

  const form = document.getElementById("reservaForm");

  if (form) {
      form.addEventListener("submit", async function (event) {
          event.preventDefault();

          const data = {
              user_id: document.getElementById("cliente").value,
              vehicle_id: document.getElementById("veiculo").value,
              start_date: document.getElementById("retirada").value,
              end_date: document.getElementById("devolucao").value,
              notes: document.getElementById("observacoes").value,
          };

          try {
              const response = await fetch(`${API_URL}/reservations`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
              });

              const result = await response.json();

              if (!response.ok) {
                  alert(result.message || result.error || "Erro ao criar reserva.");
                  return;
              }

              alert(`Reserva criada! Total: R$ ${Number(result.total_value).toFixed(2)} (${result.total_days} dias)`);

              form.reset();

              await carregarReservas();
              await carregarVeiculosSelect();

          } catch (error) {
              console.error("Erro ao criar reserva:", error);
              alert("Erro na conexão.");
          }
      });
  }

  carregarClientesSelect();
  carregarVeiculosSelect();
  carregarReservas();
})();