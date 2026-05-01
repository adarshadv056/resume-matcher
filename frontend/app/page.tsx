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

      <button onClick={handleAnalyze}>Analyze</button>

      {result && (
        <div style={{ marginTop: "30px" }}>
          <h2>Match Score: {result.match_score}%</h2>

          <h3>Missing Skills</h3>
          <ul>
            {result.missing_skills.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Resume Skills</h3>
          <ul>
            {result.resume_skills.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>

          <h3>Job Skills</h3>
          <ul>
            {result.job_skills.map((skill: string) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}