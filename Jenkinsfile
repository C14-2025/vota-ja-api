pipeline {
  agent any

  tools {
    nodejs "node20"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Run E2E tests') {
      steps {
        sh '''
          npm run test:e2e -- --coverage
        '''
      }
    }
  }

  post {
    always {
      junit 'test-results/**/*.xml'
    }
  }
}
