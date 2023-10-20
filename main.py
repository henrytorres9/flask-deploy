from flask import Flask, render_template, request, jsonify
import os
import cv2
import numpy as np
import requests


# URL de los archivos en GitHub
weights_url = "https://github.com/henrytorres9/flask-deploy/blob/main/yolov3.weights"
cfg_url = "https://raw.githubusercontent.com/henrytorres9/flask-deploy/main/yolov3.cfg"
coco_names_url = "https://raw.githubusercontent.com/henrytorres9/flask-deploy/main/coco.names"

# Descargar los archivos desde GitHub
with open("yolov3.weights", "wb") as weights_file:
    weights_file.write(requests.get(weights_url).content)

with open("yolov3.cfg", "wb") as cfg_file:
    cfg_file.write(requests.get(cfg_url).content)

with open("coco.names", "wb") as coco_names_file:
    coco_names_file.write(requests.get(coco_names_url).content)


app = Flask(__name__)


# Cargar la configuración y los pesos pre-entrenados
net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
layer_names = net.getUnconnectedOutLayersNames()

# Cargar las clases
with open("coco.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        image_path = "uploaded_image.jpg"
        file.save(image_path)
        boxes, confidences, class_ids, detected_classes = detect_objects(image_path)

        # Se devuelven los resultados en formato JSON
        results = [{'label': label, 'confidence': confidence} for label, confidence in zip(detected_classes, confidences)]

        return jsonify({'results': results})

def detect_objects(image_path):
    img = cv2.imread(image_path)
    height, width = img.shape[:2]

    # Preprocesar la imagen para la entrada de la red neuronal
    blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    outs = net.forward(layer_names)

    # Listas para almacenar información sobre las detecciones
    class_ids = []
    confidences = []
    boxes = []

    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > 0.5:
                # Coordenadas del cuadro delimitador
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)

                # Esquina superior izquierda del cuadro delimitador
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    # Aplicar supresión de no máximos (NMS)
    indices = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)

    # Almacenar las detecciones finales
    final_boxes = [boxes[i] for i in indices]
    final_confidences = [confidences[i] for i in indices]
    final_class_ids = [class_ids[i] for i in indices]
    detected_classes = [classes[class_id] for class_id in final_class_ids]

    return final_boxes, final_confidences, final_class_ids, detected_classes


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
