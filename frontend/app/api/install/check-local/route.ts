import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { InstallStatus } from '@/types/install';

const execPromise = promisify(exec);

export async function POST() {
  try {
    // Try to detect openclaw installation locally
    // This uses Node.js child process to check if openclaw is installed

    // Check if openclaw command exists and get its version
    let version: string | undefined;
    let path: string | undefined;

    try {
      // Try to get version
      const { stdout: versionOutput } = await execPromise('openclaw --version 2>&1');
      version = versionOutput.trim();
    } catch {
      // Command not found or failed
      return NextResponse.json<InstallStatus>({
        installed: false,
        version: undefined,
        path: undefined,
        latestVersion: undefined,
        updateAvailable: false,
      });
    }

    // Get the path to openclaw
    try {
      const { stdout: pathOutput } = await execPromise('which openclaw 2>&1');
      path = pathOutput.trim();
    } catch {
      // Path not found
    }

    return NextResponse.json<InstallStatus>({
      installed: true,
      version,
      path,
      latestVersion: undefined, // Cannot determine without backend
      updateAvailable: false, // Cannot determine without backend
    });
  } catch (error) {
    console.error('Error checking local install:', error);
    return NextResponse.json<InstallStatus>({
      installed: false,
      version: undefined,
      path: undefined,
      latestVersion: undefined,
      updateAvailable: false,
    });
  }
}
