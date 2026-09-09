import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AICopilotSidebarCard, WellnessSidebarCard, LotusZenIcon } from './SmartSuiteCards';

const FloatingSmartHub = ({ onDataChanged }) => {
  // null | 'ai' | 'wellness' | 'both'
  const [openPanel, setOpenPanel] = useState(null);

  const togglePanel = (panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <>
      {/* Ventana Emergente Flotante (Mantenida en el DOM para que la música y el temporizador sigan activos al minimizar) */}
      <div
        className="floating-hub-backdrop"
        onClick={() => setOpenPanel(null)}
        style={{
          display: openPanel ? 'flex' : 'none'
        }}
      >
        <div
          className="floating-hub-popover"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra superior del panel emergente */}
          <div className="floating-hub-header">
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setOpenPanel('ai')}
                className={`floating-tab-btn ${openPanel === 'ai' ? 'active' : ''}`}
              >
                <Sparkles size={15} />
                Tarjeta Copiloto IA
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel('wellness')}
                className={`floating-tab-btn ${openPanel === 'wellness' ? 'active-wellness' : ''}`}
              >
                <LotusZenIcon size={20} />
                Tarjeta Wellness &amp; Música
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel('both')}
                className={`floating-tab-btn ${openPanel === 'both' ? 'active' : ''}`}
              >
                ⚡ Ver Ambas Tarjetas
              </button>
            </div>

            <button
              type="button"
              className="floating-close-btn"
              onClick={() => setOpenPanel(null)}
              title="Minimizar ventana (la música sigue sonando)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido de las Tarjetas */}
          <div className={openPanel === 'both' ? 'grid-2' : ''} style={{ alignItems: 'start' }}>
            <div style={{ display: openPanel === 'ai' || openPanel === 'both' ? 'block' : 'none' }}>
              <AICopilotSidebarCard onDataChanged={onDataChanged} />
            </div>
            <div style={{ display: openPanel === 'wellness' || openPanel === 'both' ? 'block' : 'none' }}>
              <WellnessSidebarCard />
            </div>
          </div>
        </div>
      </div>

      {/* Burbuja Flotante en la esquina inferior derecha */}
      <div className="floating-bubble-dock">
        <button
          type="button"
          className={`floating-bubble-btn bubble-ai ${openPanel === 'ai' || openPanel === 'both' ? 'active' : ''}`}
          onClick={() => togglePanel('ai')}
          title="Abrir Copiloto de Inteligencia Artificial"
        >
          <span className="bubble-icon-circle">
            <Sparkles size={18} />
          </span>
          <span className="bubble-label">Copiloto IA</span>
        </button>

        <button
          type="button"
          className={`floating-bubble-btn bubble-wellness ${openPanel === 'wellness' ? 'active' : ''}`}
          onClick={() => togglePanel('wellness')}
          title="Abrir Espacio de Relajación y Música Continua"
        >
          <LotusZenIcon size={34} />
          <span className="bubble-label">Wellness &amp; Música</span>
        </button>
      </div>
    </>
  );
};

export default FloatingSmartHub;
