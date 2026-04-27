# AgriAssist AI - Smart Greenhouse Helpdesk

AgriAssist AI is a simple Vercel-ready chatbot web app for smart greenhouse and IoT-based farming questions. It helps users ask about greenhouse monitoring, sensors, irrigation, temperature, humidity, light, soil moisture, NPK sensors, and basic crop care.

The frontend is static HTML, CSS, and JavaScript. The backend is a Vercel serverless function at `/api/chat` that securely reads the API key from an environment variable.

## Project Structure

```text
agriassist-ai/
|-- index.html
|-- package.json
|-- .gitignore
|-- README.md
|-- api/
|   `-- chat.js
`-- assets/
    |-- css/
    |   `-- style.css
    `-- js/
        `-- app.js
```

## Run Locally

1. Install Node.js from https://nodejs.org if it is not installed yet.
2. Create a local `.env` file in the project root:

```text
CLASS_OPENAI_API_KEY=your_real_class_api_key_here
```

3. Start the Vercel local dev server:

```bash
npm start
```

4. Open the local URL printed by Vercel, usually:

```text
http://localhost:3000
```

## Deploy to GitHub and Vercel

1. Make sure `.gitignore` includes `config.php`, `.env`, `.vercel`, and `node_modules`.
2. Commit the safe project files to GitHub.
3. In Vercel, choose Add New Project and import the GitHub repository.
4. Keep the default Vercel settings. No framework is required.
5. Add the environment variable before deploying.

## Vercel Environment Variable

In the Vercel project dashboard:

1. Open Settings.
2. Open Environment Variables.
3. Add this variable name:

```text
CLASS_OPENAI_API_KEY
```

4. Paste the real API key as the value.
5. Save it for Production, Preview, and Development if you want all deployments to work.
6. Redeploy the project after adding or changing the variable.

## Security Warnings

Never upload API keys to GitHub.

Never put API keys in `index.html`, `assets/js/app.js`, CSS, README files, screenshots, or any frontend file.

Do not use `NEXT_PUBLIC_`, `VITE_`, or `PUBLIC_` prefixes for secret keys. Those prefixes are meant for values that can be exposed to browsers.

The browser should only call `/api/chat`. The serverless function in `api/chat.js` is the only place that reads `process.env.CLASS_OPENAI_API_KEY`.

## Demo Questions

- What does an NPK sensor measure?
- My soil moisture is below 30%. What should I do?
- Why is high humidity a problem in a greenhouse?

AI responses are for learning support only. Verify safety-critical, chemical, electrical, or crop disease concerns with an expert.
