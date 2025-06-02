## 🔧 Configuration: Google PageSpeed Insights API

To enable PageSpeed analysis in the **WonderSEOChecker** plugin, you'll need to:

---

### 1. Enable the PageSpeed Insights API

Go to the [Google Cloud Console](https://console.developers.google.com/apis/api/pagespeedonline.googleapis.com/overview), and:

- Select or create a Google Cloud project.
- Click **"Enable"** to activate the **PageSpeed Insights API** specifically.
- ⚠️ *Note: It may take a few minutes for the API to become active after enabling.*

---

### 2. Create an API Key

Once the API is enabled:

- Navigate to **"APIs & Services" → "Credentials"**.
- Click **"Create credentials" → "API key"**.
- Copy the key — you’ll need it in the next step.

---

### 3. Update your `appsettings.json`

Add a `PageSpeed` section to your Umbraco `appsettings.json` (or use environment-specific overrides):

```json
"WonderSeoChecker": {
    "PageSpeed": {
      "ApiKey": "api-key-here",
      "Strategy": "desktop",
      "TimeoutSeconds": 10,
      "InternalAuthToken": "example-guid-token"
    }
  },
```
 🔐 **InternalAuthToken** is a shared secret used to authorize internal API calls from your Umbraco backoffice UI to the server-side controller.  
 It ensures that only trusted requests from your own CMS can invoke the PageSpeed endpoint.

You can generate a secure token using a password manager or command line tool. For example:

 - **Linux/macOS**: `openssl rand -hex 32`
- **Windows PowerShell**: `[guid]::NewGuid().ToString("N")`
Store this token securely and **do not expose it publicly** in client-side code.
