from flask import Flask, request, jsonify
from controllers.main_controller import main_blueprint, score_image
from flask_cors import CORS

app = Flask(__name__)
app.register_blueprint(main_blueprint)
CORS(app)

@app.route('/score-image', methods=['POST'])
def score_image_endpoint():
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        image = data['image']
        score = score_image(image)
        return jsonify({'result': score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/score-batch-average', methods=['POST'])
def score_image_batch_average_endpoint():
    result_score = {}
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No images provided'}), 400
        image_batch = data['image']
        total_score = 0
        emotion_count = {}
        for image in image_batch:
            cur_score = score_image(image)
            total_score += float(cur_score['confidence'])
            emotion = cur_score['emotion']
            if emotion in emotion_count:
                emotion_count[emotion] += 1
            else:
                emotion_count[emotion] = 1
        average_score = total_score / len(image_batch)
        most_prevalent_emotion = max(emotion_count, key=emotion_count.get)
        result_score['average'] = average_score
        result_score['most_prevalent_emotion'] = most_prevalent_emotion
        return jsonify({'result': result_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/score-batch-maximum', methods=['POST'])
def score_image_batch_maximum_endpoint():
    result_score = {}
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({'error': 'No images provided'}), 400
        image_batch = data['image']

        # Dictionnaire pour compter les occurrences de chaque émotion
        emotion_count = {}

        # Boucle à travers les images du batch
        for image in image_batch:
            cur_score = score_image(image)  # Score de l'image
            emotion = cur_score['emotion']  # L'émotion prédite

            # Comptabiliser l'émotion dans le dictionnaire
            if emotion in emotion_count:
                emotion_count[emotion] += 1
            else:
                emotion_count[emotion] = 1

        # Trouver l'émotion la plus fréquemment prédite
        most_prevalent_emotion = max(emotion_count, key=emotion_count.get)

        # Résultat final avec l'émotion la plus courante
        result_score['most_prevalent_emotion'] = most_prevalent_emotion
        result_score['emotion_count'] = emotion_count  # Ajoute aussi le count des émotions pour info

        return jsonify({'result': result_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5050, host="0.0.0.0")
