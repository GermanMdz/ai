from flask import Flask, request, jsonify
import numpy as np
from AI.Classifier import BaseClassifier
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
def parseAtributes(data):
    w,b = [], []
    num_layers = len([key for key in data.keys() if 'layer' in key])
    for layer in range(num_layers):
        layer_key = f'layer{layer}'
        w.append(data[layer_key]['weights'])
        b.append(data[layer_key]['biases'])
    return w, b

@app.route('/process_data', methods=['POST'])
def process_data():
    nn = request.json.get("neuralNetwork", [])
    x = np.array(request.json.get("input", []))
    x = x.reshape(-1, 1)
    x = x / 255.0
    w,b = parseAtributes(nn)
    neuralNetwork = BaseClassifier(w,b)
    result = neuralNetwork.getOutput(x)
    return jsonify(np.argmax(result).tolist())

if __name__ == "__main__":
    app.run(debug=True)
    
