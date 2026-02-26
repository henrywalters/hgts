export async function saveToFile(content: any, suggestedName: string, type: string) {
    // @ts-ignore
    const file = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: [{
            accept: { 'text/plain': [type]}
        }],
    });
    const writeable = await file.createWritable();
    await writeable.write(JSON.stringify(content, null, 2));
    await writeable.close();
}

export async function loadFromFile(): Promise<any> {
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const text = await file.text();
    const data = JSON.parse(text);
    return data;
}