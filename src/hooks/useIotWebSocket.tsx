import { useEffect, useRef, useState } from "react";

export interface IotMessage {
  rfidId: string;
  deviceId: string
}

interface UseIotWebSocketResult {
  message: IotMessage;
}

export default function useIotWebSocket(deviceId: string | null): UseIotWebSocketResult {
  const wsRef = useRef<WebSocket | null>(null);
  const [message, setMessage] = useState<IotMessage | null>(null);

  useEffect(() => {
    if (!deviceId) return;

    const endpoint = `wss://486477s0h8.execute-api.ap-south-1.amazonaws.com/production?deviceId=${deviceId}`;
    const ws = new WebSocket(endpoint);

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: IotMessage = JSON.parse(event.data);
        setMessage(data);
      } catch {
        console.warn("Received non-JSON message:", event.data);
      }
    };

    ws.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    return () => {
      ws.close();
    };
  }, [deviceId]);


  return { message: message ?? { rfidId: "", deviceId: "" } };
}
