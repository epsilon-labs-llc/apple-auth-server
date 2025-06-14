// server.js

const express = require("express");
const AppleAuth = require("apple-auth");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config();

// Load Firebase Admin SDK credentials
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Android redirect callback from Apple Sign In
// This will be triggered by Apple and passed back into the Android app via deep link
app.post("/callbacks/sign_in_with_apple", (req, res) => {
  const redirect = `intent://callback?${new URLSearchParams(
    req.body
  ).toString()}#Intent;package=${
    process.env.ANDROID_PACKAGE_IDENTIFIER
  };scheme=signinwithapple;end`;

  console.log(`Redirecting to: ${redirect}`);
  res.redirect(307, redirect);
});

// This endpoint receives Apple authorization code from the Flutter app,
// exchanges it for Apple tokens, and returns a Firebase custom token
app.post("/sign_in_with_apple", async (req, res) => {
  const auth = new AppleAuth(
    {
      client_id:
        req.query.useBundleId === "true"
          ? process.env.BUNDLE_ID
          : process.env.SERVICE_ID,
      team_id: process.env.TEAM_ID,
      redirect_uri: process.env.REDIRECT_URI,
      key_id: process.env.KEY_ID,
    },
    process.env.KEY_CONTENTS.replace(/\|/g, "\n"),
    "text"
  );

  try {
    // Exchange authorization code for Apple tokens
    const accessToken = await auth.accessToken(req.query.code);

    // Decode ID token from Apple
    const idToken = jwt.decode(accessToken.id_token);
    const userID = idToken.sub;

    // Create a Firebase custom token
    const customToken = await admin.auth().createCustomToken(userID);

    // Return the token to the client app
    res.json({ firebaseToken: customToken });
  } catch (error) {
    console.error("Error during Apple Sign In:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});