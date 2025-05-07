import runLoadBalancerWithAsync from './LoadBalancer/loadBalancer.js';


runLoadBalancerWithAsync({
    defaultProxy: '/',
    algorithm: 'ROUND_ROBIN',
    backends: [
      { url: 'http://localhost:3001', weight: 3, healthPath: "/api/health" },
      { url: 'http://localhost:3002', weight: 1, healthPath: "/api/health" },
    ],
    consecutiveFails: 10,
    failRate: 0.5,
    consecutiveSuccess: 10,
    timeOutBreak: 10
  });