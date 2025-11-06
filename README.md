# Deploying Temporary RBAC Generator via Jenkins

This guide provides step-by-step instructions on how to use Jenkins to automate the creation and cleanup of temporary RBAC permissions in a Kubernetes cluster. The necessary parameters for the Jenkins job can be easily obtained from the **Temporary RBAC Script Generator** application.

The primary advantage of this approach is that the temporary access is automatically revoked after the specified duration, ensuring a secure and ephemeral permissions model.

## Prerequisites

Before you begin, ensure you have the following:

1.  **A running Jenkins instance:** With the ability to create and manage Pipeline jobs.
2.  **A Kubernetes cluster:** And `kubectl` configured to connect to it.
3.  **Jenkins Plugins:**
    *   `Pipeline` (usually installed by default)
    *   `Credentials` (usually installed by default)
    *   `Kubernetes CLI (kubectl)`: To provide `kubectl` tooling within the pipeline.
4.  **Permissions:** The Jenkins service account in Kubernetes needs permissions to create and delete `ServiceAccounts` and `RoleBindings`.

---

## Process Overview

The process involves creating a parameterized Jenkins pipeline that performs the following actions:

1.  **Accepts Parameters:** Takes User ID, Role Name, and Duration as input.
2.  **Applies RBAC:** Creates a temporary `ServiceAccount` and a `RoleBinding` in the Kubernetes cluster.
3.  **Waits:** Pauses the pipeline for the specified duration.
4.  **Cleans Up:** Automatically deletes the `ServiceAccount` and `RoleBinding`, revoking access.

---

## Step 1: Configure Kubernetes Credentials in Jenkins

First, you need to provide Jenkins with the credentials to access your Kubernetes cluster.

1.  From your Jenkins dashboard, go to **Manage Jenkins** > **Credentials**.
2.  Under **Stores scoped to Jenkins**, click on the **(global)** domain.
3.  Click **Add Credentials** on the left.
4.  Set the **Kind** to **Secret file**.
5.  For **File**, upload your `kubeconfig` file.
6.  Set the **ID** to something memorable, like `kubeconfig-prod`. You will use this ID in the `Jenkinsfile`.
7.  Add a **Description** (e.g., "Kubeconfig for production cluster").
8.  Click **Create**.

---

## Step 2: Create the Jenkins Pipeline Job

Next, create a new Jenkins job that will use the credentials and run our automation script.

1.  On the Jenkins dashboard, click **New Item**.
2.  Enter a name for your job (e.g., `temporary-k8s-access`).
3.  Select **Pipeline** and click **OK**.
4.  On the configuration page, check the **This project is parameterized** box.
5.  Add the following parameters:
    *   **String Parameter:**
        *   Name: `USER_ID`
        *   Description: The user ID for whom access is being granted (e.g., `jsmith`).
    *   **String Parameter:**
        *   Name: `ROLE_NAME`
        *   Description: The Kubernetes ClusterRole or Role to bind to (e.g., `admin-read-only`).
    *   **String Parameter:**
        *   Name: `DURATION_HOURS`
        *   Default Value: `1`
        *   Description: The number of hours the access should be valid for.

---

## Step 3: The `Jenkinsfile`

Now, scroll down to the **Pipeline** section and paste the following `Jenkinsfile` script into the **Script** text area.

This script defines the entire workflow for creating, waiting, and cleaning up the temporary permissions.

```groovy
// Jenkinsfile for Temporary Kubernetes RBAC

pipeline {
    agent any

    environment {
        // The unique names for the temporary resources
        SERVICE_ACCOUNT_NAME = "${params.USER_ID}-temp"
        ROLE_BINDING_NAME = "${params.USER_ID}-temp-binding"
        KUBECONFIG_CREDENTIAL_ID = 'kubeconfig-prod' // The ID you set in Step 1
    }

    stages {
        stage('Apply Temporary Access') {
            steps {
                script {
                    echo "Granting role '${params.ROLE_NAME}' to user '${params.USER_ID}' for ${params.DURATION_HOURS} hour(s)."
                    
                    withCredentials([file(credentialsId: KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_FILE')]) {
                        // Use the provided kubeconfig for all kubectl commands
                        withEnv(["KUBECONFIG=${KUBECONFIG_FILE}"]) {
                            
                            sh "kubectl create serviceaccount ${SERVICE_ACCOUNT_NAME}"
                            sh "kubectl create rolebinding ${ROLE_BINDING_NAME} --role=${params.ROLE_NAME} --serviceaccount=default:${SERVICE_ACCOUNT_NAME}"
                            
                            // Generate and display a temporary token (optional but helpful)
                            // Note: This requires the Kubernetes CLI (kubectl) plugin to be installed in Jenkins.
                            def token = sh(script: "kubectl create token ${SERVICE_ACCOUNT_NAME} --duration ${params.DURATION_HOURS}h", returnStdout: true).trim()
                            echo "================================================================"
                            echo "Temporary K8s token for ${params.USER_ID}:"
                            echo "${token}"
                            echo "================================================================"
                            
                        }
                    }
                }
            }
        }

        stage('Wait for Expiration') {
            steps {
                script {
                    def durationMinutes = params.DURATION_HOURS.toInteger() * 60
                    echo "Access is active. Waiting for ${durationMinutes} minutes before cleanup..."
                    
                    // The timeout step will wait for the duration and then proceed.
                    // If the pipeline is aborted, the cleanup will still run.
                    timeout(time: durationMinutes, unit: 'MINUTES') {
                        // This empty sleep is a robust way to make the timeout wait.
                        // It's interruptible, unlike a raw `sleep` command.
                        sleep(time: durationMinutes * 60, unit: 'SECONDS') 
                    }
                }
            }
        }
    }

    post {
        // This block runs after all stages, regardless of success or failure.
        // This ensures permissions are always revoked.
        always {
            script {
                echo "Cleaning up temporary access for user '${params.USER_ID}'."
                
                withCredentials([file(credentialsId: KUBECONFIG_CREDENTIAL_ID, variable: 'KUBECONFIG_FILE')]) {
                    withEnv(["KUBECONFIG=${KUBECONFIG_FILE}"]) {
                        // Use --ignore-not-found to prevent errors if cleanup runs twice or if creation failed
                        sh "kubectl delete rolebinding ${ROLE_BINDING_NAME} --ignore-not-found"
                        sh "kubectl delete serviceaccount ${SERVICE_ACCOUNT_NAME} --ignore-not-found"
                    }
                }
                
                echo "Cleanup complete."
            }
        }
    }
}
```

