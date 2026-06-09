import { useEffect, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

const SKILLS = {
  Knight: [
    { number: 1, name: "Strike", target: "enemy" },
    { number: 2, name: "Guard", target: "self" }
  ],
  Ranger: [
    { number: 1, name: "Shot", target: "enemy" },
    { number: 2, name: "Focus", target: "self" }
  ],
  Doctor: [
    { number: 1, name: "Scalpel", target: "enemy" },
    { number: 2, name: "Patch Up", target: "ally" }
  ],
  Scout: [
    { number: 1, name: "Stab", target: "enemy" },
    { number: 2, name: "Drain Strike", target: "enemy" }
  ],
  Mercenary: [
    { number: 1, name: "Slash", target: "enemy" },
    { number: 2, name: "Wide Swing", target: "none" }
  ],
  Bannerman: [
    { number: 1, name: "Banner Strike", target: "enemy" },
    { number: 2, name: "Rally", target: "ally" }
  ],
  Ronin: [
    { number: 1, name: "Cut", target: "enemy" },
    { number: 2, name: "Focus Blade", target: "self" }
  ]
};

const CHARACTER_INFO = {
  Knight: {
    hp: 21,
    atk: "4-6",
    spd: 4,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Grants self -25% damage taken for 3 turns."
    ]
  },
  Ranger: {
    hp: 16,
    atk: "8-10",
    spd: 7,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Grants self +25% damage done for 3 turns."
    ]
  },
  Doctor: {
    hp: 19,
    atk: "4-6",
    spd: 9,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Heals an ally for 100% of ATK."
    ]
  },
  Scout: {
    hp: 17,
    atk: "6-8",
    spd: 8,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Deals 50% of ATK to a single enemy and heals self for 50% of ATK."
    ]
  },
  Mercenary: {
    hp: 20,
    atk: "5-9",
    spd: 7,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Deals 50% of ATK to all enemies."
    ]
  },
  Bannerman: {
    hp: 16,
    atk: "5-7",
    spd: 8,
    critRate: "10%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Grants an ally +25% damage done for 3 turns."
    ]
  },
  Ronin: {
    hp: 18,
    atk: "9-13",
    spd: 7,
    critRate: "15%",
    critDamage: "50%",
    skills: [
      "Deals 100% of ATK to a single enemy.",
      "Grants self +25% damage done for 3 turns."
    ]
  }
};

const SPRITES = {
  Knight: "/sprites/knight.png",
  Ranger: "/sprites/ranger.png",
  Doctor: "/sprites/doctor.png",
  Scout: "/sprites/scout.png",
  Mercenary: "/sprites/mercenary.png",
  Bannerman: "/sprites/bannerman.png",
  Ronin: "/sprites/ronin.png",
  Goblin: "/sprites/goblin.png",
  "First Boss": "/sprites/boss.png"
};

function App() {
  const [page, setPage] = useState("dashboard");
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [message, setMessage] = useState("");

  const [inventory, setInventory] = useState(null);
  const [lineup, setLineup] = useState(null);
  const [run, setRun] = useState(null);

  const [expandedCharacterId, setExpandedCharacterId] = useState(null);
  const [selectedLineupIds, setSelectedLineupIds] = useState([]);

  const [syncResult, setSyncResult] = useState(null);
  const [lastRoll, setLastRoll] = useState(null);

  const [selectedSkill, setSelectedSkill] = useState(1);
  const [selectedTargetPosition, setSelectedTargetPosition] = useState(1);

  const [rewardCharacterId, setRewardCharacterId] = useState("");
  const [rewardType, setRewardType] = useState("heal");
  const [rewardResult, setRewardResult] = useState(null);

  const [endRunResult, setEndRunResult] = useState(null);
  const [battleMessage, setBattleMessage] = useState("");

const [unitAnimations, setUnitAnimations] = useState({});

  const token = localStorage.getItem("token");

  async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const data = await res.json();
    return { res, data };
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

      const { res, data } = await apiRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        setMessage(data.message || data.error || "Request failed");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.reload();
      } else {
        setMessage(data.message || "Account created. You can now log in.");
        setMode("login");
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  }

  async function loadInventory() {
    const { data } = await apiRequest("/inventory");
    setInventory(data);
    return data;
  }

  async function loadLineup() {
    const { data } = await apiRequest("/lineup");
    setLineup(data.lineup || []);
    return data.lineup || [];
  }

  async function loadRun() {
    const { data } = await apiRequest("/runs/current");
    setRun(data.run || null);
    return data.run || null;
  }

  async function syncLeetCode() {
    const { data } = await apiRequest("/sync", {
      method: "POST"
    });

    setSyncResult(data);
    await loadInventory();
  }

  async function rollCharacter() {
    const { data } = await apiRequest("/roll", {
      method: "POST"
    });

    setLastRoll(data);
    await loadInventory();
  }

  async function setNewLineup() {
    const { data } = await apiRequest("/lineup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterIds: selectedLineupIds })
    });

    setMessage(data.message || data.error || "Lineup updated");

    if (data.lineup) {
  setSelectedLineupIds(data.lineup);
}

    await loadLineup();
  }

  async function startRun() {
    const { data } = await apiRequest("/runs/start", {
      method: "POST"
    });

    if (data.run) {
      setRun(data.run);
      setBattleMessage("Run started.");
    } else {
      setBattleMessage(data.message || data.error || "Could not start run");
    }
  }

