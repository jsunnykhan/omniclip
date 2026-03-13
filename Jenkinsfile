pipeline {
    agent any

    environment {
        // Expose variables to docker-compose if needed
        COMPOSE_PROJECT_NAME = 'omniclip'
    }

    stages {
        stage('Checkout') {
            steps {
                // Fetch latest code from main
                checkout scm
            }
        }

        stage('Build & Deploy with Docker Combine') {
            steps {
                // We use Windows batch (bat) command here or 'sh' for linux.
                // Assuming your Jenkins runtime is running bash/sh
                sh '''
                echo "Spinning up containers..."
                
                # Rebuild all images and recreate containers without downtime if possible, 
                # running them in detached mode (-d).
                docker-compose up --build -d
                
                # Remove dangling or unused images to save disk space
                docker image prune -f
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo '✅ OmniClip successfully deployed via Docker Compose!'
        }
        failure {
            echo '❌ Deployment failed. Check the Jenkins console output.'
        }
    }
}
