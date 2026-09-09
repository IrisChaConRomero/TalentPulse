import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Send, Wand2, Target, CheckCircle2,
  Clock, Music, Play, Pause, RotateCcw, Cpu, Volume2, VolumeX, Repeat, SkipForward
} from 'lucide-react';

// Icono Original HD con Fondo Blanco Circular Integrado (Nitidez 100% HD sin filtros que desenfoquen)
export const LotusZenIcon = ({ size = 30 }) => (
  <span
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      background: '#ffffff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35), 0 0 0 1.5px rgba(6, 182, 212, 0.45)',
      flexShrink: 0,
      overflow: 'hidden'
    }}
  >
    <img
      src="/wellness-mandala-hd.jpg"
      alt="Wellness & Música"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
        display: 'block'
      }}
    />
  </span>
);

const BREATH_MODES = {
  '4-7-8': {
    name: '4-7-8',
    desc: 'Inhala 4s · Mantén 7s · Exhala 8s (Anti-estrés)',
    phases: [
      { label: 'Inhala suavemente...', seconds: 4, scale: 1.0, color: '#06b6d4' },
      { label: 'Mantén en calma...', seconds: 7, scale: 1.0, color: '#6366f1' },
      { label: 'Exhala y suelta...', seconds: 8, scale: 0.86, color: '#10b981' }
    ]
  },
  'box': {
    name: 'Box 4×4',
    desc: 'Inhala 4s · Retén 4s · Exhala 4s · Pausa 4s (Foco)',
    phases: [
      { label: 'Inhala con control...', seconds: 4, scale: 1.0, color: '#6366f1' },
      { label: 'Retén en plenitud...', seconds: 4, scale: 1.0, color: '#06b6d4' },
      { label: 'Exhala lentamente...', seconds: 4, scale: 0.86, color: '#10b981' },
      { label: 'Pausa serena...', seconds: 4, scale: 0.86, color: '#8b5cf6' }
    ]
  },
  'coherent': {
    name: '5-5 Zen',
    desc: 'Inhala 5s · Exhala 5s (Coherencia cardíaca)',
    phases: [
      { label: 'Inhala energía...', seconds: 5, scale: 1.0, color: '#06b6d4' },
      { label: 'Exhala tensión...', seconds: 5, scale: 0.86, color: '#10b981' }
    ]
  }
};

const TIMER_PRESETS = [
  { id: 'pausa5', label: 'Pausa 5m', minutes: 5, tip: 'Rota hombros atrás 10 veces y relaja cervicales.' },
  { id: 'mind10', label: 'Zen 10m', minutes: 10, tip: 'Cierra los ojos y observa tu respiración sin juzgar.' },
  { id: 'pomo25', label: 'Foco 25m', minutes: 25, tip: 'Enfoque profundo en 1 Key Result sin distracciones.' },
  { id: 'visual2', label: '20-20-20', minutes: 2, tip: 'Mira a 6 metros de distancia y parpadea despacio.' }
];

// Las 3 canciones alojadas directamente en la web (/audio/*.mp3) para que todos los usuarios las disfruten sin Spotify
const RELAX_TRACKS = [
  {
    id: 'track1',
    title: 'Ondas Alfa & Relajación Profunda',
    artist: 'MusicoterapiaTeam · Frecuencia Alfa',
    src: '/audio/ondas_alfa.mp3',
    accent: '#06b6d4'
  },
  {
    id: 'track2',
    title: 'Outra Noite (Calma Nocturna)',
    artist: 'Fleur Harmon · Ambient Piano',
    src: '/audio/outra_noite.mp3',
    accent: '#818cf8'
  },
  {
    id: 'track3',
    title: 'Máxima Concentración & Paz',
    artist: 'Mc_team · Mindful Flow',
    src: '/audio/maxima_concentracion.mp3',
    accent: '#10b981'
  }
];

/* ============================================================================
   TARJETA 1: COPILOTO IA & ASISTENTE DE OKRs
   ============================================================================ */
