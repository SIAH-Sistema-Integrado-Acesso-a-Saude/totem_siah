function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const API_BASE_URL = '/api';


async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders = {
    'ngrok-skip-browser-warning': '69420',
  };
  if (options.method === 'POST') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    signal: controller.signal,
  });

  clearTimeout(id);
  return response;
}

export async function queryCpf(cpf) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/usuarios/${cpf}`, {
      method: 'GET',
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
  const numero = String(Math.floor(Math.random() * 900) + 100); // 100-999
  return {
    cpf,
    senha: `A-${numero}`,
    status: 'AGUARDANDO_TRIAGEM',
  };
}

export async function startBiometry(cpf) {
  const response = await fetchWithTimeout(`/iniciar-leitura?cpf=${cpf}`, {
    method: 'GET',
  }, 30000);

  if (!response.ok) {
    throw new Error(`Erro na leitura biométrica: ${response.status}`);
  }

  return await response.json();
}

export async function generateTicket(cpf, area) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/queue/validate-totem`, {
    method: 'POST',
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