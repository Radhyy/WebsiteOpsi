const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Add "use client" if not present
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        content = '"use client";\n' + content;
        changed = true;
      }

      // Replace useNavigate
      if (content.includes('useNavigate') && content.includes('react-router-dom')) {
        content = content.replace(/import\s+{.*useNavigate.*}\s+from\s+['"]react-router-dom['"];?/, 'import { useRouter } from \'next/navigation\';');
        content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\);?/g, 'const router = useRouter();');
        content = content.replace(/navigate\(/g, 'router.push(');
        changed = true;
      }

      // Replace NavLink and Link from react-router-dom to next/link
      if (content.includes('NavLink') || content.includes('Link')) {
        if (content.includes('react-router-dom')) {
          content = content.replace(/import\s+{.*(NavLink|Link).*}\s+from\s+['"]react-router-dom['"];?/, 'import Link from \'next/link\';');
          content = content.replace(/<NavLink/g, '<Link');
          content = content.replace(/<\/NavLink>/g, '</Link>');
          // Next.js Link uses href instead of to
          content = content.replace(/ to=/g, ' href=');
          changed = true;
        }
      }
      
      // Some files might still import react-router-dom if it only exported useNavigate and we replaced it poorly, 
      // but the regexes above should be okay for a simple find and replace.
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src', 'components'));
processDirectory(path.join(__dirname, 'src', 'pages'));

console.log('Refactoring finished!');
