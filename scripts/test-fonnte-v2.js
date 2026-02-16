const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
    const token = 'sK9qiFd2by9FsTSADx3u';
    console.log('--- TESTING TOKEN:', token, '---');

    const testCases = [
        {
            name: 'POST get-devices with Authorization Header (Standard)',
            url: 'https://api.fonnte.com/get-devices',
            options: {
                method: 'POST',
                headers: { 'Authorization': token },
                body: '{}'
            }
        },
        {
            name: 'POST device with Authorization Header',
            url: 'https://api.fonnte.com/device',
            options: {
                method: 'POST',
                headers: { 'Authorization': token }
            }
        },
        {
            name: 'POST get-devices with token in Body',
            url: 'https://api.fonnte.com/get-devices',
            options: {
                method: 'POST',
                body: new URLSearchParams({ token: token })
            }
        },
        {
            name: 'GET get-devices with Authorization Header',
            url: 'https://api.fonnte.com/get-devices',
            options: {
                method: 'GET',
                headers: { 'Authorization': token }
            }
        }
    ];

    for (const tc of testCases) {
        console.log(`\nTesting: ${tc.name}...`);
        try {
            const response = await fetch(tc.url, tc.options);
            const json = await response.json();
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(json));
        } catch (err) {
            console.error('Error:', err.message);
        }
    }
}

test();
