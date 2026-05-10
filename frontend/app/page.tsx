"use client";
import { useState } from "react";

export default function Home() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume, job }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "auto" }}>
      <h1>Resume Matcher</h1>

      <textarea
        placeholder="Paste Resume"
        value={resume}
        onChange={(e) => setResume(e.target.value)}
        style={{ width: "100%", height: "120px", marginBottom: "20px" }}
      />

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