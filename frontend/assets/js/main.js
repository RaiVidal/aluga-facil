const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

function getVehicleImage(image) {
    if (!image) return "assets/img/car-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${STORAGE_URL}/${image}`;
}

function onlyNumbers(value) {
    return value.replace(/\D/g, "");
}

function maskPhone(value) {
    value = onlyNumbers(value).slice(0, 11);
    value = value.replace(/(\d{2})(\d)/, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");
    return value;
}

async function buscarVeiculosDisponiveis() {
    const response = await fetch(`${API_URL}/vehicles`);
    const vehicles = await response.json();

    return vehicles.filter(vehicle => {
        return Number(vehicle.available) === 1 || vehicle.available === true;
    });
}

async function carregarVeiculosHome() {
    const container = document.getElementById("home-vehicles-container");

    if (!container) return;

    try {
        const disponiveis = await buscarVeiculosDisponiveis();

        container.innerHTML = "";

        if (disponiveis.length === 0) {
            container.innerHTML = `<p>Nenhum veículo disponível no momento.</p>`;
            return;
        }

        disponiveis.slice(0, 3).forEach(vehicle => {
            container.innerHTML += `
                <article class="vehicle-card">
                    <div class="vehicle-thumb">
                        <img 
                            src="${getVehicleImage(vehicle.image)}"
                            alt="${vehicle.name}"
                            onerror="this.src='assets/img/car-placeholder.jpg'"
                        >
                    </div>

                    <h3>${vehicle.name}</h3>

                    <p>${vehicle.description || "Veículo disponível para locação."}</p>

                    <div class="tags">
                        <span class="tag">${vehicle.brand || "-"}</span>
                        <span class="tag">${vehicle.model || "-"}</span>
                        <span class="tag">${vehicle.year || "-"}</span>
                    </div>

                    <div class="actions-inline" style="justify-content:space-between; margin-top:18px;">
                        <div class="price">
                            R$ ${Number(vehicle.price_per_day || 0).toFixed(2)}
                            <span>/ diária</span>
                        </div>

                        <a class="btn btn-primary" href="pages/veiculo-detalhe.html?id=${vehicle.id}">
                            Detalhes
                        </a>
                    </div>
                </article>
            `;
        });

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        container.innerHTML = `<p>Erro ao carregar veículos disponíveis.</p>`;
    }
}

async function carregarModelosNoFormulario() {
    const select = document.getElementById("home-budget-vehicle");

    if (!select) return;

    try {
        const disponiveis = await buscarVeiculosDisponiveis();

        select.innerHTML = `<option value="">Selecione um veículo</option>`;

        if (disponiveis.length === 0) {
            select.innerHTML = `<option value="">Nenhum veículo disponível</option>`;
            return;
        }

        disponiveis.forEach(vehicle => {
            select.innerHTML += `
                <option value="${vehicle.name}">
                    ${vehicle.name} - ${vehicle.brand || ""} ${vehicle.model || ""}
                </option>
            `;
        });

    } catch (error) {
        console.error("Erro ao carregar modelos:", error);
        select.innerHTML = `<option value="">Erro ao carregar veículos</option>`;
    }
}

function configurarFormularioOrcamentoHome() {
    const form = document.getElementById("home-budget-form");
    const phoneInput = document.getElementById("home-budget-phone");

    if (phoneInput) {
        phoneInput.addEventListener("input", () => {
            phoneInput.value = maskPhone(phoneInput.value);
        });
    }

    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const button = document.getElementById("home-budget-button");

        button.disabled = true;
        button.textContent = "Enviando...";

        const name = document.getElementById("home-budget-name").value;
        const phone = onlyNumbers(document.getElementById("home-budget-phone").value);
        const vehicle = document.getElementById("home-budget-vehicle").value;
        const startDate = document.getElementById("home-budget-start-date").value;
        const endDate = document.getElementById("home-budget-end-date").value;
        const cityStart = document.getElementById("home-budget-city-start").value;
        const cityEnd = document.getElementById("home-budget-city-end").value;
        const category = document.getElementById("home-budget-category").value;

        const data = {
            name,
            phone,
            vehicle,
            start_date: startDate,
            end_date: endDate,
            message: `Cidade de retirada: ${cityStart}. Cidade de devolução: ${cityEnd}. Categoria: ${category || "Não informada"}.`
        };

        try {
            const response = await fetch(`${API_URL}/budget-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Erro ao enviar orçamento.");
                button.disabled = false;
                button.textContent = "Solicitar orçamento agora";
                return;
            }

            alert("Orçamento enviado com sucesso!");
            form.reset();

            await carregarModelosNoFormulario();

        } catch (error) {
            console.error("Erro ao enviar orçamento:", error);
            alert("Erro ao conectar com o servidor.");
        }

        button.disabled = false;
        button.textContent = "Solicitar orçamento agora";
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarVeiculosHome();
    await carregarModelosNoFormulario();
    configurarFormularioOrcamentoHome();
});