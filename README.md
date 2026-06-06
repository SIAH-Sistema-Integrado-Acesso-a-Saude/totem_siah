# Totem SIAH — Treenity

Totem de autoatendimento para unidades de saúde. Permite que o paciente faça check-in identificando-se por **CPF**, confirmando a identidade via **biometria digital** ou **reconhecimento facial com prova de vida**, gera uma **senha de atendimento** após a escolha da área (Pediatra, Dentista, Clínica, Farmácia, etc.) e finaliza com o **formulário de cadastro** — pré-preenchido para pacientes já registrados ou vazio para novos pacientes (POST direto no backend).

Aplicação **single-page** construída em **React 18 + Vite**, estilizada com **TailwindCSS** e integrada a um backend externo via proxy do Vite.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack e dependências](#stack-e-dependências)
- [Arquitetura](#arquitetura)
- [Fluxo do usuário](#fluxo-do-usuário)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar o serviço por completo](#como-rodar-o-serviço-por-completo)
- [Scripts disponíveis](#scripts-disponíveis)
- [Integração com backend (proxy Vite)](#integração-com-backend-proxy-vite)
- [Endpoints consumidos](#endpoints-consumidos)
- [Modelos de IA (face-api.js)](#modelos-de-ia-face-apijs)
- [Componentes e hooks](#componentes-e-hooks)
- [Estados do fluxo (state machine)](#estados-do-fluxo-state-machine)
- [Build de produção](#build-de-produção)
- [Solução de problemas](#solução-de-problemas)

---

## Visão geral

O totem cobre o seguinte fluxo de atendimento:

1. Paciente digita o **CPF** num teclado virtual.
2. Sistema consulta o cadastro:
   - **CPF encontrado** → segue para escolha de método de autenticação (biometria digital ou facial).
   - **CPF não encontrado** → fluxo de **cadastro facial** (captura 4 poses) e gera senha de **triagem** (`A-XXX`).
3. Autenticação (paciente existente):
   - **Biometria digital**: chama o leitor local em `http://localhost:8080`.
   - **Facial**: captura 4 poses (frente, esquerda, direita, cima) via webcam, com prova de vida (face-api.js), e envia para reconhecimento no backend.
4. Identidade confirmada → paciente escolhe a **área de atendimento**.
5. Backend gera **ticket/senha** (`P-123`, `D-456`...) e o totem exibe na tela.
6. Paciente clica em **"Continuar para cadastro"** → abre o formulário:
   - **Existente**: campos pré-preenchidos com dados do backend, editáveis para correção.
   - **Novo**: campos vazios para preenchimento e POST.
7. Submit envia o payload para `POST /api/pacientes/cadastrar` (inclui as imagens faciais capturadas).
8. Tela de sucesso é mostrada por **4 segundos** e o totem volta sozinho à tela inicial.

---

## Stack e dependências

| Camada | Tecnologia |
|--------|------------|
| Build / Dev | Vite 5 |
| UI | React 18, TailwindCSS 3 |
| Animação | framer-motion |
| Ícones | lucide-react |
| Webcam | react-webcam |
| Reconhecimento facial | face-api.js (TinyFaceDetector + FaceLandmark68Net) |

### Dependências principais (`package.json`)

```json
{
  "dependencies": {
    "face-api.js": "^0.22.2",
    "framer-motion": "^10.18.0",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-webcam": "^7.2.0"
  }
}
```

---

## Arquitetura

```
┌──────────────────────────────┐
│  Browser (Totem)             │
│  React SPA + Webcam          │
└──────────────┬───────────────┘
               │
               │ fetch /api/* /queue/* /iniciar-leitura
               ▼
┌──────────────────────────────┐
│  Vite Dev Server (5173)      │
│  Proxy reverso               │
└──────┬─────────────────┬─────┘
       │                 │
       ▼                 ▼
┌──────────────┐   ┌──────────────────────┐
│ localhost    │   │ ngrok público        │
│ :8080        │   │ Backend SIAH         │
│ (biometria)  │   │ /usuarios /pacientes │
└──────────────┘   │ /queue/...           │
                   └──────────────────────┘
```

O front **não fala direto** com os backends — todas as chamadas passam pelo proxy do Vite (`vite.config.js`). Isso evita CORS e permite trocar host só no config, sem mexer no código.

---

## Fluxo do usuário

Implementado em `src/hooks/useTotemFlow.js`. Estados do `step`:

| Step                 | O que acontece                                                                   |
|----------------------|----------------------------------------------------------------------------------|
| `cpfEntry`           | Teclado virtual para digitar 11 dígitos do CPF                                   |
| `authSelection`      | Mostra usuário encontrado e oferece Biometria ou Facial                          |
| `biometryPrompt`     | Aguarda leitor digital (timeout 30s)                                             |
| `facialPrompt`       | Webcam + face-api.js captura 4 poses (paciente já cadastrado, para reconhecer)   |
| `facialEnrollment`   | Captura 4 poses para **novo** paciente (sem cadastro)                            |
| `areaSelection`      | Botões com áreas de atendimento                                                  |
| `triageResult`       | CPF não cadastrado — exibe senha `A-XXX` + botão para o form de cadastro         |
| `result`             | Senha de atendimento exibida + botão "Continuar para cadastro"                   |
| `cadastroForm`       | Formulário (vazio para novo, pré-preenchido para existente)                      |
| `cadastroSuccess`    | Confirmação de cadastro (volta para `cpfEntry` em 4s — único auto-reset do fluxo)|

---

## Estrutura de pastas

```
totem_siah/
├── public/
│   └── models/                  # Modelos pré-treinados face-api.js
│       ├── tiny_face_detector_model-*
│       └── face_landmark_68_model-*
├── src/
│   ├── App.jsx                  # Root, renderiza <Presentation />
│   ├── main.jsx                 # Bootstrap React + CSS global
│   ├── index.css                # Tailwind base + ajustes globais
│   ├── assets/                  # Ilustrações do layout
│   ├── components/
│   │   ├── Presentation.jsx     # Tela principal do totem (todos os steps)
│   │   ├── FacialCapture.jsx    # Captura facial com prova de vida
│   │   └── CadastroForm.jsx     # Formulário de cadastro pós-senha
│   ├── hooks/
│   │   └── useTotemFlow.js      # State machine do fluxo
│   └── services/
│       └── totemService.js      # Chamadas HTTP para o backend
├── index.html
├── vite.config.js               # Proxy + allowed hosts
├── tailwind.config.js
├── postcss.config.js
├── favicon.svg
└── package.json
```

---

## Pré-requisitos

- **Node.js 18+** (recomendado LTS 20)
- **npm 9+**
- **Webcam** funcional (para o reconhecimento facial)
- **Leitor biométrico digital** rodando como serviço local em `http://localhost:8080` expondo `GET /iniciar-leitura?cpf=...` (opcional — só necessário se for usar autenticação por biometria digital)
- Acesso ao backend SIAH via ngrok (URL configurada em `vite.config.js`)

---

## Como rodar o serviço por completo

### 1. Clonar e instalar dependências

```bash
git clone <repo-url>
cd totem_siah
npm install
```

### 2. Verificar a configuração do proxy (`vite.config.js`)

O arquivo já vem com:

```js
proxy: {
  '/api':              { target: 'https://mulberry-carload-example.ngrok-free.dev' },
  '/iniciar-leitura':  { target: 'http://localhost:8080' },
  '/queue':            { target: 'https://mulberry-carload-example.ngrok-free.dev' },
}
```

Se o backend mudar de URL (novo ngrok, deploy em outro host etc.), basta atualizar o `target` correspondente. **Não há `.env`** — a configuração vive em `vite.config.js`.

### 3. (Opcional) Subir o leitor biométrico local

Para usar autenticação por biometria digital, o serviço do leitor precisa estar rodando em `localhost:8080` expondo:

```
GET /iniciar-leitura?cpf=<11 dígitos>
```

A resposta deve ser JSON contendo pelo menos `status: 'ok'` ou `success: true` ou `mensagem`. Sem esse serviço, o passo de biometria digital retorna erro — o reconhecimento **facial continua funcionando normalmente**.

### 4. Subir o servidor de desenvolvimento

```bash
npm run dev
```

Por padrão, o Vite sobe em `http://localhost:5173`. O console mostra a URL exata.

### 5. Acessar o totem

Abrir `http://localhost:5173` no navegador. Conceder permissão de **câmera** quando solicitado (necessário para o reconhecimento facial).

### 6. Testar o fluxo

- **CPF de teste com cadastro**: `111.111.111-11` (depende da base do backend)
- **CPF aleatório**: cai no fluxo de triagem (`triageResult`) e gera senha `A-XXX` localmente, sem chamar o backend.

---

## Scripts disponíveis

| Comando           | O que faz                                       |
|-------------------|-------------------------------------------------|
| `npm run dev`     | Sobe o Vite em modo dev com HMR + proxy         |
| `npm run build`   | Build de produção em `dist/`                    |
| `npm run preview` | Serve o `dist/` localmente para testar o build  |

---

## Integração com backend (proxy Vite)

Definido em `vite.config.js`:

```js
server: {
  allowedHosts: ['arletha-nonbusy-unfaithfully.ngrok-free.dev'],
  proxy: {
    '/api': {
      target: 'https://mulberry-carload-example.ngrok-free.dev',
      changeOrigin: true,
      headers: { 'ngrok-skip-browser-warning': '69420' },
    },
    '/iniciar-leitura': {
      target: 'http://localhost:8080',
      changeOrigin: false,
    },
    '/queue': {
      target: 'https://mulberry-carload-example.ngrok-free.dev',
      changeOrigin: true,
      headers: { 'ngrok-skip-browser-warning': '69420' },
    },
  },
}
```

O header `ngrok-skip-browser-warning` pula a tela de aviso do ngrok free.

`allowedHosts` permite expor o totem via ngrok para testes remotos (ajuste para o seu túnel).

---

## Endpoints consumidos

Definidos em `src/services/totemService.js`. Timeout padrão **30s** via `AbortController`.

### 1. Consultar paciente por CPF

```http
GET /api/usuarios/{cpf}
```

- **200 OK** → JSON do paciente (`{ nome, cpf, ... }`)
- **Qualquer outro status / erro** → tratado como "CPF não cadastrado" e dispara o fluxo de triagem

### 2. Triagem (gerada localmente)

`triageCpf(cpf)` **não chama o backend**. Gera senha `A-XXX` no front após `800ms` de delay simulado.

### 3. Iniciar leitura biométrica digital

```http
GET /iniciar-leitura?cpf={cpf}
```

- **2xx** com JSON `{ status: 'ok' | 'success' }` ou `{ success: true }` ou `{ mensagem: '...' }` → identidade confirmada
- **Erro / 4xx / 5xx** → mensagem "Biometria não identificada"

### 4. Reconhecimento facial

```http
POST /api/pacientes/reconhecer
Content-Type: application/json

{ "images": ["data:image/jpeg;base64,...", ...4 fotos...] }
```

- **200** com `{ sucesso: true, paciente: { cpf, nome, ... } }` → o front ainda **valida que `paciente.cpf` bate com o CPF digitado** (proteção anti-impersonação).
- **401** → tratado como "rosto não reconhecido", **não como erro fatal**.
- **Outros erros** → mensagem genérica de falha.

### 5. Gerar ticket de atendimento

```http
POST /queue/validate-totem
Content-Type: application/json

{
  "patientCpf": "11111111111",
  "serviceType": "P"   // 1ª letra da área: Pediatra → P, Dentista → D...
}
```

Espera resposta com qualquer um dos campos: `senha`, `ticket`, `numero`, `code`, `senhaGerada`, `ticketNumber`.
Se o backend não devolver nada utilizável, o front **gera um fallback** no formato `{PREFIX}-{100-999}`.

### 6. Cadastrar paciente (formulário pós-senha)

```http
POST /api/pacientes/cadastrar
Content-Type: application/json

{
  "nome": "...",
  "cpf": "11122233344",
  "email": "...",
  "telefone": "11999998888",
  "dataNascimento": "1990-05-15",
  "genero": "Masculino",
  "tipoSanguineo": "O+",
  "hospitalVinculado": "...",
  "rg": "...",
  "cartaoSus": "...",
  "cnh": "...",
  "cep": "...", "rua": "...", "numero": "...", "bairro": "...", "cidade": "...", "estado": "SP",
  "possuiPlanoSaude": false,
  "nomePlano": "", "numeroCarteirinha": "", "validadeCarteirinha": null,
  "nomeResponsavel": "", "parentesco": "", "telefoneResponsavel": "",
  "images": ["data:image/jpeg;base64,/9j/...", "...4 fotos..."],
  "embedding": [],
  "embeddingPath": "",
  "tempFile": ""
}
```

- **Payload em camelCase** (alinhado com o schema do Swagger).
- **CPF e telefones** vão sem máscara (só dígitos).
- **Datas** vazias viram `null` (evita erro de cast `text → date` no Postgres).
- **`images[]`** recebe os 4 base64 capturados durante o enrollment facial — backend usa para gerar o embedding e salvar para reconhecimento futuro.
- **Bloco de responsável** (`nomeResponsavel`, `parentesco`, `telefoneResponsavel`) só é preenchido quando o paciente é menor de idade.
- **2xx** → segue para `cadastroSuccess`. **Erro** → mensagem com status + body do backend aparece em vermelho no próprio form (útil quando não há console disponível em tablet).

---

## Modelos de IA (face-api.js)

Servidos estaticamente de `public/models/`:

- `tiny_face_detector_model` — detecção rápida de rosto
- `face_landmark_68_model` — 68 pontos faciais (usado para validar pose)

Carregados em `FacialCapture.jsx` via `faceapi.nets.*.loadFromUri('/models')`.

### Lógica de validação de pose (`validarPosicao`)

Usa distância horizontal entre nariz e contorno do queixo:

| Desafio    | Critério                              |
|------------|---------------------------------------|
| `frente`   | `0.8 < ratio < 1.2`                   |
| `esquerda` | `ratio > 2.2`                         |
| `direita`  | `ratio < 0.45`                        |
| `cima`     | `verticalDiff < 15` (px entre topo e base do nariz) |

Para cada pose, o usuário precisa manter a posição por **3 segundos** estáveis antes de capturar a foto. Um contador regressivo é desenhado por cima do rosto via canvas.

---

## Componentes e hooks

### `Presentation.jsx`
Tela principal. Renderiza um dos 10 steps com transições do `framer-motion`. Contém:
- Cabeçalho dinâmico por step (`stepHeaders`)
- Teclado virtual de 12 teclas (`keypad`)
- Lista de áreas (`areaOptions`)
- Botão "Continuar para cadastro" nas telas de senha (`result` / `triageResult`)
- Overlay de loading com spinner

### `FacialCapture.jsx`
Componente isolado de captura facial. Recebe:
- `onComplete(images: string[])` — chamado com as 4 fotos em Base64
- `onCancel()` — volta para `authSelection`

Usa `useRef` para o loop de animação (`requestAnimationFrame`) e evita re-renders desnecessários.

### `CadastroForm.jsx`
Formulário pós-senha. Recebe:
- `initialData` — objeto do paciente vindo do `queryCpf` (pré-preenche). Se `null` (novo paciente), começa vazio.
- `password` — senha exibida no topo do form como confirmação.
- `statusMessage` — mensagem de erro do backend, renderizada em caixa vermelha com scroll.
- `capturedImages` — array de base64 das 4 poses (vai no `images[]` do payload).
- `onSubmit(payload)` — disparado no submit, monta o payload camelCase.
- `onReset()` — volta para `cpfEntry`.

Aceita `initialData` em **snake_case ou camelCase** (resiliente ao formato do backend). Aplica máscaras de CPF/telefone, esconde bloco do plano de saúde quando o checkbox está desmarcado, e o bloco do responsável só aparece quando o paciente tem menos de 18 anos.

### `useTotemFlow.js`
Hook que centraliza **todo o estado** do totem:
- `cpf`, `step`, `user`, `password`
- Mensagens (`statusMessage`, `entryMessage`, `overlayMessage`)
- Loading global
- `capturedImages` — exposto via ref para o `CadastroForm` injetar no payload
- Funções: `appendDigit`, `clearCpf`, `submitCpf`, `authenticate`, `submitFacial`, `cancelFacial`, `enrollFacial`, `cancelEnrollment`, `selectArea`, `goToCadastroForm`, `submitCadastroForm`, `reset`
- Auto-reset após 4s **apenas** no step `cadastroSuccess` — `result` e `triageResult` não resetam mais sozinhos para dar tempo do usuário clicar em "Continuar para cadastro"

### `totemService.js`
Wrapper de `fetch` com timeout, headers padrão e tratamento de erros. Centraliza todos os endpoints.

---

## Estados do fluxo (state machine)

```
        ┌─────────────┐
        │  cpfEntry   │ ◄─────────────────────────────────────────┐
        └──────┬──────┘                                            │
               │ submitCpf                                         │ reset / 4s
               ▼                                                   │
       ┌───────────────┐  CPF não achado  ┌──────────────────────┐ │
       │   queryCpf    │ ───────────────► │  facialEnrollment    │ │
       └───────┬───────┘                  └──────────┬───────────┘ │
               │ CPF OK                              │             │
               ▼                                     ▼             │
       ┌───────────────┐                  ┌──────────────────────┐ │
       │ authSelection │                  │    triageResult      │ │
       └───┬────────┬──┘                  └──────────┬───────────┘ │
   biometria│        │facial                         │             │
           ▼        ▼                                │             │
   ┌──────────────┐ ┌──────────────┐                 │             │
   │biometryPrompt│ │ facialPrompt │                 │             │
   └──────┬───────┘ └──────┬───────┘                 │             │
          │                │                         │             │
          │ OK             │ OK + CPF bate           │             │
          └────────┬───────┘                         │             │
                   ▼                                 │             │
            ┌──────────────┐                         │             │
            │ areaSelection│                         │             │
            └──────┬───────┘                         │             │
                   │ selectArea                      │             │
                   ▼                                 │             │
              ┌──────────┐                           │             │
              │  result  │                           │             │
              └────┬─────┘                           │             │
                   │ "Continuar para cadastro"       │             │
                   │                                 │             │
                   └─────────────┬───────────────────┘             │
                                 ▼                                 │
                       ┌───────────────────┐                       │
                       │   cadastroForm    │                       │
                       └─────────┬─────────┘                       │
                                 │ submit OK                       │
                                 ▼                                 │
                       ┌───────────────────┐                       │
                       │ cadastroSuccess   │ ──────────────────────┘
                       └───────────────────┘
```

---

## Build de produção

```bash
npm run build
```

Saída em `dist/`. Inclui os modelos do face-api.js (servidos como assets estáticos de `public/`).

Para testar local:

```bash
npm run preview
```

Em produção real, o `dist/` precisa ser servido por um web server (nginx, etc.) **com o mesmo esquema de proxy** do `vite.config.js`, ou o front precisa ser configurado para apontar direto para os hosts externos.

---

## Solução de problemas

| Sintoma                                    | Causa provável                                 | O que fazer                                                                 |
|--------------------------------------------|------------------------------------------------|------------------------------------------------------------------------------|
| Tela "Carregando IA..." nunca sai          | Modelos `/models/*` não acessíveis             | Confirmar `public/models/` íntegro; abrir DevTools → Network                |
| Webcam pede permissão e nunca abre         | Bloqueado pelo navegador / sem HTTPS em host remoto | Acessar via `localhost` (origem segura) ou habilitar HTTPS                  |
| `Erro ao consultar CPF`                    | Backend ngrok offline ou URL trocou             | Atualizar `target` no `vite.config.js` e reiniciar `npm run dev`            |
| Biometria sempre falha                     | Serviço local `:8080` não está rodando         | Subir o leitor digital ou usar reconhecimento facial                        |
| Facial reconhece, mas mostra "rosto não corresponde ao CPF" | Backend devolveu paciente diferente do CPF digitado | Comportamento intencional — segurança. Repetir com CPF correto.            |
| Senha sempre cai no fallback `{PREFIX}-XXX`| `/queue/validate-totem` respondendo sem código | Conferir formato de resposta esperado em `generateTicket`                   |
| `allowedHosts` reclamando no ngrok         | Túnel novo                                     | Adicionar o host em `vite.config.js → server.allowedHosts`                  |
| Cadastro retorna 500 com erro de coluna `date` no Postgres | Backend está enviando `dataNascimento`/`validadeCarteirinha` como `text` sem cast | Bug do backend — coluna `date` recebe `text`. Frontend já manda formato ISO. Pedir cast `::date` ou conversão `DateOnly`. |
| Após cadastro, reconhecimento facial não acha o paciente | Backend não está gerando/persistindo o `embedding` a partir do `images[]` enviado | Verificar pipeline de embedding no `CadastrarAsync` do backend. Sem embedding salvo, recognition nunca casa. |
| Erro de cadastro aparece em caixa vermelha no form | Backend devolveu 4xx/5xx | Texto da caixa traz `status` + body — usar para diagnosticar (formato de campo, validação faltando, etc.) |

---

## Notas de segurança

- Front **valida CPF da resposta facial contra CPF digitado**, evitando que um rosto reconhecido na base seja usado para entrar como outra pessoa.
- 401 do reconhecimento facial é **silencioso** (não vaza informação sobre quem está na base).
- Triagem é gerada **localmente** quando o CPF não é encontrado — não cadastra ninguém no backend até o paciente submeter o form de cadastro.
- O form de cadastro envia imagens faciais capturadas no `enrollment` — backend deve gerar e persistir embedding para que reconhecimento futuro funcione.

---

## Licença

Projeto acadêmico — Fábrica de Projetos, Treenity / SIAH.
