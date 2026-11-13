/* PCM bridge for the authenticated WaCalls provider. Output remains silent. */
class InboxCapture extends AudioWorkletProcessor {
  process(inputs) {
    const samples = inputs[0]?.[0];
    if (samples?.length) this.port.postMessage(samples.slice());
    return true;
  }
}
registerProcessor("inbox-capture", InboxCapture);
