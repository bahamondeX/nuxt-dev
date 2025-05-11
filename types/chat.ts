export type Message = {
  role: "assistant" | "user" | "system";
  content: string;
};

export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  ts: Date;
};
