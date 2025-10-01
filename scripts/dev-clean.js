#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

console.log('🚀 Starting Safpar Tours Development Server...');
console.log('================================================');

/**
 * Kill all processes running on port 3000
 */
async function killPort3000() {
  console.log('🔍 Checking for processes on port 3000...');
  
  try {
    // For Linux/macOS systems
    const { stdout } = await execAsync('lsof -ti:3000');
    const pids = stdout.trim().split('\n').filter(pid => pid);
    
    if (pids.length === 0) {
      console.log('✅ Port 3000 is free');
      return;
    }
    
    console.log(`⚠️  Found processes on port 3000: ${pids.join(', ')}`);
    console.log('🔪 Killing processes...');
    
    // Kill processes gracefully first
    for (const pid of pids) {
      try {
        console.log(`   Terminating PID ${pid}...`);
        await execAsync(`kill ${pid}`);
      } catch (error) {
        // Process might already be dead, ignore
      }
    }
    
    // Wait for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if any processes are still running and force kill if necessary
    try {
      const { stdout: remaining } = await execAsync('lsof -ti:3000');
      const remainingPids = remaining.trim().split('\n').filter(pid => pid);
      
      if (remainingPids.length > 0) {
        console.log('💀 Force killing remaining processes...');
        for (const pid of remainingPids) {
          try {
            console.log(`   Force killing PID ${pid}...`);
            await execAsync(`kill -9 ${pid}`);
          } catch (error) {
            // Process might already be dead, ignore
          }
        }
      }
    } catch (error) {
      // No remaining processes, which is good
    }
    
    console.log('✅ Port 3000 is now free');
    
  } catch (error) {
    if (error.code === 1) {
      // No processes found, which is good
      console.log('✅ Port 3000 is free');
    } else {
      console.log('⚠️  Could not check port 3000. Proceeding anyway...');
    }
  }
}

/**
 * Kill processes on Windows
 */
async function killPort3000Windows() {
  console.log('🔍 Checking for processes on port 3000 (Windows)...');
  
  try {
    const { stdout } = await execAsync('netstat -ano | findstr :3000');
    const lines = stdout.trim().split('\n').filter(line => line.includes('LISTENING'));
    
    if (lines.length === 0) {
      console.log('✅ Port 3000 is free');
      return;
    }
    
    const pids = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return parts[parts.length - 1];
    }).filter((pid, index, arr) => arr.indexOf(pid) === index);
    
    console.log(`⚠️  Found processes on port 3000: ${pids.join(', ')}`);
    console.log('🔪 Killing processes...');
    
    for (const pid of pids) {
      try {
        console.log(`   Killing PID ${pid}...`);
        await execAsync(`taskkill /PID ${pid} /F`);
      } catch (error) {
        console.log(`   Could not kill PID ${pid}`);
      }
    }
    
    console.log('✅ Port 3000 processes killed');
    
  } catch (error) {
    console.log('✅ Port 3000 is free');
  }
}

/**
 * Start the development server
 */
function startDevServer() {
  console.log('');
  console.log('🌟 Starting Next.js development server...');
  console.log('📱 Auth0 will be available at: http://localhost:3000');
  console.log('🔐 Admin dashboard: http://localhost:3000/admin/dashboard');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('================================================');
  
  // Start npm run dev
  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n🛑 Stopping development server...');
    devServer.kill('SIGINT');
    
    // Clean up port one more time
    if (process.platform === 'win32') {
      await killPort3000Windows();
    } else {
      await killPort3000();
    }
    
    console.log('✅ Cleanup complete');
    process.exit(0);
  });
  
  devServer.on('close', (code) => {
    console.log(`\n📊 Development server exited with code ${code}`);
    process.exit(code);
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Preparing development environment...\n');
    
    // Kill processes on port 3000 based on platform
    if (process.platform === 'win32') {
      await killPort3000Windows();
    } else {
      await killPort3000();
    }
    
    // Start the development server
    startDevServer();
    
  } catch (error) {
    console.error('❌ Error starting development server:', error.message);
    process.exit(1);
  }
}

// Run the script
main();