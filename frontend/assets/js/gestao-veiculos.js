const API_URL = "http://127.0.0.1:8000/api";
const STORAGE_URL = "http://127.0.0.1:8000/storage";

let vehiclesCache = [];

function getVehicleImageUrl(image) {
    if (!image) {
        return "../assets/img/car-placeholder.jpg";
    }

    if (image.startsWith("http")) {
        return image;
    }

    return `${STORAGE_URL}/${image}`;
}

async function carregarGestaoVeiculos() {
    const tbody = document.getElementById("tabelaVeiculos");

    try {
        const response = await fetch(`${API_URL}/vehicles`);
        const vehicles = await response.json();

        vehiclesCache = vehicles;

        document.getElementById("total").textContent = vehicles.length;

        const disponiveis = vehicles.filter(vehicle => Number(vehicle.available) === 1 || vehicle.available === true).length;
        const indisponiveis = vehicles.length - disponiveis;

        document.getElementById("disponiveis").textContent = disponiveis;
        document.getElementById("indisponiveis").textContent = indisponiveis;

        if (vehicles.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum veículo cadastrado.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";

        vehicles.forEach(vehicle => {
            const available = Number(vehicle.available) === 1 || vehicle.available === true;

            tbody.innerHTML += `
                <tr>
                    <td>
                        <img 
                            src="${getVehicleImageUrl(vehicle.image)}" 
                            alt="${vehicle.name}" 
                            style="width:80px;height:55px;object-fit:contain;"
                            onerror="this.src='../assets/img/car-placeholder.jpg'"
                        >
                    </td>
                    <td>
                        <strong>${vehicle.name}</strong><br>
                        <small>${vehicle.brand} - ${vehicle.model}</small>
                    </td>
                    <td>${vehicle.year}</td>
                    <td>R$ ${Number(vehicle.price_per_day).toFixed(2)}</td>
                    <td>${available ? "Disponível" : "Indisponível"}</td>
                    <td>
                        <button class="btn btn-secondary" onclick="preencherEdicao(${vehicle.id})">Editar</button>
                        <button class="btn btn-primary" onclick="excluirVeiculo(${vehicle.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Erro ao carregar veículos:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Erro ao carregar veículos.</td>
            </tr>
        `;
    }
}

function preencherEdicao(id) {
    const vehicle = vehiclesCache.find(item => item.id === id);

    if (!vehicle) {
        alert("Veículo não encontrado.");
        return;
    }

    document.getElementById("edit_id").value = vehicle.id;
    document.getElementById("edit_name").value = vehicle.name;
    document.getElementById("edit_brand").value = vehicle.brand;
    document.getElementById("edit_model").value = vehicle.model;
    document.getElementById("edit_year").value = vehicle.year;
    document.getElementById("edit_price_per_day").value = vehicle.price_per_day;
    document.getElementById("edit_description").value = vehicle.description || "";
    document.getElementById("edit_available").value = (Number(vehicle.available) === 1 || vehicle.available === true) ? "1" : "0";

    const preview = document.getElementById("edit_preview_image");
    preview.src = getVehicleImageUrl(vehicle.image);
    preview.style.display = "block";

    document.getElementById("edit_image_file").value = "";

    window.scrollTo({
        top: document.getElementById("edit-vehicle-form").offsetTop - 120,
        behavior: "smooth"
    });
}

document.getElementById("edit-vehicle-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = document.getElementById("edit_id").value;

    if (!id) {
        alert("Clique em editar em algum veículo antes de salvar.");
        return;
    }

    const formData = new FormData();

    formData.append("_method", "PUT");
    formData.append("name", document.getElementById("edit_name").value);
    formData.append("brand", document.getElementById("edit_brand").value);
    formData.append("model", document.getElementById("edit_model").value);
    formData.append("year", document.getElementById("edit_year").value);
    formData.append("price_per_day", document.getElementById("edit_price_per_day").value);
    formData.append("description", document.getElementById("edit_description").value);
    formData.append("available", document.getElementById("edit_available").value);

    const newImage = document.getElementById("edit_image_file").files[0];

    if (newImage) {
        formData.append("image", newImage);
    }

    try {
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("alugaFacilToken")}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Erro da API:", result);
            alert("Erro ao atualizar veículo.");
            return;
        }

        alert("Veículo atualizado com sucesso!");

        document.getElementById("edit-vehicle-form").reset();
        document.getElementById("edit_id").value = "";
        document.getElementById("edit_preview_image").src = "";
        document.getElementById("edit_preview_image").style.display = "none";

        carregarGestaoVeiculos();

    } catch (error) {
        console.error("Erro ao atualizar veículo:", error);
        alert("Erro na conexão com o servidor.");
    }
});

document.getElementById("edit_image_file").addEventListener("change", function () {
    const file = this.files[0];
    const preview = document.getElementById("edit_preview_image");

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        preview.src = event.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
});

async function excluirVeiculo(id) {
    const confirmar = confirm("Tem certeza que deseja excluir este veículo?");

    if (!confirmar) return;

    try {
        const response = await fetch(`${API_URL}/vehicles/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("alugaFacilToken")}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Erro da API:", result);
            alert("Erro ao excluir veículo.");
            return;
        }

        alert("Veículo excluído com sucesso!");
        carregarGestaoVeiculos();

    } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        alert("Erro na conexão com o servidor.");
    }
}

carregarGestaoVeiculos();