async function takeAction(skillNumber, targetPosition) {
  const skill = getCurrentSkills().find(
    skill => skill.number === skillNumber
  );

  if (skill?.target === "enemy") {
    const target = run?.enemies?.find(
      enemy => enemy.position === Number(targetPosition)
    );

    if (target) {
      triggerAnimation(target._id, "hit");
    }
  }

  if (skill?.target === "ally") {
    const target = run?.party?.find(
      ally => ally.position === Number(targetPosition)
    );

    if (target) {
      triggerAnimation(target._id, "boost");
    }
  }

  if (skill?.target === "self" || skill?.target === "none") {
    const currentUnit = getCurrentUnit();

    if (currentUnit) {
      triggerAnimation(currentUnit._id, "boost");
    }
  }

  const { data } = await apiRequest("/runs/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skillNumber,
      targetPosition
    })
  });

  if (data.run) {
    setRun(data.run);
  }

  setBattleMessage(data.message || data.error || "Action resolved");
}

  async function claimReward() {
    const { data } = await apiRequest("/runs/reward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        characterId: rewardCharacterId,
        rewardType
      })
    });

    setRewardResult(data);

    if (data.run) {
      setRun(data.run);
    }
  }

async function endRun() {
  const { data } = await apiRequest("/runs/end", {
    method: "POST"
  });

  setEndRunResult(data);
  setRun(null);
  setSelectedLineupIds([]);
  setLineup([]);

  await loadInventory();
  await loadLineup();
}

  useEffect(() => {
    if (token) {
      loadInventory();
      loadLineup();
      loadRun();
    }
  }, [token]);

  function logout() {
    localStorage.removeItem("token");
    window.location.reload();
  }

  function getCurrentUnit() {
    if (!run || !run.turnOrder || !run.party || !run.enemies) return null;

    const id = run.turnOrder[run.currentTurnIndex];

    return [...run.party, ...run.enemies].find(unit => unit._id === id);
  }

  function getCurrentSkills() {
    const currentUnit = getCurrentUnit();

    if (!currentUnit || currentUnit.side !== "ally") return [];

    return SKILLS[currentUnit.name] || [];
  }

  function getTargetsForSkill(skill) {
    if (!run || !skill) return [];

    if (skill.target === "enemy") {
      return run.enemies.filter(enemy => enemy.alive);
    }

    if (skill.target === "ally") {
      return run.party.filter(ally => ally.alive);
    }

    return [];
  }

  function handleSkillClick(skill) {
    setSelectedSkill(skill.number);

    const targets = getTargetsForSkill(skill);

    if (targets.length > 0) {
      setSelectedTargetPosition(targets[0].position);
    } else {
      setSelectedTargetPosition(1);
    }
  }

