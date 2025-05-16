const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying build output...');

// Path to build directory
const buildDir = path.join(__dirname, '..', 'build');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory does not exist!');
  process.exit(1);
}

// List all files in the build directory
console.log('Files in build directory:');
function listFiles(dir, prefix = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  items.forEach(item => {
    if (item.isDirectory()) {
      console.log(`${prefix}📁 ${item.name}/`);
      listFiles(path.join(dir, item.name), `${prefix}  `);
    } else {
      console.log(`${prefix}📄 ${item.name}`);
    }
  });
}

listFiles(buildDir);

console.log('✅ Build verification complete!');