/** WaCalls uses 16 kHz mono Int16 little endian over the `pcm` data channel. */
export function encodePcm(samples: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  samples.forEach((sample, index) => {
    const clipped = Math.max(-1, Math.min(1, sample));
    view.setInt16(
      index * 2,
      clipped < 0 ? clipped * 32768 : clipped * 32767,
      true
    );
  });
  return buffer;
}
export function decodePcm(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const samples = new Float32Array(Math.floor(buffer.byteLength / 2));
  samples.forEach((_, index) => {
    samples[index] = view.getInt16(index * 2, true) / 32768;
  });
  return samples;
}
