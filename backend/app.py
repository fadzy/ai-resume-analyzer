from flask import Flask, request, jsonify, session
import os
import PyPDF2
import nltk
from werkzeug.utils import secure_filename
from flask_cors import CORS
import re

nltk.download('punkt')

app = Flask(__name__)
CORS(app)
app.secret_key = 'AIzaSyBGa2EkkoA5GSWDLayUi_qMnBKnJbxB1I4'  # For session management, make sure this is kept secret!

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file):
    try:
        print("📄 Extracting text from PDF...")
        reader = PyPDF2.PdfReader(file)
        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

        if not text.strip():
            raise ValueError("No extractable text found in PDF")

        print("✅ Text Extraction Successful!")
        return text.strip()

    except Exception as e:
        print(f"❌ Error extracting text: {e}")
        return None

# Function to extract skills dynamically from the job description
def extract_skills_from_description(job_description):
    # A basic skill extraction using regular expressions (you can make it more advanced)
    skills = re.findall(r'\b[A-Za-z]+(?:[A-Za-z\s]*)\b', job_description)
    return set(map(lambda x: x.strip().lower(), skills))

def analyze_resume_text(resume_text, job_description):
    job_skills = extract_skills_from_description(job_description)

    # Find skills that are mentioned in both the resume and job description
    found_skills = {skill for skill in job_skills if skill in resume_text.lower()}

    # Calculate match score based on the percentage of matched skills
    match_score = int((len(found_skills) / len(job_skills)) * 100) if job_skills else 0

    # Determine missing skills
    missing_skills = list(job_skills - found_skills)

    # Prepare a more detailed summary for the response
    summary = {
        "total_skills": len(job_skills),
        "found_skills_count": len(found_skills),
        "found_skills": list(found_skills),
        "missing_skills": missing_skills,
        "match_score": match_score
    }

    return summary

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    try:
        print("✅ Received request at /analyze")

        if 'file' not in request.files:
            print("❌ No file found in request")
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        job_description = request.form.get('job_description', '').strip()

        if file.filename == '':
            print("❌ Empty filename received")
            return jsonify({'error': 'No selected file'}), 400

        if not allowed_file(file.filename):
            print("❌ Unsupported file type")
            return jsonify({'error': 'Only PDF files are allowed'}), 400

        if not job_description:
            print("❌ No job description provided")
            return jsonify({'error': 'Job description required'}), 400

        # Extract text from resume
        resume_text = extract_text_from_pdf(file)
        if not resume_text:
            print("❌ Extracted text is empty")
            return jsonify({'error': 'Could not extract text from the PDF'}), 500

        print(f"🔍 Extracted Text (First 500 chars): {resume_text[:500]}")

        # Analyze resume
        analysis_result = analyze_resume_text(resume_text, job_description)
        print(f"✅ Analysis Result: {analysis_result}")

        # Store the analysis result in session for future reference if needed
        session['last_analysis'] = analysis_result

        # Return the result to the frontend, including a detailed summary
        return jsonify({
            "summary": f"✅ Resume matches {analysis_result['found_skills_count']} out of {analysis_result['total_skills']} required skills.",
            "score": f"{analysis_result['match_score']}/100",
            "found_skills": analysis_result['found_skills'],
            "missing_skills": analysis_result['missing_skills']
        }), 200

    except Exception as e:
        print(f"❌ Error in analyze_resume: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/previous-analysis', methods=['GET'])
def get_previous_analysis():
    # Retrieve the last analysis result from session
    last_analysis = session.get('last_analysis', None)
    if last_analysis:
        return jsonify(last_analysis), 200
    else:
        return jsonify({'error': 'No previous analysis found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
