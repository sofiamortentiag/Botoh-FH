import fetch from "node-fetch";
import { sendWebRadioMessage } from "../commands/chat/handleRadioCommand";

const QUEUE_URL =
  process.env.RADIO_QUEUE_URL ||
  "https://haxball-league.vercel.app/api/radio";
const POLL_INTERVAL_MS = 6000;
const MAX_BACKOFF_MS = 30_000;

interface QueuedRadioMessage {
  id: string;
  targetId: number;
  targetName: string;
  message: string;
  createdAt: number;
  expiresAt: number;
}

export function startRadioQueueWorker(room: RoomObject) {
  const token = process.env.RADIO_BOT_TOKEN;
  if (!token) {
    console.warn(
      "Web radio is disabled: configure RADIO_BOT_TOKEN to connect the bot to the broadcast panel.",
    );
    return;
  }

  let stopped = false;
  let retryDelay = POLL_INTERVAL_MS;
  let warned = false;

  const schedule = (delay: number) => {
    if (!stopped) setTimeout(poll, delay);
  };

  const poll = async () => {
    try {
      const response = await fetch(`${QUEUE_URL}?worker=1`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      if (response.status === 204) {
        retryDelay = POLL_INTERVAL_MS;
        warned = false;
        schedule(POLL_INTERVAL_MS);
        return;
      }

      if (!response.ok) {
        throw new Error(`Radio queue returned HTTP ${response.status}`);
      }

      const result = (await response.json()) as { message?: QueuedRadioMessage | null };
      const queued = result.message;
      if (queued && queued.expiresAt > Date.now()) {
        sendWebRadioMessage(room, queued.targetId, queued.targetName, queued.message);
      }

      retryDelay = POLL_INTERVAL_MS;
      warned = false;
      schedule(queued ? 250 : POLL_INTERVAL_MS);
    } catch (error) {
      if (!warned) {
        console.error("Web radio queue is unavailable; retrying in the background:", error);
        warned = true;
      }
      retryDelay = Math.min(Math.max(retryDelay * 2, POLL_INTERVAL_MS), MAX_BACKOFF_MS);
      schedule(retryDelay);
    }
  };

  void poll();
  return () => {
    stopped = true;
  };
}
