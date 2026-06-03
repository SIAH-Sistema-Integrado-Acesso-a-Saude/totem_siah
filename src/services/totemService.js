function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const API_BASE_URL = 'https://mulberry-carload-example.ngrok-free.dev/api';

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);
  return response;
}

export async function queryCpf(cpf) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${cpf}`, {
      method: 'GET',
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Erro ao consultar CPF:', error);
    return null;
  }
}

export async function triageCpf(cpf) {
  await sleep(800);
  return {
    cpf,
    senha: 'T-001',
    status: 'AGUARDANDO_TRIAGEM',
  };
}

export async function startBiometry(cpf) {
  const response = await fetchWithTimeout(`http://localhost:8080/iniciar-leitura?cpf=${cpf}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }, 30000);

  if (!response.ok) {
    throw new Error(`Erro na leitura biométrica: ${response.status}`);
  }

  return await response.json();
}

export async function generateTicket(cpf, area) {
  const response = await fetch(`${API_BASE_URL}/senhas`, {
    method: 'POST',
    headers: {
      'ngrok-skip-browser-warning': '69420',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      patientCpf: cpf,
      serviceType: area,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao gerar ticket: ${response.status}`);
  }

  return await response.json();
}
