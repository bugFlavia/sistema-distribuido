import * as net from "node:net";
import type { Buffer } from 'node:buffer';
import { Conexao, enviar, type Mensagem, type MediaSensor, type MediaTalhao, type Leitura, type Lote, receber } from './protocolo.ts';

const portaServico = 3002;

function calcularMediaSensores(lotes: Lote[]): MediaSensor[] {
    const medias: MediaSensor[] = [];
    const sensoresMap: { [key: number]: { soma: number; count: number; tipo: string; unidade: string } } = {};
    for (const lote of lotes) {
        for (const leitura of lote.leituras) {
            if (!sensoresMap[leitura.sensorId]) {
                sensoresMap[leitura.sensorId] = { soma: 0, count: 0, tipo: leitura.tipo, unidade: leitura.unidade };
            }
            sensoresMap[leitura.sensorId]!.soma += leitura.valores.reduce((acc, val) => acc + val, 0);
            sensoresMap[leitura.sensorId]!.count++;
        }
    }
    for (const sensorId in sensoresMap) {
        const { soma, count, tipo, unidade } = sensoresMap[sensorId]!;
        medias.push({
            sensorId: parseInt(sensorId),
            tipo,
            unidade,
            media: soma / count
        });
    }
    return medias;
}

const server: net.Server = net.createServer((socket: net.Socket) => {
    socket.on('data', (dados: Buffer) => {
        for (const linha of dados.toString().split('\n')) {
            if (!linha) continue;
            const mensagemRecebida: Mensagem = receber(linha);
            if (!('leituras' in mensagemRecebida)) continue;
            const loteRecebido: Lote = mensagemRecebida;
            console.log('Mensagem recebida:', JSON.stringify(mensagemRecebida));
            const medias = calcularMediaSensores([loteRecebido]);
            const mediasCalculadas: MediaSensor[] = medias.map(media => {
                return {
                    sensorId: media.sensorId,
                    tipo: media.tipo,
                    unidade: media.unidade,
                    media: media.media
                };
            });
            const mediaTalhao: MediaTalhao = {
                talhaoId: loteRecebido.talhaoId,
                mediasSensores: mediasCalculadas
            };

            console.log('Médias calculadas e enviadas para o gateway:', JSON.stringify(medias));
            enviar(socket, mediaTalhao);
        }
    })

    socket.on('close', () =>  {
        console.log(`Conexão encerrada: ${socket.remoteAddress}:${socket.remotePort}`);
    }); 
});

server.listen(portaServico, () => {
    console.log(`Servidor de serviço rodando na porta ${portaServico}`);
});

