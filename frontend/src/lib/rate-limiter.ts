export class RateLimiter {
  private queue: Array<() => void> = []
  private running = 0
  private lastTick = Date.now()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async wait(): Promise<void> {
    const now = Date.now()
    if (now - this.lastTick >= this.windowMs) {
      this.running = 0
      this.lastTick = now
    }

    if (this.running >= this.maxRequests) {
      await new Promise<void>((resolve) => {
        this.queue.push(resolve)
      })
    }

    this.running++
    this.processQueue()
  }

  private processQueue() {
    while (this.queue.length > 0 && this.running < this.maxRequests) {
      const next = this.queue.shift()
      if (next) {
        this.running++
        next()
      }
    }
  }
}
