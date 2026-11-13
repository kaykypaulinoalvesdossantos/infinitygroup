class InboxPlayback extends AudioWorkletProcessor {
  constructor() {
    super();
    this.samples = new Float32Array(32000);
    this.read = 0;
    this.write = 0;
    this.count = 0;
    this.port.onmessage = ({ data }) => {
      for (const sample of data) {
        this.samples[this.write] = sample;
        this.write = (this.write + 1) % this.samples.length;
        if (this.count < this.samples.length) this.count++;
        else this.read = (this.read + 1) % this.samples.length;
      }
    };
  }
  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (!output) return true;
    for (let i = 0; i < output.length; i++) {
      output[i] = this.count ? this.samples[this.read] : 0;
      if (this.count) { this.read = (this.read + 1) % this.samples.length; this.count--; }
    }
    return true;
  }
}
registerProcessor("inbox-playback", InboxPlayback);
