module.exports = async () => {
    const { execSync } = require('child_process');
    try {
      execSync('pkill -f electron');
    } catch (e) {
      console.error('No Electron processes found to terminate');
    }
  };
  