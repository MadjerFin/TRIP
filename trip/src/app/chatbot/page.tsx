'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type SpeechRecognitionAlternative = {
  transcript: string
  confidence: number
}

type SpeechRecognitionResult = {
  0: SpeechRecognitionAlternative
  isFinal: boolean
  length: number
}

type SpeechRecognitionResultList = {
  0: SpeechRecognitionResult
  length: number
}

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList
}

type SpeechRecognitionInstance = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

export default function Chatbot() {
  const router = useRouter()
  const [mensagens, setMensagens] = useState([
    {
      remetente: 'bot',
      texto: 'Olá! Eu sou o assistente virtual Trip ~\n\nEm relação às linhas de trens e metrôs, como posso te ajudar?',
    },
  ])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [gravando, setGravando] = useState(false)
  const [logado, setLogado] = useState(false)

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const fimDasMensagensRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      router.push('/')
    } else {
      setLogado(true)
    }
  }, [router])

  const formatarTexto = (texto: string) => {
    return texto.replace(/\n/g, '<br>')
  }

  const enviarMensagem = async () => {
    if (!input.trim()) return
    const novaMensagem = { remetente: 'user', texto: input }

    setMensagens((prev) => [...prev, novaMensagem, { remetente: 'bot', texto: 'Analisando...' }])
    setInput('')
    setEnviando(true)
    setTimeout(() => fimDasMensagensRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

    try {
      const resposta = await fetch('https://chatbot-trip.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: novaMensagem.texto }),
      })

      const data = await resposta.json() // <-- aqui está a correção
      const texto = data.resposta || 'Erro: resposta vazia'

      setMensagens((msgs) => {
        const novasMsgs = [...msgs.slice(0, -1), { remetente: 'bot', texto: formatarTexto(texto) }]
        return novasMsgs
      })
    } catch {
      setMensagens((msgs) => [...msgs.slice(0, -1), { remetente: 'bot', texto: 'Desculpe, ocorreu um erro.' }])
    }

    setEnviando(false)
  }

  const limparConversa = async () => {
    setMensagens([
      {
        remetente: 'bot',
        texto: 'Olá! Eu sou o assistente virtual Trip ~\n\nEm relação às linhas de trens e metrôs, como posso te ajudar?',
      },
    ])
    try {
      await fetch('https://chatbot-trip.onrender.com/limpar_historico', { method: 'POST' })
    } catch (e) {
      console.error('Erro ao limpar histórico', e)
    }
  }

  const handleMicrofoneClick = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognitionInstance }).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz.')
      return
    }

    if (gravando && recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognitionRef.current = recognition
    recognition.start()
    setGravando(true)

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setInput(event.results[0][0].transcript)
    }

    recognition.onerror = () => {
      setGravando(false)
      recognition.stop()
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setGravando(false)
      recognitionRef.current = null
    }
  }

  return (
    <section
      className="relative w-full min-h-screen flex flex-col bg-[#DA3368] bg-no-repeat bg-center bg-cover overflow-x-hidden font-[Poppins]"
      style={{ backgroundImage: "url('/background-chatbot.png')" }}
    >
      <header className="w-full px-6 md:px-10 pt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Image src="/Logo.png" alt="Logo TRIP" width={120} height={60} priority />
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            className="text-white text-xs sm:text-sm px-4 py-2 rounded-md border border-white font-bold hover:bg-white hover:text-[#DA3368] shadow-md transition"
          >
            INÍCIO
          </Link>
          <button
            onClick={limparConversa}
            className="bg-white text-[#DA3368] text-xs sm:text-sm font-bold px-4 py-2 rounded-md hover:opacity-90 shadow-md transition"
          >
            LIMPAR CONVERSA
          </button>
          {logado && (
            <button
              onClick={() => {
                localStorage.removeItem('token')
                router.push('/')
              }}
              className="text-white text-xs sm:text-sm px-4 py-2 rounded-md border border-white font-bold hover:bg-white hover:text-[#DA3368] shadow-md transition"
            >
              SAIR
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-end w-full max-w-5xl px-4 sm:px-6 py-10 mx-auto">
        <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] mb-6">
          {mensagens.map((msg, i) => (
            <div
              key={i}
              className={`max-w-[80%] px-6 py-3 rounded-full text-sm md:text-base font-medium ${
                msg.remetente === 'user'
                  ? 'bg-white text-black self-start'
                  : 'bg-white/30 text-white self-end'
              }`}
              dangerouslySetInnerHTML={{ __html: msg.texto }}
            ></div>
          ))}
          <div ref={fimDasMensagensRef} />
        </div>

        <div className="w-full flex justify-center px-2">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 w-full max-w-3xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarMensagem()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder:text-gray-300 outline-none"
            />
            <button
              onClick={handleMicrofoneClick}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition duration-300"
            >
              <Image src="/microfone.svg" alt="Microfone" width={20} height={20} />
            </button>
            <button
              onClick={enviarMensagem}
              disabled={enviando}
              className="bg-white text-[#DA3368] px-5 py-2 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition duration-300 ease-in-out"
            >
              Enviar
            </button>
          </div>
        </div>
      </main>
    </section>
  )
}
