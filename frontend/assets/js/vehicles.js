(function () {
    const VEHICLES_API_URL = "http://127.0.0.1:8000/api";
    const STORAGE_URL = "http://127.0.0.1:8000/storage";

    function imageUrl(image) {
        if (!image) return "../assets/img/car-placeholder.jpg";
        if (image.startsWith("http")) return image;
        return `${STORAGE_URL}/${image}`;
    }

    async function carregarVeiculos() {
        const container = document.getElementById("vehicles-container");
        if (!container) return;

        try {
            const response = await fetch(`${VEHICLES_API_URL}/vehicles`);
            const vehicles = await response.json();

            container.innerHTML = "";

            if (!vehicles.length) {
                container.innerHTML = `<p class="vehicles-empty">Nenhum veículo cadastrado ainda.</p>`;
                return;
            }

            vehicles.forEach(vehicle => {
                const disponivel = Number(vehicle.available) === 1 || vehicle.available === true;

                container.innerHTML += `
                    <article class="vehicle-card">
                        <div class="vehicle-thumb">
                            <img 
                                src="${imageUrl(vehicle.image)}"
                                alt="${vehicle.name || "Veículo"}"
                                onerror="this.src='../assets/img/car-placeholder.jpg'"
                            >
                        </div>

                        <h3>${vehicle.name || "-"}</h3>
                        <p>${vehicle.description || "Veículo disponível para locação."}</p>

                        <div class="tags">
                            <span class="tag">${vehicle.brand || "-"}</span>
                            <span class="tag">${vehicle.model || "-"}</span>
                            <span class="tag">${vehicle.year || "-"}</span>
                            <span class="tag">${disponivel ? "Disponível" : "Indisponível"}</span>
                        </div>

                        <div class="actions-inline" style="justify-content:space-between; margin-top:18px;">
                            <div class="price">
                                R$ ${Number(vehicle.price_per_day || 0).toFixed(2)}
                                <span>/ diária</span>
                            </div>

                            <a href="veiculo-detalhe.html?id=${vehicle.id}" class="btn btn-primary">
                                Ver detalhes
                            </a>
                        </div>
                    </article>
                `;
            });

        } catch (error) {
            console.error("Erro ao carregar veículos:", error);
            container.innerHTML = `<p class="vehicles-error">Erro ao carregar veículos.</p>`;
        }
    }

    document.addEventListener("DOMContentLoaded", carregarVeiculos);
})();