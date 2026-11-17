export async function* readLogLines(file: File): AsyncGenerator<string> {
    const stream = file.stream();
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try{
        while(true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop() ?? '';

            for (const line of lines){
                yield line;
            }
        }

        buffer += decoder.decode();
        if(buffer.length > 0){
            yield buffer;
        }
    } finally {
        reader.releaseLock();
    }
    
}