import runLoadBalancerWithAsync from './LoadBalancer/loadBalancer.js';



runLoadBalancerWithAsync({
    defaultProxy: '/',
    algorithm: 'ROUND_ROBIN',
    backends: [
      { url: 'http://localhost:3001', weight: 3 },
      { url: 'http://localhost:3002', weight: 1 },
    ],
    consecutiveFails: 5,
    failRate: 0.5
  });