import { describe, it, expect, vi } from 'vitest';
import { readLogLines } from '../../src/parser/log-reader';

describe('readLogLines', () => {
    it('reads all lines from a text file', async () => {
        const file = new File(
            ['First record\nSecond record\nThird record\n'],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            'Second record',
            'Third record'
        ]);
    });


    it('handles missing trailing newline', async () => {
        const file = new File(
            ['First record\nSecond record\nThird record'],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            'Second record',
            'Third record'
        ]);
        
    });


    it('handles windows line endings', async () => {
        const file = new File(
            ['First record\r\nSecond record\r\nThird record\r\n'],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            'Second record',
            'Third record'
        ]);

    });

    
    it('handles empty lines', async () => {
        const file = new File(
            ['First record\n\nSecond record\n\n\nThird record\n'],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            '',
            'Second record',
            '',
            '',
            'Third record'
            
        ]);

    });

    it('handles an empty file', async () => {
        const file = new File(
            [''],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([]);
    });

    it('handles unicode characters', async () => {
        const file = new File(
            ['First record\nSecond record with emoji 😊\nThird record with accented characters éàè\n'],
            'test-log.txt',
            { type: 'text/plain' }
        );

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            'Second record with emoji 😊',
            'Third record with accented characters éàè'
        ]);
    });


    it('handles lines split across chunk boundaries', async () => {
        const file = new File(['placeholder'], 'test-log.txt');

        const encoder = new TextEncoder();

        const chunks = [
            encoder.encode('First rec'),
            encoder.encode('ord\nSecond rec'),
            encoder.encode('ord\nThird record')
        ];

        const stream = new ReadableStream<Uint8Array<ArrayBuffer>>({
            start(controller) {
                for (const chunk of chunks) {
                    controller.enqueue(chunk);
                }

                controller.close();
            }
        });

        vi.spyOn(file, 'stream').mockReturnValue(stream);

        const lines: string[] = [];

        for await (const line of readLogLines(file)) {
            lines.push(line);
        }

        expect(lines).toEqual([
            'First record',
            'Second record',
            'Third record'
        ]);
    });
});
