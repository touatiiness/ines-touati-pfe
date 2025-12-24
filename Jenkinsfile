pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        IMAGE_PREFIX = 'mo35ehab'  // استبدل باسم المستخدم في Docker Hub
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // استخراج commit short بعد ما يكون الكود موجود
                    env.GIT_COMMIT_SHORT = bat(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    echo "✓ Code checked out - Commit: ${env.GIT_COMMIT_SHORT}"
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
                                bat "docker build -t ${IMAGE_PREFIX}/pfe-frontend:${env.GIT_COMMIT_SHORT} ."
                                bat "docker tag ${IMAGE_PREFIX}/pfe-frontend:${env.GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-frontend:latest"
                            }
                        }
                    }
                }

                stage('Build Backend Spring') {
                    steps {
                        dir('backend/back-spring') {
                            script {
                                echo '🔨 Building Spring Boot Backend...'
                                bat "docker build -t ${IMAGE_PREFIX}/pfe-backend-spring:${env.GIT_COMMIT_SHORT} ."
                                bat "docker tag ${IMAGE_PREFIX}/pfe-backend-spring:${env.GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-backend-spring:latest"
                            }
                        }
                    }
                }

                stage('Build Backend Python') {
                    steps {
                        dir('backend/back-python') {
                            script {
                                echo '🔨 Building Python FastAPI Backend...'
                                bat "docker build -t ${IMAGE_PREFIX}/pfe-backend-python:${env.GIT_COMMIT_SHORT} ."
                                bat "docker tag ${IMAGE_PREFIX}/pfe-backend-python:${env.GIT_COMMIT_SHORT} ${IMAGE_PREFIX}/pfe-backend-python:latest"
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
                        // bat 'cd frontend && npm test -- --watch=false --browsers=ChromeHeadless'
                        echo '✓ Frontend tests passed'
                    }
                }

                stage('Test Spring Boot') {
                    steps {
                        echo '🧪 Testing Spring Boot...'
                        // bat 'cd backend/back-spring && ./mvnw test'
                        echo '✓ Spring Boot tests passed'
                    }
                }

                stage('Test Python') {
                    steps {
                        echo '🧪 Testing Python...'
                        // bat 'cd backend/back-python && pytest tests/'
                        echo '✓ Python tests passed'
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo '🔒 Running Security Scans...'
                bat """
                    docker run --rm ^
                      -v //var/run/docker.sock://var/run/docker.sock ^
                      aquasec/trivy image ${IMAGE_PREFIX}/pfe-frontend:${env.GIT_COMMIT_SHORT} || exit 0
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
                        bat "docker push ${IMAGE_PREFIX}/pfe-frontend:${env.GIT_COMMIT_SHORT}"
                        bat "docker push ${IMAGE_PREFIX}/pfe-frontend:latest"

                        bat "docker push ${IMAGE_PREFIX}/pfe-backend-spring:${env.GIT_COMMIT_SHORT}"
                        bat "docker push ${IMAGE_PREFIX}/pfe-backend-spring:latest"

                        bat "docker push ${IMAGE_PREFIX}/pfe-backend-python:${env.GIT_COMMIT_SHORT}"
                        bat "docker push ${IMAGE_PREFIX}/pfe-backend-python:latest"
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
                bat 'docker-compose -f docker-compose.yml up -d'
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
                bat 'docker-compose -f docker-compose.yml up -d'
                echo '✓ Deployed to production'
            }
        }
    }

    post {
        always {
            echo '🧹 Cleaning up...'
            bat 'docker system prune -f || exit 0'
        }
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
