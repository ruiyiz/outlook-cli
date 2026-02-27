export class LineReader {
  private buffer = "";
  private reader;
  private decoder = new TextDecoder();

  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader();
  }

  async readLine(): Promise<string | null> {
    while (true) {
      const idx = this.buffer.indexOf("\n");
      if (idx !== -1) {
        const line = this.buffer.slice(0, idx);
        this.buffer = this.buffer.slice(idx + 1);
        return line;
      }

      const { done, value } = await this.reader.read();
      if (done) {
        if (this.buffer.length > 0) {
          const line = this.buffer;
          this.buffer = "";
          return line;
        }
        return null;
      }
      this.buffer += this.decoder.decode(value, { stream: true });
    }
  }
}
