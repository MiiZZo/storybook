import path from 'node:path';
import { sync as spawnSync } from 'cross-spawn';
import { sync as findUpSync } from 'find-up';

import { NPMProxy } from './NPMProxy';
import { PNPMProxy } from './PNPMProxy';

import type { JsPackageManager, PackageManagerName } from './JsPackageManager';

import { Yarn2Proxy } from './Yarn2Proxy';
import { Yarn1Proxy } from './Yarn1Proxy';
import { getParentProcessName } from '../helpers';

const NPM_LOCKFILE = 'package-lock.json';
const PNPM_LOCKFILE = 'pnpm-lock.yaml';
const YARN_LOCKFILE = 'yarn.lock';

export class JsPackageManagerFactory {
  public static async getPackageManager(
    { force }: { force?: PackageManagerName } = {},
    cwd?: string
  ): Promise<JsPackageManager> {
    if (force === 'npm') {
      return new NPMProxy({ cwd });
    }
    if (force === 'pnpm') {
      return new PNPMProxy({ cwd });
    }
    if (force === 'yarn1') {
      return new Yarn1Proxy({ cwd });
    }
    if (force === 'yarn2') {
      return new Yarn2Proxy({ cwd });
    }

    const yarnVersion = getYarnVersion(cwd);

    const closestLockfilePath = findUpSync([YARN_LOCKFILE, PNPM_LOCKFILE, NPM_LOCKFILE], {
      cwd,
    });
    const closestLockfile = closestLockfilePath && path.basename(closestLockfilePath);

    const hasNPMCommand = hasNPM(cwd);
    const hasPNPMCommand = hasPNPM(cwd);

    if (yarnVersion && (closestLockfile === YARN_LOCKFILE || (!hasNPMCommand && !hasPNPMCommand))) {
      return yarnVersion === 1 ? new Yarn1Proxy({ cwd }) : new Yarn2Proxy({ cwd });
    }

    if (hasPNPMCommand && closestLockfile === PNPM_LOCKFILE) {
      return new PNPMProxy({ cwd });
    }

    const parentProcessName = await getParentProcessName();

    const parentProcessArgs = parentProcessName.split(' ');

    // if the command is run on an empty directory with no package manager connected to it
    // we fallback to inferring the package manager from the command being used
    if (parentProcessArgs[1].endsWith('pnpm')) {
      return new PNPMProxy({ cwd });
    }

    if (parentProcessArgs[1].endsWith('yarn')) {
      return new Yarn2Proxy({ cwd });
    }

    if (hasNPMCommand) {
      return new NPMProxy({ cwd });
    }

    throw new Error('Unable to find a usable package manager within NPM, PNPM, Yarn and Yarn 2');
  }
}

function hasNPM(cwd?: string) {
  const npmVersionCommand = spawnSync('npm', ['--version'], { cwd, shell: true });
  return npmVersionCommand.status === 0;
}

function hasPNPM(cwd?: string) {
  const pnpmVersionCommand = spawnSync('pnpm', ['--version'], { cwd, shell: true });
  return pnpmVersionCommand.status === 0;
}

function getYarnVersion(cwd?: string): 1 | 2 | undefined {
  const yarnVersionCommand = spawnSync('yarn', ['--version'], { cwd, shell: true });

  if (yarnVersionCommand.status !== 0) {
    return undefined;
  }

  const yarnVersion = yarnVersionCommand.output.toString().replace(/,/g, '').replace(/"/g, '');

  return /^1\.+/.test(yarnVersion) ? 1 : 2;
}
