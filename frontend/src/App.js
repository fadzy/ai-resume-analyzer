import React from "react";
import UploadForm from "./components/UploadForm";
import { CssBaseline, Container, Typography } from "@mui/material";
import './App.css'; // Ensures the CSS is loaded


function App() {
  return (
    <>
      <CssBaseline />
      <Container>
        <Typography variant="h3" align="center" gutterBottom>
          AI Resume & Cover Letter Analyzer
        </Typography>
        <UploadForm />
      </Container>
    </>
  );
}

export default App;
