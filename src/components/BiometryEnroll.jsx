import { useEffect, useRef, useState } from 'react';
import { Fingerprint, Check, AlertTriangle } from 'lucide-react';
import { enrollBiometry } from '../services/totemService';

// Mensagens que ciclam enquanto o C# faz as leituras — replicam o vocabulário do app desktop
const MENSAGENS = [
  'Coloque o dedo no leitor',
  'Mantenha firme por alguns instantes...',
  'Retire o dedo ao sentir a vibração',
  'Coloque o dedo novamente',
  'Ótimo! Aguarde a próxima leitura...',
  'Quase lá, reposicione o dedo',
];

export default function BiometryEnroll({ cpf, onComplete, onCancel }) {
  const [mensagem, setMensagem] = useState('Coloque o dedo no leitor');
  const [status, setStatus] = useState('waiting'); // 'waiting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [amostras, setAmostras] = useState(0); // 0–4, progressão visual

  const mensagemIdxRef = useRef(0);
  const mensagemTimerRef = useRef(null);
  const amostraTimerRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    // Cicla mensagens a cada 5s enquanto aguarda
    mensagemTimerRef.current = setInterval(() => {
      mensagemIdxRef.current = (mensagemIdxRef.current + 1) % MENSAGENS.length;
      setMensagem(MENSAGENS[mensagemIdxRef.current]);
    }, 5000);

    // Preenche visualmente os 4 indicadores ao longo do tempo (cosmético)
    // O C# tem timeout de 90s; simulamos ~18s por amostra
    let count = 0;
    amostraTimerRef.current = setInterval(() => {
      count += 1;
      if (count <= 3) {
        // Avança até 3 — o 4º é completado ao receber a resposta da API
        setAmostras(count);
      }
      if (count >= 3) clearInterval(amostraTimerRef.current);
    }, 18000);

    enrollBiometry(cpf)
      .then((result) => {
        if (cancelledRef.current) return;

        clearInterval(mensagemTimerRef.current);
        clearInterval(amostraTimerRef.current);

        const statusText = result?.status || result?.mensagem || '';
        const isSuccess =
          statusText.toLowerCase().includes('sucesso') ||
          statusText.toLowerCase().includes('success') ||
          statusText.toLowerCase().includes('realizado');

        if (isSuccess) {
          setAmostras(4);
          setStatus('success');
          setMensagem('Biometria cadastrada com sucesso!');
          setTimeout(() => {
            if (!cancelledRef.current) onComplete(result);
          }, 2500);
        } else {
          setStatus('error');
          setErrorMsg(statusText || 'Erro no cadastro. Tente novamente.');
        }
      })
      .catch((err) => {
        if (cancelledRef.current) return;

        clearInterval(mensagemTimerRef.current);
        clearInterval(amostraTimerRef.current);
        setStatus('error');
        setErrorMsg(err?.message || 'Não foi possível conectar ao leitor biométrico.');
      });

    return () => {
      cancelledRef.current = true;
      clearInterval(mensagemTimerRef.current);
      clearInterval(amostraTimerRef.current);
    };
  }, [cpf, onComplete]);

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Cadastro biométrico</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#162033]">
            {status === 'success'
              ? 'Cadastro concluído!'
              : status === 'error'
              ? 'Erro no cadastro'
              : 'Registrando digital'}
          </h2>
        </div>
        {status !== 'success' && (
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-[#0b2540] hover:underline"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Área principal */}
      <div className="rounded-[28px] border border-slate-200 bg-[#eff6f5] p-8 text-center">
        {status === 'waiting' && (
          <>
            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#06a08b] opacity-15" />
              <span className="absolute inset-2 animate-ping rounded-full bg-[#06a08b] opacity-10 [animation-delay:0.4s]" />
              <Fingerprint className="relative h-16 w-16 text-[#06a08b]" />
            </div>
            <p className="text-xl font-semibold text-[#162033]">{mensagem}</p>
            <p className="mt-2 text-sm text-[#64748b]">
              São necessárias <strong>4 leituras</strong> para concluir o cadastro.
              <br />
              Coloque e retire o dedo conforme solicitado pelo leitor.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#ecfdf5]">
              <Check className="h-12 w-12 text-[#0f766e]" strokeWidth={2.5} />
            </div>
            <p className="text-xl font-semibold text-[#064e3b]">Biometria cadastrada!</p>
            <p className="mt-2 text-sm text-[#0f766e]">
              Sua digital foi registrada com sucesso no sistema.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-[#fef2f2]">
              <AlertTriangle className="h-12 w-12 text-[#b91c1c]" />
            </div>
            <p className="text-xl font-semibold text-[#162033]">Não foi possível cadastrar</p>
            <p className="mt-2 text-sm text-[#b91c1c]">{errorMsg}</p>
          </>
        )}
      </div>

      {/* Indicadores de progresso — 4 leituras */}
      <div className="mt-6 flex items-center justify-center gap-3">
        {[1, 2, 3, 4].map((i) => {
          const done = i <= amostras && status !== 'error';
          const active = i === amostras + 1 && status === 'waiting';
          return (
            <div
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500 ${
                done
                  ? 'scale-105 bg-[#06a08b] text-white'
                  : active
                  ? 'animate-pulse bg-[#162033] text-white'
                  : status === 'error'
                  ? 'bg-[#fef2f2] text-[#b91c1c]'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? <Check size={15} /> : i}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        {status === 'success'
          ? '4 de 4 leituras concluídas'
          : status === 'error'
          ? 'Processo interrompido'
          : `${amostras} de 4 leituras concluídas`}
      </p>

      {status === 'error' && (
        <button
          onClick={onCancel}
          className="mt-6 w-full rounded-[16px] bg-[#0b2540] px-6 py-4 text-lg font-semibold text-white transition hover:bg-[#162033]"
        >
          Voltar
        </button>
      )}
    </div>
  );
}
