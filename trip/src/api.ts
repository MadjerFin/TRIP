const BASE_URL = 'https://trip-java-production.up.railway.app/api'

// Registro de usuário com tratamento de erro
export async function cadastrarUsuario(dados: {
  nome: string
  email: string
  senha: string
}) {
  try {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    })

    const conteudo = await res.text() // lê apenas uma vez

    if (!res.ok) {
      const msg = conteudo.toLowerCase()
      if (
        res.status === 409 ||
        msg.includes('e-mail já cadastrado') ||
        msg.includes('email já cadastrado')
      ) {
        throw new Error('Este e-mail já está cadastrado. Tente outro ou faça login.')
      }

      throw new Error(conteudo || 'Erro ao registrar. Tente novamente.')
    }

    // Tenta converter o conteúdo para JSON (se aplicável)
    try {
      return JSON.parse(conteudo)
    } catch {
      return {} // ou null, se não houver corpo JSON válido
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Erro no cadastro:', err.message)
      throw err
    } else {
      console.error('Erro desconhecido no cadastro')
      throw new Error('Erro inesperado ao cadastrar. Tente novamente.')
    }
  }
}

// Login de usuário com tratamento refinado
export async function loginUsuario(email: string, senha: string) {
  try {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    })

    const texto = await res.text()

    if (!res.ok) {
      const msg = texto.toLowerCase()
      if (res.status === 401) {
        if (msg.includes('senha')) {
          throw new Error('Senha incorreta')
        } else if (msg.includes('email')) {
          throw new Error('E-mail não cadastrado')
        } else {
          throw new Error('E-mail ou senha inválidos')
        }
      }

      throw new Error(texto || 'Erro ao logar. Tente novamente.')
    }

    const data = JSON.parse(texto)

    // Salva token local
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token)
    }

    return data

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Erro no login:', err.message)
      throw err
    } else {
      console.error('Erro desconhecido no login')
      throw new Error('Erro inesperado ao logar. Tente novamente.')
    }
  }
}
