# RBAC Temporary Credential Script Generator - Deployment Guide

This guide provides detailed instructions on how to deploy the RBAC Script Generator application on a server using Nginx.

## Overview

The RBAC Script Generator is a web-based tool that leverages the Google Gemini API to generate secure, temporary access scripts for various infrastructure platforms like Kubernetes, AWS, and HashiCorp Vault. This is a fully client-side application built with React and Tailwind CSS, served as static files.

## Prerequisites

Before you begin, ensure you have the following on your server:
- A Linux server (e.g., Ubuntu 20.04/22.04).
- Nginx installed and running.
- A registered domain name pointing to your server's public IP address.
- A valid Google Gemini API Key.

## Deployment Steps

Follow these steps to build and deploy the application.

### Step 1: Prepare Application Files & API Key

The application is designed to be served as static files. However, it requires a Google Gemini API key to function. The source code references `process.env.API_KEY`, which is not available when serving static files directly in a browser.

You must replace this placeholder with your actual API key before deploying.

1.  **Copy Application Files:**
    Gather all the application files into a single directory on your local machine. The required files are:
    - `index.html`
    - `index.tsx`
    - `App.tsx`
    - `types.ts`
    - `constants.ts`
    - `services/geminiService.ts`
    - `components/` (the entire directory)
    - `metadata.json`

2.  **Inject API Key:**
    Open the file `services/geminiService.ts`. You will find the line:
    ```typescript
    const API_KEY = process.env.API_KEY;
    ```
    You need to replace `process.env.API_KEY` with your actual key. A simple way to do this on a Linux/macOS command line is using `sed`.

    First, make a copy of the original directory to work from. Then, run the following command, replacing `"YOUR_GEMINI_API_KEY"` with your key:

    ```bash
    # IMPORTANT: Run this command in your deployment directory
    sed -i.bak 's|process.env.API_KEY|"'YOUR_GEMINI_API_KEY'"|g' services/geminiService.ts
    ```
    This command replaces the placeholder directly in the file and creates a backup (`geminiService.ts.bak`). Verify that the `services/geminiService.ts` file now contains your hardcoded API key:
    ```typescript
    // Before
    const API_KEY = process.env.API_KEY;

    // After
    const API_KEY = "YOUR_GEMINI_API_KEY";
    ```
    **Security Note:** Hardcoding API keys directly into client-side code is not recommended for production environments with public access. For enhanced security, consider using a backend proxy to make API calls, which would keep your API key private on the server.

### Step 2: Upload Files to the Server

Now that the files are prepared, upload them to your server.

1.  **Create a Directory:**
    On your server, create a directory where the application files will live. A common location is `/var/www/`.

    ```bash
    sudo mkdir -p /var/www/rbac-generator
    ```

2.  **Upload Files:**
    Use `scp` or any other file transfer tool to upload your prepared application files (with the injected API key) to the newly created directory on your server.

    ```bash
    # From your local machine, run this in the app directory
    scp -r ./* user@your_server_ip:/var/www/rbac-generator/
    ```

3.  **Set Permissions:**
    Ensure Nginx has the correct permissions to read the files.

    ```bash
    sudo chown -R www-data:www-data /var/www/rbac-generator
    sudo chmod -R 755 /var/www/rbac-generator
    ```

### Step 3: Configure Nginx

Create an Nginx server block (virtual host) to serve your application.

1.  **Create a New Configuration File:**
    Use a text editor like `nano` or `vim` to create a new configuration file in Nginx's `sites-available` directory.

    ```bash
    sudo nano /etc/nginx/sites-available/rbac-generator
    ```

2.  **Add the Server Block Configuration:**
    Paste the following configuration into the file. Replace `your-domain.com` with your actual domain name.

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        server_name your-domain.com;

        root /var/www/rbac-generator;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        # Since the app uses .tsx files directly, we need to serve them
        # with the correct MIME type for JavaScript modules.
        location ~ \.tsx$ {
            types { }
            default_type application/javascript;
            try_files $uri =404;
        }
    }
    ```

    **Configuration Explained:**
    *   `listen 80`: Nginx listens on port 80 for incoming HTTP traffic.
    *   `server_name`: Your registered domain name.
    *   `root`: The directory where your application files are stored.
    *   `index`: Specifies the default file to serve, which is `index.html`.
    *   `location /`: This block handles all requests. `try_files` is crucial for single-page applications. It tells Nginx to first look for a file or directory matching the request URI, and if none is found, fall back to serving `/index.html`.
    *   `location ~ \.tsx$`: This is a critical block for this specific application. Browsers do not understand `.tsx` files natively. This block tells Nginx to serve any file ending in `.tsx` with the MIME type `application/javascript`, allowing the browser's ES module loader to process it correctly.

### Step 4: Enable the Site and Restart Nginx

1.  **Enable the Configuration:**
    Create a symbolic link from your new configuration file in `sites-available` to the `sites-enabled` directory. This tells Nginx to use this configuration.

    ```bash
    sudo ln -s /etc/nginx/sites-available/rbac-generator /etc/nginx/sites-enabled/
    ```
    *(Note: It's good practice to remove the default Nginx config if it's enabled: `sudo rm /etc/nginx/sites-enabled/default`)*

2.  **Test Nginx Configuration:**
    Always test your Nginx configuration for syntax errors before reloading.

    ```bash
    sudo nginx -t
    ```
    If you see `syntax is ok` and `test is successful`, you can proceed.

3.  **Reload Nginx:**
    Apply the changes by gracefully reloading the Nginx service.

    ```bash
    sudo systemctl reload nginx
    ```

Your application should now be live and accessible at `http://your-domain.com`.

### Step 5 (Recommended): Secure with HTTPS

It is highly recommended to secure your site with an SSL/TLS certificate. The easiest way to do this is by using Certbot with Let's Encrypt.

1.  **Install Certbot:**
    ```bash
    sudo apt update
    sudo apt install certbot python3-certbot-nginx
    ```

2.  **Obtain and Install Certificate:**
    Run Certbot, which will automatically obtain a certificate and update your Nginx configuration to use it.

    ```bash
    sudo certbot --nginx -d your-domain.com
    ```
    Follow the on-screen prompts. Certbot will configure HTTPS and set up automatic certificate renewals.

Your application is now securely deployed and accessible at `https://your-domain.com`.
