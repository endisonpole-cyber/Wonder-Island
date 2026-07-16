// Speak text using Web Speech API (TTS)

// 缓存可用语音列表
let cachedVoices: SpeechSynthesisVoice[] = [];
let preferredVoice: string | null = null;

// 语音初始化：浏览器异步加载语音列表
if (typeof window !== "undefined" && window.speechSynthesis) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/** 获取所有可用的中文语音 */
export function getZhVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices.filter((v) => v.lang.toLowerCase().startsWith("zh"));
}

/** 设置首选语音名称 */
export function setPreferredVoice(name: string) {
  preferredVoice = name;
  if (typeof window !== "undefined") {
    localStorage.setItem("preferred-voice", name);
  }
}

/** 从 localStorage 恢复首选语音 */
export function initPreferredVoice() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem("preferred-voice");
  if (saved) preferredVoice = saved;
}

/** 智能选择最佳中文语音：优先女声 */
function pickBestZhVoice(): SpeechSynthesisVoice | null {
  const zhVoices = getZhVoices();
  if (zhVoices.length === 0) return null;

  // 1. 用户手动选择的
  if (preferredVoice) {
    const match = zhVoices.find((v) => v.name === preferredVoice);
    if (match) return match;
  }

  // 2. 优先女声关键词
  const femaleKeywords = ["female", "女", "Huihui", "Yaoyao", "Tingting", "Mei", "Xiaoxiao", "Yunxi"];
  for (const kw of femaleKeywords) {
    const found = zhVoices.find((v) => v.name.includes(kw));
    if (found) return found;
  }

  // 3. 退回第一个中文语音
  return zhVoices[0];
}

// Speak text using Web Speech API (TTS)
export function speak(text: string, rate: number = 0.9): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  initPreferredVoice();

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  utterance.pitch = 1.1; // Slightly higher pitch for child-friendly voice

  const voice = pickBestZhVoice();
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

// Speak English text
export function speakEnglish(text: string, rate: number = 0.7): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.2;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  const enVoice = voices.find(
    (v) => v.lang.startsWith("en") && v.name.includes("female")
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (enVoice) {
    utterance.voice = enVoice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

// Stop all speech
export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
