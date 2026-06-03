import { useCallback, useEffect, useRef, useState } from 'react';
import {
  queryCpf,
  startBiometry,
  triageCpf,
  generateTicket,
  recognizeFace,
} from '../services/totemService';

// Remove máscara do CPF (pontos/traço) para comparação — o banco da API tem
// CPFs salvos em formatos inconsistentes (com e sem máscara).
const soDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export function useTotemFlow() {
  const [cpf, setCpf] = useState('');
  const [step, setStep] = useState('cpfEntry');
  const [user, setUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [entryMessage, setEntryMessage] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const appendDigit = useCallback(
    (digit) => {
      if (cpf.length >= 11) return;
      setCpf((current) => current + digit);
    },
    [cpf],
  );

  const removeDigit = useCallback(() => {
    setCpf((current) => current.slice(0, -1));
  }, []);

  const clearCpf = useCallback(() => {
    setCpf('');
    setEntryMessage('');
  }, []);

  const submitCpf = useCallback(async () => {
    if (cpf.length !== 11) {
      setEntryMessage('Digite um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);
    setOverlayMessage('Consultando CPF no banco de dados...');
    setEntryMessage('');

    const result = await queryCpf(cpf);
    setLoading(false);

    if (result) {
      setUser(result);
      setStep('authSelection');
      setStatusMessage('CPF encontrado. Escolha um método de verificação.');
      return;
    }

    const triage = await triageCpf(cpf);
    setPassword(triage.senha);
    setStep('triageResult');
    setStatusMessage('Senha gerada com sucesso. Dirija-se à triagem para completar seu cadastro.');
  }, [cpf]);

  const authenticate = useCallback(
    async (method) => {
      setEntryMessage('');

      if (method === 'facial') {
        setStatusMessage('');
        setStep('facialPrompt');
        return;
      }

      if (method === 'biometria') {
        setStep('biometryPrompt');
        setOverlayMessage('Toque no leitor...');

        const promptTimer = setTimeout(async () => {
          setLoading(true);
          try {
            const result = await startBiometry(cpf);
            if (result && (result.status === 'ok' || result.status === 'success' || result.success)) {
              setUser((prev) => ({
                ...(prev ?? {}),
                nome: result.nome || prev?.nome || 'Paciente',
              }));
              setStep('areaSelection');
              return;
            }
            setStep('authSelection');
            setStatusMessage('Biometria não identificada. Tente novamente.');
          } catch (error) {
            console.error('Erro na autenticação biométrica:', error);
            setStep('authSelection');
            setStatusMessage('Erro na leitura da biometria. Tente novamente.');
          } finally {
            setLoading(false);
          }
        }, 1200);

        timers.current.push(promptTimer);
      }
    },
    [cpf]
  );

  const submitFacial = useCallback(
    async (images) => {
      setLoading(true);
      setOverlayMessage('Reconhecendo o rosto...');
      try {
        const result = await recognizeFace(images);

        if (result?.sucesso && result.paciente) {
          // Confere se o rosto reconhecido bate com o CPF digitado (comparação sem máscara).
          if (soDigitos(result.paciente.cpf) !== soDigitos(cpf)) {
            setStep('authSelection');
            setStatusMessage('O rosto reconhecido não corresponde ao CPF informado. Tente novamente.');
            return;
          }

          setUser((prev) => ({
            ...(prev ?? {}),
            ...result.paciente,
            nome: result.paciente.nome || prev?.nome || 'Paciente',
          }));
          setStep('areaSelection');
          return;
        }

        setStep('authSelection');
        setStatusMessage('Rosto não identificado. Tente novamente.');
      } catch (error) {
        console.error('Erro no reconhecimento facial:', error);
        setStep('authSelection');
        setStatusMessage('Erro no reconhecimento facial. Tente novamente.');
      } finally {
        setLoading(false);
        setOverlayMessage('');
      }
    },
    [cpf],
  );

  const cancelFacial = useCallback(() => {
    setStep('authSelection');
    setStatusMessage('Escolha um método de verificação.');
  }, []);

  const selectArea = useCallback(
    async (area) => {
      setLoading(true);
      setOverlayMessage('Gerando sua senha...');
      try {
        const result = await generateTicket(cpf, area);
        const senha = result?.senha || result?.ticket || result?.numero || (typeof result === 'string' ? result : '');
        
        if (senha) {
          setPassword(senha);
          setStep('result');
          setStatusMessage(`Senha ${senha} gerada com sucesso. Aguarde na área selecionada.`);
        } else {
          throw new Error('Resposta de senha inválida ou nula.');
        }
      } catch (error) {
        console.error('Erro ao gerar ticket:', error);
        setStatusMessage('Não foi possível gerar a senha. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [cpf]
  );

  const reset = useCallback(() => {
    clearTimers();
    setCpf('');
    setStep('cpfEntry');
    setUser(null);
    setStatusMessage('');
    setEntryMessage('');
    setPassword('');
    setOverlayMessage('');
    setLoading(false);
  }, [clearTimers]);

  useEffect(() => {
    if (step === 'result' || step === 'triageResult') {
      const resultTimer = setTimeout(reset, 4000);
      timers.current.push(resultTimer);
      return () => clearTimeout(resultTimer);
    }
    return undefined;
  }, [reset, step]);

  return {
    cpf,
    appendDigit,
    removeDigit,
    clearCpf,
    submitCpf,
    step,
    user,
    statusMessage,
    entryMessage,
    password,
    loading,
    overlayMessage,
    authenticate,
    submitFacial,
    cancelFacial,
    selectArea,
    reset,
  };
}
