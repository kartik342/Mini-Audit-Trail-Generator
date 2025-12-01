import { useState, useEffect } from "react";


function App() {
  const [text, setText] = useState("");
  const [versions, setVersions] = useState([]); // array of all versions
  const [openVersion, setOpenVersion] = useState(null);


  // function to save-version
  const saveVersion = async () => {
      try {
          const response = await fetch("http://localhost:5000/save-version", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
      });

      const data = await response.json();

      console.log("Server response:", data);

      fetchVersions();

      } 
      catch (error) {
        console.error("Error saving version:", error);
      }
  };

  // function to get all version
  const fetchVersions = async () => {
      try {
        const res = await fetch("http://localhost:5000/versions");
        const data = await res.json();
        setVersions(data);
      } 
      catch (err) {
        console.error("Fetch versions error:", err);
      }
  };

  const clearHistory = async () => {
      try {
        await fetch("http://localhost:5000/clear-history", {
          method: "DELETE"
        });

        setVersions([]);       // frontend cleanup
        setText("");           // optional: clear editor
        localStorage.removeItem("editorText"); // optional

      } catch (err) {
        console.error("Error clearing history:", err);
      }
  };


  const handleRevert = (version) => {
      setText(version.fullText);

      // update the latest text to local storage
      localStorage.setItem("editorText", version.fullText);
  };

  const toggleVersion = (id) => {
      setOpenVersion(openVersion === id ? null : id);
  };


  // fetch all verison on first load
  useEffect(() => {
    fetchVersions();
  }, []);


  // Load text on first load
  useEffect(() => {
      const saved = localStorage.getItem("editorText");
      if (saved) setText(saved);
  }, []);

  useEffect(() => {
      localStorage.setItem("editorText", text);
  }, [text]);



  return (
    <div style={{ padding: "20px", maxWidth: "750px", margin: "auto" }}>
        <h1>Mini Audit Trail Generator</h1>
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something..."
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: "200px",
              padding: "10px",
              marginTop: "20px",
              fontSize: "16px",
              outline: "none",
              resize: "vertical",
            }}
        />

        {/* Save Button */}
        <button
            onClick={saveVersion}
            style={{
              marginTop: "15px",
              padding: "12px 24px",
              fontSize: "16px",
              cursor: "pointer",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontFamily: "monospace"
            }}
        >
            Save Version
        </button>


        {/* Version History */}
        <div style={{ marginTop: "30px" }}>


            <div style={{
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}>

                <h2>Version History</h2>
                <button
                    onClick={clearHistory}
                    style={{
                      padding: "10px 14px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontFamily: "monospace",
                      marginBottom: "15px"
                    }}
                  >
                    Clear History
                </button>
                
            </div>


            {versions.length === 0 ? 
            (
              <p>No versions yet.</p>
            ) : 
            (
              versions.map((v, index) => (
                <div
                    key={v.id}
                    style={{
                      background: index === 0 ? "#e4fae4ff" : "#ffffff",
                      padding: "15px 25px",
                      marginBottom: "5px",
                      borderRadius: "6px",
                      fontSize : "11px",
                      display : "flex",
                      justifyContent : "space-between",
                      alignItems : "center",
                      border: "1px solid #ddd"
                    }}
                >
                    <div>
                        <strong style={{fontSize: "15px", display:"block", marginBottom : "-10px"}}>Version {versions.length - index}</strong> <br />
                        <span>Timestamp: {v.timestamp}</span> <br />
                        <div>
                          <span>Added: </span>
                              {v.addedWords.length > 0 ? 
                              (
                                <span style={{ color: "green" }}>
                                  {v.addedWords.join(", ")}
                                </span>
                              ) : 
                              (
                                <span>None</span>
                              )}
                        </div>

                        <div>
                          <span>Removed: </span>
                              {v.removedWords.length > 0 ? 
                              (
                                <span style={{ color: "red" }}>
                                  {v.removedWords.join(", ")}
                                </span>
                              ) : 
                              (
                                <span>None</span>
                              )}
                        </div>

                        <span>Old Length: {v.oldLength}</span> <br />
                        <span>New Length: {v.newLength}</span>
                    </div>

                    <div style={{marginRight : "20px"}}>
                      <button
                          onClick={() => handleRevert(v)}
                          style={{
                            marginTop: "10px",
                            fontSize : "12px",
                            padding: "8px 10px",
                            background: "black",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontFamily: "monospace",
                          }}
                        >
                          Revert to this Version
                        </button>
                    </div>

                </div>
              ))
            )}

        </div>
    </div>
  );
}

export default App;
