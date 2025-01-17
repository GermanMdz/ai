const $ = (id) => document.getElementById(id);

// Crear el canvas con Fabric.js
const canvas = new fabric.Canvas('canvasEl', {
    isDrawingMode: true,
});

canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
fabric.Object.prototype.transparentCorners = false;

// Funcionalidad para borrar el canvas
const clearEl = $('clearEl');
clearEl.onclick = function () {
    canvas.clear();
};

// Funcionalidad para predecir el número dibujado en el canvas
const predictEl = $('predictEl');
predictEl.onclick = function () {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = 28;
    tempCanvas.height = 28;

    const img = new Image();
    img.src = canvas.toDataURL('image/png');

    img.onload = function () {
        tempCtx.drawImage(img, 0, 0, 28, 28);

        const imageData = tempCtx.getImageData(0, 0, 28, 28);
        const data = imageData.data;

        const normalizedArray = [];
        for (let i = 0; i < data.length; i += 4) {
            const gray = data[i + 3]; // El valor de gris está en el canal alpha (i + 3)
            const normalizedGray = gray / 255;
            normalizedArray.push(normalizedGray);
        }

        console.log('Normalized Array:', normalizedArray);

        // Llamar a la función getOutput con el array normalizado
        getNeuralNetwork()
            .then(nn => {
                getOutput(nn, normalizedArray)
                    .then(result => {
                        console.log('Resultado de la predicción:', result);
                    })
                    .catch(error => console.error('Error en la predicción:', error));
            })
            .catch(error => console.error('Error al cargar el modelo:', error));
    };
};

// Configuración de la brocha
if (canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush.width = parseInt(10, 10) || 1;
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
    });
}

// Función para obtener el modelo de la red neuronal
async function getNeuralNetwork() {
    const response = await fetch('models/numberClassifier.json');
    return response.json();
}

// Función para obtener la salida de la red neuronal
async function getOutput(nn, x) {
    try {
        const response = await fetch('http://localhost:5000/process_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ neuralNetwork: nn, input: x }),
        });
        const result = await response.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error al obtener la salida:', error);
    }
}
