const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

// Load environment variables
dotenv.config();

// Enable CORS for local development
app.use(cors());

// Endpoint for GitHub OAuth callback
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code.');
    }

    try {
        // Exchange the authorization code for an access token
        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const accessToken = response.data.access_token;

        // Do something with the access token (e.g., store it in a session, make API requests)
        res.send('GitHub OAuth successful!');
    } catch (error) {
        console.error('OAuth error:', error);
        res.status(500).send('OAuth error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
