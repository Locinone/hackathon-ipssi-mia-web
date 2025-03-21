from flask import Flask, request, jsonify
import gensim
from controllers.preprocessing import preprocess_text, analyze_list_text
from middleware.apikey import require_api_key
from dotenv import load_dotenv
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
load_dotenv()
API_KEY = os.getenv('API_KEY')

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
        if 'text' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        if data['text'] == [""]:
            return jsonify({'error': 'Empty array provided'}), 422
        text = data.get("text", "")
        processed_text = analyze_list_text(text)
        return jsonify({"processed_text": processed_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5010, host="0.0.0.0")
