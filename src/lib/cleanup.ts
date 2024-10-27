import * as fs from 'fs';
import * as path from 'path';

export function cleanupTempFiles() {
  const tempDir = path.join(process.cwd(), 'public', 'temp');
  
  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);
    
    // Keep .gitkeep file
    const filesToDelete = files.filter(file => file !== '.gitkeep');
    
    filesToDelete.forEach(file => {
      const filePath = path.join(tempDir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error(`Failed to delete ${filePath}:`, error);
      }
    });
  }
}