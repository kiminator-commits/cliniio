// Typed Realtime Channel
import {
  RealtimeChannel,
  RealtimeSubscription,
  RealtimePayload,
} from '../types/supabaseMockTypes';

export class TypedMockRealtimeChannel implements RealtimeChannel {
  private channelName: string;
  private callbacks: Array<(payload: RealtimePayload) => void> = [];

  constructor(channelName: string) {
    this.channelName = channelName;
  }

  on<T = unknown>(
    event: string,
    filter: Record<string, unknown>,
    callback: (payload: T) => void
  ): { subscribe: (callback?: (payload: T) => void) => RealtimeSubscription } {
    // console.log(
    //   `[MOCK] Channel ${this.channelName}: Subscribed to ${event}`,
    //   filter
    // );
    this.callbacks.push(callback as (payload: RealtimePayload) => void);
    return {
      subscribe: (cb?: (payload: T) => void) => {
        if (cb) {
          this.callbacks.push(cb as (payload: RealtimePayload) => void);
        }
        return this.subscribe();
      },
    };
  }

  subscribe<T = unknown>(
    callback?: (payload: T) => void
  ): RealtimeSubscription {
    // console.log(`[MOCK] Channel ${this.channelName}: Subscription active`);
    if (callback) {
      callback({} as T);
    }
    return {
      unsubscribe: () => {
        // console.log(`[MOCK] Channel ${this.channelName}: Unsubscribed`);
      },
      send: (event: string, payload: unknown) => {
        // console.log(
        //   `[MOCK] Channel ${this.channelName}: Sending ${event}`,
        //   payload
        // );
      },
    };
  }

  unsubscribe(): void {
    // console.log(`[MOCK] Channel ${this.channelName}: Unsubscribed`);
  }

  send(event: string, payload: unknown): void {
    // console.log(
    //   `[MOCK] Channel ${this.channelName}: Sending ${event}`,
    //   payload
    // );
  }
}
