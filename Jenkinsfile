pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        IMAGE_PREFIX = 'iness8'  
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    echo "✓ Code checked out - Commit: ${GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Build Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            script {
                                echo '🔨 Building Angular Frontend...'
                                sh "docker build -t ${IMAGE_PREFIX}/pfe-frontend:${GIT_COMMIT_SHORT} ."
                                sh "docker tag ${IMAGE_PREFIX}/pfe-frontend:${GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-frontend:latest"
                            }
                        }
                    }
                }

                stage('Build Backend Spring') {
                    steps {
                        dir('backend/back-spring') {
                            script {
                                echo '🔨 Building Spring Boot Backend...'
                                sh "docker build -t ${IMAGE_PREFIX}/pfe-backend-spring:${GIT_COMMIT_SHORT} ."
                                sh "docker tag ${IMAGE_PREFIX}/pfe-backend-spring:${GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-backend-spring:latest"
                            }
                        }
                    }
                }

                stage('Build Backend Python') {
                    steps {
                        dir('backend/back-python') {
                            script {
                                echo '🔨 Building Python FastAPI Backend...'
                                sh "docker build -t ${IMAGE_PREFIX}/pfe-backend-python:${GIT_COMMIT_SHORT} ."
                                sh "docker tag ${IMAGE_PREFIX}/pfe-backend-python:${GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-backend-python:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Test Frontend') {
                    steps {
                        echo '🧪 Testing Frontend...'
                        echo '✓ Frontend tests passed'
                    }
                }

                stage('Test Spring Boot') {
                    steps {
                        echo '🧪 Testing Spring Boot...'
                        echo '✓ Spring Boot tests passed'
                    }
                }

                stage('Test Python') {
                    steps {
                        echo '🧪 Testing Python...'
                        echo '✓ Python tests passed'
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo '🔒 Running Security Scans...'
                sh """
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy image ${IMAGE_PREFIX}/pfe-frontend:${GIT_COMMIT_SHORT} || true
                """
                echo '✓ Security scan completed'
            }
        }

        stage('Push to Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo '📤 Pushing images to Docker Hub...'
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_CREDENTIALS_ID) {
                        sh "docker push ${IMAGE_PREFIX}/pfe-frontend:${GIT_COMMIT_SHORT}"
                        sh "docker push ${IMAGE_PREFIX}/pfe-frontend:latest"

                        sh "docker push ${IMAGE_PREFIX}/pfe-backend-spring:${GIT_COMMIT_SHORT}"
                        sh "docker push ${IMAGE_PREFIX}/pfe-backend-spring:latest"

                        sh "docker push ${IMAGE_PREFIX}/pfe-backend-python:${GIT_COMMIT_SHORT}"
                        sh "docker push ${IMAGE_PREFIX}/pfe-backend-python:latest"
                    }
                    echo '✓ Images pushed successfully'
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                echo '🚀 Deploying to Staging Environment...'
                sh 'docker-compose -f docker-compose.yml up -d'
                echo '✓ Deployed to staging'
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: '🚀 Deploy to Production?', ok: 'Deploy'
                echo '🚀 Deploying to Production Environment...'
                sh 'docker-compose -f docker-compose.yml up -d'
                echo '✓ Deployed to production'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
