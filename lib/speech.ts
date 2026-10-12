export type SpeechLang = "en-IN" | "hi-IN";

function pickVoice(lang: SpeechLang) {
  if (typeof window === "undefined" || !window.speechSynthesis) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const exact = voices.find((voice) => voice.lang?.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;
  const prefix = lang.slice(0, 2).toLowerCase();
  return voices.find((voice) => voice.lang?.toLowerCase().startsWith(prefix));
}

export function speak(text: string, lang: SpeechLang) {
  if (typeof window === "undefined" || !window.speechSynthesis || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang === "hi-IN" ? 0.78 : 0.86;
  utterance.pitch = 1.05;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}

type Speakable = { word: string; hindiPron: string };

/** Urdu cards speak the Hindi transliteration with hi-IN. Native Urdu voices are unreliable. */
export function speakWord(subject: "english" | "hindi" | "urdu", item: Speakable) {
  if (subject === "english") {
    speak(item.word, "en-IN");
    return;
  }
  if (subject === "hindi") {
    speak(item.word, "hi-IN");
    return;
  }
  speak(item.hindiPron, "hi-IN");
}
