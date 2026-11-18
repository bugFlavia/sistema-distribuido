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