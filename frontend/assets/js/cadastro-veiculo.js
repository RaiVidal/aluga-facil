const API_URL = "http://127.0.0.1:8000/api";

const vehicleForm = document.getElementById("vehicle-form");
const imageInput = document.getElementById("image");
const preview = document.getElementById("preview-image");

vehicleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("brand", document.getElementById("brand").value);
    formData.append("model", document.getElementById("model").value);
    formData.append("year", document.getElementById("year").value);
    formData.append("price_per_day", document.getElementById("price_per_day").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("available", "1");

    const imageFile = imageInput.files[0];

    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const response = await fetch(`${API_URL}/vehicles`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Erro da API:", result);
            alert("Erro ao cadastrar veículo.");
            return;
        }

        alert("Veículo cadastrado com sucesso!");
        vehicleForm.reset();
        preview.src = "";
        preview.style.display = "none";

    } catch (error) {
        console.error("Erro na conexão:", error);
        alert("Erro na conexão com o servidor.");
    }
});

imageInput.addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        preview.src = "";
        preview.style.display = "none";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
    };

    reader.readAsDataURL(file);
});