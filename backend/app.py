import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk import pos_tag
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger_eng')

NORMALIZE = {
    "node.js": "nodejs",
    "node": "nodejs",
    "js": "javascript",
    "api": "apis",
    "apis": "apis"
}

STOP_SKILLS = {
    "experience", "work", "role", "developer", "applications", "systems"
}

STOP_WORDS = set(stopwords.words('english'))

# 🔹 Preprocessing
def preprocess(text):
    text = text.lower()
    tokens = word_tokenize(text)
    filtered = [word for word in tokens if word not in STOP_WORDS]
    return " ".join(filtered)

# 🔹 Core Function
def calculate_similarity(resume, job_desc):
    resume = preprocess(resume)
    job_desc = preprocess(job_desc)

    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([resume, job_desc])

    score = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return round(score * 100, 2)

def extract_skills(text):
    tokens = word_tokenize(text.lower())
    tagged = pos_tag(tokens)
    skills = []
    for word, tag in tagged:
        if tag.startswith('NN') and word not in STOP_SKILLS:
            normalized = NORMALIZE.get(word, word)
            skills.append(normalized)
    return set(skills)

# 🔹 Test Input
resume_text = """
Built web applications using Flask and JavaScript.
Worked on APIs and backend systems.
"""

job_description = """
Looking for a backend developer with experience in APIs and Node.js.
"""

score = calculate_similarity(resume_text, job_description)
print(f"Match Score: {score}%")
resume_skills = extract_skills(resume_text)
job_skills = extract_skills(job_description)

missing_skills = sorted(job_skills - resume_skills)

print("\nResume Skills:", resume_skills)
print("\nJob Skills:", job_skills)
print("\nMissing Skills:", missing_skills)



@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()

    resume = data.get('resume', '')
    job = data.get('job', '')

    score = calculate_similarity(resume, job)
    resume_skills = extract_skills(resume)
    job_skills = extract_skills(job)
    missing_skills = sorted(job_skills - resume_skills)

    return jsonify({
        "match_score": score,
        "resume_skills": list(resume_skills),
        "job_skills": list(job_skills),
        "missing_skills": missing_skills
    })
    
if __name__ == '__main__':
    app.run(debug=True)