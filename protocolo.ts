import type { Buffer } from 'node:buffer';
import * as net from 'node:net';

export interface Leitura {
    talhaoId: number;
    sensorId: number;
    tipo: string;
    unidade: string;
    valores: number[];
}

export interface Lote{
    id: number;
    talhaoId: number;
    leituras: Leitura[];
    timestamp: string;
}

export interface MediaSensor {
    sensorId: number;
    tipo: string;
    unidade: string;
    media: number;
}

export interface MediaTalhao {
    talhaoId: number;
    mediasSensores: MediaSensor[];
}

export interface MediaLote {
    loteId: number;
    mediasTalhoes: MediaTalhao[];
}

export type Mensagem = Leitura | Lote | MediaSensor | MediaTalhao | MediaLote;

export function enviar(socket: net.Socket, mensagem: Mensagem): void {
    socket.write(JSON.stringify(mensagem));
}

export function receber(mensagem: Buffer): Mensagem {
    return JSON.parse(mensagem.toString('utf8'));
}

export class Conexao {
    private endereco: string;
    private porta: number;
    private socket: net.Socket | null = null;

    constructor(endereco: string, porta: number) {
        this.endereco = endereco;
        this.porta = porta;
    }

    enviar(mensagem: Mensagem): void {
        if (this.socket) {
            enviar(this.socket, mensagem);
        } else {
            console.error('Socket não está conectado. Não é possível enviar a mensagem.');
        }
    }

    conectar(): net.Socket {
        const socket: net.Socket = net.createConnection({ 
            host: this.endereco,
            port: this.porta
        });

        socket.on('connect', () => {
            console.log(`Conectado ao servidor ${this.endereco}:${this.porta}`);
        });

        socket.on('data', (mensagem: Buffer) => {
            const mensagemRecebida: Mensagem = receber(mensagem);
            console.log(`Mensagem recebida do servidor: ${JSON.stringify(mensagemRecebida)}`);
        });

        socket.on('error', (erro: Error) => {
            console.error(`Erro de conexão: ${erro.message}`);
        }); 

        return socket;
    }

}