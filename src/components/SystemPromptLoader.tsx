import { useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { LiveConnectConfig, FunctionDeclaration, Type } from "@google/genai";
import { getMemory } from "../lib/memory-api";

/**
 * SystemPromptLoader
 *
 * Loads the system prompt from `public/system-prompt.md` at runtime and
 * injects it into the Live API configuration. This happens only once on
 * mount. If the file cannot be fetched, we log a warning but allow the
 * app to continue running.
 */
const memoryTools: FunctionDeclaration[] = [
  {
    name: "memory_get",
    description: "Retrieve the full memory array (read-only).",
    parameters: { type: Type.OBJECT, properties: {}, required: [] },
  },
  {
    name: "memory_overwrite",
    description: "Replace the entire memory with the provided array of strings.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: "New memory in correct order.",
          items: { type: Type.STRING },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "memory_add",
    description: "Append new items that are not already present in memory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: "Strings to add.",
          items: { type: Type.STRING },
        },
      },
      required: ["items"],
    },
  },
  {
    name: "memory_delete",
    description: "Remove matching items from memory.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        items: {
          type: Type.ARRAY,
          description: "Strings to remove.",
          items: { type: Type.STRING },
        },
      },
      required: ["items"],
    },
  },
];

export default function SystemPromptLoader() {
  const { setConfig } = useLiveAPIContext();

  useEffect(() => {
    const loadPromptAndMemory = async () => {
      try {
        const promptPath = process.env.REACT_APP_SYSTEM_PROMPT_PATH || "/system-prompt.md";
        const promptRes = await fetch(promptPath);
        if (!promptRes.ok) {
          console.warn(`Failed to fetch system prompt: ${promptRes.statusText}`);
          // Fallback to empty prompt if fetch fails
          return ""; 
        }
        const systemPromptText = await promptRes.text();

        let memory: string[] = [];
        try {
          memory = await getMemory();
        } catch (memError) {
          console.warn("Failed to load memory from API:", memError);
          // Continue with empty memory if API call fails
        }

        const combinedPrompt = [
          systemPromptText,
          "\n\nLong-Term Memory (from API):\n",
          memory.join("\n"),
        ].join("");

        const cfg: LiveConnectConfig = {
          systemInstruction: {
            parts: [{ text: combinedPrompt }],
          },
          tools: [{ functionDeclarations: memoryTools }],
        };
        setConfig(cfg);
      } catch (err) {
        console.warn("Error in SystemPromptLoader:", err);
        // Fallback: Set config with empty prompt and tools if everything fails
        const fallbackCfg: LiveConnectConfig = {
          systemInstruction: {
            parts: [{ text: "Assistant ready." }],
          },
          tools: [{ functionDeclarations: memoryTools }], // Still provide tools
        };
        setConfig(fallbackCfg);
      }
    };

    loadPromptAndMemory();
  }, [setConfig]);

  return null; // This component renders nothing
}

