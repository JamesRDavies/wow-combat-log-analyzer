export async function* readLogLines(file: File, onProgress?: (bytesRead: number, totalBytes:number) => void | Promise<void>): AsyncGenerator<string> {
    const stream = file.stream();
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try{
        let bytesRead = 0;

        while(true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }

            bytesRead += value.byteLength;

            await onProgress?.(bytesRead, file.size);

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