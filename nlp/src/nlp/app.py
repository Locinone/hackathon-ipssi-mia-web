from flask import Flask, request, jsonify
import gensim
from controllers.preprocessing import preprocess_text, analyze_list_text, add_themes_and_scores_to_db
from middleware.apikey import require_api_key

app = Flask(__name__)

API_KEY = 'your_secret_api_key_here'

@app.route('/api-key', methods=['GET'])
def get_api_key():
    return jsonify({'api_key': API_KEY})

@app.route('/preprocess', methods=['POST'])
@require_api_key(API_KEY)
def preprocess_text_route():
    try:
        data = request.json
        if 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        if data['text'] == "":
            return jsonify({'error': 'Empty text provided'}), 422
        text = data.get("text", "")
        processed_text = preprocess_text(text)
        return jsonify({"processed_text": processed_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
@require_api_key(API_KEY)
def analyze_text_route():
    try:
        data = request.json
        if 'text' not in data or 'post_id' not in data or 'user_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        if data['text'] == [""]:
            return jsonify({'error': 'Empty array provided'}), 422
        text = data.get("text", "")
        post = data.get("post_id", "")
        user = data.get("user_id", "")
        processed_text = analyze_list_text(text, post)
        add_themes_and_scores_to_db(processed_text, post, user)
        return jsonify({"processed_text": processed_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5010)
