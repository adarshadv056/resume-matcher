import PyPDF2
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
import numpy as np
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import pos_tag
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from bs4 import BeautifulSoup
import gensim.downloader as api
import traceback

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("stopwords", quiet=True)
nltk.download("averaged_perceptron_tagger", quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

STOP_WORDS = set(stopwords.words("english"))

NORMALIZE = {
    "frontend": ["react", "vue", "angular", "nextjs", "nuxt", "javascript", "typescript", "html", "css", "tailwind", "bootstrap", "sass", "redux", "vite", "webpack", "jquery"],
    "backend": ["nodejs", "express", "flask", "django", "fastapi", "spring", "laravel", "php", "java", "python", "golang", "ruby", "rails", "dotnet", "csharp", "rest", "graphql", "apis", "server"],
    "database": ["postgresql", "mysql", "mongodb", "sqlite", "redis", "firebase", "oracle", "mariadb", "cassandra", "dynamodb", "supabase"],
    "devops": ["docker", "kubernetes", "jenkins", "githubactions", "ci/cd", "nginx", "aws", "gcp", "azure", "linux", "terraform", "ansible"],
    "machinelearning": ["machinelearning", "deeplearning", "tensorflow", "pytorch", "scikitlearn", "pandas", "numpy", "matplotlib", "seaborn", "xgboost", "opencv", "nltk", "spacy", "langchain"],
    "mobile": ["flutter", "reactnative", "android", "kotlin", "swift", "ios"],
    "authentication": ["jwt", "oauth", "auth", "authentication", "bcrypt", "firebaseauth"],
    "testing": ["jest", "pytest", "selenium", "cypress", "unittest", "postman"],
    "versioncontrol": ["git", "github", "gitlab", "bitbucket"],
    "api_development": ["rest", "graphql", "apis", "postman", "swagger"],
    "architecture": ["microservices", "scalable", "architecture", "saas", "distributed", "async"],
    "backgroundjobs": ["celery", "rabbitmq", "kafka", "bullmq", "redisqueue"],
    "cms": ["wordpress", "shopify", "woocommerce"]
}

REVERSE_NORMALIZE = {}
for category, skills_list in NORMALIZE.items():
    for skill in skills_list:
        REVERSE_NORMALIZE[skill] = category

STOP_SKILLS = {
    "experience", "work", "role", "roles", "job", "position", "career", "professional", "skills", "skill", "knowledge", "understanding", "expertise", "responsibilities", "responsibility", "company", "organization", "team", "teams", "client", "clients", "business", "businesses", "candidate", "candidates", "employee", "employees", "developer", "development", "engineer", "engineering", "applications", "application", "systems", "system", "software", "platform", "solution", "solutions", "project", "projects", "service", "services", "design", "designed", "building", "built", "working", "worked", "creating", "created", "implementation", "implemented", "management", "managing", "support", "supported", "resume", "cv", "summary", "objective", "profile", "details", "description", "intern", "internship", "stipend", "benefits", "opportunity", "opportunities", "deadline", "duration", "location", "employment", "communication", "leadership", "passionate", "motivated", "creative", "responsible", "collaboration", "collaborate", "use", "using", "used", "based", "including", "related", "focused", "ability", "abilities", "student", "education", "university", "college", "institute", "degree", "http", "https", "www", "com", "linkedin", "github", "portfolio", "@", "+", "-", "|", "•"
}

CLEAN_MAP = {
    "node.js": "nodejs",
    "react.js": "react",
    "react-native": "reactnative",
    "native react": "reactnative",
    "next.js": "nextjs"
}

# word2vec_model = api.load("word2vec-google-news-300")
word2vec_model = api.load("glove-wiki-gigaword-50")
lemmatizer = WordNetLemmatizer()

def clean_html(text):
    soup = BeautifulSoup(text, "html.parser")
    return soup.get_text(separator=" ")

def get_wordnet_pos(word):
    tag = nltk.pos_tag([word])[0][1][0].upper()
    tag_dict = {
        "J": wordnet.ADJ,
        "N": wordnet.NOUN,
        "V": wordnet.VERB,
        "R": wordnet.ADV
    }
    return tag_dict.get(tag, wordnet.NOUN)

def preprocess(text):
    text = clean_html(text)
    text = text.lower()
    for variant, standard in CLEAN_MAP.items():
        text = text.replace(variant, standard)
    tokens = word_tokenize(text)
    expanded_tokens = []
    for token in tokens:
        expanded_tokens.append(token)
        for category, skills in NORMALIZE.items():
            if token in skills:
                expanded_tokens.append(category)
    filtered = [word for word in expanded_tokens if word not in STOP_WORDS and word.isalpha()]
    lemmatized = [lemmatizer.lemmatize(word, get_wordnet_pos(word)) for word in filtered]
    return " ".join(lemmatized)

def get_word_vector(text):
    words = preprocess(text).split()
    vectors = [word2vec_model[word] for word in words if word in word2vec_model]
    if not vectors:
        return np.zeros(word2vec_model.vector_size)
    return np.mean(vectors, axis=0)

def match_sentences(resume, job_desc):
    resume_sents = sent_tokenize(resume)
    job_vec = get_word_vector(job_desc).reshape(1, -1)
    
    scores = []
    for sent in resume_sents:       
        if len(sent.strip()) < 10:
            continue 
        sent_vec = get_word_vector(sent).reshape(1, -1)
        
        if not np.any(sent_vec) or not np.any(job_vec):
            score = 0.0
        else:
            score = float(cosine_similarity(sent_vec, job_vec)[0][0])
            
        scores.append((sent, score))
    
    scores = sorted(scores, key=lambda x: x[1], reverse=True)
    return [s[0] for s in scores[:3]]

def calculate_similarity(resume, job_desc):
    resume_cleaned = preprocess(resume)
    job_cleaned = preprocess(job_desc)
    
    if not resume_cleaned.strip() or not job_cleaned.strip():
        return 0.0
        
    resume_vec = get_word_vector(resume).reshape(1, -1)
    job_vec = get_word_vector(job_desc).reshape(1, -1)
    
    if not np.any(resume_vec) or not np.any(job_vec):
        semantic_score = 0.0
    else:
        semantic_score = float(cosine_similarity(resume_vec, job_vec)[0][0])
    
    vectrotizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf_matrix = vectrotizer.fit_transform([resume_cleaned, job_cleaned])
        keyword_score = float(cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0])
    except ValueError:
        keyword_score = 0.0

    score = (semantic_score * 0.7) + (keyword_score * 0.3)
    return round(score * 100, 2)

def extract_skills(text):
    tokens = word_tokenize(text.lower())
    tagged = pos_tag(tokens)
    
    skills = []
    for word, tag in tagged:
        if tag.startswith("NN") and word not in STOP_SKILLS:
            if word in REVERSE_NORMALIZE:
                skills.append(word)
            elif word in NORMALIZE:
                skills.append(word)
            
    return set(skills)

def analyze_text(resume, job):
    score = calculate_similarity(resume, job)
    resume_skills = extract_skills(resume)
    job_skills = extract_skills(job)
    missing_skills = sorted(list(job_skills - resume_skills))
    top_matches = match_sentences(resume, job)
    
    return {
        "match_score": float(score),
        "resume_skills": list(resume_skills),
        "job_skills": list(job_skills),
        "missing_skills": missing_skills,
        "top_matches": top_matches
    }

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    resume = data.get('resume', '').strip()
    job = data.get('job', '').strip()

    if not resume or not job:
        return jsonify({"error": "Both resume and job description are required"}), 400

    try:
        result = analyze_text(resume, job)
        return jsonify(result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)