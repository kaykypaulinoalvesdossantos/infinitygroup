import { apiRequest } from './api';

export const usersService = {
  /**
   * Atualiza os dados do usuário logado.
   * Usado para troca de senha no primeiro acesso.
   */
  async updateMe(data: { password?: string; name?: string }) {
    return apiRequest('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Busca as preferências do usuário logado.
   */
  async getPreferences() {
    return apiRequest('/users/me/preferences', {
      method: 'GET',
    });
  },

  /**
   * Atualiza as preferências do usuário logado.
   */
  async updatePreferences(data: any) {
    return apiRequest('/users/me/preferences', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
