pipeline {
  agent any

  tools {
    nodejs "node20"
  }

  environment {
    NODE_OPTIONS = '--max_old_space_size=4096'
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Cache & Install') {
      steps {
        // Cache node_modules for faster builds
        script {
          def nodeModulesExists = fileExists('node_modules')
          if (!nodeModulesExists) {
            echo 'Installing dependencies...'
            sh 'npm ci'
          } else {
            echo 'Using cached dependencies'
          }
        }
      }
    }

    stage('Lint & Build') {
      parallel {
        stage('Lint') {
          steps {
            sh 'npm run lint:check'
          }
        }
        stage('Build') {
          steps {
            sh 'npm run build'
          }
          post {
            success {
              archiveArtifacts artifacts: 'dist/*/', allowEmptyArchive: true
            }
          }
        }
      }
    }

    stage('Run Tests') {
      parallel {
        stage('Unit Tests') {
          steps {
            sh 'npm run test:unit -- --coverage --ci'
          }
          post {
            always {
              junit 'test-results/unit.xml'
              publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/unit',
                reportFiles: 'index.html',
                reportName: 'Unit Test Coverage Report'
              ])
            }
          }
        }
        stage('E2E Tests') {
          steps {
            sh 'npm run test:e2e -- --coverage --ci'
          }
          post {
            always {
              junit 'test-results/e2e.xml'
              publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/e2e',
                reportFiles: 'index.html',
                reportName: 'E2E Test Coverage Report'
              ])
            }
          }
        }
      }
    }

    stage('Security Audit') {
      steps {
        sh 'npm audit --audit-level=moderate'
      }
    }
  }

  post {
    always {
      // Cleanup workspace
      cleanWs()
    }
    success {
      echo 'Pipeline completed successfully! 🎉'
    }
    failure {
      echo 'Pipeline failed! ❌ Check the logs for details.'
    }
    unstable {
      echo 'Pipeline completed with warnings! ⚠️'
    }
  }
}
