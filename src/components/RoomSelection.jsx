import { useState, useEffect } from "react";
import { generateRoomCode, generateUserName } from "../utils/helpers";
import milkyway from "../assets/milkyway.svg";
import doodlebob from "../assets/doodlebob.svg";
import { useDarkMode } from "../contexts/DarkModeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const RoomSelection = ({ onJoinRoom, initialRoomCode }) => {
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState("create");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

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
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center transition-colors duration-200">
      <div className="fixed inset-0 bg-white dark:bg-gray-900 opacity-40 pointer-events-none"></div>

      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        onClick={toggleDarkMode}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <FontAwesomeIcon
          icon={isDarkMode ? faSun : faMoon}
          className={`${isDarkMode ? "text-yellow-400" : "text-blue-500"}`}
          size="lg"
        />
      </button>

      <h1 className="text-7xl font-bold mb-8 relative z-10 text-black dark:text-white fade-in">
        doodle.bob
      </h1>
      <h2 className="text-lg sm:text-xl font-semibold text-center flex items-center mb-8 relative z-10 text-black dark:text-white fade-in">
        a whiteboard for everyone
        <img
          alt="milkyway"
          className="-mt-1 pl-2"
          width={60}
          height={60}
          src={doodlebob}
        />
      </h2>
      {!showForm ? (
        <div className="mb-12 relative z-10">
          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="px-10 py-3 rounded-full font-medium transition-all duration-300 bg-pink-500 text-white shadow-md hover:bg-pink-600"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md px-6 relative z-10">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200"
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              {mode === "create" ? "Create New Room" : "Join Existing Room"}
            </h2>

            <div className="mb-6 flex justify-center">
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-md shadow-inner border border-gray-300 dark:border-gray-600">
                <button
                  type="button"
                  onClick={() => toggleMode("create")}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${
                    mode === "create"
                      ? "bg-black dark:bg-gray-900 text-white"
                      : "bg-transparent text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => toggleMode("join")}
                  className={`px-4 py-2 font-medium rounded-md transition-colors ${
                    mode === "join"
                      ? "bg-black dark:bg-gray-900 text-white"
                      : "bg-transparent text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Join
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 text-gray-800 dark:text-white"
                placeholder="Enter your name"
                autoFocus
              />
            </div>

            {mode === "join" && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 text-gray-800 dark:text-white"
                  placeholder="Enter 6-digit room code"
                  maxLength={6}
                />
              </div>
            )}

            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-black dark:bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
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
