import { useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import {
  getMemory,
  overwriteMemory,
  addMemory,
  deleteMemory,
} from "../lib/memory-api";
import { LiveServerToolCall } from "@google/genai";

/**
 * MemoryHandler
 *
 * Listens for `save_memory` tool calls and persists the memory array to
 * localStorage via helper functions. After handling, we send a tool response
 * so the model knows the operation succeeded.
 */
export default function MemoryHandler() {
  const { client } = useLiveAPIContext();

  useEffect(() => {
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls || toolCall.functionCalls.length === 0) return;

      const responses = await Promise.all(
        toolCall.functionCalls.map(async (fc) => {
          try {
            const args = fc.args as { items?: string[] }; // Common case, specific tools might have other args
            let result: any;

            switch (fc.name) {
              case "memory_get":
                result = await getMemory();
                break;
              case "memory_overwrite":
                if (!args.items || !Array.isArray(args.items)) {
                  throw new Error("Invalid or missing 'items' for memory_overwrite");
                }
                result = await overwriteMemory(args.items);
                break;
              case "memory_add":
                if (!args.items || !Array.isArray(args.items)) {
                  throw new Error("Invalid or missing 'items' for memory_add");
                }
                result = await addMemory(args.items);
                break;
              case "memory_delete":
                if (!args.items || !Array.isArray(args.items)) {
                  throw new Error("Invalid or missing 'items' for memory_delete");
                }
                result = await deleteMemory(args.items);
                break;
              default:
                console.warn(`Unknown tool call: ${fc.name}`);
                return {
                  id: fc.id,
                  name: fc.name,
                  response: { error: { message: `Unknown tool: ${fc.name}` } },
                };
            }
            return {
              id: fc.id,
              name: fc.name,
              response: { output: result }, // API returns the updated memory array
            };
          } catch (err: any) {
            console.error(`Error processing tool call ${fc.name}:`, err);
            return {
              id: fc.id,
              name: fc.name,
              response: { error: { message: err.message || "API call failed" } },
            };
          }
        })
      );

      if (responses.length > 0) {
        client.sendToolResponse({ functionResponses: responses });
      }
    };

    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  return null;
}
