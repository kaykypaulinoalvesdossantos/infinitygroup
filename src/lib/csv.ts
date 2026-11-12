/**
 * Leitor de CSV no navegador. Aceita separador ";" ou "," (detectado pela primeira linha),
 * campos entre aspas (com "" como aspas escapadas e quebras de linha) e BOM UTF-8.
 */

export type CsvDelimiter = ',' | ';';

export function detectDelimiter(firstLine: string): CsvDelimiter {
    let inQuotes = false;
    let commas = 0;
    let semicolons = 0;
    for (const ch of firstLine) {
        if (ch === '"') inQuotes = !inQuotes;
        else if (!inQuotes && ch === ',') commas++;
        else if (!inQuotes && ch === ';') semicolons++;
    }
    return semicolons > commas ? ';' : ',';
}

export function parseCsv(input: string): string[][] {
    const text = input.replace(/^﻿/, '');
    const firstLine = text.split(/\r?\n/)[0] ?? '';
    const delimiter = detectDelimiter(firstLine);

    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inQuotes) {
            if (ch === '"') {
                if (text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += ch;
            }
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === delimiter) {
            row.push(field);
            field = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n') i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else {
            field += ch;
        }
    }

    if (field !== '' || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows
        .map((r) => r.map((c) => c.trim()))
        .filter((r) => r.some((c) => c !== ''));
}
