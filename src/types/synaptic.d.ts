declare module 'synaptic' {
    export class Layer {
        constructor(size: number);
        project(layer: Layer): any;
    }

    export class Network {
        constructor(options: { input: Layer, hidden: Layer[], output: Layer });
        activate(input: number[]): number[];
        propagate(rate: number, target: number[]): void;
        toJSON(): any;
        static fromJSON(json: any): Network;
    }
}
