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

    stage('Run ESLint') {
      steps {
        sh 'npx eslint . --ext .ts,.js --config eslintrc.js'
      }
    }

    stage('Check Prettier formatting') {
      steps {
        sh 'npx prettier --check "src/**/*.ts" "tests/**/*.ts"'
      }
    }
  }

  post {
    success {
      echo 'Code quality checks passed!'
    }
    failure {
      echo 'Code quality checks failed. Please fix linting errors.'
    }
  }
}
