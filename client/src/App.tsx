import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  CheckCircle2,
  CircleUserRound,
  Flame,
  LogIn,
  LogOut,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  UserPlus,
  XCircle,
} from "lucide-react";
import { auth, googleProvider, hasFirebaseConfig } from "./firebase";
import { categories, prompts, type Category, type PromptType } from "./prompts";

type Player = {
  id: string;
  name: string;
  score: number;
};

type GameStage = "setup" | "category" | "play";
type AuthMode = "signin" | "signup";

const starterPlayers: Player[] = [
  { id: crypto.randomUUID(), name: "Player 1", score: 0 },
  { id: crypto.randomUUID(), name: "Player 2", score: 0 },
];

function randomPrompt(category: Category, type: PromptType) {
  const list = prompts[category][type];
  return list[Math.floor(Math.random() * list.length)];
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [players, setPlayers] = useState<Player[]>(starterPlayers);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [stage, setStage] = useState<GameStage>("setup");
  const [category, setCategory] = useState<Category>("Normal");
  const [turnIndex, setTurnIndex] = useState(0);
  const [activeType, setActiveType] = useState<PromptType | null>(null);
  const [activePrompt, setActivePrompt] = useState("");

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, setUser);
  }, []);

  const currentPlayer = players[turnIndex % players.length];
  const canStart = players.filter((player) => player.name.trim()).length >= 2;
  const leaderboard = useMemo(
    () => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [players],
  );

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");

    if (!auth) {
      setAuthMessage("Add Firebase env values to enable sign in.");
      return;
    }

    try {
      if (authMode === "signin") {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      } else {
        await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setAuthForm({ email: "", password: "" });
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
  }

  async function handleGoogleSignIn() {
    if (!auth) {
      setAuthMessage("Add Firebase env values to enable Google sign in.");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Google sign in failed.");
    }
  }

  function addPlayer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newPlayerName.trim();

    if (!name) {
      return;
    }

    setPlayers((current) => [...current, { id: crypto.randomUUID(), name, score: 0 }]);
    setNewPlayerName("");
  }

  function updatePlayerName(id: string, name: string) {
    setPlayers((current) =>
      current.map((player) => (player.id === id ? { ...player, name } : player)),
    );
  }

  function removePlayer(id: string) {
    setPlayers((current) => current.filter((player) => player.id !== id));
    setTurnIndex(0);
  }

  function beginGame() {
    setPlayers((current) =>
      current
        .filter((player) => player.name.trim())
        .map((player) => ({ ...player, name: player.name.trim(), score: 0 })),
    );
    setTurnIndex(0);
    setActiveType(null);
    setActivePrompt("");
    setStage("category");
  }

  function choosePrompt(type: PromptType) {
    setActiveType(type);
    setActivePrompt(randomPrompt(category, type));
  }

  function finishTurn(delta: number) {
    setPlayers((current) =>
      current.map((player, index) =>
        index === turnIndex % current.length ? { ...player, score: player.score + delta } : player,
      ),
    );
    setTurnIndex((current) => (current + 1) % players.length);
    setActiveType(null);
    setActivePrompt("");
  }

  function resetGame() {
    setPlayers((current) => current.map((player) => ({ ...player, score: 0 })));
    setTurnIndex(0);
    setActiveType(null);
    setActivePrompt("");
    setStage("setup");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Party mode</p>
          <h1>Truth or Dare</h1>
        </div>
        <div className="auth-card">
          {user ? (
            <>
              <span className="user-chip">
                <CircleUserRound size={18} />
                {user.email ?? user.displayName ?? "Signed in"}
              </span>
              <button className="icon-button" type="button" onClick={() => auth && signOut(auth)}>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <AuthPanel
              authForm={authForm}
              authMessage={authMessage}
              authMode={authMode}
              firebaseReady={hasFirebaseConfig}
              onFormChange={setAuthForm}
              onGoogleSignIn={handleGoogleSignIn}
              onModeChange={setAuthMode}
              onSubmit={handleAuthSubmit}
            />
          )}
        </div>
      </section>

      <section className="workspace">
        <aside className="side-panel">
          <div className="panel-heading">
            <Trophy size={20} />
            <h2>Scores</h2>
          </div>
          <div className="score-list">
            {leaderboard.map((player, index) => (
              <div className="score-row" key={player.id}>
                <span>{index + 1}</span>
                <strong>{player.name || "Unnamed"}</strong>
                <b>{player.score}</b>
              </div>
            ))}
          </div>
        </aside>

        <section className="game-panel">
          {stage === "setup" && (
            <div className="flow">
              <div className="section-title">
                <UserPlus size={24} />
                <div>
                  <p className="eyebrow">Day 3</p>
                  <h2>Add players</h2>
                </div>
              </div>
              <div className="player-list">
                {players.map((player) => (
                  <div className="player-row" key={player.id}>
                    <input
                      aria-label="Player name"
                      value={player.name}
                      onChange={(event) => updatePlayerName(player.id, event.target.value)}
                    />
                    <button
                      className="icon-button"
                      disabled={players.length <= 2}
                      type="button"
                      onClick={() => removePlayer(player.id)}
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <form className="add-player" onSubmit={addPlayer}>
                <input
                  placeholder="New player name"
                  value={newPlayerName}
                  onChange={(event) => setNewPlayerName(event.target.value)}
                />
                <button type="submit">
                  <Plus size={18} />
                  Add
                </button>
              </form>
              <button className="primary-action" disabled={!canStart} type="button" onClick={beginGame}>
                <Sparkles size={20} />
                Start game
              </button>
            </div>
          )}

          {stage === "category" && (
            <div className="flow">
              <div className="section-title">
                <Shuffle size={24} />
                <div>
                  <p className="eyebrow">Day 5</p>
                  <h2>Choose category</h2>
                </div>
              </div>
              <div className="category-grid">
                {categories.map((item) => (
                  <button
                    className={item === category ? "category-card selected" : "category-card"}
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                  >
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              <button className="primary-action" type="button" onClick={() => setStage("play")}>
                <Flame size={20} />
                Play round
              </button>
            </div>
          )}

          {stage === "play" && (
            <div className="flow play-flow">
              <div className="turn-card">
                <p className="eyebrow">{category} category</p>
                <h2>{currentPlayer.name}'s turn</h2>
              </div>
              <div className="choice-row">
                <button type="button" onClick={() => choosePrompt("truth")}>
                  Truth
                </button>
                <button type="button" onClick={() => choosePrompt("dare")}>
                  Dare
                </button>
              </div>
              {activePrompt && activeType && (
                <div className={`prompt-card ${activeType}`}>
                  <span>{activeType}</span>
                  <p>{activePrompt}</p>
                  <div className="result-actions">
                    <button type="button" onClick={() => finishTurn(1)}>
                      <CheckCircle2 size={18} />
                      Completed
                    </button>
                    <button type="button" onClick={() => finishTurn(-1)}>
                      <XCircle size={18} />
                      Skipped
                    </button>
                  </div>
                </div>
              )}
              <div className="secondary-actions">
                <button type="button" onClick={() => setStage("category")}>
                  <Shuffle size={18} />
                  Category
                </button>
                <button type="button" onClick={resetGame}>
                  <RotateCcw size={18} />
                  Restart
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

type AuthPanelProps = {
  authForm: { email: string; password: string };
  authMessage: string;
  authMode: AuthMode;
  firebaseReady: boolean;
  onFormChange: (value: { email: string; password: string }) => void;
  onGoogleSignIn: () => void;
  onModeChange: (value: AuthMode) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function AuthPanel({
  authForm,
  authMessage,
  authMode,
  firebaseReady,
  onFormChange,
  onGoogleSignIn,
  onModeChange,
  onSubmit,
}: AuthPanelProps) {
  return (
    <div className="auth-panel">
      <div className="mode-toggle">
        <button
          className={authMode === "signin" ? "active" : ""}
          type="button"
          onClick={() => onModeChange("signin")}
        >
          Sign in
        </button>
        <button
          className={authMode === "signup" ? "active" : ""}
          type="button"
          onClick={() => onModeChange("signup")}
        >
          Sign up
        </button>
      </div>
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={(event) => onFormChange({ ...authForm, email: event.target.value })}
        />
        <input
          minLength={6}
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={(event) => onFormChange({ ...authForm, password: event.target.value })}
        />
        <button type="submit">
          <LogIn size={16} />
          {authMode === "signin" ? "Enter" : "Create"}
        </button>
      </form>
      <button className="google-button" type="button" onClick={onGoogleSignIn}>
        Google
      </button>
      {!firebaseReady && <p className="auth-note">Firebase env values are missing.</p>}
      {authMessage && <p className="auth-note">{authMessage}</p>}
    </div>
  );
}
