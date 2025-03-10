import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { UploadFile, Work, CheckCircle, ErrorOutline } from "@mui/icons-material";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Clear previous results when selecting a new file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
      setError("⚠️ Please upload a file and enter a job description.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const res = await axios.post("http://127.0.0.1:5000/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResponse(res.data); // ✅ Ensure response is set properly
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ textAlign: "center", marginTop: "40px" }}>
      <Typography variant="h3" style={{ fontWeight: "bold", color: "#1976d2", marginBottom: "20px" }}>
        AI Resume Analyzer 🚀
      </Typography>

      <Card elevation={4} style={{ padding: "30px", borderRadius: "12px", background: "#f5f5f5" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload Your Resume (PDF) <UploadFile style={{ verticalAlign: "middle", color: "#1976d2" }} />
          </Typography>

          <form onSubmit={handleSubmit}>
            <input type="file" accept=".pdf" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
            <TextField
              label="Job Description"
              multiline
              rows={4}
              fullWidth
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              margin="normal"
              variant="outlined"
            />

            <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} style={{ marginTop: "10px" }}>
              {loading ? <CircularProgress size={24} /> : "Analyze Resume"}
            </Button>
          </form>

          {loading && <CircularProgress style={{ marginTop: "20px" }} />}
          {error && (
            <Typography color="error" style={{ marginTop: "10px" }}>
              <ErrorOutline style={{ verticalAlign: "middle" }} /> {error}
            </Typography>
          )}

          {response && (
            <Paper elevation={2} style={{ padding: "20px", marginTop: "20px", background: "#ffffff", borderRadius: "8px" }}>
              <Typography variant="h6" gutterBottom style={{ fontWeight: "bold" }}>
                📄 Analysis Results:
              </Typography>

              {response.summary && (
                <Typography>
                  <strong>Summary:</strong> {response.summary} {/* ✅ Display Summary */}
                </Typography>
              )}

              {response.score !== undefined && (
                <Box mt={2}>
                  <Typography>
                    <strong>Score:</strong>
                    <Chip
                      icon={<CheckCircle />}
                      label={`${response.score}/100`}
                      color="primary"
                      style={{ marginLeft: "5px", fontSize: "16px" }}
                    />
                  </Typography>
                </Box>
              )}

              {response.found_skills && response.found_skills.length > 0 && (
                <Box mt={2}>
                  <Typography style={{ color: "#388e3c", fontWeight: "bold" }}>✅ Found Skills:</Typography>
                  <Box display="flex" flexWrap="wrap" justifyContent="center" mt={1}>
                    {response.found_skills.map((skill, index) => (
                      <Chip key={index} label={skill} style={{ margin: "4px", backgroundColor: "#e8f5e9", color: "#388e3c" }} />
                    ))}
                  </Box>
                </Box>
              )}

              {response.missing_skills && response.missing_skills.length > 0 && (
                <Box mt={2}>
                  <Typography style={{ color: "#d32f2f", fontWeight: "bold" }}>⚠️ Missing Skills:</Typography>
                  <Box display="flex" flexWrap="wrap" justifyContent="center" mt={1}>
                    {response.missing_skills.map((skill, index) => (
                      <Chip key={index} label={skill} style={{ margin: "4px", backgroundColor: "#ffebee", color: "#d32f2f" }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UploadForm;
