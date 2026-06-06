const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

function getVehicleId() {
    return new URLSearchParams(window.location.search).get("id");
}

function getVehicleImageUrl(image) {
    if (!image) return "../assets/img/car-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `${STORAGE_URL}/${image}`;
}

async function loadVehicle() {
    const id = getVehicleId();
    const container = document.getElementById("vehicle-detail");

    if (!id) {
        container.innerHTML = `<p>Veículo não encontrado.</p>`;
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vehicles/${id}`);

        if (!response.ok) {
            container.innerHTML = `
                <section class="section">
                    <div class="container">
                        <p>Veículo não encontrado.</p>
                        <a class="btn btn-secondary" href="veiculos.html">Voltar ao catálogo</a>
                    </div>
                </section>
            `;
            return;
        }

        const vehicle = await response.json();
        const available = Number(vehicle.available) === 1 || vehicle.available === true;

        container.innerHTML = `
            <section class="page-hero">
                <div class="container">
                    <div class="eyebrow">Detalhes do veículo</div>
                    <h1>${vehicle.name}</h1>
                    <p>Confira as informações reais cadastradas para este veículo.</p>
                </div>
            </section>

            <section class="section" style="padding-top:8px;">
                <div class="container vehicle-detail">
                    <div class="gallery-main">
                        <img 
                            src="${getVehicleImageUrl(vehicle.image)}"
                            alt="${vehicle.name}"
                            onerror="this.src='../assets/img/car-placeholder.jpg'"
                        >
                    </div>

                    <div class="form-card">
                        <h3>${vehicle.name}</h3>

                        <p>${vehicle.description || "Descrição não informada."}</p>

                        <div class="tags">
                            <span class="tag">${vehicle.brand}</span>
                            <span class="tag">${vehicle.model}</span>
                            <span class="tag">Ano ${vehicle.year}</span>
                            <span class="tag">${available ? "Disponível" : "Indisponível"}</span>
                        </div>

                        <div class="price" style="margin-top:8px;">
                            R$ ${Number(vehicle.price_per_day).toFixed(2)}
                            <span>/ diária</span>
                        </div>

                        <div class="spec-list">
                            <div class="spec-item">
                                <strong>Marca</strong>
                                <span class="small">${vehicle.brand}</span>
                            </div>

                            <div class="spec-item">
                                <strong>Modelo</strong>
                                <span class="small">${vehicle.model}</span>
                            </div>

                            <div class="spec-item">
                                <strong>Ano</strong>
                                <span class="small">${vehicle.year}</span>
                            </div>

                            <div class="spec-item">
                                <strong>Status</strong>
                                <span class="small">${available ? "Disponível" : "Indisponível"}</span>
                            </div>
                        </div>

                        <div class="actions-inline" style="margin-top:14px;">
                            <a class="btn btn-primary" href="orcamento.html">Solicitar orçamento</a>
                            <a class="btn btn-secondary" href="veiculos.html">Voltar ao catálogo</a>
                        </div>
                    </div>
                </div>
            </section>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p>Erro ao carregar veículo.</p>`;
    }
}

loadVehicle();