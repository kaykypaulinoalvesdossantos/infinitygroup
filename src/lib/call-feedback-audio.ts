const tones = {
  dialing: { duration: 4, notes: [[0, 0.16, 520], [0.25, 0.16, 520]], loop: true },
  ringing: { duration: 3, notes: [[0, 1, 440]], loop: true },
  connected: { duration: 0.35, notes: [[0, 0.12, 620], [0.14, 0.19, 780]], loop: false },
} as const;

export function playCallFeedback(context: AudioContext, kind: keyof typeof tones) {
  const { duration, notes, loop } = tones[kind];
  const rate = context.sampleRate;
  const buffer = context.createBuffer(1, Math.ceil(rate * duration), rate);
  const samples = buffer.getChannelData(0);
  for (const [start, length, frequency] of notes) {
    for (let index = 0; index < Math.floor(length * rate); index++) {
      const time = index / rate;
      const fade = Math.min(1, time / 0.02, (length - time) / 0.02);
      samples[Math.floor(start * rate) + index] = Math.sin(2 * Math.PI * frequency * time) * fade * 0.12;
    }
  }
  const tone = context.createBufferSource();
  tone.buffer = buffer;
  tone.loop = loop;
  tone.connect(context.destination);
  tone.start();
  return () => {
    tone.stop();
    tone.disconnect();
  };
}
