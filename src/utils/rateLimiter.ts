type RequestRecord = { timestamps: number[] };

const requests = new Map<string, RequestRecord>();

export const rateLimiter = {
  windowMs: 60000,
  maxRequests: 30,

  checkLimit(userId: string): boolean {
    const now = Date.now();
    const record = requests.get(userId) || { timestamps: [] };

    // Filter out timestamps older than window
    record.timestamps = record.timestamps.filter(ts => now - ts < this.windowMs);

    if (record.timestamps.length >= this.maxRequests) {
      requests.set(userId, record);
      return false; // limit exceeded
    }

    // Add current timestamp and update record
    record.timestamps.push(now);
    requests.set(userId, record);
    return true; // within limit
  },
};
