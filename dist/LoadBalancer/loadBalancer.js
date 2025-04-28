var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { spawn, ChildProcess } from 'child_process';
import { platform } from 'os';
import { join } from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const binaryMap = {
    linux: 'loadbalancer-linux',
    darwin: 'loadbalancer-mac',
    win32: 'load-balancer-windows-x64.exe',
};
const getBinaryPath = () => {
    const binary = binaryMap[platform()];
    if (!binary)
        throw new Error(`Unsupported platform: ${platform()}`);
    return join(__dirname, '..', 'bin', binary);
};
export default function runLoadBalancerWithAsync(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config.consecutiveFails == null)
            config.consecutiveFails = 0.2;
        if (config.failRate == null)
            config.failRate = 0.5;
        const binary = getBinaryPath();
        const args = [
            `-defaultProxy=${config.defaultProxy}`,
            `-algorithm=${config.algorithm}`,
            `-backends=${JSON.stringify(config.backends)}`,
            `-consecutiveFails=${JSON.stringify(config.consecutiveFails)}`,
            `-failRate=${JSON.stringify(config.failRate)}`
        ];
        const proc = spawn(binary, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        proc.on('close', (code) => {
            console.log(`Load balancer exited with code ${code}`);
        });
        proc.on('error', (err) => {
            console.error(`Failed to start process: ${err.message}`);
        });
        if (proc.stdout == null) {
            return 0;
        }
        proc.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        process.on('SIGINT', () => {
            console.log('Caught interrupt signal, killing child process...');
            proc.kill('SIGINT');
            process.exit();
        });
        return new Promise((resolve, reject) => {
            proc.on('close', (code) => resolve(code !== null && code !== void 0 ? code : 0));
            proc.on('error', reject);
        });
    });
}
