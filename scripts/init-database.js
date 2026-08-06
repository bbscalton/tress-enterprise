const { spawn } = require('child_process');
const path = require('path');

const child = spawn('firebase', ['init', 'database', '--project', 'fleetrentals-app'], {
  shell: true,
  cwd: path.join(__dirname, '..'),
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buffer = '';

function respond(text) {
  if (buffer.includes('Are you ready to proceed')) {
    child.stdin.write('y\n');
    buffer = '';
  } else if (buffer.includes('What file should be used for Realtime Database')) {
    child.stdin.write('firebase/database.rules.json\n');
    buffer = '';
  } else if (buffer.includes('What Firebase Realtime Database instance')) {
    child.stdin.write('default\n');
    buffer = '';
  } else if (buffer.includes('Please choose the location')) {
    child.stdin.write('us-central1\n');
    buffer = '';
  } else if (buffer.includes('Do you want to overwrite')) {
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
child.on('close', (code) => {
  console.log('Exit code:', code);
  process.exit(code ?? 0);
});
