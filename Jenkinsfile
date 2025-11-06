pipeline {
  agent {
    label 'docker-lab'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '5'))
  }

  environment {
    // Variables for docker build and k8s deployment
    APP_NAME = "easy-rbac"
    APP_SERVICE_NAME = "${env.APP_NAME}-svc"
    APP_INGRESS_NAME = "${env.APP_NAME}-ingress"
    APP_HOST_URL = "http://easy-rbac.trongnv.xyz" 
    DOCKER_REGISTRY = "https://registry-nexus.trongnv.xyz"
    REGISTRY_HOST = DOCKER_REGISTRY.replace("https://", "").replace("http://", "")
    DOCKER_CREDENTIALS = credentials('docker-login')
    APP_IMAGE_NAME = "${env.REGISTRY_HOST}/${env.APP_NAME}/${env.APP_NAME}:latest"
    K8S_NAMESPACE = 'app-dev'
  }

  stages { 
    // --- Stage 1: Get latest code ---
    stage('1. Checkout Code') {
      steps {
        echo 'Starting to check out code...'
        checkout scm 
        echo "SUCCESS: Code checked out from Github."
      }
    }

    // --- Stage 2: Build Docker Images and Push App to Registry ---
    stage('2. Build Docker Images and Push App to Registry') {
      steps {
        echo "INFO: Building App image: ${env.APP_IMAGE_NAME}"
        //sh "docker build -t ${env.APP_IMAGE_NAME} ."
        echo "INFO: Building App image: ${env.APP_IMAGE_NAME} successfylly"

        echo "INFO: Pushing App image..."
        //sh '''
		//          echo $DOCKER_CREDENTIALS_PSW | docker login ${DOCKER_REGISTRY} -u $DOCKER_CREDENTIALS_USR --password-stdin
        //      docker push ${APP_IMAGE_NAME}
        //      docker logout ${DOCKER_REGISTRY}
        //   '''
        echo "INFO: Pushing App image successfully"
      }
    }
	  
    stage('Stage 3: Deploy to Kubernetes') {
      steps {
        echo 'Starting deployment to Kubernetes cluster...'       
        echo '0. Cleaning up old resources...'
        // Clean old App, Service, và Ingress
        sh "kubectl delete deployment ${env.APP_NAME} --namespace=${env.K8S_NAMESPACE} || true"
        sh "kubectl delete service ${env.APP_SERVICE_NAME} --namespace=${env.K8S_NAMESPACE} || true"
        sh "kubectl delete ingress ${env.APP_INGRESS_NAME} --namespace=${env.K8S_NAMESPACE} || true"

        echo '1. Applying Namespace and Secret...'
        // Do not delete Namespace
        sh "kubectl apply -f k8s/namespace.yaml --namespace=${env.K8S_NAMESPACE} || true"
        //sh "kubectl apply -f k8s/registry-secret.yaml -n ${env.K8S_NAMESPACE} || true"

        echo '2. Applying Deployment, Service, and Ingress...'
        sh "kubectl apply -f k8s/app-service.yaml --namespace=${K8S_NAMESPACE}"
        sh "kubectl apply -f k8s/app-deployment.yaml --namespace=${K8S_NAMESPACE}"
        sh "kubectl apply -f k8s/app-ingress.yaml --namespace=${K8S_NAMESPACE}"

        echo '3. Waiting 5 seconds...'
        sh "sleep 5" 

        echo '4. Waiting for deployment to complete...'
        sh "kubectl rollout status deployment/${APP_NAME} --namespace=${K8S_NAMESPACE}"
                        
        echo '5. Getting Service Access URLs...'
        script {
          echo "----------------------------------------------------"
          echo "✅ Frontend (Ingress): ${APP_HOST_URL}  (Need Access from outsite)"
          echo "----------------------------------------------------"
        }
      }
    }
  }
  // --- Post Actions ---
  post {
    always {
      sh 'docker logout'
      echo 'INFO: Pipeline finished execution.'
    }

    success { 
      echo 'SUCCESS: Pipeline completed successfully!'
    }

    failure { 
      echo 'FAILED: Pipeline failed!'
    }
  } // End of post
} // End of pipeline
