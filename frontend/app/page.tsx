"use client";
import { useState } from "react";

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a resume PDF.");
      return;
    }
    if (!job) {
      alert("Please enter a job description.");
      return;
    }
    const resumetext = await extractTextFromPDF(file);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const res = await fetch(`${backendUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume: resumetext, job }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden font-sans">

      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 py-10 px-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Resume Matcher</h1>
        <p className="text-blue-100 mt-2 text-base">Analyze and compare your resume against any job description.</p>
      </div>

      <div className="p-10 space-y-8 bg-white">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            1. Upload Resume (PDF)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
            className="block w-full text-sm text-gray-600 
              file:mr-5 file:py-3 file:px-6 
              file:rounded-xl file:border-0 
              file:text-sm file:font-bold 
              file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100 hover:file:cursor-pointer
              cursor-pointer border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
            2. Paste Job Description
          </label>
          <textarea
            placeholder="Paste the job description here..."
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="w-full h-40 p-5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-800 bg-gray-50 transition-all text-base shadow-inner"
          />
        </div>

        <button
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
          onClick={handleAnalyze}
        >
          Analyze Resume
        </button>
      </div>

      {result && (
        <div className="bg-gray-50 p-10 border-t border-gray-200">

          <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Analysis Results</h2>
            <div className="flex items-center gap-4 mt-6 md:mt-0 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-200">
              <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">Match Score</span>
              <span className={`text-5xl font-black tracking-tighter ${result.match_score >= 75 ? 'text-green-500' :
                  result.match_score >= 50 ? 'text-yellow-500' :
                    'text-red-500'
                }`}>
                {result.match_score}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-100 hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-red-600 mb-5 flex items-center gap-3 text-lg">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></span> Missing Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-red-50 text-red-700 text-sm font-bold rounded-xl border border-red-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-green-100 hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-green-600 mb-5 flex items-center gap-3 text-lg">
                <span className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></span> Resume Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.resume_skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm font-bold rounded-xl border border-green-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-blue-600 mb-5 flex items-center gap-3 text-lg">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span> Job Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.job_skills.map((skill: string) => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-bold rounded-xl border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* <div className="bg-white p-6 rounded-3xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-purple-600 mb-5 flex items-center gap-3 text-lg">
                <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span> Top Matches
              </h3>
              <div className="flex flex-col gap-4">
                {result.top_matches.map((sent: string, index: number) => (
                  <div key={index} className="p-4 bg-purple-50 text-purple-800 text-sm font-medium rounded-2xl border border-purple-100 leading-relaxed">
                    "{sent}"
                  </div>
                ))}
              </div>
            </div> */}

          </div>
        </div>
      )}
    </div>
  );
}