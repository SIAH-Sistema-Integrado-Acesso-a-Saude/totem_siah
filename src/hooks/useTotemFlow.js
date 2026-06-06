import { useCallback, useEffect, useRef, useState } from 'react';
import {
  queryCpf,
  startBiometry,
  triageCpf,
  generateTicket,
  recognizeFace,
  submitCadastro,
} from '../services/totemService';

// Remove máscara do CPF (pontos/traço) para comparação.
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

    setStep('facialEnrollment');
    setStatusMessage('CPF não encontrado. Faça o cadastro facial para continuar.');
  }, [cpf]);

  const capturedImagesRef = useRef([]);

  const enrollFacial = useCallback(
    async (images) => {
      capturedImagesRef.current = images;
      setLoading(true);
      setOverlayMessage('Gerando senha de triagem...');
      try {
        const triage = await triageCpf(cpf);
        setPassword(triage.senha);
        setStep('triageResult');
        setStatusMessage('Captura facial concluída. Dirija-se à triagem para completar seu cadastro.');
      } catch (error) {
        console.error('Erro ao gerar triagem:', error);
        setStep('cpfEntry');
        setEntryMessage('Erro ao gerar senha de triagem. Tente novamente.');
      } finally {
        setLoading(false);
        setOverlayMessage('');
      }
    },
    [cpf],
  );

  const cancelEnrollment = useCallback(() => {
    setStep('cadastroSuccess');
    setStatusMessage('Biometria ignorada. Cadastro salvo com sucesso.');
  }, []);

  const completeEnrollment = useCallback(() => {
    setStep('cadastroSuccess');
    setStatusMessage('Biometria cadastrada e cadastro concluído com sucesso.');
  }, []);

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

  const submitFacial = useCallback(
    async (images) => {
      setLoading(true);
      setOverlayMessage('Reconhecendo o rosto...');
      try {
        const result = await recognizeFace(images);

        if (result?.sucesso && result.paciente) {
          // Confere se o rosto reconhecido bate com o CPF digitado.
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
        const status = error?.status ?? 'sem status';
        let body = error?.body;
        if (typeof body === 'object') body = JSON.stringify(body);
        const detail = `Erro ${status}: ${body ?? error?.message ?? 'sem detalhe'}`;
        setStep('authSelection');
        setStatusMessage(detail.length > 500 ? detail.slice(0, 500) + '…' : detail);
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

  const goToCadastroForm = useCallback(() => {
    setStep('cadastroForm');
    setStatusMessage('');
  }, []);

  const submitCadastroForm = useCallback(
    async (formData, proceedToBiometry = false) => {
      setLoading(true);
      setOverlayMessage('Enviando cadastro...');
      try {
        await submitCadastro(formData);
        
        if (proceedToBiometry) {
          setStep('biometryEnroll');
          setStatusMessage('Cadastro salvo com sucesso. Agora posicione seu dedo no leitor.');
        } else {
          setStep('cadastroSuccess');
          setStatusMessage('Cadastro concluído com sucesso.');
        }
      } catch (error) {
        console.error('Erro ao enviar cadastro:', error);
        const status = error?.status ?? 'sem status';
        let body = error?.body;
        if (typeof body === 'object') body = JSON.stringify(body);
        const msg = `Erro ${status}: ${body ?? error?.message ?? 'sem detalhe'}`;
        setStatusMessage(msg.length > 500 ? msg.slice(0, 500) + '…' : msg);
      } finally {
        setLoading(false);
        setOverlayMessage('');
      }
    },
    [],
  );

  const reset = useCallback(() => {
    clearTimers();
    capturedImagesRef.current = [];
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
    if (step === 'cadastroSuccess') {
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
    enrollFacial,
    cancelEnrollment,
    completeEnrollment,
    selectArea,
    goToCadastroForm,
    submitCadastroForm,
    capturedImages: capturedImagesRef.current,
    reset,
  };
}
