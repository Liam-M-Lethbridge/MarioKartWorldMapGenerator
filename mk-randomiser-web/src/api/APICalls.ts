const BASE_URL = 'http://localhost:3000/api';

// Function requests all of the maps along with their since_last_played values from the server
export async function getMaps() {
  const response = await fetch(`${BASE_URL}/maps`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

// Function sends a request to the server to generate a set of maps and pass them back to the client
export async function generateSetRequest(mapNum: number) {
  const response = await fetch(`${BASE_URL}/generate_set`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mapNum })
  });
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  return JSON.parse(await response.text());
}

// Function sends the updated cooldown value to the server and requests the probabilities be updated accordingly
export async function writeCooldownRequest(cooldown: number) {
  const response = await fetch(`${BASE_URL}/write_cooldown`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ cooldown })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

// Function requests for the server to reset the history to be empty
export async function resetHistoryRequest() {
  const response = await fetch(`${BASE_URL}/reset_history`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

// Function requests the cooldown value from the server
export async function getCooldownRequest(){
  const response = await fetch(`${BASE_URL}/get_cooldown`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  
  return Number(await response.text());
}