import { AnimatePresence, motion } from 'framer-motion';
import { Fingerprint, ScanFace, RefreshCcw } from 'lucide-react';
import { useTotemFlow } from '../hooks/useTotemFlow';
import FacialCapture from './FacialCapture';
import CadastroForm from './CadastroForm';
import leftIllustration from '../assets/Component 1 (2).png';
import rightIllustration from '../assets/Image (29).png';

const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'blank'];
const areaOptions = ['Pediatra', 'Dentista', 'Sentista', 'Clínica', 'Farmácia'];

function formatCpf(cpf) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export default function Presentation() {
  const {
    cpf,
    appendDigit,
    clearCpf,
    submitCpf,
    step,
    user,
    entryMessage,
    password,
    loading,
    overlayMessage,
    statusMessage,
    authenticate,
    submitFacial,
    cancelFacial,
    enrollFacial,
    cancelEnrollment,
    selectArea,
    goToCadastroForm,
    submitCadastroForm,
    capturedImages,
    reset,
  } = useTotemFlow();

  const stepHeaders = {
    cpfEntry: {
      label: 'Totem de atendimento',
      title: 'Digite seu CPF',
      subtitle: 'Use o teclado abaixo para confirmar sua identidade e iniciar o atendimento.',
    },
    authSelection: {
      label: 'Totem de atendimento',
      title: 'Confirmar identidade',
      subtitle: 'Escolha como você quer confirmar sua presença.',
    },
    biometryPrompt: {
      label: 'Totem de atendimento',
      title: 'Aguardando leitura',
      subtitle: 'Coloque o dedo no leitor para continuar.',
    },
    facialPrompt: {
      label: 'Totem de atendimento',
      title: 'Reconhecimento facial',
      subtitle: 'Posicione seu rosto na câmera e siga as instruções.',
    },
    facialEnrollment: {
      label: 'Totem de atendimento',
      title: 'Cadastro facial',
      subtitle: 'CPF não localizado. Faça o cadastro facial para continuar.',
    },
    areaSelection: {
      label: 'Totem de atendimento',
      title: 'Escolher área',
      subtitle: 'Selecione o local de atendimento a seguir.',
    },
    triageResult: {
      label: 'Totem de atendimento',
      title: 'Triagem',
      subtitle: 'Senha gerada para completar seu cadastro na triagem.',
    },
    result: {
      label: 'Totem de atendimento',
      title: 'Senha gerada',
      subtitle: 'Aguarde na área selecionada para ser chamado.',
    },
    cadastroForm: {
      label: 'Totem de atendimento',
      title: 'Cadastro',
      subtitle: 'Confirme ou complete seus dados para finalizar.',
    },
    cadastroSuccess: {
      label: 'Totem de atendimento',
      title: 'Cadastro concluído',
      subtitle: 'Dados salvos com sucesso.',
    },
  };

  const header = stepHeaders[step] ?? stepHeaders.cpfEntry;
  const canProceed = cpf.length === 11;
  const currentCpfLabel = formatCpf(cpf) || '000.000.000-00';

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <img src={leftIllustration} alt="left illustration" className="pointer-events-none absolute right-0 bottom-0 h-[560px] opacity-95" />
      <img src={rightIllustration} alt="right illustration" className="pointer-events-none absolute left-0 bottom-0 h-[520px] opacity-95" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-[690px] rounded-[40px] bg-transparent">
          <div className="px-10 py-12 sm:px-14 sm:py-16">
            <div className="text-center">
              <p className="text-sm uppercase tracking-[0.32em] text-[#06a08b]">{header.label}</p>
              <h1 className="mt-4 text-5xl font-extrabold text-[#162033]">{header.title}</h1>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#475569]">
                {header.subtitle}
              </p>
            </div>

            <div className="mx-auto mt-12 w-full max-w-3xl rounded-[36px] bg-transparent p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {step === 'cpfEntry' && (
                  <motion.div
                    key="cpfEntry"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-transparent p-6"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Passo 1</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#162033]">Digite seu CPF</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">Reiniciar</button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-[#eff6f5] p-6 text-center">
                      <p className="text-xs uppercase tracking-[0.32em] text-[#64748b]">CPF atual</p>
                      <p className="mt-4 text-5xl font-semibold text-[#162033]">{currentCpfLabel}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4">
                        {keypad.map((item) => {
                          const isClear = item === 'clear';
                          const isEmpty = item === 'blank';
                          const label = isClear ? 'Limpar' : isEmpty ? '' : item;
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (isClear) return clearCpf();
                                if (isEmpty) return;
                                appendDigit(item);
                              }}
                              disabled={isEmpty}
                              className={`h-20 rounded-[24px] text-lg font-semibold transition ${
                                isEmpty
                                  ? 'cursor-default border-transparent bg-transparent'
                                  : isClear
                                  ? 'bg-[#0b8f78] text-white hover:bg-[#0a7e69]'
                                  : 'bg-white text-[#162033] shadow-sm hover:shadow-md'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      onClick={submitCpf}
                      disabled={!canProceed}
                      className="mt-6 w-full rounded-[16px] bg-[#242E49] px-6 py-4 text-lg font-semibold text-white transition disabled:cursor-not-allowed"
                    >
                      Prosseguir
                    </button>

                    {entryMessage ? <p className="mt-4 text-center text-sm text-red-600">{entryMessage}</p> : null}
                    <p className="mt-4 text-center text-xs text-[#94a3b8]">CPF de teste: <span className="font-semibold text-[#162033]">111.111.111-11</span></p>
                  </motion.div>
                )}

                {step === 'authSelection' && (
                  <motion.div
                    key="authSelection"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Passo 2</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#162033]">Confirmar identidade</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">
                        Reiniciar
                      </button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-[#eff6f5] p-7 text-center">
                      <p className="text-sm text-[#475569]">Usuário encontrado</p>
                      <p className="mt-3 text-2xl font-semibold text-[#162033]">{user?.nome ?? 'Fulano de Tal'}</p>
                      <p className="mt-2 text-sm text-[#64748b]">Escolha o método de verificação</p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => authenticate('biometria')}
                        className="flex h-20 items-center justify-center gap-3 rounded-[28px] bg-[#162033] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#0f2038]"
                      >
                        <Fingerprint className="h-6 w-6" />
                        Biometria
                      </button>
                      <button
                        type="button"
                        onClick={() => authenticate('facial')}
                        className="flex h-20 items-center justify-center gap-3 rounded-[28px] bg-[#0b8f78] px-5 py-4 text-lg font-semibold text-white transition hover:bg-[#0a7e69]"
                      >
                        <ScanFace className="h-7 w-7" strokeWidth={2} />
                        Facial
                      </button>
                    </div>

                    {statusMessage ? (
                      <pre className="mt-5 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-red-200 bg-red-50 p-3 text-left text-xs font-medium text-[#b91c1c]">
                        {statusMessage}
                      </pre>
                    ) : null}

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-[#f8fafc] p-4 text-sm text-[#475569]">
                      Se o hardware demorar mais de 30 segundos, aparecerá timeout e você poderá tentar novamente.
                    </div>
                  </motion.div>
                )}

                {step === 'biometryPrompt' && (
                  <motion.div
                    key="biometryPrompt"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Passo 2</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#162033]">Coloque o dedo</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">
                        Reiniciar
                      </button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-[#eff6f5] p-8 text-center">
                      <Fingerprint className="mx-auto mb-4 h-14 w-14 text-[#06a08b]" />
                      <p className="text-xl font-semibold text-[#162033]">Coloque o dedo no leitor, por gentileza</p>
                      <p className="mt-3 text-sm text-[#64748b]">A leitura começa em instantes.</p>
                    </div>
                  </motion.div>
                )}

                {step === 'facialPrompt' && (
                  <motion.div
                    key="facialPrompt"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FacialCapture onComplete={submitFacial} onCancel={cancelFacial} />
                  </motion.div>
                )}

                {step === 'facialEnrollment' && (
                  <motion.div
                    key="facialEnrollment"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FacialCapture onComplete={enrollFacial} onCancel={cancelEnrollment} />
                  </motion.div>
                )}

                {step === 'areaSelection' && (
                  <motion.div
                    key="areaSelection"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Passo 3</p>
                        <h2 className="mt-2 text-2xl font-semibold text-[#162033]">Escolher área</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">Reiniciar</button>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-[#eff6f5] p-7 text-center">
                      <p className="text-sm text-[#475569]">Bem-vindo, {user?.nome ?? 'Fulano'}</p>
                      <p className="mt-3 text-3xl font-semibold text-[#162033]">Escolha a área de atendimento</p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                      {areaOptions.map((area) => (
                        <button
                          key={area}
                          type="button"
                          onClick={() => selectArea(area)}
                          className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-lg font-semibold text-[#162033] transition hover:border-slate-300 hover:shadow-sm"
                        >
                          {area}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 'triageResult' && (
                  <motion.div
                    key="triageResult"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Triagem</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#162033]">Novo usuário</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">Reiniciar</button>
                    </div>

                    <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] p-7 text-center">
                      <p className="text-sm text-[#0f766e]">Nenhum cadastro encontrado</p>
                      <p className="mt-3 text-3xl font-semibold text-[#064e3b]">{password}</p>
                      <p className="mt-2 text-sm text-[#0f766e]">Continue para completar seu cadastro.</p>
                    </div>
                    <button
                      type="button"
                      onClick={goToCadastroForm}
                      className="mt-6 w-full rounded-[16px] bg-[#0b8f78] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#0a7e69]"
                    >
                      Continuar para cadastro
                    </button>
                  </motion.div>
                )}

                {step === 'result' && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Senha gerada</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#162033]">Atendimento iniciado</h2>
                      </div>
                      <button onClick={reset} className="text-sm font-semibold text-[#0b2540] hover:underline">Reiniciar</button>
                    </div>

                    <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] p-7 text-center">
                      <p className="text-sm text-[#0f766e]">Senha gerada com sucesso</p>
                      <p className="mt-3 text-3xl font-semibold text-[#064e3b]">{password}</p>
                      <p className="mt-2 text-sm text-[#0f766e]">Confirme seus dados antes de aguardar atendimento.</p>
                    </div>
                    <button
                      type="button"
                      onClick={goToCadastroForm}
                      className="mt-6 w-full rounded-[16px] bg-[#0b8f78] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#0a7e69]"
                    >
                      Continuar para cadastro
                    </button>
                  </motion.div>
                )}

                {step === 'cadastroForm' && (
                  <motion.div
                    key="cadastroForm"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CadastroForm
                      initialData={user}
                      password={password}
                      statusMessage={statusMessage}
                      capturedImages={capturedImages}
                      onSubmit={submitCadastroForm}
                      onReset={reset}
                    />
                  </motion.div>
                )}

                {step === 'cadastroSuccess' && (
                  <motion.div
                    key="cadastroSuccess"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Cadastro</p>
                        <h2 className="mt-2 text-3xl font-semibold text-[#162033]">Tudo certo!</h2>
                      </div>
                    </div>
                    <div className="rounded-[24px] border border-[#d1fae5] bg-[#ecfdf5] p-7 text-center">
                      <p className="text-sm text-[#0f766e]">Cadastro salvo com sucesso</p>
                      <p className="mt-3 text-3xl font-semibold text-[#064e3b]">{password}</p>
                      <p className="mt-2 text-sm text-[#0f766e]">Aguarde na área selecionada para atendimento.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-3xl bg-white p-8 text-center shadow-2xl shadow-slate-950/20">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#06a08b] text-white">
              <RefreshCcw className="h-12 w-12 animate-spin" />
            </div>
            <p className="text-lg font-semibold text-[#162033]">Aguarde...</p>
            <p className="mt-2 text-sm text-[#64748b]">{overlayMessage}</p>
          </div>
        </div>
      ) : null}
    </div>

  );
}
