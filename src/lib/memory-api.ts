const BASE_URL = process.env.REACT_APP_MEMORY_API_URL || "http://localhost:4000";

async function handleMutationResponse(res: Response, operationName: string): Promise<string[]> {
  if (!res.ok) {
    let errorDetails = "";
    try {
      errorDetails = await res.text();
    } catch (e) { /* ignore if reading text fails */ }
    throw new Error(`Memory API ${operationName} failed: ${res.status} ${res.statusText}. ${errorDetails}`.trim());
  }
  
  let data;
  try {
    data = await res.json();
  } catch (e: any) {
    throw new Error(`Memory API ${operationName} returned invalid JSON: ${e.message}`);
  }

  if (data && Array.isArray(data.memory)) {
    return data.memory;
  } else {
    console.warn(`Memory API ${operationName} response was OK but malformed (expected { memory: array }):`, data);
    throw new Error(`Memory API ${operationName} response was malformed. Expected { memory: array } but received: ${JSON.stringify(data)}`);
  }
}

export async function getMemory(): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/memory`);
  if (!res.ok) {
    let errorDetails = "";
    try {
      errorDetails = await res.text();
    } catch (e) { /* ignore */ }
    console.error(`Memory API getMemory failed: ${res.status} ${res.statusText}. ${errorDetails}`.trim());
    return []; 
  }
  
  let data;
  try {
    data = await res.json();
  } catch (e: any) {
    console.error(`Memory API getMemory returned invalid JSON: ${e.message}`);
    return []; 
  }

  if (data && Array.isArray(data.memory)) {
    return data.memory;
  } else {
    console.warn("Memory API getMemory response was OK but malformed (expected { memory: array }):", data);
    return []; 
  }
}

export async function overwriteMemory(items: string[]): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/memory`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memory: items }),
  });
  return handleMutationResponse(res, "overwrite");
}

export async function addMemory(items: string[]): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ add: items }),
  });
  return handleMutationResponse(res, "add");
}

export async function deleteMemory(items: string[]): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/memory`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delete: items }),
  });
  return handleMutationResponse(res, "delete");
}
