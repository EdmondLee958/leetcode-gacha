import { useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("new@test.com");
  const [password, setPassword] = useState("123456");
  const [leetcodeUsername, setLeetcodeUsername] = useState("edlee1");
  const [message, setMessage] = useState("");
  const [inventory, setInventory] = useState(null);
  const [lastRoll, setLastRoll] = useState(null);
  const [syncResult, setSyncResult] = useState(null);
  const [lineup, setLineup] = useState(null);
  const [run, setRun] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [rewardCharacterId, setRewardCharacterId] = useState("");
  const [rewardType, setRewardType] = useState("heal");
  const [rewardResult, setRewardResult] = useState(null);
  const [endRunResult, setEndRunResult] = useState(null);
  const [selectedLineupIds, setSelectedLineupIds] = useState([]);
  const [lineupResult, setLineupResult] = useState(null);

  const token = localStorage.getItem("token");

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || data.error || "Request failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      } else {
        setMessage(data.message || "Success");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  async function loadInventory() {
    const res = await fetch(`${API_URL}/inventory`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setInventory(data);
  }

  if (token) {
    return (
      <div className="container">
        <h1>LeetCode Gacha</h1>
        <h2>Dashboard</h2>

        <button onClick={syncLeetCode}>Sync LeetCode</button>
        <button onClick={loadInventory}>Load Inventory</button>
        <button onClick={rollCharacter}>Roll Character</button>
        <button onClick={loadLineup}>Load Lineup</button>
        <button onClick={loadRun}>Load Run</button>
        <button onClick={startBattle}>Battle</button>
        <button onClick={endRun}>End Run</button>

{inventory && (
  <div>
    <p>Rolls: {inventory.rolls}</p>

    <h3>Characters</h3>

    {inventory.characters.map(character => (
      <div key={character._id}>
        {character.name} - {character.rarity}

        <label>
          <input
            type="checkbox"
            checked={selectedLineupIds.includes(character._id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedLineupIds([
                  ...selectedLineupIds,
                  character._id
                ]);
              } else {
                setSelectedLineupIds(
                  selectedLineupIds.filter(
                    id => id !== character._id
                  )
                );
              }
            }}
          />
          Add to lineup
        </label>
      </div>
    ))}

    <p>Selected: {selectedLineupIds.length}/4</p>

    <button onClick={setNewLineup}>
      Set Lineup
    </button>

    {lineupResult && (
      <p>{lineupResult.message || lineupResult.error}</p>
    )}
  </div>
)}

{syncResult && (
  <div>
    <h3>Sync Result</h3>
    <p>Rolls Earned: {syncResult.rollsEarned}</p>
  </div>
)}

{lineup && (
  <div>
    <h3>Lineup</h3>
    {lineup.map(character => (
      <div key={character._id}>
        {character.name} - {character.rarity}
      </div>
    ))}
  </div>
)}

{run && run.party && (
  <div>
    <h3>Current Run</h3>
    <p>Encounter: {run.encounterNumber}</p>
    <p>Score: {run.score}</p>

    {run.party.map(character => (
      <div key={character._id}>
        {character.name}: {character.hp}/{character.maxHp} HP
      </div>
    ))}
  </div>

)}

{run && run.pendingReward && (
  <div>
    <h3>Claim Reward</h3>

    <select
      value={rewardCharacterId}
      onChange={e => setRewardCharacterId(e.target.value)}
    >
      <option value="">Choose character</option>
      {run.party
        .filter(character => character.alive)
        .map(character => (
          <option key={character.characterId} value={character.characterId}>
            {character.name} - {character.hp}/{character.maxHp} HP
          </option>
        ))}
    </select>

    <select
      value={rewardType}
      onChange={e => setRewardType(e.target.value)}
    >
      <option value="heal">Heal 25%</option>
      <option value="hp">+3 HP</option>
      <option value="atk">+1 ATK</option>
    </select>

    <button onClick={claimReward}>
      Claim Reward
    </button>
  </div>
)}

{rewardResult && (
  <p>{rewardResult.message || rewardResult.error}</p>
)}

{endRunResult && (
  <div>
    <h3>Run Ended</h3>
    <p>Score: {endRunResult.score}</p>
    <p>Dead Characters Removed: {endRunResult.deadCharacterIds?.length}</p>
  </div>
)}

{battleResult && (
  <div>
    <h3>Battle Result</h3>
    <p>{battleResult.result}</p>

    {battleResult.log && battleResult.log.map((line, index) => (
      <div key={index}>{line}</div>
    ))}
  </div>
)}

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

  async function rollCharacter() {
  const res = await fetch(`${API_URL}/roll`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  setLastRoll(data);

  loadInventory();
}

async function syncLeetCode() {
  const res = await fetch(`${API_URL}/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  setSyncResult(data);
  loadInventory();
}

async function loadLineup() {
  const res = await fetch(`${API_URL}/lineup`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  setLineup(data.lineup);
}

async function loadRun() {
  const res = await fetch(`${API_URL}/runs/current`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  setRun(data.run || data);
}

async function startBattle() {
  const res = await fetch(`${API_URL}/runs/battle`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();
  setBattleResult(data);
  loadRun();
}

async function claimReward() {
  const res = await fetch(`${API_URL}/runs/reward`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      characterId: rewardCharacterId,
      rewardType
    })
  });

  const data = await res.json();
  setRewardResult(data);
  loadRun();
}

async function endRun() {
  const res = await fetch(`${API_URL}/runs/end`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  setEndRunResult(data);
  loadInventory();
  loadRun();
}

async function setNewLineup() {
  const res = await fetch(`${API_URL}/lineup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      characterIds: selectedLineupIds
    })
  });

  const data = await res.json();
  setLineupResult(data);
  loadLineup();
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