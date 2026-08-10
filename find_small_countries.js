
import fs from 'fs';
import path from 'path';

const rootDir = '/Users/jay/Development/Projects/Internship/Thhiya/Website/thhiya/backend/data/seed/countries/processed';

function findSmallFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findSmallFiles(fullPath);
        } else if (file.endsWith('.json')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const lines = content.split('\n').length;
            if (lines < 800) {
                console.log(`${fullPath}: ${lines} lines`);
            }
        }
    }
}

findSmallFiles(rootDir);
