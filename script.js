// Inicializa EmailJS
emailjs.init("TU_USER_ID_EMAILJS"); // Reemplaza con tu USER ID

document.getElementById("contribucionesForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const emailUsuario = this.email.value;
    const certificadoFile = document.getElementById("certificado").files[0];

    // Validar PDF de mínimo 2 páginas
    const pdfBytes = await certificadoFile.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    if (pdfDoc.getPageCount() < 2) {
        alert("El certificado debe tener al menos 2 páginas.");
        return;
    }

    // Crear CSV con los datos del formulario
    const formData = new FormData(this);
    let csvContent = "Nombre del Campo,Valor\n";
    formData.forEach((value, key) => {
        if (key !== "certificado") {
            csvContent += `"${key}","${value}"\n`;
        }
    });

    // Convertir CSV y PDF a Base64
    const csvBlob = new Blob([csvContent], { type: 'text/csv' });
    const csvBase64 = await blobToBase64(csvBlob);
    const pdfBase64 = await blobToBase64(certificadoFile);

    // Parámetros para EmailJS
    let templateParams = {
        to_email: "entiende.tus.contribuciones@gmail.com",
        from_email: emailUsuario,
        message: "Nuevo caso enviado desde la aplicación web",
        csv_attachment: csvBase64,
        pdf_attachment: pdfBase64,
        csv_filename: "datos.csv",
        pdf_filename: certificadoFile.name
    };

    try {
        await emailjs.send("TU_SERVICE_ID", "TU_TEMPLATE_ID", templateParams);
        window.location.href = "resultado.html";
    } catch (err) {
        alert("Error al enviar el formulario. Inténtelo más tarde.");
        console.error(err);
    }
});

// Función para convertir Blob a Base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

