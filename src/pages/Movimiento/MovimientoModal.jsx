import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { createPortal } from 'react-dom';

import {
  X,
  ArrowLeftRight,
  Check,
  Search,
  Plus,
  User
} from 'lucide-react';

const INITIAL = {
  CUB_Cuenta: '',
  PER_Persona: '',
  TIM_Tipo_Movimiento: '',
  MEM_Medio_Movimiento: '',
  ESM_Estado_Movimiento: '',
  RCA_Regla_Recargo: '',
  MOV_Fecha: '',
  MOV_Numero_Referencia: '',
  MOV_Descripcion: '',
  MOV_Monto_Origen: '',
};

const normalize = (value) =>
  String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const SearchableSelect = ({
  label,
  value,
  options = [],
  getOptionId,
  getOptionText,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
}) => {
  const boxRef = useRef(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const selected = options.find(
      item => String(getOptionId(item)) === String(value)
    );

    if (selected) {
      setQuery(getOptionText(selected));
    }
  }, [value, options, getOptionId, getOptionText]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);

    if (!q) return options.slice(0, 8);

    return options
      .filter(item => normalize(getOptionText(item)).includes(q))
      .slice(0, 8);
  }, [query, options, getOptionText]);

  return (
    <div className="input-group searchable-select" ref={boxRef}>
      <label>{label}</label>

      <div className={`searchable-control ${open ? 'is-open' : ''}`}>
        <Search size={15} className="searchable-control-icon" />

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {!disabled && open && (
        <div className="searchable-menu">
          {filtered.length > 0 ? (
            filtered.map(item => {
              const id = String(getOptionId(item));

              return (
                <button
                  key={id}
                  type="button"
                  className={`searchable-item ${String(value) === id ? 'selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(id);
                    setQuery(getOptionText(item));
                    setOpen(false);
                  }}
                >
                  <span>{getOptionText(item)}</span>
                  {String(value) === id && <Check size={14} />}
                </button>
              );
            })
          ) : (
            <div className="searchable-empty">
              No se encontraron resultados
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MovimientoModal = ({
  isOpen,
  onClose,
  onSave,
  cuentaId = '',
  numeroCuenta = '',
  personas = [],
  tiposMovimiento = [],
  mediosMovimiento = [],
  estadosMovimiento = []
}) => {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [personaSearch, setPersonaSearch] = useState('');

  const setValue = (key, value) =>
    setForm(prev => ({
      ...prev,
      [key]: value
    }));

  const setText = (key) => (e) =>
    setValue(key, e.target.value);

  const getPersonaId = (p) =>
    p?.peR_Persona ??
    p?.pER_Persona ??
    p?.per_persona ??
    p?.id ??
    '';

  const getPersonaNombre = (p) =>
    p?.peR_Nombre_Completo ??
    p?.pER_Nombre_Completo ??
    p?.per_nombre_completo ??
    p?.nombreCompleto ??
    '';

  const getPersonaNit = (p) =>
    p?.peR_NIT ??
    p?.pER_NIT ??
    p?.PER_NIT ??
    p?.nit ??
    '';

  const getPersonaDpi = (p) =>
    p?.peR_DPI ??
    p?.pER_DPI ??
    p?.PER_DPI ??
    p?.dpi ??
    '';

  const getTipoId = (t) =>
    t?.tiM_Tipo_Movimiento ??
    t?.tIM_Tipo_Movimiento ??
    t?.tim_tipo_movimiento ??
    '';

  const getTipoDesc = (t) =>
    t?.tiM_Descripcion ??
    t?.tIM_Descripcion ??
    t?.tim_descripcion ??
    '';

  const getMedioId = (m) =>
    m?.meM_Medio_Movimiento ??
    m?.mEM_Medio_Movimiento ??
    m?.mem_medio_movimiento ??
    '';

  const getMedioDesc = (m) =>
    m?.meM_Descripcion ??
    m?.mEM_Descripcion ??
    m?.mem_descripcion ??
    '';

  const getEstadoId = (e) =>
    e?.esM_Estado_Movimiento ??
    e?.eSM_Estado_Movimiento ??
    e?.esm_estado_movimiento ??
    '';

  const getEstadoDesc = (e) =>
    e?.esM_Descripcion ??
    e?.eSM_Descripcion ??
    e?.esm_descripcion ??
    '';

  const estadoPorDefecto = useMemo(() => {
    if (!estadosMovimiento || estadosMovimiento.length === 0) return '';

    const activo =
      estadosMovimiento.find((e) =>
        String(getEstadoDesc(e)).trim().toLowerCase() === 'activo'
      ) ||
      estadosMovimiento[0];

    return String(getEstadoId(activo) ?? '');
  }, [estadosMovimiento]);

  const mediosSinCheque = useMemo(() => {
    return mediosMovimiento.filter((m) => {
      const nombre = String(getMedioDesc(m)).trim().toLowerCase();
      return nombre !== 'cheque';
    });
  }, [mediosMovimiento]);

  const personasFiltradas = useMemo(() => {
    const q = personaSearch.trim().toLowerCase();

    if (!q) return [];

    return personas
      .filter((p) => {
        const nombre = String(getPersonaNombre(p) ?? '').toLowerCase();
        const nit = String(getPersonaNit(p) ?? '').toLowerCase();
        const dpi = String(getPersonaDpi(p) ?? '').toLowerCase();

        return (
          nombre.includes(q) ||
          nit.includes(q) ||
          dpi.includes(q)
        );
      })
      .slice(0, 8);
  }, [personas, personaSearch]);

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...INITIAL,
        CUB_Cuenta: String(cuentaId ?? ''),
        ESM_Estado_Movimiento: estadoPorDefecto,
        MOV_Fecha: new Date().toISOString().slice(0, 16),
      });

      setPersonaSearch('');
    }
  }, [isOpen, cuentaId, estadoPorDefecto]);

  if (!isOpen) return null;

  const isValid =
    String(form.CUB_Cuenta).trim() !== '' &&
    String(form.TIM_Tipo_Movimiento).trim() !== '' &&
    String(form.MEM_Medio_Movimiento).trim() !== '' &&
    String(form.ESM_Estado_Movimiento).trim() !== '' &&
    String(form.MOV_Fecha).trim() !== '' &&
    String(form.MOV_Descripcion).trim() !== '' &&
    Number(form.MOV_Monto_Origen) > 0;

  const handleSubmit = async () => {
    if (!isValid || saving) return;

    setSaving(true);

    try {
      await onSave({
        CUB_Cuenta: Number(form.CUB_Cuenta),
        PER_Persona: form.PER_Persona ? Number(form.PER_Persona) : null,
        TIM_Tipo_Movimiento: Number(form.TIM_Tipo_Movimiento),
        MEM_Medio_Movimiento: Number(form.MEM_Medio_Movimiento),
        ESM_Estado_Movimiento: Number(form.ESM_Estado_Movimiento),
        RCA_Regla_Recargo: form.RCA_Regla_Recargo ? Number(form.RCA_Regla_Recargo) : null,
        MOV_Fecha: new Date(form.MOV_Fecha).toISOString(),
        MOV_Numero_Referencia: form.MOV_Numero_Referencia.trim() || null,
        MOV_Descripcion: form.MOV_Descripcion.trim(),
        MOV_Monto_Origen: Number(form.MOV_Monto_Origen),
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-card movimiento-modal-card">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon">
              <ArrowLeftRight size={20} />
            </div>

            <div>
              <h2>Nuevo movimiento</h2>
              <p>Cuenta {numeroCuenta || cuentaId}</p>
            </div>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-row">
            <div className="input-group">
              <label>Cuenta</label>
              <input value={numeroCuenta || cuentaId} disabled />
            </div>

            <div className="input-group">
              <label>Fecha *</label>
              <input
                type="datetime-local"
                value={form.MOV_Fecha}
                onChange={setText('MOV_Fecha')}
                disabled={saving}
              />
            </div>
          </div>

          <div className="form-row">
            <SearchableSelect
              label="Tipo movimiento *"
              value={form.TIM_Tipo_Movimiento}
              options={tiposMovimiento}
              getOptionId={getTipoId}
              getOptionText={getTipoDesc}
              onChange={(value) => setValue('TIM_Tipo_Movimiento', value)}
            />

            <SearchableSelect
              label="Medio movimiento *"
              value={form.MEM_Medio_Movimiento}
              options={mediosSinCheque}
              getOptionId={getMedioId}
              getOptionText={getMedioDesc}
              onChange={(value) => setValue('MEM_Medio_Movimiento', value)}
            />
          </div>

          <div className="form-row movimiento-persona-layout">
            <div className="input-group persona-search-section">
              <label>Buscar persona</label>

              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search
                  size={15}
                  color="#94a3b8"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                />

                <input
                  value={personaSearch}
                  onChange={(e) => {
                    setPersonaSearch(e.target.value);
                    setValue('PER_Persona', '');
                  }}
                  placeholder="Buscar por nombre, NIT o DPI..."
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 34px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 13,
                    background: '#f8fafc',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {personaSearch.trim() !== '' && (
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    maxHeight: 260,
                    overflowY: 'auto',
                    background: '#fff'
                  }}
                >
                  {personasFiltradas.length === 0 ? (
                    <div
                      style={{
                        padding: 14,
                        fontSize: 12,
                        color: '#94a3b8',
                        textAlign: 'center'
                      }}
                    >
                      No se encontraron personas.
                    </div>
                  ) : (
                    personasFiltradas.map((p) => {
                      const pid = getPersonaId(p);
                      const nombre = getPersonaNombre(p) || 'Sin nombre';
                      const nit = getPersonaNit(p);
                      const dpi = getPersonaDpi(p);
                      const selected = String(form.PER_Persona) === String(pid);

                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => {
                            setValue('PER_Persona', String(pid));
                            setPersonaSearch(nombre);
                          }}
                          style={{
                            width: '100%',
                            border: 'none',
                            borderBottom: '1px solid #f1f5f9',
                            background: selected ? '#eff6ff' : '#fff',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#0f172a'
                              }}
                            >
                              {nombre}
                            </div>

                            <div
                              style={{
                                fontSize: 11,
                                color: '#64748b',
                                marginTop: 2
                              }}
                            >
                              NIT: {nit || '—'} · DPI: {dpi || '—'}
                            </div>
                          </div>

                          {selected ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#0284c7'
                              }}
                            >
                              Seleccionado
                            </span>
                          ) : (
                            <User size={16} color="#94a3b8" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="estado-side">
              <SearchableSelect
                label="Estado *"
                value={form.ESM_Estado_Movimiento}
                options={estadosMovimiento}
                getOptionId={getEstadoId}
                getOptionText={getEstadoDesc}
                onChange={(value) => setValue('ESM_Estado_Movimiento', value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Referencia</label>
              <input
                value={form.MOV_Numero_Referencia}
                onChange={setText('MOV_Numero_Referencia')}
                placeholder="Ej. TRX-001"
                disabled={saving}
              />
            </div>

            <div className="input-group">
              <label>Monto *</label>

              <div className="money-input">
                <span>Q</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.MOV_Monto_Origen}
                  onChange={setText('MOV_Monto_Origen')}
                  placeholder="0.00"
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label>Descripción *</label>
            <input
              value={form.MOV_Descripcion}
              onChange={setText('MOV_Descripcion')}
              placeholder="Descripción del movimiento"
              disabled={saving}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            Cancelar
          </button>

          <button
            className="btn-save"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            type="button"
          >
            {saving ? (
              'Guardando...'
            ) : (
              <>
                <Plus size={15} />
                Guardar movimiento
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MovimientoModal;