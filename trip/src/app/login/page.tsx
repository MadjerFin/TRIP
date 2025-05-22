'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BotaoAnimado from '../../components/BotaoAnimado'
import { loginUsuario } from '../../api'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap'
})

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({ email: '', senha: '' })
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [errosCampo, setErrosCampo] = useState<{ email?: string; senha?: string }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrosCampo(prev => ({ ...prev, [e.target.name]: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErroGeral(null)
    setMensagemSucesso(null)
    setErrosCampo({})

    try {
      const data = await loginUsuario(form.email, form.senha)

      localStorage.setItem('token', data.token)
      localStorage.setItem('nome', data.nome)
      localStorage.setItem('id', data.id)

      setMensagemSucesso('Login realizado com sucesso!')
      setTimeout(() => router.push('/chatbot'), 1500)

    } catch (err: unknown) {
      const novosErros: { email?: string; senha?: string } = {}

      if (err instanceof Error) {
        const msg = err.message.toLowerCase()

        if (msg.includes('senha')) {
          novosErros.senha = 'Senha incorreta'
        } else if (msg.includes('e-mail') || msg.includes('email')) {
          novosErros.email = 'E-mail não cadastrado'
        } else if (msg.includes('inválido') || msg.includes('invalid')) {
          novosErros.email = 'E-mail ou senha inválidos'
          novosErros.senha = ' '
        } else {
          setErroGeral('Erro ao tentar logar. Tente novamente.')
        }
      } else {
        setErroGeral('Erro inesperado. Tente novamente.')
      }

      setErrosCampo(novosErros)
    }
  }

  return (
    <section
      className={`${poppins.className} relative w-full h-screen flex flex-col bg-cover bg-center overflow-x-hidden`}
      style={{ backgroundImage: "url('/background-conta.png')" }}
    >
      <header className="w-full px-6 md:px-10 pt-4 flex items-center justify-between">
        <Image src="/Logo.png" alt="Logo TRIP" width={140} height={80} priority />
        <div className="flex gap-4">
          <BotaoAnimado href="/" variant="outlined">INÍCIO</BotaoAnimado>
          <BotaoAnimado href="/register" variant="filled">CRIAR CONTA</BotaoAnimado>
        </div>
      </header>

      <div className="flex flex-1 w-full flex-col lg:flex-row items-center justify-between px-6 md:px-30">
        <div className="flex flex-col justify-center items-center lg:items-start gap-6 max-w-[500px] w-full h-full pt-4 lg:pt-20 lg:ml-36 xl:ml-48 text-center lg:text-left">
          <h1 className="text-[28px] sm:text-[32px] md:text-[36px] text-white leading-snug font-bold">
            Bem-vindo(a) de volta!
            Faça login e continue sua 
            viagem com a TRIP ao seu lado.
          </h1>

          {mensagemSucesso && (
            <div className="bg-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-md shadow w-full text-center">
              {mensagemSucesso}
            </div>
          )}

          {erroGeral && (
            <div className="bg-red-200 text-red-800 text-sm font-medium px-4 py-2 rounded-md shadow w-full text-center">
              {erroGeral}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full px-1" autoComplete="off">
            <input
              type="email"
              name="email"
              placeholder={errosCampo.email ? errosCampo.email : 'Digite seu e-mail'}
              value={form.email}
              onChange={handleChange}
              className={`px-6 py-3 rounded-md placeholder:italic placeholder:text-sm ${
                errosCampo.email
                  ? 'bg-red-200 text-red-800 placeholder:text-red-800 border border-red-400'
                  : 'bg-white/20 text-white placeholder-white'
              } outline-none text-base transition-all duration-200`}
              required
            />

            <input
              type="password"
              name="senha"
              placeholder={errosCampo.senha ? errosCampo.senha : 'Digite sua senha'}
              value={form.senha}
              onChange={handleChange}
              className={`px-6 py-3 rounded-md placeholder:italic placeholder:text-sm ${
                errosCampo.senha
                  ? 'bg-red-200 text-red-800 placeholder:text-red-800 border border-red-400'
                  : 'bg-white/20 text-white placeholder-white'
              } outline-none text-base transition-all duration-200`}
              required
            />

            <button
              type="submit"
              className="border border-white px-4 py-2 sm:px-6 sm:py-3 rounded-md text-white text-sm sm:text-base hover:bg-white hover:text-[#DA3368] transition font-black"
            >
              ENTRAR
            </button>
          </form>

          <p className="text-sm text-white -mt-2">
            Não possui uma conta?{' '}
            <Link href="/register" className="underline hover:text-gray-300 font-bold">
              Criar
            </Link>
          </p>

          <div className="flex justify-center lg:justify-start">
            <Image src="/parcerias-login.svg" alt="Parcerias" width={140} height={40} className="w-auto h-8 md:h-10" />
          </div>
        </div>

        <div className="hidden lg:flex items-end justify-end h-full pr-20 lg:pr-32 xl:pr-40">
          <Image
            src="/trip-conta.svg"
            alt="Mascote Trip"
            width={700}
            height={680}
            priority
            className="w-auto h-auto max-h-[900px]"
          />
        </div>
      </div>
    </section>
  )
}
