export interface AssistantMessage {
  id: string;
  content: string;
  timestamp: Date;
}

export interface AssistantState {
  messages: AssistantMessage[];
  isLoading: boolean;
}
