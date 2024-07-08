import { EventEmitter } from "https://deno.land/x/eventemitter@1.2.4/mod.ts";
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RequestBody {
  model: 'model-identifier';
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export type ResponseEvent = {
  content(value: string): void,
  done(value: string): void
};

export const call = async (requestBody: RequestBody): Promise<EventEmitter<ResponseEvent>> => {
  const response = await fetch("http://localhost:1234/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: new TextEncoder().encode(JSON.stringify(requestBody))
  });
  if (!response.ok) throw Error(`Error: ${response.status} ${response.statusText}`);
  const events = new EventEmitter<ResponseEvent>();
  handleResponse(response, events);
  return events;
}

const handleResponse = async (
  response: Response,
  events: EventEmitter<ResponseEvent>
) => {
  const reader = response.body?.getReader();
  if (!reader) throw Error("Failed to read response body");
  let output = '';
  
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      events.emit('done', output);
      break;
    };
    const partialText = new TextDecoder().decode(value);
    output += (partialText || '')
      .trim()
      .split('\n')
      .filter(item => !!item)
      .reduce(
        (content, item) => {
          if (item === 'data: [DONE]') {
            return content;
          }
          const { choices: [elemet] } = JSON.parse(item.replace('data: ', ''))

          return content += elemet.delta.content || '';
        },
        ''
      );
    events.emit('content', output);
  }
}