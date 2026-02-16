async function testTokens() {
    const tokens = [
        'd45xmvKQbAaiWcPyCBgu',
        'sK9qiFd2by9FsTSADx3u'
    ];

    const endpoints = [
        { name: 'GET-DEVICES (Account Endpoint)', url: 'https://api.fonnte.com/get-devices' },
        { name: 'DEVICE PROFILE (Device Endpoint)', url: 'https://api.fonnte.com/device' }
    ];

    console.log('--- STARTING DUAL TOKEN TEST ---');

    for (const token of tokens) {
        console.log(`\n>>> Testing Token: ${token.substring(0, 4)}...${token.substring(token.length - 4)}`);
        for (const ep of endpoints) {
            console.log(`Checking ${ep.name}...`);
            try {
                const response = await fetch(ep.url, {
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: '{}'
                });
                const json = await response.json();
                console.log(`Status: ${response.status} | Response: ${JSON.stringify(json)}`);
            } catch (err) {
                console.error(`Error checking ${ep.name}:`, err.message);
            }
        }
    }
}

testTokens();
