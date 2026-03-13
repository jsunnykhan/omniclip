import "./App.css";

function App() {
  return (
    <main className="container" style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>OmniClip Client</h1>
      <p style={{ color: "green", fontWeight: "bold" }}>
        Status: Running & Monitoring Clipboard
      </p>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
        <p>
          The background process is monitoring your clipboard. Any text you copy
          will be sent to the OmniClip server based on your default configuration.
        </p>
      </div>
    </main>
  );
}

export default App;
