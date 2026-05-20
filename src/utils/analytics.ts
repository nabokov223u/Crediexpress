export function trackCrediexpressAprobado(): void {
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'crediexpress_aprobado',
      tipo_conversion: 'precalificacion_exitosa',
    });
  }
}
