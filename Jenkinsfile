#!/usr/bin/env groovy
def getLastCommit() {
  sh "$GITHUB_LAST_COMMIT > .git/last-commit"
  return readFile(".git/last-commit").trim()
}
pipeline {
    agent any
    environment { 
        LAST_COMMIT = getLastCommit()
    }
    stages {
        stage('Build') {
            when {
                expression {
                    return !env.LAST_COMMIT.contains(env.JENKINS_SKIP_BUILD)
                }
            }
            steps { 
                echo 'npm install'
                sh 'npm install'
                echo 'kill process to avoid issues later'
                sh(returnStdout: true, script: 'lsof -i:$TEST_PORT -t | xargs -r kill -9') 
                echo 'npm test'
                sh 'npm test'
                echo 'kill process to avoid issues later'
                sh(returnStdout: true, script: 'lsof -i:$E2E_PORT -t | xargs -r kill -9') 
                echo 'npm run e2e'
                sh 'npm run e2e'
                echo 'kill process to avoid issues later'
                sh(returnStdout: true, script: 'lsof -i:$PROFILE_PORT -t | xargs -r kill -9') 
                sh 'npm run profile'
                echo 'git commit'
                sh 'git commit -m "$JENKINS_SKIP_BUILD upload profile result by build $BUILD_NUMBER"'
                echo 'git pull and push to avoid slow build and new commits'
                sh 'git pull origin $GITHUB_PUSH_BRANCH'
                sh 'git push origin HEAD:$GITHUB_PUSH_BRANCH' 
             }
        }
        stage ('Skip Build') {
            when {
                expression {
                    return env.LAST_COMMIT.contains(env.JENKINS_SKIP_BUILD)
                }
            }
            steps {
                echo 'skipped build.'
            }
        }
    }
    post {
          success { 
             githubNotify description: 'Build successfully by jenkins build '+ env.BUILD_NUMBER,  status: 'SUCCESS',sha:env.GIT_COMMIT, 
              credentialsId: env.GITHUB_CREDENTIALS_ID, account: env.GITHUB_USER_NAME, repo: env.GITHUB_REPO_NAME
          }
          failure { 
             githubNotify description: 'Build failed by Jenkins build '+ env.BUILD_NUMBER,  status: 'FAILURE',sha:env.GIT_COMMIT, 
              credentialsId: env.GITHUB_CREDENTIALS_ID, account: env.GITHUB_USER_NAME, repo: env.GITHUB_REPO_NAME
          }
    }
}
