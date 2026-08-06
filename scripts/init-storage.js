const { spawn } = require('child_process');
const path = require('path');

const child = spawn('firebase', ['init', 'storage', '--project', 'fleetrentals-app'], {
  shell: true,
  cwd: path.join(__dirname, '..'),
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buffer = '';

function respond(text) {
  if (text.includes('Are you ready to proceed')) {
    child.stdin.write('y\n');
    buffer = '';
  } else if (text.includes('What file should be used for Storage Rules')) {
    child.stdin.write('firebase/storage.rules\n');
    buffer = '';
  } else if (text.includes('Set up the default Storage bucket')) {
    child.stdin.write('y\n');
    buffer = '';
  } else if (text.includes('Do you want to overwrite')) {
    child.stdin.write('n\n');
    buffer = '';
  }
}

child.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  buffer += text;
  respond(buffer);
});

child.stderr.on('data', (data) => process.stderr.write(data));
child.on('close', (code) => process.exit(code ?? 0));
