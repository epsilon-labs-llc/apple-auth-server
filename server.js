// Load environment variables
require('dotenv').config();

const express = require("express");
const AppleAuth = require("apple-auth");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.urlencoded({ extended: false }));

// Environment variables validation
const requiredEnvVars = ['ANDROID_PACKAGE_IDENTIFIER', 'TEAM_ID', 'KEY_ID', 'KEY_CONTENTS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

// At least one of SERVICE_ID or BUNDLE_ID is required
if (!process.env.SERVICE_ID && !process.env.BUNDLE_ID) {
  console.error('❌ Either SERVICE_ID or BUNDLE_ID must be set');
  process.exit(1);
}

console.log('✅ All required environment variables are set');

// Android callback - redirects back to app after Apple auth
app.post("/callbacks/sign_in_with_apple", (req, res) => {
  const params = new URLSearchParams(req.body).toString();
  const redirect = `intent://callback?${params}#Intent;package=${process.env.ANDROID_PACKAGE_IDENTIFIER};scheme=signinwithapple;end`;
  
  console.log(`Redirecting to app: ${redirect}\n`);
  res.redirect(307, redirect);
});

// Main Apple Sign In endpoint
app.post("/sign_in_with_apple", async (req, res) => {
  try {
    const { code, useBundleId, firstName, lastName } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    // Create Apple Auth instance
    const auth = new AppleAuth(
      {
        client_id: useBundleId === "true" ? process.env.BUNDLE_ID : process.env.SERVICE_ID,
        team_id: process.env.TEAM_ID,
        redirect_uri: process.env.REDIRECT_URI,
        key_id: process.env.KEY_ID
      },
      process.env.KEY_CONTENTS.replace(/\|/g, "\n"),
      "text"
    );

    console.log('Processing Apple Sign In...');

    // Exchange code for tokens
    const accessToken = await auth.accessToken(code);
    const idToken = jwt.decode(accessToken.id_token);

    const userInfo = {
      id: idToken.sub,
      email: idToken.email,
      name: firstName && lastName ? `${firstName} ${lastName}` : null
    };

    console.log('User authenticated:', userInfo.id);

    // TODO: Create your session here
    const sessionID = `session_${Date.now()}_${userInfo.id.slice(-8)}`;

    res.json({
      success: true,
      sessionId: sessionID,
      user: userInfo
    });

  } catch (error) {
    console.error('Auth error:', error.message);
    
    if (error.message?.includes('invalid_grant')) {
      return res.status(401).json({ error: 'Authorization code expired' });
    }
    
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
});