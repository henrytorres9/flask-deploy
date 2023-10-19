from flask import Flask, render_template, request, jsonify
import os
import cv2
import numpy as np


# Cargar la configuración y los pesos pre-entrenados
net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
layer_names = net.getUnconnectedOutLayersNames()

# Cargar las clases
with open("coco.names", "r") as f:
    classes = [line.strip() for line in f.readlines()]


app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT", default=5000))
