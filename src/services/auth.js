import { api } from './api.js'

export async function login(email, password) {
  try {
    const { data } = await api.post('/login', { email, password })
    return data.token
  } catch (error) {
    console.error('Erro ao fazer login:', error)
    throw error
  }
}

export function logout() {
  localStorage.removeItem('token')
}