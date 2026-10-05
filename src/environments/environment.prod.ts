/**
 * Configuracao de producao.
 *
 * O caminho relativo assume que a API e servida sob o mesmo dominio do
 * frontend (por um proxy reverso). Se a API tiver dominio proprio, troque
 * por essa URL absoluta e mantenha-a na lista de CORS da API.
 */
export const environment = {
  producao: true,
  apiUrl: '/api',
};
