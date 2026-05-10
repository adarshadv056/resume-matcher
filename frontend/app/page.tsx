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
    const res = await fetch("http://127.0.0.1:5000/analyze", {
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
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>Resume Matcher</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
          }
        }}
        style={{ marginBottom: "20px" }}
      />

      {/* <textarea
        placeholder="Paste Resume"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        style={{ width: "100%", height: "120px", marginBottom: "20px" }}
      /> */}

      <textarea
        placeholder="Paste Job Description"
        value={job}
        onChange={(e) => setJob(e.target.value)}
        style={{ width: "100%", height: "120px", marginBottom: "20px" }}
      />

      <button className="border rounded p-2 cursor-pointer" onClick={handleAnalyze}>Analyze</button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Match Score: {result.match_score}%</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "24px", marginTop: "20px" }}>
            <div>
              <h3><b>Missing Skills</b></h3>
              <ul style={{ color: "red", listStyleType: "disc", paddingLeft: "20px" }}>
                {result.missing_skills.map((skill: string) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3><b>Resume Skills</b></h3>
              <ul style={{ color: "green", listStyleType: "disc", paddingLeft: "20px" }}>
                {result.resume_skills.map((skill: string) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3><b>Job Skills</b></h3>
              <ul style={{ color: "blue", listStyleType: "disc", paddingLeft: "20px" }}>
                {result.job_skills.map((skill: string) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3><b>Top Matches</b></h3>
              <ul style={{ color: "purple", listStyleType: "disc", paddingLeft: "20px" }}>
                {result.top_matches.map((sent: string, index: number) => (
                  <li key={index}>{sent}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}