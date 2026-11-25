import * as net from 'node:net';
import type { Buffer } from 'node:buffer';
import {type MediaTalhao} from './protocolo.ts';

const servico = 'localhost';
const porta = 3003;

const socket = net.createConnection({ host: servico, port: porta });

let texto = '';
socket.on('data', (dados: Buffer) => {
    texto += dados.toString();
});

socket.on('end', () => {
    const medias: MediaTalhao[] = JSON.parse(texto);

    if (medias.length === 0) {
        console.log('Nenhuma média recebida ainda.');
        return;
    }

    for (const mediaTalhao of medias) {
        console.log(`Talhão ${mediaTalhao.talhaoId}`);
        for (const sensor of mediaTalhao.mediasSensores) {
            console.log(`  ${sensor.tipo}: ${sensor.media.toFixed(2)} ${sensor.unidade}`);
        }
    }
});

socket.on('error', (erro: Error) => {
    console.error(`Erro de conexão: ${erro.message}`);
});
