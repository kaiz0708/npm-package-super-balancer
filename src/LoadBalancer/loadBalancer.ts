import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';
import { join } from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


const __dirname: string = dirname(fileURLToPath(import.meta.url));


interface BinaryMap {
  [key: string]: string;
}


const binaryMap: BinaryMap = {
  linux: 'loadbalancer-linux',
  darwin: 'loadbalancer-mac',
  win32: 'load-balancer-windows-x64.exe',
};


const getBinaryPath = (): string => {
  const binary = binaryMap[platform()];
  if (!binary) throw new Error(`Unsupported platform: ${platform()}`);
  return join(__dirname, '..', 'bin', binary);
};

interface Backend {
  url: string;
  weight: number;
  healthPath?: string;
}


interface LoadBalancerConfig {
  defaultProxy: string;
  algorithm: string;
  backends: Backend[];
  consecutiveFails?: number,
  consecutiveSuccess?: number,
  failRate?: number,
  timeOutBreak?: number
  timeOutDelay?: number
}

enum Defaults {
  ConsecutiveFails = 50,
  FailRate = 0.5,
  ConsecutiveSuccess = 50,
  HealthPathDefault = "",
  TimeBreakOut = 50,
  TimeOutDelay = 5
}

export default async function runLoadBalancerWithAsync(config: LoadBalancerConfig): Promise<number> {
  if(config.consecutiveFails == undefined) config.consecutiveFails = Defaults.ConsecutiveFails
  if(config.failRate == undefined) config.failRate = Defaults.FailRate
  if(config.consecutiveSuccess == undefined) config.consecutiveSuccess = Defaults.ConsecutiveSuccess
  if(config.timeOutBreak == undefined) config.timeOutBreak = Defaults.TimeBreakOut
  if(config.timeOutDelay == undefined) config.timeOutDelay = Defaults.TimeOutDelay
  config.backends.forEach((value, index) => {
    if(value.healthPath == null){
      value.healthPath = ""
    }
  })
  console.log(config)

  const binary: string = getBinaryPath();
  const args: string[] = [
    `-defaultProxy=${config.defaultProxy}`,
    `-algorithm=${config.algorithm}`,
    `-backends=${JSON.stringify(config.backends)}`,
    `-consecutiveFails=${JSON.stringify(config.consecutiveFails)}`,
    `-failRate=${JSON.stringify(config.failRate)}`,
    `-consecutiveSuccess=${JSON.stringify(config.consecutiveSuccess)}`,
    `-timeOutBreak=${JSON.stringify(config.timeOutBreak)}`,
    `-timeOutDelay=${JSON.stringify(config.timeOutDelay)}`
  ];

  const proc: ChildProcess = spawn(binary, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.on('close', (code: number | null) => {
    console.log(`Load balancer exited with code ${code}`);
  });

  proc.on('error', (err: Error) => {
    console.error(`Failed to start process: ${err.message}`);
  });

  if(proc.stdout == null){
    return 0;
  }

  proc.stdout.on('data', (data: Buffer) => {
    process.stdout.write(data);
  });

  process.on('SIGINT', () => {
    console.log('Caught interrupt signal, killing child process...');
    proc.kill('SIGINT');
    process.exit();
  });

  return new Promise<number>((resolve, reject) => {
    proc.on('close', (code: number | null) => resolve(code ?? 0));
    proc.on('error', reject);
  });
}

