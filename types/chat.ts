export type Message = {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  ts: Date;
};

export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  ts: Date;
};
