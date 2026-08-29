'use client';

import { FormEvent, useState } from 'react';
import { GeneradorDto } from '@renova/shared';
import { api } from '@/lib/api/client';
import { useConsulta } from '@/lib/api/useConsulta';
import { EncabezadoVista } from '@/components/dashboard/BarraLateral';

const FORMULARIO_VACIO = { nombre: '', tipo: '', direccion: '', contacto: '' };

export default function VistaGeneradores() {
  const { datos: generadores, recargar } = useConsulta(() => api.generadores(), []);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const datos = {
        nombre: formulario.nombre,
        tipo: formulario.tipo,
        direccion: formulario.direccion || undefined,
        contacto: formulario.contacto || undefined,
      };
      if (editando) {
        await api.actualizarGenerador(editando, datos);
      } else {
        await api.crearGenerador(datos);
      }
      cancelar();
      recargar();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  function editar(generador: GeneradorDto) {
    setEditando(generador.id);
    setFormulario({
      nombre: generador.nombre,
      tipo: generador.tipo,
      direccion: generador.direccion ?? '',
      contacto: generador.contacto ?? '',
    });
  }

  function cancelar() {
    setEditando(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function alternarActivo(generador: GeneradorDto) {
    await api.actualizarGenerador(generador.id, { activo: !generador.activo });
    recargar();
  }

  async function eliminar(generador: GeneradorDto) {
    setError(null);
    try {
      await api.eliminarGenerador(generador.id);
      recargar();
    } catch (e) {
      // El backend rechaza borrar un generador con entregas: borraría el histórico.
      setError((e as Error).message);
    }
  }

  return (
    <div className="p-8">
      <EncabezadoVista
        titulo="Generadores de residuo"
        descripcion="Los puntos de origen que abastecen la planta y su volumen histórico entregado."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={guardar} className="tarjeta h-fit">
          <h2 className="text-base font-semibold">
            {editando ? 'Editar generador' : 'Nuevo generador'}
          </h2>

          <div className="mt-4 space-y-4">
            <Campo
              id="nombre"
              etiqueta="Nombre"
              valor={formulario.nombre}
              onChange={(v) => setFormulario((f) => ({ ...f, nombre: v }))}
              placeholder="Mercado Campesino"
              requerido
            />
            <Campo
              id="tipo"
              etiqueta="Tipo"
              valor={formulario.tipo}
              onChange={(v) => setFormulario((f) => ({ ...f, tipo: v }))}
              placeholder="Mercado, comedor, feria…"
              requerido
            />
            <Campo
              id="direccion"
              etiqueta="Dirección"
              valor={formulario.direccion}
              onChange={(v) => setFormulario((f) => ({ ...f, direccion: v }))}
              placeholder="Av. Cañoto esq. Isabel La Católica"
            />
            <Campo
              id="contacto"
              etiqueta="Contacto"
              valor={formulario.contacto}
              onChange={(v) => setFormulario((f) => ({ ...f, contacto: v }))}
              placeholder="Administración de mercado"
            />

            {error && (
              <p role="alert" className="rounded-lg border border-estado-critico/40 bg-estado-critico/10 px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button type="submit" disabled={enviando} className="boton-primario flex-1 disabled:opacity-60">
                {editando ? 'Guardar cambios' : 'Agregar'}
              </button>
              {editando && (
                <button type="button" onClick={cancelar} className="boton-secundario">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="tarjeta overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-superficie-alta text-xs text-texto-tenue">
                <tr>
                  <th className="px-5 py-3 font-medium">Generador</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 text-right font-medium">Total entregado</th>
                  <th className="px-5 py-3 text-right font-medium">Entregas</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {(generadores ?? []).map((generador) => (
                  <tr key={generador.id} className="border-t border-borde/60">
                    <td className="px-5 py-3">
                      <p className="text-texto">{generador.nombre}</p>
                      {generador.direccion && (
                        <p className="text-[11px] text-texto-debil">{generador.direccion}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-texto-tenue">{generador.tipo}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {generador.totalEntregadoKg.toLocaleString('es-BO')} kg
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-texto-tenue">
                      {generador.entregas}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => alternarActivo(generador)}
                        className={`text-xs ${generador.activo ? 'text-estado-normal' : 'text-texto-debil'}`}
                      >
                        {generador.activo ? '● Activo' : '○ Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-3 text-xs">
                        <button type="button" onClick={() => editar(generador)} className="text-acento">
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminar(generador)}
                          className="text-texto-tenue hover:text-estado-critico"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({
  id,
  etiqueta,
  valor,
  onChange,
  placeholder,
  requerido,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  requerido?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-texto-tenue">
        {etiqueta}
        {!requerido && <span className="text-texto-debil"> (opcional)</span>}
      </label>
      <input
        id={id}
        type="text"
        required={requerido}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="campo"
      />
    </div>
  );
}
