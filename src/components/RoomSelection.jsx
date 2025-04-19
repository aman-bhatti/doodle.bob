import { useState, useEffect } from "react";
import { generateRoomCode, generateUserName } from "../utils/helpers";

const RoomSelection = ({ onJoinRoom, initialRoomCode }) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState("create");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setUserName(generateUserName());

    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
      setMode("join");
      setShowForm(true);
    }
  }, [initialRoomCode]);

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    const newRoomCode = generateRoomCode();

    onJoinRoom({
      userName: userName.trim(),
      roomCode: newRoomCode,
      isCreator: true,
    });
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    onJoinRoom({
      userName: userName.trim(),
      roomCode: roomCode.trim().toUpperCase(),
      isCreator: false,
    });
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setError("");
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (mode === "create") {
      handleCreateRoom();
    } else {
      handleJoinRoom();
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
      <div className="fixed inset-0 bg-white opacity-40 pointer-events-none"></div>

      <h1 className="text-7xl font-bold mb-8 relative z-10 text-black">
        milky.way
      </h1>
      <h2 className=" text-black text-lg sm:text-xl font-semibold text-center flex items-center gap-2 mb-4">
        a whiteboard for everyone
        <img
          alt="logo"
          class="-mt-1"
          style={{
            width: "50px",
            height: "auto",
            backgroundColor: "white",
          }}
          src="/logo.png"
        />
      </h2>
      {!showForm ? (
        <div className="mb-12 relative z-10">
          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="px-10 py-3 rounded-full font-medium transition-all duration-300 bg-pink-500 text-white shadow-md"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md px-6 relative z-10">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {mode === "create" ? "Create New Room" : "Join Existing Room"}
            </h2>

            <div className="mb-6 flex justify-center">
              <div className="flex bg-gray-100 p-1 rounded-md shadow-inner border border-gray-300">
                <button
                  type="button"
                  onClick={() => toggleMode("create")}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${
                    mode === "create"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-700"
                  }`}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => toggleMode("join")}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${
                    mode === "join"
                      ? "bg-black text-white"
                      : "bg-transparent text-gray-700"
                  }`}
                >
                  Join
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your name"
                autoFocus
              />
            </div>

            {mode === "join" && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Enter 6-digit room code"
                  maxLength={6}
                />
              </div>
            )}

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {mode === "create" ? "Create Room" : "Join Room"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RoomSelection;

