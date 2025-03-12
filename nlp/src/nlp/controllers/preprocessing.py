from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from gensim.utils import simple_preprocess
from gensim.corpora import Dictionary
from gensim.models import TfidfModel, LdaModel
import nltk
from nltk.corpus import stopwords
import requests

# Télécharger les stopwords
nltk.download('stopwords')
stop_words = set(stopwords.words('french'))
API_KEY = 'your_secret_api_key_here'

# Initialiser l'analyseur de sentiment VADER
analyzer = SentimentIntensityAnalyzer()

def preprocess_text(text):
    """Tokenise et enlève les stopwords du texte."""
    return [word for word in simple_preprocess(text) if word not in stop_words]

def analyze_list_text(texts, post):
    """Effectue la modélisation des sujets et l'analyse des relations entre les mots."""
    
    # Prétraitement
    processed_texts = [preprocess_text(text) for text in texts]
    dictionary = Dictionary(processed_texts)
    bow_corpus = [dictionary.doc2bow(text) for text in processed_texts]
    tfidf = TfidfModel(bow_corpus)
    tfidf_corpus = [tfidf[doc] for doc in bow_corpus]

    # Entraîner le modèle LDA (modélisation des sujets)
    lda_model = LdaModel(corpus=tfidf_corpus, id2word=dictionary, num_topics=3, passes=10)

    # Extraire les mots-clés de chaque topic
    topic_keywords = {}
    for topic_id in range(lda_model.num_topics):
        words = lda_model.show_topic(topic_id, topn=5)  # Affiche les 5 premiers mots pour chaque sujet
        topic_keywords[topic_id] = [word[0] for word in words]

    # Identifier le sujet dominant pour chaque tweet
    tweet_topics = []
    for i, doc in enumerate(tfidf_corpus):
        topic_distribution = lda_model.get_document_topics(doc)
        if topic_distribution:
            top_topic = max(topic_distribution, key=lambda x: x[1])
            filtered_keywords = [word for word in topic_keywords[top_topic[0]] if word in processed_texts[i]]
            tweet_topics.append((i, top_topic[0], filtered_keywords)) 
        else:
            tweet_topics.append((i, "Aucun sujet dominant", []))

    # Analyser le sentiment des mots-clés
    def analyze_sentiment(words):
        sentiment = []
        for word in words:
            sentiment_score = analyzer.polarity_scores(word)
            sentiment.append({
                'word': word,
                'sentiment': sentiment_score
            })
        return sentiment

    # Préparer la sortie API avec les mots-clés associés au sujet dominant pour chaque tweet
    response = []
    for i, text in enumerate(texts):
        topic_keywords_list = tweet_topics[i][2]
        sentiment_analysis = analyze_sentiment(topic_keywords_list)
        response.append({
            "tweet": text,
            "dominant_theme": topic_keywords_list,
            "sentiment_analysis": sentiment_analysis
        })

    return response

async def add_themes_and_scores_to_db(themes, post, user):
    """Ajoute les thèmes et les scores de sentiment à la base de données."""
    theme_url = "http://localhost:4000/api/themes/create"
    score_url = "http://localhost:4000/api/scoreThemes/create"
    headers = {"Content-Type": "application/json", "x-api-key": f"{API_KEY}"}

    for theme in themes["processed_text"][0]["dominant_theme"]:
        theme_data = {
            "name": theme,
            "post": post,
        }
        theme_response = await requests.post(theme_url, json=theme_data, headers=headers)
        if theme_response.status_code != 201:
            print(f"Failed to create theme: {theme_response.json()}")
            continue

        created_theme = theme_response.json()
        for sentiment in themes["processed_text"][0]["sentiment_analysis"]:
            score_data = {
                "theme": created_theme["_id"],
                "score": sentiment["sentiment"]["compound"] * 100,
                "post": post,
                "user": user
            }
            score_response = await requests.post(score_url, json=score_data, headers=headers)
            if score_response.status_code != 201:
                print(f"Failed to create theme score: {score_response.json()}")

# Exemple
texts = [
    "J'adore IPSSI et le basketball mais je deteste la pluie",
    "La musique est trop bien",
    "Faker est le goat"
]
