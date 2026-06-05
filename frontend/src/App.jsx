import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("new@test.com");
  const [password, setPassword] = useState("123456");
  const [leetcodeUsername, setLeetcodeUsername] = useState("edlee1");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  if (token) {
  return (
    <div className="container">
      <h1>LeetCode Gacha</h1>

      <h2>Dashboard</h2>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
}

async function handleSubmit(e) {
  e.preventDefault();

  setMessage("Sending request...");

  try {
    const endpoint = mode === "login" ? "/login" : "/signup";

    const body =
      mode === "login"
        ? { email, password }
        : { email, password, leetcodeUsername };

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || data.error || "Request failed");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("token", data.token);
      window.location.reload();
    } else {
      setMessage(data.message || "Success");
    }
  } catch (error) {
    setMessage(`Error: ${error.message}`);
  }
}

  return (
    <div className="container">
      <h1>LeetCode Gacha</h1>

      <div className="buttons">
        <button onClick={() => setMode("login")}>Login</button>
        <button onClick={() => setMode("signup")}>Register</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {mode === "signup" && (
          <input
            placeholder="LeetCode username"
            value={leetcodeUsername}
            onChange={e => setLeetcodeUsername(e.target.value)}
          />
        )}

        <button type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default App;