'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  respaldo: ReactNode;
}

/**
 * Red de seguridad para la carga de modelos.
 *
 * useModeloDisponible ya evita el caso normal (archivo ausente), pero un .glb
 * corrupto o mal exportado lanza dentro del árbol de R3F y tumbaría todo el
 * canvas. Acá se degrada a la silueta procedural en vez de dejar la pantalla vacía.
 */
export class LimiteDeError extends Component<Props, { fallo: boolean }> {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  componentDidCatch(error: Error) {
    console.warn('No se pudo cargar el modelo 3D, se usa la silueta procedural:', error.message);
  }

  render() {
    return this.state.fallo ? this.props.respaldo : this.props.children;
  }
}
