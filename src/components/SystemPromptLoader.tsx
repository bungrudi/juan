import { useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { LiveConnectConfig } from "@google/genai";

/**
 * SystemPromptLoader
 *
 * Loads the system prompt from `public/system-prompt.md` at runtime and
 * injects it into the Live API configuration. This happens only once on
 * mount. If the file cannot be fetched, we log a warning but allow the
 * app to continue running.
 */
export default function SystemPromptLoader() {
  const { setConfig } = useLiveAPIContext();

  useEffect(() => {
    fetch("/system-prompt.md")
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.text();
      })
      .then((text) => {
        const cfg: LiveConnectConfig = {
          systemInstruction: {
            parts: [{ text }],
          },
        };
        setConfig(cfg);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("System prompt could not be loaded:", err);
      });
  }, [setConfig]);

  return null; // This component renders nothing
}
