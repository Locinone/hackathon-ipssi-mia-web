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
        max_confidence = 0
        max_confidence_emotion = None
        for image in image_batch:
            cur_score = score_image(image)
            confidence = float(cur_score['confidence'])
            emotion = cur_score['emotion']
            if confidence > max_confidence:
                max_confidence = confidence
                max_confidence_emotion = emotion
        result_score['max_confidence'] = max_confidence
        result_score['max_confidence_emotion'] = max_confidence_emotion
        return jsonify({'result': result_score})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5050, host="0.0.0.0")
