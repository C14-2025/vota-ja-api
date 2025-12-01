pipeline {
  agent any

  tools {
    nodejs "node20"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
          url: 'https://github.com/C14-2025/vota-ja-api.git'
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Archive artifacts') {
      steps {
        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
      }
    }
  }

  post {
    success {
      echo 'Build completed successfully!'
    }
    failure {
      echo 'Build failed!'
    }
  }
}
