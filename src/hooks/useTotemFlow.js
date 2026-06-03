import { useCallback, useEffect, useRef, useState } from 'react';
import {
  queryCpf,
  startBiometry,
  triageCpf,
  generateTicket,
} from '../services/totemService';

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
      if (method === 'biometria') {
        setStep('biometryPrompt');
        setOverlayMessage('Toque no leitor...');

        const promptTimer = setTimeout(async () => {
          setLoading(true);
          try {
            const result = await startBiometry(cpf);
            // Verifica tanto respostas de sucesso explícito quanto ausência de erro
            const verificado = result && !result.erro &&
              (result.status === 'ok' || result.status === 'success' || result.success || result.mensagem);
            if (verificado) {
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
    selectArea,
    reset,
  };
}
