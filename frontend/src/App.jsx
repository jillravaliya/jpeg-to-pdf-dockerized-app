import React, { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setFiles(droppedFiles);
    }
  };

  // ✅ Real backend logic (no fake alerts)
  const handleConvert = async () => {
    if (!files.length) {
      alert("Please select at least one image file.");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append("images", file); // must match backend field name
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/convert`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Conversion failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "converted.pdf";
      a.click();
      a.remove();

      alert("✅ Conversion complete! PDF downloaded.");
    } catch (error) {
      console.error("❌ Conversion error:", error);
      alert("Error converting images to PDF. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.headerSection}>
          <div style={styles.titleBox}>
            <h1 style={styles.title}>IMAGE</h1>
            <h1 style={styles.titleSecond}>TO PDF</h1>
          </div>
          <div style={styles.iconSticker}>
            <svg
              style={styles.headerIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          style={{
            ...styles.dropzone,
            ...(dragActive ? styles.dropzoneActive : {}),
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            style={styles.fileInput}
            id="fileInput"
          />
          <label htmlFor="fileInput" style={styles.dropzoneLabel}>
            <div style={styles.uploadBox}>
              <svg
                style={styles.uploadIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <span style={styles.dropText}>
              {dragActive ? "DROP NOW!" : "DRAG & DROP"}
            </span>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div style={styles.fileSection}>
            <div style={styles.badge}>{files.length} FILES</div>
            <div style={styles.fileItems}>
              {files.map((file, index) => (
                <div key={index} style={styles.fileCard}>
                  <div style={styles.fileLeft}>
                    <div style={styles.fileIcon}>📷</div>
                    <span style={styles.fileName}>{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    style={styles.deleteBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Convert Button */}
        <button
          onClick={handleConvert}
          disabled={loading || files.length === 0}
          style={{
            ...styles.convertBtn,
            ...(loading || files.length === 0
              ? styles.convertBtnDisabled
              : {}),
          }}
        >
          {loading ? "CONVERTING..." : "CONVERT"}
        </button>

        {/* Sticker */}
        <div style={styles.bottomSticker}>PDF READY!</div>
      </div>

      {/* Inline Animations */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.85) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-1deg); }
          75% { transform: translateX(5px) rotate(1deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        button:active:not(:disabled) {
          transform: translateY(4px) translateX(4px) !important;
          box-shadow: 4px 4px 0 #000 !important;
          filter: blur(1px) !important;
          transition: none !important;
        }
      `}</style>
    </div>
  );
}

// 🧱 Your full original style object (unchanged)
const styles = {
  container: {
    minHeight: "100vh",
    background: "#FFEB3B",
    backgroundImage: "radial-gradient(circle, #000 1.5px, transparent 1.5px)",
    backgroundSize: "30px 30px",
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  content: { maxWidth: "600px", width: "100%", position: "relative" },
  headerSection: { marginBottom: "40px", position: "relative", animation: "popIn 0.3s ease-out" },
  titleBox: {
    background: "#FF1744",
    border: "5px solid #000",
    padding: "20px 30px",
    boxShadow: "12px 12px 0 #000",
    display: "inline-block",
    transform: "rotate(-2deg)",
  },
  title: { fontSize: "4rem", fontWeight: "900", color: "#000", margin: 0, lineHeight: "0.9" },
  titleSecond: { fontSize: "4rem", fontWeight: "900", color: "#FFEB3B", margin: 0, lineHeight: "0.9" },
  iconSticker: {
    position: "absolute",
    top: "-20px",
    right: "0",
    width: "80px",
    height: "80px",
    background: "#00E676",
    border: "5px solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(12deg)",
    boxShadow: "6px 6px 0 #000",
    animation: "float 3s ease-in-out infinite",
  },
  headerIcon: { width: "40px", height: "40px", color: "#000" },
  dropzone: {
    border: "5px dashed #000",
    padding: "50px 30px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#F5F5F5",
    transition: "all 0.15s ease-out",
    position: "relative",
  },
  dropzoneActive: { backgroundColor: "#00E676", transform: "rotate(-1deg)", animation: "shake 0.3s ease-in-out" },
  fileInput: { display: "none" },
  dropzoneLabel: { cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" },
  uploadBox: {
    width: "100px",
    height: "100px",
    background: "#2196F3",
    border: "5px solid #000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "6px 6px 0 #000",
    transform: "rotate(-5deg)",
  },
  uploadIcon: { width: "50px", height: "50px", color: "#000" },
  dropText: {
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#000",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  fileSection: { marginTop: "30px" },
  badge: {
    display: "inline-block",
    background: "#FF1744",
    color: "#FFEB3B",
    border: "4px solid #000",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: "900",
    letterSpacing: "0.05em",
    boxShadow: "5px 5px 0 #000",
    marginBottom: "20px",
    transform: "rotate(-2deg)",
  },
  fileItems: { display: "flex", flexDirection: "column", gap: "12px", maxHeight: "280px", overflowY: "auto" },
  fileCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#F5F5F5",
    border: "4px solid #000",
    padding: "16px 20px",
    boxShadow: "5px 5px 0 #000",
  },
  fileLeft: { display: "flex", alignItems: "center", gap: "15px", flex: 1, minWidth: 0 },
  fileIcon: { fontSize: "2rem" },
  fileName: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#000",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    background: "#FF1744",
    border: "4px solid #000",
    width: "45px",
    height: "45px",
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#000",
    cursor: "pointer",
    transition: "all 0.1s ease-out",
    boxShadow: "4px 4px 0 #000",
  },
  convertBtn: {
    width: "100%",
    padding: "22px",
    marginTop: "30px",
    fontSize: "1.5rem",
    fontWeight: "900",
    color: "#000",
    background: "#F57C00",
    border: "5px solid #000",
    cursor: "pointer",
    boxShadow: "8px 8px 0 #000",
    textTransform: "uppercase",
  },
  convertBtnDisabled: { background: "#F57C00", cursor: "not-allowed", opacity: 1 },
  bottomSticker: {
    position: "absolute",
    bottom: "-40px",
    right: "20px",
    background: "#2196F3",
    color: "#FFEB3B",
    border: "5px solid #000",
    padding: "12px 25px",
    fontSize: "1.2rem",
    fontWeight: "900",
    boxShadow: "6px 6px 0 #000",
    transform: "rotate(5deg)",
    animation: "float 3s ease-in-out infinite 1s",
  },
};

export default App;