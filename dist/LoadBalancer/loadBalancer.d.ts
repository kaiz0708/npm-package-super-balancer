interface Backend {
    url: string;
    weight: number;
}
interface LoadBalancerConfig {
    defaultProxy: string;
    algorithm: string;
    backends: Backend[];
    consecutiveFails?: number;
    failRate?: number;
}
export default function runLoadBalancerWithAsync(config: LoadBalancerConfig): Promise<number>;
export {};
//# sourceMappingURL=loadBalancer.d.ts.map