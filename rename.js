const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.gemini'];
const IGNORE_EXTS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf', '.zip'];

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  let changedFilesCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        changedFilesCount += walkAndReplace(fullPath);
      }
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (!IGNORE_EXTS.includes(ext) && file !== 'rename.js') {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        let newContent = content
          .replace(/EventFlow/g, 'Event Ku')
          .replace(/Eventflow/g, 'Event Ku')
          .replace(/EVENTFLOW/g, 'EVENT KU')
          .replace(/eventflow/g, 'eventku');
          
        if (newContent !== content) {
          fs.writeFileSync(fullPath, newContent, 'utf8');
          console.log(`Updated: ${fullPath}`);
          changedFilesCount++;
        }
      }
    }
  }
  return changedFilesCount;
}

const targetDir = process.cwd();
console.log(`Starting advanced rebranding in ${targetDir}`);
const totalChanged = walkAndReplace(targetDir);
console.log(`Rebranding complete. Changed ${totalChanged} files.`);