---

## Step 4: Running the Job

You can now grant temporary access by running the Jenkins job.

1.  Navigate to your `temporary-k8s-access` job in Jenkins.
2.  Click **Build with Parameters** on the left.
3.  Fill in the `USER_ID`, `ROLE_NAME`, and `DURATION_HOURS` fields. You can get these values by using the **Temporary RBAC Script Generator** UI to determine the exact user and role you need.
4.  Click **Build**.

The pipeline will start. You can monitor its progress in the **Stage View** or by looking at the **Console Output**. The job will grant access, provide the temporary token in the logs, wait for the specified duration, and then automatically clean up the resources.

## Security Considerations

*   **Jenkins Security:** Ensure your Jenkins instance is secure. Limit who can create and run this job.
*   **Audit Logs:** Use the Jenkins job history and the Kubernetes audit logs to track who was granted temporary access, by whom, and for what reason.
*   **Principle of Least Privilege:** The Kubernetes role used by Jenkins itself should be tightly scoped to only allow the creation/deletion of the necessary resources (`ServiceAccount`, `RoleBinding`).

---

## Containerizing with Docker

This application can be containerized using Docker for easy deployment and portability. The provided `Dockerfile` sets up a multi-stage build that compiles the React application and serves it using a lightweight Nginx web server.

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/) must be installed on your system.

### Preparing Dockerfile
In the root directory, create Dockerfile
```Dockerfile
# STAGE 1: "Packaging Machine" (Build Stage)
# ---------------------------------------------

# Use Node.js 18 Alpine (lightweight) image for building
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json file to WORKDIR
COPY package.json ./

# Run npm install INSIDE this build container (this acts as the “packaging machine”)
RUN npm install

# Copy all remaining project source code
COPY . .

# Run the build command to generate the /app/dist directory
RUN npm run build

# STAGE 2: "Main Runner" (Final Stage)
# ---------------------------------------------

# Use the Nginx Alpine image (very lightweight)
FROM nginx:alpine

# Set the working directory to Nginx's root directory
WORKDIR /usr/share/nginx/html

# Remove Nginx’s default HTML files
RUN rm -rf ./*

# Copy the built files (the dist directory) from STAGE 1
COPY --from=build /app/dist .
```

To build the Docker image, navigate to the root directory of the project (where the `Dockerfile` is located) and run the following command:

```sh
docker build -t easy-rbac .
```

This command will:
1.  Create a build environment using Node.js.
2.  Install all necessary dependencies.
3.  Build the application for production.
4.  Package the resulting static files into an Nginx container.

### Running the Docker Container

Once the image is built, you can run it as a container with this command:

```sh
docker run -d -p 8080:80 --name rbac-app easy-rbac
```

This command does the following:
*   `-d`: Runs the container in detached mode (in the background).
*   `-p 8080:80`: Maps port 8080 of your local machine to port 80 inside the container.
*   `--name rbac-app`: Assigns a convenient name to the container.
*   `easy-rbac`: Specifies the image to run.

The application will now be accessible in your web browser at **http://localhost:8080**.

### Managing the Container

*   **To stop the container:**
    ```sh
    docker stop rbac-app
    ```
*   **To start it again:**
    ```sh
    docker start rbac-app
    ```
*   **To view logs:**
    ```sh
    docker logs -f rbac-app
    ```
*   **To remove the container (after stopping):**
    ```sh
    docker rm rbac-app
    ```
