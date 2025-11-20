import useIotWebSocket, { IotMessage } from "hooks/useIotWebSocket";
import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";
import { Chip, IconButton } from "@mui/material";
import { keyframes } from "@emotion/react";
import { ContentCopy } from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

// Animation
const fadeInOut = keyframes`
  0% { background: #7cbf7eff; }
  50% { background: #338836ff; }
  100% { background: #7cbf7eff; }
`;

interface AttenzyLiveFeedProps {
  isOpen: boolean;
  onClose: () => void;
  bounds?: "parent" | undefined;
  maxEntries?: number;
}

const AttenzyLiveFeed: React.FC<AttenzyLiveFeedProps> = ({
  isOpen,
  onClose,
  bounds,
  maxEntries = 50,
}) => {
  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const [entries, setEntries] = useState<IotMessage[]>([]);
  const [currentScan, setCurrentScan] = useState<IotMessage | null>(null);

  const { db } = useFirebase();
  // Load device IDs from Firestore
  useEffect(() => {
    const loadIds = async () => {
      try {
        const snap = await getDoc(doc(db, "CONFIG", "IOT_CONFIG"));
        if (snap.exists()) {
          const arr = snap.data()?.attenzyDeviceIds || [];
          setDeviceIds(arr);
          console.log("Loaded IoT device IDs:", arr);
          if (arr.length > 0) {
            setSelectedDeviceId(arr[0]); // auto select first
          }
        }
      } catch (err) {
        console.error("Error loading IoT device IDs:", err);
      }
    };

    loadIds();
  }, []);

  // Initialize WS only when open AND deviceId selected
  const { message } = useIotWebSocket(isOpen ? selectedDeviceId : null);

  // Handle incoming messages
  useEffect(() => {
    if (message && message.rfidId) {
      setCurrentScan(message);

      setEntries((prev) => {
        const next = [message, ...prev];
        if (next.length > maxEntries) next.length = maxEntries;
        return next;
      });
    }
  }, [message, maxEntries]);

  if (!isOpen) return null;

  return (
    <Draggable handle=".rfid-header" bounds={bounds}>
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 360,
          height: 420,
          borderRadius: 12,
          boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
          background: "#fff",
          overflow: "hidden",
          zIndex: 999999,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="rfid-header"
          style={{
            background: "#0f62fe",
            color: "#fff",
            padding: "10px 12px",
            cursor: "move",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong>RFID Monitor</strong>

            {/* Device selector */}
            {deviceIds.length > 0 && (
              <select
                value={selectedDeviceId || ""}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                style={{
                  marginLeft: 10,
                  padding: "4px 6px",
                  borderRadius: 4,
                  border: "1px solid #fff",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontSize: 12,
                }}
              >
                {deviceIds.map((id) => (
                  <option key={id} value={id} style={{ color: "#000" }}>
                    {id}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {/* Current Scan Chip */}
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid #eee",
            background: "#f8f9fa",
          }}
        >
          {currentScan ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Chip
                label={`Last Scan: ${currentScan.rfidId}`}
                color="primary"
                sx={{
                  animation: `${fadeInOut} 2s infinite`,
                  fontWeight: 600,
                  fontSize: 18,
                  width: "100%",
                  justifyContent: "center",
                  "& .MuiChip-label": {
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  },
                }}
              />
              <IconButton
                onClick={() => navigator.clipboard.writeText(currentScan.rfidId)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                }}
                title="Copy RFID"
              >
                <ContentCopy />
              </IconButton>
            </div>
          ) : (
            <Chip label="Waiting for scan..." variant="outlined" sx={{ width: "100%" }} />
          )}
        </div>

        {/* RFID Logs */}
        <div
          style={{
            padding: 10,
            overflowY: "auto",
            height: "calc(100% - 100px)",
          }}
        >
          {entries.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#666",
                marginTop: 30,
              }}
            >
              Waiting for RFID scans...
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={`${entry.rfidId}-${index}`}
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  background:
                    entry === currentScan
                      ? "#e3f2fd"
                      : index % 2
                        ? "#f5f7ff"
                        : "#fff",
                  marginBottom: 6,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontWeight: entry === currentScan ? 700 : 600,
                    fontSize: entry === currentScan ? 16 : 14,
                  }}
                >
                  {entry.rfidId}
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>{entry.deviceId}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default AttenzyLiveFeed;
