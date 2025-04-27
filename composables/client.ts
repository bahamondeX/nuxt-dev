import { OpenAI } from "openai";
export const client = new OpenAI({
  baseURL: "https://voice_ui.oscarbahamonde.cloud/v1",
  apiKey: "f",
  dangerouslyAllowBrowser: true,
});
