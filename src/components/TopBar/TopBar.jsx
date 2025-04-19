import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faCog,
  faChevronDown,
  faDownload,
  faFilePdf,
  faFileImage,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { useAwareness } from "../../hooks/useYjsBinding";
import { formatRoomCode } from "../../utils/helpers";

const TopBar = ({ roomData }) => {
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const users = useAwareness();

  const toggleUsersDropdown = () => {
    setShowUsersDropdown(!showUsersDropdown);
    if (showSettingsDropdown) setShowSettingsDropdown(false);
  };

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
    if (showUsersDropdown) setShowUsersDropdown(false);
  };

  const domainDisplay = `doodle.bob/${roomData?.roomCode || ""}`;

  const handleSaveAsPng = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Canvas not found. Unable to save as PNG.");
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = `doodle.bob-${roomData?.roomCode || "drawing"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowSettingsDropdown(false);
    } catch (error) {
      console.error("Error saving canvas as PNG:", error);
      alert("Failed to save as PNG. Please try again.");
    }
  };

  const handleSaveAsPdf = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      alert("Canvas not found. Unable to save as PDF.");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const width = canvas.width;
      const height = canvas.height;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>doodle.bob - ${roomData?.roomCode || "Drawing"}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
              }
              @media print {
                body {
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" alt="milky.way Drawing" />
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      setShowSettingsDropdown(false);
    } catch (error) {
      console.error("Error saving canvas as PDF:", error);
      alert("Failed to save as PDF. Please try again.");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white h-12 z-50 flex items-center justify-between px-4">
      <div className="flex items-center">
        <h1 className="text-lg font-mono font-semibold text-gray-700">
          {domainDisplay}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            className="p-2 flex items-center gap-2"
            onClick={toggleUsersDropdown}
          >
            <FontAwesomeIcon
              icon={faUsers}
              className="text-blue-500"
              size="lg"
            />
            <span className="text-sm font-medium text-gray-700">
              {users?.length || 0}
            </span>
          </button>

          {showUsersDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="max-h-80 overflow-y-auto">
                <ul className="divide-y divide-gray-100">
                  {users && users.length > 0 ? (
                    users.map((user) => {
                      const brightColors = [
                        "#FF5733",
                        "#33FF57",
                        "#3357FF",
                        "#FF33A8",
                        "#33FFF5",
                        "#F5FF33",
                        "#A833FF",
                        "#FF8C33",
                      ];

                      const colorIndex =
                        (user.clientID || user.name?.length || 0) %
                        brightColors.length;
                      const avatarColor = brightColors[colorIndex];

                      return (
                        <li
                          key={user.clientID}
                          className="flex items-center p-3"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-sm"
                            style={{ backgroundColor: avatarColor }}
                          >
                            {user.name ? user.name.charAt(0) : "A"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.name || "Anonymous"}
                              {roomData && roomData.userName === user.name && (
                                <span className="ml-2 text-xs font-medium text-blue-600">
                                  (You)
                                </span>
                              )}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {user.currentTool
                                ? `Using: ${user.currentTool}`
                                : "Viewing"}
                            </p>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li className="py-3 px-4 text-sm text-gray-500">
                      No users connected
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="p-2 flex items-center gap-2"
            onClick={toggleSettingsDropdown}
          >
            <FontAwesomeIcon icon={faCog} className="text-blue-500" size="lg" />
          </button>

          {showSettingsDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
              <div className="px-4 pt-3 pb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Export
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 flex items-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={handleSaveAsPng}
                  >
                    <FontAwesomeIcon
                      icon={faFileImage}
                      className="mr-2 text-blue-500"
                      size="lg"
                    />
                    <span>PNG Image</span>
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 flex items-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    onClick={handleSaveAsPdf}
                  >
                    <FontAwesomeIcon
                      icon={faFilePdf}
                      className="mr-2 text-red-500"
                      size="lg"
                    />
                    <span>PDF Document</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-2"></div>

              <div className="px-4 pt-3 pb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Canvas
                </h3>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 flex items-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors mb-2">
                  <FontAwesomeIcon
                    icon={faCog}
                    className="mr-2 text-gray-600"
                  />
                  <span>Canvas Options</span>
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 flex items-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="mr-2 text-gray-600"
                  />
                  <span>Display Preferences</span>
                </button>
              </div>

              <div className="border-t border-gray-100 mt-2"></div>

              <div className="px-4 pt-3 pb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Room
                </h3>
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 flex items-center bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  onClick={() => {
                    if (
                      window.confirm("Are you sure you want to leave the room?")
                    ) {
                      if (roomData && roomData.onLeaveRoom) {
                        roomData.onLeaveRoom();
                      }
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  <span>Leave Room</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;

