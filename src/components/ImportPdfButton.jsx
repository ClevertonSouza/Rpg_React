import { useRef, useState } from 'react';
import { parsePdfSheet } from '../utils/parsePdfSheet';

/**
 * Botão que abre um file picker para importar uma ficha PDF do D&D 5.5 oficial.
 * Após parsing, exibe preview e chama onImport(characterData).
 */
export default function ImportPdfButton({ onImport, disabled }) {
  const inputRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | parsing | preview | error
  const [preview, setPreview] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleClick = () => {
    if (disabled || state === 'parsing') return;
    inputRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input para permitir importar o mesmo arquivo novamente
    e.target.value = '';

    setState('parsing');
    setErrorMsg('');
    setPreview(null);

    try {
      const charData = await parsePdfSheet(file);
      setPreview(charData);
      setState('preview');
    } catch (err) {
      console.error('Erro ao importar PDF:', err);
      setErrorMsg('Não foi possível ler o PDF. Verifique se é a ficha oficial do D&D 5.5.');
      setState('error');
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
      setState('idle');
      setPreview(null);
    }
  };

  const handleCancel = () => {
    setState('idle');
    setPreview(null);
    setErrorMsg('');
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      {state === 'idle' && (
        <button
          className="btn btn-sm btn-outline"
          onClick={handleClick}
          disabled={disabled}
          title="Importar ficha a partir de um PDF oficial do D&D 5.5"
        >
          📄 Importar PDF
        </button>
      )}

      {state === 'parsing' && (
        <span className="pdf-import-status">Lendo PDF...</span>
      )}

      {state === 'error' && (
        <div className="pdf-import-error">
          <span>{errorMsg}</span>
          <button className="btn btn-sm" onClick={handleCancel}>Fechar</button>
        </div>
      )}

      {state === 'preview' && preview && (
        <div className="pdf-import-overlay">
          <div className="pdf-import-modal">
            <h3 className="pdf-import-title">Importar Ficha</h3>
            <p className="pdf-import-subtitle">
              Dados encontrados no PDF. Confirme para criar o personagem.
            </p>

            <div className="pdf-import-grid">
              <div className="pdf-import-field">
                <span className="pdf-import-label">Nome</span>
                <span className="pdf-import-value">{preview.name}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">Classe</span>
                <span className="pdf-import-value">{preview.class || '—'}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">Nível</span>
                <span className="pdf-import-value">{preview.level}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">Espécie</span>
                <span className="pdf-import-value">{preview.race || '—'}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">Antecedente</span>
                <span className="pdf-import-value">{preview.background || '—'}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">HP Máx</span>
                <span className="pdf-import-value">{preview.hpMax}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">CA</span>
                <span className="pdf-import-value">{preview.ac}</span>
              </div>
              <div className="pdf-import-field">
                <span className="pdf-import-label">Velocidade</span>
                <span className="pdf-import-value">{preview.speed || '—'}</span>
              </div>
            </div>

            <div className="pdf-import-attrs">
              {Object.entries(preview.attributes).map(([key, attr]) => (
                <div key={key} className="pdf-import-attr">
                  <span className="pdf-import-attr-name">{ATTR_LABELS[key]}</span>
                  <span className="pdf-import-attr-val">{attr.value}</span>
                </div>
              ))}
            </div>

            <div className="pdf-import-actions">
              <button className="btn btn-gold" onClick={handleConfirm}>
                Confirmar Importação
              </button>
              <button className="btn btn-sm" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ATTR_LABELS = {
  forca:        'FOR',
  destreza:     'DES',
  constituicao: 'CON',
  inteligencia: 'INT',
  sabedoria:    'SAB',
  carisma:      'CAR',
};