function triggerAnimation(unitId, type) {
  console.log("ANIMATION TRIGGERED", unitId, type);

  setUnitAnimations(prev => ({
    ...prev,
    [unitId]: type
  }));

  setTimeout(() => {
    setUnitAnimations(prev => {
      const copy = { ...prev };
      delete copy[unitId];
      return copy;
    });
  }, 900);
}

  async function useSelectedSkill() {
    const skill = getCurrentSkills().find(s => s.number === selectedSkill);

    if (!skill) {
      setBattleMessage("No valid skill selected.");
      return;
    }

    const targetPosition =
      skill.target === "self" || skill.target === "none"
        ? 1
        : selectedTargetPosition;

    await takeAction(skill.number, targetPosition);
  }

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="brand">LEETCODE GACHA</div>
          <h1>{mode === "login" ? "Login" : "Register"}</h1>
          <p className="muted">
            Solve LeetCode problems, earn rolls, recruit characters, and survive dungeon runs.
          </p>

          <div className="tab-row">
            <button
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={mode === "signup" ? "tab active" : "tab"}
              onClick={() => setMode("signup")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="form-stack">
            <input
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <input
              placeholder="Password"
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

            <button className="primary-btn" type="submit">
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  const currentUnit = getCurrentUnit();
  const currentSkills = getCurrentSkills();
  const selectedSkillData = currentSkills.find(
    skill => skill.number === selectedSkill
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand sidebar-brand">LEETCODE GACHA</div>

        <button
          className={page === "dashboard" ? "nav-btn active" : "nav-btn"}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "inventory" ? "nav-btn active" : "nav-btn"}
          onClick={() => {
            setPage("inventory");
            loadInventory();
          }}
        >
          View Inventory
        </button>

        <button
          className={page === "gacha" ? "nav-btn active" : "nav-btn"}
          onClick={() => {
            setPage("gacha");
            loadInventory();
          }}
        >
          Gacha
        </button>

        <button
          className={page === "battle" ? "nav-btn active" : "nav-btn"}
          onClick={() => {
            setPage("battle");
            loadInventory();
            loadLineup();
            loadRun();
          }}
        >
          Battle
        </button>

        <button className="nav-btn danger" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-panel">
        {page === "dashboard" && (
          <section>
            <h1>Dashboard</h1>
            <p className="muted">
              Choose where to go next. Your main loop is Gacha → Inventory → Battle.
            </p>

            <div className="dashboard-grid">
              <button className="big-menu-card" onClick={() => setPage("inventory")}>
                <h2>View Inventory</h2>
                <p>Inspect your owned characters and select a lineup.</p>
              </button>

              <button className="big-menu-card" onClick={() => setPage("gacha")}>
                <h2>Gacha</h2>
                <p>Sync LeetCode, earn rolls, and pull new characters.</p>
              </button>

              <button className="big-menu-card" onClick={() => setPage("battle")}>
                <h2>Battle</h2>
                <p>Enter a turn-based dungeon run with permadeath.</p>
              </button>
            </div>
          </section>
        )}

        {page === "inventory" && (
          <section>
            <div className="section-header">
              <div>
                <h1>Inventory</h1>
                <p className="muted">Click a character to inspect details. Select 4 for your lineup.</p>
              </div>

              <button className="secondary-btn" onClick={() => setPage("dashboard")}>
                Back to Dashboard
              </button>
            </div>

            <div className="panel">
              <p className="currency">Rolls: {inventory?.rolls ?? 0}</p>

              <div className="card-grid">
                {inventory?.characters?.map(character => (
                  <div
                    key={character._id}
                    className={`character-card rarity-${character.rarity?.toLowerCase()}`}
                  >
                    <div
                      className="card-main"
                      onClick={() =>
                        setExpandedCharacterId(
                          expandedCharacterId === character._id ? null : character._id
                        )
                      }
                    >
<img
  src={SPRITES[character.name]}
  alt={character.name}
  style={{
    width: "96px",
    height: "96px",
    objectFit: "contain",
    imageRendering: "pixelated",
    display: "block",
    margin: "0 auto 10px"
  }}
/>

<h3>{character.name}</h3>
<span>{character.rarity}</span>
<p>{character.classType}</p>
                    </div>

                    <label className="checkbox-line">
                      <input
                        type="checkbox"
                        checked={selectedLineupIds.includes(character._id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedLineupIds([...selectedLineupIds, character._id]);
                          } else {
                            setSelectedLineupIds(
                              selectedLineupIds.filter(id => id !== character._id)
                            );
                          }
                        }}
                      />
                      Add to lineup
                    </label>

{expandedCharacterId === character._id && (
  <div className="dropdown-details">
    <p>Level: {character.level}</p>
    <p>Class: {character.classType}</p>

    {CHARACTER_INFO[character.name] && (
      <>
        <p>HP: {CHARACTER_INFO[character.name].hp}</p>
        <p>ATK: {CHARACTER_INFO[character.name].atk}</p>
        <p>SPD: {CHARACTER_INFO[character.name].spd}</p>
        <p>Crit Rate: {CHARACTER_INFO[character.name].critRate}</p>
        <p>Crit Damage: {CHARACTER_INFO[character.name].critDamage}</p>

        <h4>Skills</h4>
        <p>Skill 1: {CHARACTER_INFO[character.name].skills[0]}</p>
        <p>Skill 2: {CHARACTER_INFO[character.name].skills[1]}</p>
      </>
    )}
  </div>
)}
                  </div>
                ))}
              </div>

              <div className="lineup-box">
                <p>Selected: {selectedLineupIds.length}/4</p>
                <button className="primary-btn" onClick={setNewLineup}>
                  Set Lineup
                </button>
                {message && <p className="message">{message}</p>}
              </div>
            </div>
          </section>
        )}

        {page === "gacha" && (
          <section>
            <div className="section-header">
              <div>
                <h1>Gacha</h1>
                <p className="muted">Sync LeetCode to earn rolls, then pull characters.</p>
              </div>

              <button className="secondary-btn" onClick={() => setPage("dashboard")}>
                Back to Dashboard
              </button>
            </div>

            <div className="two-column">
              <div className="panel">
                <h2>Rolls</h2>
                <p className="roll-count">{inventory?.rolls ?? 0}</p>

                <button className="primary-btn" onClick={syncLeetCode}>
                  Sync LeetCode
                </button>

                <button className="primary-btn" onClick={rollCharacter}>
                  Pull Character
                </button>

                {syncResult && (
                  <div className="result-box">
                    <h3>Sync Result</h3>
                    <p>Rolls Earned: {syncResult.rollsEarned ?? 0}</p>
                    {syncResult.message && <p>{syncResult.message}</p>}
                  </div>
                )}
              </div>

              <div className="panel">
                <h2>Latest Pull</h2>
                {lastRoll?.character ? (
                  <div className={`character-card rarity-${lastRoll.character.rarity?.toLowerCase()}`}>
                    <h3>{lastRoll.character.name}</h3>
                    <p>{lastRoll.character.rarity}</p>
                    <p>{lastRoll.character.classType}</p>
                  </div>
                ) : (
                  <p className="muted">No pull yet this session.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {page === "battle" && (
          <section>
            <div className="section-header">
              <div>
                <h1>Battle</h1>
                <p className="muted">
                  Turn-based combat. Choose skills and targets when an ally is acting.
                </p>
              </div>

              <button className="secondary-btn" onClick={() => setPage("dashboard")}>
                Back to Dashboard
              </button>
            </div>

            {!run && (
              <div className="panel">
                <h2>No Current Run</h2>
                <p className="muted">
                  Select 4 characters in Inventory, then start a run here.
                </p>
                <button className="primary-btn" onClick={startRun}>
                  Start Run
                </button>
              </div>
            )}

            {run && (
              <div className="battle-layout">
                <div className="battle-board">
                  <div className="team-panel">
                    <h2>Allies</h2>
                    <div className="unit-row">
                      {run.party?.map(unit => (
                        <div
                          key={unit._id}
className={`unit-card ${unit.alive ? "" : "dead"} ${
  unitAnimations[unit._id] || ""
}`}
                        >
                          <span className="position">P{unit.position}</span>
<img
  src={SPRITES[unit.name]}
  alt={unit.name}
  style={{
    width: "72px",
    height: "72px",
    objectFit: "contain",
    imageRendering: "pixelated",
    display: "block",
    margin: "0 auto 8px"
  }}
/>
                          <h3>{unit.name}</h3>
                          <p>{unit.hp}/{unit.maxHp} HP</p>
                          <p>SPD {unit.spd}</p>
                          {unit.buffs?.length > 0 && <p>Buffs: {unit.buffs.length}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="team-panel">
                    <h2>Enemies</h2>
                    <div className="unit-row">
                      {run.enemies?.map(unit => (
                        <div
                          key={unit._id}
className={`unit-card enemy ${unit.alive ? "" : "dead"} ${
  unitAnimations[unit._id] || ""
}`}
                        >
                          <span className="position">E{unit.position}</span>
<img
  src={SPRITES[unit.name]}
  alt={unit.name}
  style={{
    width: "72px",
    height: "72px",
    objectFit: "contain",
    imageRendering: "pixelated",
    display: "block",
    margin: "0 auto 8px"
  }}
/>
                          <h3>{unit.name}</h3>
                          <p>{unit.hp}/{unit.maxHp} HP</p>
                          <p>SPD {unit.spd}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel">
                    <h2>Current Turn</h2>
                    {currentUnit ? (
                      <p>
                        {currentUnit.side === "ally" ? "Ally" : "Enemy"}{" "}
                        {currentUnit.position}: {currentUnit.name}
                      </p>
                    ) : (
                      <p>No current unit.</p>
                    )}

                    {run.phase === "reward" && (
                      <div className="reward-panel">
                        <h3>Choose Reward</h3>

                        <p>
  Rewards Claimed: {run.rewardClaims?.length || 0}/
  {run.party?.filter(character => character.alive).length || 0}
</p>

                        <select
                          value={rewardCharacterId}
                          onChange={e => setRewardCharacterId(e.target.value)}
                        >
                          <option value="">Choose character</option>
                          {run.party
                            ?.filter(
  character =>
    character.alive &&
    !run.rewardClaims?.includes(character.characterId)
)
                            .map(character => (
                              <option key={character.characterId} value={character.characterId}>
                                {character.name} {character.hp}/{character.maxHp}
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
                          <option value="spd">+1 SPD</option>
                          <option value="critRate">+1% Crit Rate</option>
                          <option value="critDamage">+2% Crit Damage</option>
                        </select>

                        <button className="primary-btn" onClick={claimReward}>
                          Claim Reward
                        </button>

                        {rewardResult && (
                          <p className="message">
                            {rewardResult.message || rewardResult.error}
                          </p>
                        )}
                      </div>
                    )}

                    {run.phase === "battle" && currentUnit?.side === "ally" && (
                      <div className="action-panel">
                        <h3>Choose Skill</h3>
                        <div className="button-row">
                          {currentSkills.map(skill => (
                            <button
                              key={skill.number}
                              className={
                                selectedSkill === skill.number
                                  ? "small-btn active"
                                  : "small-btn"
                              }
                              onClick={() => handleSkillClick(skill)}
                            >
                              Skill {skill.number}: {skill.name}
                            </button>
                          ))}
                        </div>

                        {selectedSkillData && currentUnit && (
  <div className="skill-detail-box">
    <h4>{selectedSkillData.name}</h4>
    <p>
      Skill {selectedSkillData.number}:{" "}
      {CHARACTER_INFO[currentUnit.name]?.skills[selectedSkillData.number - 1]}
    </p>
  </div>
)}

                        {selectedSkillData &&
                          selectedSkillData.target !== "self" &&
                          selectedSkillData.target !== "none" && (
                            <>
                              <h3>Choose Target</h3>
                              <div className="button-row">
                                {getTargetsForSkill(selectedSkillData).map(target => (
                                  <button
                                    key={target._id}
                                    className={
                                      selectedTargetPosition === target.position
                                        ? "small-btn active"
                                        : "small-btn"
                                    }
                                    onClick={() => setSelectedTargetPosition(target.position)}
                                  >
                                    {target.side === "enemy" ? "Enemy" : "Ally"}{" "}
                                    {target.position}: {target.name}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                        <button className="primary-btn" onClick={useSelectedSkill}>
                          Use Skill
                        </button>

                        {battleMessage && <p className="message">{battleMessage}</p>}
                      </div>
                    )}

                    {run.status === "failed" && (
                      <div className="result-box danger-box">
                        <h3>Run Failed</h3>
                        <p>Your party was defeated. End the run to apply permadeath.</p>
                      </div>
                    )}

                    <button className="danger-btn" onClick={endRun}>
                      End Run
                    </button>

                    {endRunResult && (
                      <div className="result-box">
                        <h3>Run Ended</h3>
                        <p>Score: {endRunResult.score}</p>
                        <p>Dead Removed: {endRunResult.deadCharacterIds?.length ?? 0}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="battle-log-panel">
                  <h2>Battle Log</h2>
                  <div className="battle-log">
                    {run.battleLog?.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;