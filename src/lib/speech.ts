// Speak text using Web Speech API (TTS)
export function speak(text: string, rate: number = 0.9): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = rate;
  utterance.pitch = 1.1; // Slightly higher pitch for child-friendly voice

  // Try to find a Chinese voice
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(
    (v) => v.lang.startsWith("zh") && v.name.includes("female")
  ) || voices.find((v) => v.lang.startsWith("zh"));

  if (zhVoice) {
    utterance.voice = zhVoice;
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

  const voices = window.speechSynthesis.getVoices();
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
