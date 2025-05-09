import { useState, useEffect, useRef } from 'react';
import micIcon from './assets/microphone.png';

export default function App() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = 'ru-RU';
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setMessage((prev) => (prev ? prev + ' ' : '') + transcript);
    };
    recog.onerror = (e) => console.error('Speech error:', e.error);
    recog.onend = () => setListening(false);

    recognitionRef.current = recog;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      setMessage('');
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const sendChat = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setReply(data.reply);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#062D69] flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        {/* Заголовок над формой */}
        <h1 className="text-white text-center text-3xl font-bold mb-6">
          Добро пожаловать ChatGPT-клиент
        </h1>

        <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
          {/* Кнопка микрофона */}
          <button
            onClick={toggleListening}
            className="p-2 opacity-70 hover:opacity-100 transition"
          >
            <img
              src={micIcon}
              alt="Mic"
              className="h-6 w-6"
            />
          </button>

          {/* Поле ввода текста */}
          <input
            type="text"
            className="flex-1 bg-transparent border-none text-white placeholder-white opacity-80 mx-4 focus:outline-none"
            placeholder="Ask whatever you want"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
          />

          {/* Кнопка отправки */}
          <button
            onClick={sendChat}
            disabled={loading}
            className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Ответ от сервера */}
        {reply && (
          <div className="mt-6 text-white text-center whitespace-pre-wrap">
            {reply}
          </div>
        )}
      </div>
    </div>
  );
}
