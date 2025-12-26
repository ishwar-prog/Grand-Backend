
import fs from 'fs';

async function register() {
  try {
    const formData = new FormData();
    formData.append('fullName', 'Test Node User');
    formData.append('email', 'testnode@example.com');
    formData.append('username', 'testnodeuser');
    formData.append('password', 'password123');

    // Read the file buffer
    const buffer = fs.readFileSync('test_avatar.png');
    // Create a Blob from the buffer (Node 18+ supports this)
    const blob = new Blob([buffer], { type: 'image/png' });
    
    formData.append('avatar', blob, 'test_avatar.png');

    console.log('Sending registration request...');
    const response = await fetch('http://localhost:8000/api/v1/users/register', {
      method: 'POST',
      body: formData,
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
        process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

register();
