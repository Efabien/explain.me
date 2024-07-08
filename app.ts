import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { RequestBody, call } from './llm-studio.client.ts';
import { handle } from './builder.ts';
import { TerminalSpinner } from "https://deno.land/x/spinners/mod.ts";
const run = async () => {
  try {
    const { commands } = argumentsAndOptions(Deno.args);

    const requestBody = await buidldRequestBody(commands as string[]);
    const event = await call(requestBody);
    const spinner = new TerminalSpinner('Generating documentation!');
    spinner.start();
    event.on('done', (value: string) => {
      spinner.succeed();
      handle(value);
    })
  } catch (error) {
    console.error(error);
  }
};

const buidldRequestBody = async (fileNames: string[]): Promise<RequestBody> => {
  const systemPrompt = `
  your role is to help explain codes to first timer coders.
  Write with a tutorial style in markdown format.
`
  const fileContent = await loadFileContent(fileNames);
  const requestBody: RequestBody = {
    model: "model-identifier",
    messages: [
      { role: "system",content:  systemPrompt },
      {
        role: "user",
        content: `Explain the following code (each code where initialy in the following files : ${fileNames.join(',')}). Reference the file name at the start of each explanation. Here are the codes: ${fileContent}`
      },
    ],
    temperature: 0.7,
    max_tokens: -1,
    stream: true,
  };
  return requestBody;
}

const argumentsAndOptions = (denoArgs: string[]) => {
  const parsed = parse(denoArgs);
  const commands = parsed._;
  const optionMap: { [key: string]: string; } = {
    'i': 'instruction'
  };
  const options = Object.keys(parse(denoArgs)).reduce((result, key) => {
    if (key === '_') return result;
    if (!Object.keys(optionMap).includes(key)) return { ...result, [key]: parsed[key] }
    return {
      ...result,
      [optionMap[key]]: parsed[key]
    }
  }, {} as { instruction: string });
  return { commands, options };
}

const loadFileContent = async (fileNames: string[]): Promise<string> => {
  let content = '';
  for (let i = 0; i < fileNames.length; i++) {
    const fileContent = await Deno.readTextFile(`./${fileNames[i]}`);
    content += `File name : ${fileNames[i]} \n\n` + fileContent;
  }
  return content;
}

run();
