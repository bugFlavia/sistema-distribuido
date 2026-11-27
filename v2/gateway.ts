import type { Buffer } from 'node:buffer';
import * as net from 'node:net';
import {Conexao, type Mensagem, type Pedido, type MediaTalhao, receber, enviar} from './protocolo.ts';
import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';

const endereco: string = 'localhost';
const porta: number = 3001;
const servico: string = 'localhost';
const portaServidorSensores: number = 3000;
const portaServico: number = 3002;

const medias: Mensagem[] = [];

const mediaDef = loadSync('media.proto')
const mediaProto = (grpc.loadPackageDefinition)(mediaDef).media as any;

const client = new mediaProto.MediaService(servico + ':' + portaServico, (grpc.credentials).createInsecure());

const conexaoServivorSensores = new Conexao(servico, portaServidorSensores)
conexaoServivorSensores.conectar((mensagem: Mensagem) => {
    if(!('leituras' in mensagem)) return;
    console.log(`Mensagem recebida do servidor de sensores: ${JSON.stringify(mensagem)}`);
    console.log(`Encaminhando mensagem para o serviço em ${servico}:${portaServico}`);
    client.calcularMedia(mensagem, (err: grpc.ServiceError | null, response: MediaTalhao) => {
        if (err) {
            console.error(`Erro ao calcular média: ${err.message}`);
            return;
        }
        console.log(`Média calculada recebida do serviço: ${JSON.stringify(response)}`);
        medias.push(response);
    });
});

setInterval(() => {
    const pedido: Pedido = {pedido: 'leituras'};
    console.log(`Enviando pedido de leituras para o servidor de sensores: ${JSON.stringify(pedido)}`);
    conexaoServivorSensores.enviar(pedido);
}, 5000);

const server: net.Server = net.createServer((socket: net.Socket) => {
    let resto = '';
    socket.on('data', (dados: Buffer) => {
        const linhas = (resto + dados.toString()).split('\n');
        resto = linhas.pop() ?? '';
        for (const linha of linhas) {
            if (!linha) continue;
            const mensagemRecebida: Mensagem = receber(linha);
            if(!('pedido' in mensagemRecebida)) continue;
            for (const media of medias) {
                enviar(socket, media);
            }
            medias.length = 0; 
        }
    });
    socket.on('error', (err: Error) => {
        console.error(`Erro no socket: ${err.message}`);
    })
});

server.listen(porta, endereco, () => {
    console.log(`Gateway escutando em ${endereco}:${porta}`);
});