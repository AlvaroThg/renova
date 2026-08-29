/**
 * Nodos del modelo `planta-biogas.glb` que son escenografía y no equipamiento.
 *
 * Se excluyen al calcular el encuadre: la retícula del terreno mide 46 × 46
 * contra unos 9 de alto del conjunto, así que medirla dejaría los equipos
 * reducidos a una manchita en el centro del cuadro. Sigue dibujándose — solo
 * que se sale del encuadre, que es exactamente lo que hace un piso.
 *
 * Si el modelo se reexporta con otros nombres, esta lista es el único lugar
 * a tocar.
 */
export const NODOS_ESCENOGRAFIA = ['reticula'];
