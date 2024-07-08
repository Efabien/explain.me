export const handle = async (content: string) => {
    const pathToFile = './README.md';
    await Deno.create(pathToFile);
    Deno.writeTextFileSync(pathToFile, content);
};