export const AICopilotSidebarCard = ({ onDataChanged }) => {
  const { user } = useAuth();
  const [aiTab, setAiTab] = useState('chat');
  const [aiInfo, setAiInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);

  const [goalIdea, setGoalIdea] = useState('');
  const [generatingOkr, setGeneratingOkr] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState(null);
  const [savingProposal, setSavingProposal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchInitialAIContext();
  }, [user?.id, user?.role]);

  const fetchInitialAIContext = async () => {
    setLoadingInit(true);
    try {
      const res = await api.get('/analytics/ai-assistant/');
      setAiInfo(res.data);
      setMessages([
        {
          sender: 'ai',
          text: res.data.initial_insight,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Error al cargar el Copiloto IA:', err);
    } finally {
      setLoadingInit(false);
    }
  };

  const handleSendPrompt = async (customPrompt) => {
    const textToSend = (customPrompt ?? inputPrompt).trim();
    if (!textToSend || sending) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (!customPrompt) setInputPrompt('');
    setSending(true);

    try {
      const res = await api.post('/analytics/ai-assistant/', { prompt: textToSend });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '⚠️ Error al conectar con el motor de IA. Inténtalo de nuevo.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateOkrProposal = async (e) => {
    e.preventDefault();
    if (!goalIdea.trim()) return;
    setGeneratingOkr(true);
    setSavedSuccess(false);
    try {
      const res = await api.post('/analytics/ai-generate-okr/', { goal_idea: goalIdea });
      setGeneratedProposal(res.data);
    } catch (err) {
      alert('No se pudo generar la propuesta de OKR.');
    } finally {
      setGeneratingOkr(false);
    }
  };

  const handleSaveGeneratedOkr = async () => {
    if (!generatedProposal) return;
    setSavingProposal(true);
    try {
      const okrRes = await api.post('/okrs/', {
        title: generatedProposal.title,
        description: generatedProposal.description,
        quarter: generatedProposal.quarter || 'Q4-2026'
      });
      const createdOkrId = okrRes.data.id;
      for (const kr of generatedProposal.key_results || []) {
        await api.post('/key-results/', {
          okr: createdOkrId,
          title: kr.title,
          target_value: kr.target_value,
          current_value: 0,
          unit: kr.unit,
          weight: kr.weight
        });
      }
      setSavedSuccess(true);
      setGoalIdea('');
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Error al guardar el OKR generado.');
    } finally {
      setSavingProposal(false);
    }
  };

  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    return rawText.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: '0.92rem', fontWeight: '800', color: '#fff', margin: '0.3rem 0 0.4rem 0' }}>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h5 key={idx} style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--secondary-light)', margin: '0.5rem 0 0.25rem 0' }}>
            {line.replace('#### ', '')}
          </h5>
        );
      }
      if (line.trim() === '') return <div key={idx} style={{ height: '0.25rem' }} />;
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={idx} style={{ fontSize: '0.8rem', lineHeight: '1.48', marginBottom: '0.18rem', color: 'var(--text-main)' }}>
          {parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={i} style={{ color: '#fff' }}>{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </div>
      );
    });
  };

  const getRoleLabel = () => {
    if (user?.role === 'ADMIN') return 'IA Estrategia Global';
    if (user?.role === 'MANAGER') return 'IA Coach de Equipo';
    return 'IA Mentor Personal';
  };

  return (
    <div className="glass-card sidebar-suite-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <div className="icon-badge-box" style={{ width: '42px', height: '42px' }}>
          <Sparkles size={20} color="var(--secondary-light)" />
        </div>
        <div>
          <span className="badge badge-status-in_progress" style={{ fontSize: '0.64rem', padding: '0.2rem 0.65rem' }}>
            <Cpu size={10} /> {getRoleLabel()}
          </span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '0.15rem' }}>
            Copiloto <span className="gradient-text">IA OKR</span>
          </h3>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.3rem',
        background: 'rgba(9, 13, 26, 0.78)',
        padding: '0.25rem',
        borderRadius: '999px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        marginBottom: '0.9rem'
      }}>
        <button
          type="button"
          onClick={() => setAiTab('chat')}
          style={{
            padding: '0.38rem 0.5rem',
            borderRadius: '999px',
            border: 'none',
            fontSize: '0.74rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: aiTab === 'chat' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
            color: aiTab === 'chat' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          💬 Consultar IA
        </button>
        <button
          type="button"
          onClick={() => setAiTab('generator')}
          style={{
            padding: '0.38rem 0.5rem',
            borderRadius: '999px',
            border: 'none',
            fontSize: '0.74rem',
            fontWeight: '700',
            cursor: 'pointer',
            background: aiTab === 'generator' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
            color: aiTab === 'generator' ? '#fff' : 'var(--text-secondary)'
          }}
        >
          🪄 Crear OKR IA
        </button>
      </div>

      {aiTab === 'chat' ? (
        <>
          {aiInfo?.suggested_prompts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem', marginBottom: '0.85rem' }}>
              {aiInfo.suggested_prompts.slice(0, 3).map((promptText, index) => (
                <button
                  key={index}
                  type="button"
                  className="chip"
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.35rem 0.7rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    borderRadius: '10px'
                  }}
                  onClick={() => handleSendPrompt(promptText)}
                  disabled={sending}
                >
                  <span>✨ {promptText}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{
            background: 'rgba(9, 13, 26, 0.75)',
            border: '1px solid rgba(99, 102, 241, 0.28)',
            borderRadius: '14px',
            padding: '0.85rem',
            maxHeight: '290px',
            overflowY: 'auto',
            marginBottom: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}>
            {loadingInit ? (
              <div style={{ textAlign: 'center', padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Analizando métricas de tu perfil...
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '96%',
                    background: msg.sender === 'user'
                      ? 'linear-gradient(135deg, var(--primary), #4338ca)'
                      : 'rgba(30, 41, 59, 0.78)',
                    padding: '0.65rem 0.8rem',
                    borderRadius: '11px',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(99, 102, 241, 0.25)'
                  }}
                >
                  {renderFormattedText(msg.text)}
                </div>
              ))
            )}
            {sending && (
              <div style={{ fontSize: '0.76rem', color: 'var(--secondary-light)' }}>
                ✨ Sintetizando datos en vivo...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            style={{ display: 'flex', gap: '0.45rem' }}
          >
            <input
              type="text"
              className="form-control"
              style={{ padding: '0.58rem 0.8rem', fontSize: '0.8rem' }}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Consulta sobre OKRs o equipo..."
              disabled={sending}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.58rem 0.9rem' }} disabled={sending || !inputPrompt.trim()}>
              <Send size={14} />
            </button>
          </form>
        </>
      ) : (
        <div style={{
          background: 'rgba(9, 13, 26, 0.75)',
          border: '1px solid rgba(99, 102, 241, 0.28)',
          borderRadius: '14px',
          padding: '0.9rem'
        }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            Escribe una meta y la IA diseñará un <strong>Objetivo SMART + 3 Key Results</strong>:
          </p>
          <form onSubmit={handleGenerateOkrProposal} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              style={{ padding: '0.58rem 0.8rem', fontSize: '0.8rem' }}
              value={goalIdea}
              onChange={(e) => setGoalIdea(e.target.value)}
              placeholder="Ej. Mejorar seguridad cloud y CI/CD"
              required
            />
            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '0.55rem' }} disabled={generatingOkr}>
              <Wand2 size={14} /> {generatingOkr ? 'Generando...' : 'Diseñar OKR con IA'}
            </button>
          </form>

          {generatedProposal && (
            <div style={{ borderTop: '1px solid rgba(99, 102, 241, 0.25)', paddingTop: '0.7rem' }}>
              <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#fff', marginBottom: '0.35rem' }}>
                {generatedProposal.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
                {generatedProposal.key_results.map((kr, i) => (
                  <div key={i} style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    🎯 {kr.title} (<strong style={{ color: 'var(--secondary-light)' }}>{kr.target_value} {kr.unit}</strong>)
                  </div>
                ))}
              </div>
              {savedSuccess ? (
                <div style={{ color: 'var(--accent-light)', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={14} /> ¡Guardado en base de datos!
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.5rem', fontSize: '0.76rem' }}
                  onClick={handleSaveGeneratedOkr}
                  disabled={savingProposal}
                >
                  <Target size={14} /> {savingProposal ? 'Guardando...' : 'Guardar OKR (1 Clic)'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   TARJETA 2: AUTORRELAJACIÓN & WELLNESS HUB (AUDIO NATIVO CONTINUO SIN CORTES)
   ============================================================================ */
export const WellnessSidebarCard = () => {
  const [breathModeKey, setBreathModeKey] = useState('4-7-8');
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(BREATH_MODES['4-7-8'].phases[0].seconds);
  const [completedCycles, setCompletedCycles] = useState(0);

  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0]);
  const [timerSeconds, setTimerSeconds] = useState(TIMER_PRESETS[0].minutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reproductor Nativo con Crossfade Infinito (Para que cualquier usuario escuche sin tener Spotify)
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [playMode, setPlayMode] = useState('repeat-one'); // 'repeat-one' | 'playlist'
  const [customTracks, setCustomTracks] = useState(RELAX_TRACKS);

  // Doble canal de audio para Crossfade suave infinito sin cortes
  const audioARef = useRef(null);
  const audioBRef = useRef(null);
  const activeChannelRef = useRef('A');
  const isCrossfadingRef = useRef(false);

  const currentTrack = customTracks[trackIdx] || customTracks[0];
  const currentBreathMode = BREATH_MODES[breathModeKey];
  const currentPhase = currentBreathMode.phases[phaseIdx] || currentBreathMode.phases[0];

  // Ciclo de respiración guiada
  useEffect(() => {
    if (!isBreathing) return;
    const interval = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = (phaseIdx + 1) % currentBreathMode.phases.length;
        setPhaseIdx(nextIdx);
        if (nextIdx === 0) setCompletedCycles((c) => c + 1);
        return currentBreathMode.phases[nextIdx].seconds;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBreathing, phaseIdx, currentBreathMode]);

  // Temporizador Pomodoro / Pausa Activa
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  // Inicializar elementos de Audio Nativo con Crossfade Continuo
  useEffect(() => {
    const a = new Audio(currentTrack.src);
    const b = new Audio(currentTrack.src);
    a.preload = 'auto';
    b.preload = 'auto';
    a.volume = volume;
    b.volume = 0;
    audioARef.current = a;
    audioBRef.current = b;

    return () => {
      a.pause();
      b.pause();
    };
  }, []);

  // Control de Crossfade automático antes de que termine el bloque para que dure indefinidamente sin ningún corte
  useEffect(() => {
    if (!isPlayingAudio) return;

    const checkCrossfade = setInterval(() => {
      const primary = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
      const secondary = activeChannelRef.current === 'A' ? audioBRef.current : audioARef.current;
      if (!primary || !secondary || !primary.duration) return;

      const timeLeft = primary.duration - primary.currentTime;
      if (timeLeft <= 3.2 && !isCrossfadingRef.current) {
        isCrossfadingRef.current = true;

        // Determinar siguiente pista (misma pista en bucle infinito o siguiente de la playlist)
        let nextIndex = trackIdx;
        if (playMode === 'playlist') {
          nextIndex = (trackIdx + 1) % customTracks.length;
          setTrackIdx(nextIndex);
        }
        const nextSrc = customTracks[nextIndex].src;
        if (!secondary.src.endsWith(nextSrc)) {
          secondary.src = nextSrc;
        }
        secondary.currentTime = 0;
        secondary.volume = 0;
        secondary.play().catch(() => {});

        // Fundido cruzado suave de 2.8 segundos
        let step = 0;
        const steps = 28;
        const fadeTimer = setInterval(() => {
          step += 1;
          const ratio = step / steps;
          primary.volume = Math.max(0, (1 - ratio) * volume);
          secondary.volume = Math.min(volume, ratio * volume);
          if (step >= steps) {
            clearInterval(fadeTimer);
            primary.pause();
            primary.currentTime = 0;
            activeChannelRef.current = activeChannelRef.current === 'A' ? 'B' : 'A';
            isCrossfadingRef.current = false;
          }
        }, 100);
      }
    }, 250);

    return () => clearInterval(checkCrossfade);
  }, [isPlayingAudio, trackIdx, playMode, volume, customTracks]);

  const togglePlayAudio = () => {
    const primary = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
    const secondary = activeChannelRef.current === 'A' ? audioBRef.current : audioARef.current;
    if (!primary) return;

    if (isPlayingAudio) {
      primary.pause();
      if (secondary) secondary.pause();
      setIsPlayingAudio(false);
    } else {
      primary.volume = volume;
      primary.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  const selectAndPlayTrack = (index) => {
    const chosen = customTracks[index];
    setTrackIdx(index);
    isCrossfadingRef.current = false;

    const a = audioARef.current;
    const b = audioBRef.current;
    if (b) {
      b.pause();
      b.currentTime = 0;
    }
    if (a) {
      a.pause();
      a.src = chosen.src;
      a.currentTime = 0;
      a.volume = volume;
      a.play().catch(() => {});
      activeChannelRef.current = 'A';
      setIsPlayingAudio(true);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    const primary = activeChannelRef.current === 'A' ? audioARef.current : audioBRef.current;
    if (primary && !isCrossfadingRef.current) {
      primary.volume = newVol;
    }
  };

  const formatMMSS = (totalSecs) => {
    const m = Math.floor(totalSecs / 60).toString().padStart(2, '0');
    const s = (totalSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="glass-card sidebar-suite-card">
      {/* Cabecera Elegante con Medallón HD Blanco */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.85rem' }}>
        <LotusZenIcon size={48} />
        <div>
          <span className="badge badge-employee" style={{ fontSize: '0.64rem', padding: '0.2rem 0.65rem' }}>
            <span className="status-dot" /> Mindful Lounge • Ciclos: {completedCycles}
          </span>
          <h3 style={{ fontSize: '1.12rem', fontWeight: '800', marginTop: '0.15rem' }}>
            Wellness &amp; <span className="gradient-text">Música</span>
          </h3>
        </div>
      </div>

      {/* 1. Respiración + Temporizador en fila */}
      <div className="grid-2" style={{ gap: '0.75rem', marginBottom: '0.9rem' }}>
        {/* Esfera Zen con Flor de Loto Vectorial Animada (Sin emojis) */}
        <div style={{
          background: 'rgba(9, 13, 26, 0.78)',
          border: '1px solid rgba(99, 102, 241, 0.28)',
          borderRadius: '16px',
          padding: '0.85rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            {Object.entries(BREATH_MODES).map(([key, mode]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setIsBreathing(false);
                  setBreathModeKey(key);
                  setPhaseIdx(0);
                  setPhaseTimeLeft(BREATH_MODES[key].phases[0].seconds);
                }}
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  border: breathModeKey === key ? '1px solid var(--secondary-light)' : '1px solid rgba(99, 102, 241, 0.25)',
                  background: breathModeKey === key ? 'rgba(6, 182, 212, 0.22)' : 'transparent',
                  color: breathModeKey === key ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.66rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {mode.name}
              </button>
            ))}
          </div>

          {/* Medallón Circular Blanco HD con la Imagen Original Nítida */}
          <div style={{ padding: '0.45rem 0', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                width: '138px',
                height: '138px',
                borderRadius: '50%',
                background: '#ffffff',
                padding: '4px',
                border: isBreathing
                  ? `3px solid ${currentPhase.color}`
                  : '2.5px solid rgba(6, 182, 212, 0.55)',
                boxShadow: isBreathing
                  ? `0 0 28px ${currentPhase.color}88, 0 8px 20px rgba(0, 0, 0, 0.45)`
                  : '0 8px 24px rgba(0, 0, 0, 0.48), 0 0 0 4px rgba(99, 102, 241, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                transform: isBreathing ? `scale(${currentPhase.scale})` : 'scale(1)',
                transition: `transform ${currentPhase.seconds}s ease-in-out, border-color 0.5s ease, box-shadow 0.5s ease`
              }}
            >
              <img
                src="/wellness-mandala-hd.jpg"
                alt="Mandala de Respiración Consciente HD"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block'
                }}
              />
              {isBreathing && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: `1.5px solid ${currentPhase.color}`,
                    borderRadius: '999px',
                    padding: '0.12rem 0.65rem',
                    fontSize: '0.88rem',
                    fontWeight: '800',
                    color: '#ffffff',
                    fontFamily: 'var(--font-heading)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.45)'
                  }}
                >
                  {phaseTimeLeft}s
                </span>
              )}
            </div>
          </div>

          <div style={{ fontSize: '0.73rem', fontWeight: '700', color: isBreathing ? '#fff' : 'var(--text-secondary)', margin: '0.35rem 0 0.5rem' }}>
            {isBreathing ? currentPhase.label : 'Respiración consciente'}
          </div>

          <button
            type="button"
            className={`btn ${isBreathing ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', justifyContent: 'center', padding: '0.45rem', fontSize: '0.73rem' }}
            onClick={() => setIsBreathing(!isBreathing)}
          >
            {isBreathing ? <Pause size={12} /> : <Play size={12} />}
            {isBreathing ? 'Pausar Guía' : 'Iniciar Calma'}
          </button>
        </div>

        {/* Temporizador de Pausa Activa / Pomodoro */}
        <div style={{
          background: 'rgba(9, 13, 26, 0.78)',
          border: '1px solid rgba(99, 102, 241, 0.28)',
          borderRadius: '16px',
          padding: '0.85rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setSelectedPreset(preset);
                  setTimerSeconds(preset.minutes * 60);
                }}
                style={{
                  padding: '0.2rem 0.45rem',
                  borderRadius: '8px',
                  border: selectedPreset.id === preset.id ? '1px solid var(--primary-light)' : '1px solid rgba(255,255,255,0.1)',
                  background: selectedPreset.id === preset.id ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                  color: selectedPreset.id === preset.id ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.66rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div style={{ margin: '0.35rem 0' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary-light)', fontFamily: 'var(--font-heading)' }}>
              {formatMMSS(timerSeconds)}
            </div>
            <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', lineHeight: '1.35' }}>
              {selectedPreset.tip}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.73rem' }}
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? <Pause size={12} /> : <Clock size={12} />}
              {isTimerRunning ? 'Pausar' : 'Temporizador'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.55rem' }}
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(selectedPreset.minutes * 60);
              }}
              title="Reiniciar"
            >
              <RotateCcw size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Reproductor Musical Integrado en la Web (Sin necesitar cuenta de Spotify + Crossfade Infinito) */}
      <div style={{
        background: 'rgba(9, 13, 26, 0.85)',
        border: '1.5px solid rgba(52, 211, 153, 0.38)',
        borderRadius: '16px',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.7rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Music size={16} color="var(--accent-light)" />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
              Playlist Wellness &amp; Música
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setPlayMode(playMode === 'repeat-one' ? 'playlist' : 'repeat-one')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.24rem 0.65rem',
                borderRadius: '999px',
                border: '1px solid rgba(52, 211, 153, 0.45)',
                background: 'rgba(16, 185, 129, 0.16)',
                color: 'var(--accent-light)',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Repeat size={11} />
              {playMode === 'repeat-one' ? 'Bucle Infinito Pista' : 'Playlist Continua'}
            </button>
          </div>
        </div>

        {/* Lista de las 3 Canciones integradas en el servidor web */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem', marginBottom: '0.85rem' }}>
          {customTracks.map((track, idx) => {
            const isSelected = idx === trackIdx;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectAndPlayTrack(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '11px',
                  border: isSelected ? '1.5px solid var(--accent-light)' : '1px solid rgba(99, 102, 241, 0.25)',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(6, 182, 212, 0.18))'
                    : 'rgba(19, 28, 51, 0.68)',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: isSelected ? '#fff' : 'var(--text-main)' }}>
                    {idx + 1}. {track.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {track.artist}
                  </div>
                </div>

                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  color: isSelected && isPlayingAudio ? 'var(--accent-light)' : 'var(--secondary-light)'
                }}>
                  {isSelected && isPlayingAudio ? '● Sonando' : 'Reproducir'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Barra de Control del Reproductor Nativo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingTop: '0.65rem',
          borderTop: '1px solid rgba(99, 102, 241, 0.22)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '0.48rem 1rem', fontSize: '0.76rem' }}
              onClick={togglePlayAudio}
            >
              {isPlayingAudio ? <Pause size={14} /> : <Play size={14} />}
              {isPlayingAudio ? 'Pausar Música' : 'Reproducir Sin Cortes'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.48rem 0.65rem' }}
              onClick={() => selectAndPlayTrack((trackIdx + 1) % customTracks.length)}
              title="Siguiente canción"
            >
              <SkipForward size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {isPlayingAudio ? <Volume2 size={15} color="var(--accent-light)" /> : <VolumeX size={15} color="var(--text-muted)" />}
            <input
              type="range"
              min="0.05"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              style={{ width: '80px', cursor: 'pointer' }}
              title="Volumen de la música"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
