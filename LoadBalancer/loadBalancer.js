import { spawn } from 'child_process';
import { platform } from 'os';
import { join } from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


const __dirname = dirname(fileURLToPath(import.meta.url));

const binaryMap = {
  linux: 'loadbalancer-linux',
  darwin: 'loadbalancer-mac',
  win32: 'load-balancer-windows-x64.exe'
};

const getBinaryPath = () => {
  const binary = binaryMap[platform()];
  if (!binary) throw new Error(`Unsupported platform: ${platform()}`);
  return join(__dirname, '..', 'bin', binary);
};

export default async function runLoadBalancerWithAsync({ defaultProxy, algorithm, backends }) {
  const binary = getBinaryPath();
  const args = [
    `-defaultProxy=${defaultProxy}`,
    `-algorithm=${algorithm}`,
    `-backends=${JSON.stringify(backends)}`
  ];

  const proc = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });

  proc.on('close', (code) => {
    console.log(`Load balancer exited with code ${code}`);
  });

  proc.on('error', (err) => {
    console.error(`Failed to start process: ${err.message}`);
  });

  proc.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  process.on('SIGINT', () => {
    console.log('Caught interrupt signal, killing child process...');
    proc.kill('SIGINT');
    process.exit();
  });

  return new Promise((resolve, reject) => {
    proc.on('close', resolve);
    proc.on('error', reject);
  });
}

