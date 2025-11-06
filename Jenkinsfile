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
    APP_HOST_URL = "http://easy-rbac.trongnv.xyx" 
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
        cleanWs()
        checkout scm 
        echo "SUCCESS: Code checked out from Github."
      }
    }

    // --- Stage 2: Build Docker Images and Push App to Registry ---
    stage('2. Build Docker Images and Push App to Registry') {
      steps {
        echo "INFO: Building App image: ${env.APP_IMAGE_NAME}"
        sh "docker build -t ${env.APP_IMAGE_NAME} ."
        echo "INFO: Building App image: ${env.APP_IMAGE_NAME} successfylly"

        echo "INFO: Pushing App image..."
        sh '''
		          echo $DOCKER_CREDENTIALS_PSW | docker login ${DOCKER_REGISTRY} -u $DOCKER_CREDENTIALS_USR --password-stdin
              docker push ${APP_IMAGE_NAME}
              docker logout ${DOCKER_REGISTRY}
           '''
        echo "INFO: Pushing App image successfully"
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
