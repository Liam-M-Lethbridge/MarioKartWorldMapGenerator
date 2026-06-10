const BASE_URL = 'http://localhost:3000/api';

export async function getMaps() {
  const response = await fetch(`${BASE_URL}/maps`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}


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

export async function resetHistoryRequest() {
  const response = await fetch(`${BASE_URL}/reset_history`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
}

export async function getCooldownRequest(){
  const response = await fetch(`${BASE_URL}/get_cooldown`);

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }
  
  return Number(await response.text());
}