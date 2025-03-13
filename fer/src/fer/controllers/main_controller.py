from flask import Blueprint, jsonify
import base64
from io import BytesIO
from PIL import Image
import numpy as np
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image
import numpy as np

main_blueprint = Blueprint('main', __name__)

model_name = "dima806/facial_emotions_image_detection"
processor = AutoImageProcessor.from_pretrained(model_name)
model = AutoModelForImageClassification.from_pretrained(model_name)

@main_blueprint.route('/', methods=['POST'])
def score_image(image_base64):
    imageConverted = Image.open(BytesIO(base64.b64decode(image_base64)))
    image = imageConverted.convert("RGB")
    # Transformer l'image en format compatible avec le modèle
    inputs = processor(
        images=image,
        return_tensors="pt",
        do_resize=True,
        size={"height": 224, "width": 224},
        do_normalize=True
    )
    # Passer l'image dans le modèle
    with torch.no_grad():
        outputs = model(**inputs)
    # Récupérer les prédictions
    logits = outputs.logits
    probas = torch.nn.functional.softmax(logits, dim=-1)
    predicted_class_idx = torch.argmax(probas, dim=-1).item()

    # Obtenir les labels du modèle
    labels = model.config.id2label
    predicted_emotion = labels[predicted_class_idx]

    return {
        "emotion": predicted_emotion,
        "confidence": f"{probas[0][predicted_class_idx].item()*100}"
    }

