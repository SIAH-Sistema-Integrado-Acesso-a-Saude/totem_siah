import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Check, AlertTriangle } from 'lucide-react';

const desafios = [
  { id: 'frente', label: 'Frente', instrucao: 'Olhe para a frente' },
  { id: 'esquerda', label: 'Esquerda', instrucao: 'Vire o rosto para a esquerda' },
  { id: 'direita', label: 'Direita', instrucao: 'Vire o rosto para a direita' },
  { id: 'cima', label: 'Cima', instrucao: 'Incline o rosto para cima' },
];

export default function FacialCapture({ onComplete, onCancel }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const desafioIndexRef = useRef(0);
  const fotosRef = useRef({});
  const tempoInicioEstabilidadeRef = useRef(null);
  const requestRef = useRef(null);
  const ultimaDeteccaoRef = useRef(null);
  const ultimaDeteccaoTimeRef = useRef(0);
  const finalizadoRef = useRef(false);
  const baselineRef = useRef(null);
  const amostrasBaselineRef = useRef([]);

  const AMOSTRAS_BASELINE = 20;

  const [modelosCarregados, setModelosCarregados] = useState(false);
  const [desafioIndex, setDesafioIndex] = useState(0);
  const [posicaoCorreta, setPosicaoCorreta] = useState(false);
  const [mensagem, setMensagem] = useState('Carregando IA...');
  const [processando, setProcessando] = useState(false);
  const [calibrando, setCalibrando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        if (!ativo) return;
        setModelosCarregados(true);
        setMensagem(desafios[0].instrucao);
      } catch (err) {
        console.error('Erro ao carregar modelos:', err);
        setMensagem('Erro ao carregar IA');
      }
    };
    loadModels();
    return () => {
      ativo = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const validarPosicao = (landmarks) => {
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();
    const distEsquerda = nose[0].x - jaw[0].x;
    const distDireita = jaw[16].x - nose[0].x;
    const ratio = distEsquerda / distDireita;

    const noseTop = nose[0].y;
    const noseBottom = nose[3].y;
    const verticalDiff = noseBottom - noseTop;

    const atualId = desafios[desafioIndexRef.current]?.id;

    if (atualId === 'frente') {
      if (!baselineRef.current) {
        if (ratio > 0.2 && ratio < 5 && verticalDiff > 3) {
          amostrasBaselineRef.current.push({ ratio, verticalDiff });
          if (amostrasBaselineRef.current.length >= AMOSTRAS_BASELINE) {
            const soma = amostrasBaselineRef.current.reduce(
              (acc, s) => ({
                ratio: acc.ratio + s.ratio,
                verticalDiff: acc.verticalDiff + s.verticalDiff,
              }),
              { ratio: 0, verticalDiff: 0 }
            );
            const n = amostrasBaselineRef.current.length;
            baselineRef.current = {
              ratio: soma.ratio / n,
              verticalDiff: soma.verticalDiff / n,
            };
          }
        }
        return false;
      }
      const deltaRatio = ratio / baselineRef.current.ratio;
      const deltaVert = verticalDiff / baselineRef.current.verticalDiff;
      return deltaRatio > 0.78 && deltaRatio < 1.28 && deltaVert > 0.75;
    }

    if (!baselineRef.current) return false;
    const base = baselineRef.current;
    const deltaRatio = ratio / base.ratio;
    const deltaVert = verticalDiff / base.verticalDiff;

    if (atualId === 'esquerda' && deltaRatio > 1.7) return true;
    if (atualId === 'direita' && deltaRatio < 0.5) return true;
    if (atualId === 'cima' && deltaVert < 0.55) return true;

    return false;
  };

  const desenharGuia = (ctx, box, estaCorreto) => {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const base = Math.min(box.width, box.height);
    const rh = base * 0.65;
    const rv = base * 0.9;

    ctx.strokeStyle = estaCorreto
      ? 'rgba(6, 160, 139, 0.8)'
      : 'rgba(239, 68, 68, 0.55)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rh, rv, 0, 0, Math.PI * 2);
    ctx.stroke();
  };

  const desenharContagem = (ctx, box, segundos) => {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(-1, 1);
    ctx.fillStyle = 'white';
    ctx.font = "bold 26px Inter, 'Segoe UI', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(segundos.toString(), 0, 0);
    ctx.restore();
  };

  const processarFrame = async () => {
    const idx = desafioIndexRef.current;
    if (finalizadoRef.current || idx >= desafios.length || !webcamRef.current?.video || !canvasRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;

    if (video.readyState === 4) {
      const displaySize = { width: video.offsetWidth, height: video.offsetHeight };

      if (canvas.width !== displaySize.width || canvas.height !== displaySize.height) {
        faceapi.matchDimensions(canvas, displaySize);
      }

      const deteccao = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (deteccao) {
        const resized = faceapi.resizeResults(deteccao, displaySize);
        const estaCorreto = validarPosicao(deteccao.landmarks);
        const emCalibracao = desafios[idx]?.id === 'frente' && !baselineRef.current;

        ultimaDeteccaoRef.current = { resized, estaCorreto };
        ultimaDeteccaoTimeRef.current = Date.now();
        setPosicaoCorreta(estaCorreto);
        setCalibrando(emCalibracao);

        desenharGuia(ctx, resized.detection.box, estaCorreto || emCalibracao);

        if (emCalibracao) {
          tempoInicioEstabilidadeRef.current = null;
          setMensagem('Calibrando, mantenha-se parado...');
        } else if (estaCorreto) {
          if (!tempoInicioEstabilidadeRef.current) tempoInicioEstabilidadeRef.current = Date.now();
          const tempoPassado = Date.now() - tempoInicioEstabilidadeRef.current;

          if (tempoPassado >= 3000) {
            const foto = webcamRef.current.getScreenshot();
            fotosRef.current[desafios[idx].id] = foto;
            tempoInicioEstabilidadeRef.current = null;

            if (idx < desafios.length - 1) {
              desafioIndexRef.current += 1;
              setDesafioIndex(desafioIndexRef.current);
              setMensagem(desafios[idx + 1].instrucao);
            } else {
              finalizadoRef.current = true;
              setProcessando(true);
              setMensagem('Processando biometria facial...');
              onComplete(Object.values(fotosRef.current));
              return;
            }
          } else {
            const restante = Math.ceil(3 - tempoPassado / 1000);
            desenharContagem(ctx, resized.detection.box, restante);
            setMensagem(desafios[idx].instrucao);
          }
        } else {
          tempoInicioEstabilidadeRef.current = null;
          setMensagem(desafios[idx]?.instrucao);
        }
      } else {
        const tempoDesdeUltima = Date.now() - ultimaDeteccaoTimeRef.current;
        if (ultimaDeteccaoRef.current && tempoDesdeUltima < 500) {
          const { resized, estaCorreto } = ultimaDeteccaoRef.current;
          desenharGuia(ctx, resized.detection.box, estaCorreto);
        } else {
          setPosicaoCorreta(false);
          ultimaDeteccaoRef.current = null;
        }
      }
    }

    requestRef.current = requestAnimationFrame(processarFrame);
  };

  const handleVideoPlay = () => {
    requestRef.current = requestAnimationFrame(processarFrame);
  };

  const atual = desafios[Math.min(desafioIndex, desafios.length - 1)];

  return (
    <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#06a08b]">Passo 2</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#162033]">
            {processando ? 'Processando...' : `Etapa ${desafioIndex + 1}: ${atual?.label}`}
          </h2>
        </div>
        <button onClick={onCancel} className="text-sm font-semibold text-[#0b2540] hover:underline">
          Voltar
        </button>
      </div>

      {modelosCarregados && !processando && (
        <div
          className={`mb-4 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
            calibrando
              ? 'bg-[#fef9c3] text-[#854d0e]'
              : posicaoCorreta
              ? 'bg-[#ecfdf5] text-[#0f766e]'
              : 'bg-[#fef2f2] text-[#b91c1c]'
          }`}
        >
          {calibrando ? (
            <>
              <AlertTriangle size={16} /> Calibrando...
            </>
          ) : posicaoCorreta ? (
            <>
              <Check size={16} /> Posição correta
            </>
          ) : (
            <>
              <AlertTriangle size={16} /> Ajuste sua posição
            </>
          )}
        </div>
      )}

      <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-[28px] border border-slate-200 bg-black">
        {!modelosCarregados && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 text-[#162033]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#06a08b] border-t-transparent" />
            <p className="text-sm font-medium">Carregando IA...</p>
          </div>
        )}
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored
          screenshotFormat="image/jpeg"
          onPlay={handleVideoPlay}
          className="h-full w-full object-cover"
          videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />
      </div>

      <p className="mt-5 text-center text-base font-medium text-[#475569]">{mensagem}</p>

      <div className="mt-6 flex items-center justify-center gap-3">
        {desafios.map((d, i) => {
          const done = i < desafioIndex || processando;
          const active = i === desafioIndex && !processando;
          return (
            <div
              key={d.id}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                done
                  ? 'bg-[#06a08b] text-white'
                  : active
                  ? 'bg-[#162033] text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {done ? <Check size={16} /> : i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
