# ---------------------------------------------------------------
# 1. Service Account 
# ---------------------------------------------------------------
# 1.1. Service Account 
# ---------------------------------------------------------------
resource "google_service_account" "tome-ms-challenges-service-account" {
  account_id = "tome-ms-challenges"
  display_name = "Tome MS Challenges Service Account"
}

# ---------------------------------------------------------------
# 1.2. Service Account Roles
# ---------------------------------------------------------------
resource "google_project_iam_member" "tome-ms-challenges-role-secretmanagedaccessor" {
    project = var.gcp_pid
    role = "roles/secretmanager.secretAccessor"
    member = format("serviceAccount:%s", google_service_account.tome-ms-challenges-service-account.email)
}
resource "google_project_iam_member" "tome-ms-challenges-role-gcs" {
    project = var.gcp_pid
    role = "roles/storage.admin"
    member = format("serviceAccount:%s", google_service_account.tome-ms-challenges-service-account.email)
}
resource "google_project_iam_member" "tome-ms-challenges-role-pubsub" {
    project = var.gcp_pid
    role = "roles/pubsub.publisher"
    member = format("serviceAccount:%s", google_service_account.tome-ms-challenges-service-account.email)
}

# --------------------------------------------------------------
# 2. Artifact Repository
# ---------------------------------------------------------------
resource "google_artifact_registry_repository" "tome-ms-challenges-registry" {
    location = var.gcp_region
    repository_id = "tome-ms-challenges"
    format = "DOCKER"
    description = "Tome MS Challenges Artifact Registry"
    labels = {
        "created_by" = "terraform"
        "project" = var.gcp_pid
    }
}

# ---------------------------------------------------------------
# 3. Github environment secrets & variables
# ---------------------------------------------------------------
resource "github_repository_environment" "tome-ms-challenges-github-environment" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
}
resource "github_actions_environment_secret" "tome-ms-challenges-bucket-envsecret" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    secret_name = "BACKUP_BUCKET"
    plaintext_value  = google_storage_bucket.backup-bucket.name
}
resource "github_actions_environment_secret" "tome-ms-challenges-secret-cicdsakey" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    secret_name = "CICD_SERVICE_ACCOUNT"
    plaintext_value = jsonencode(jsondecode(base64decode(google_service_account_key.toto-cicd-sa-key.private_key)))
}
resource "github_actions_environment_variable" "tome-ms-challenges-var-pid" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    variable_name = "GCP_PID"
    value = var.gcp_pid
}
resource "github_actions_environment_secret" "tome-ms-challenges-secret-service-account" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    secret_name = "SERVICE_ACCOUNT"
    plaintext_value = google_service_account.tome-ms-challenges-service-account.email
}
resource "github_actions_environment_secret" "tome-ms-challenges-secret-gale-broker-endpoint" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    secret_name = "GALE_BROKER_URL"
    plaintext_value = format("https://gale-broker-%s/galebroker", var.cloud_run_endpoint_suffix)
}
resource "github_actions_environment_secret" "tome-ms-challenges-secret-service-base-url" {
    repository = "tome-ms-challenges"
    environment = var.gcp_pid
    secret_name = "SERVICE_BASE_URL"
    plaintext_value = format("https://tome-ms-challenges-%s", var.cloud_run_endpoint_suffix)
}

# ---------------------------------------------------------------
# 4. Google Secret Manager (Secrets)
# ---------------------------------------------------------------
variable "tome_ms_challenges_mongo_user" {
    description = "Mongo User for challenges"
    type = string
    sensitive = true
}
variable "tome_ms_challenges_mongo_pswd" {
    description = "Mongo Password for challenges"
    type = string
    sensitive = true
}
resource "google_secret_manager_secret" "tome-ms-challenges-mongo-user" {
    secret_id = "tome-ms-challenges-mongo-user"
    replication {
        auto { }
    }
}
resource "google_secret_manager_secret_version" "tome-ms-challenges-mongo-user-version" {
    secret = google_secret_manager_secret.tome-ms-challenges-mongo-user.id
    secret_data = var.tome_ms_challenges_mongo_user
}
resource "google_secret_manager_secret" "tome-ms-challenges-mongo-pswd" {
    secret_id = "tome-ms-challenges-mongo-pswd"
    replication {
        auto { }
    }
}
resource "google_secret_manager_secret_version" "tome-ms-challenges-mongo-pswd-version" {
    secret = google_secret_manager_secret.tome-ms-challenges-mongo-pswd.id
    secret_data = var.tome_ms_challenges_mongo_pswd
}

# ---------------------------------------------------------------
# 5. Cloud DNS & Domain Mapping
# ---------------------------------------------------------------
# 5.1. DNS 
# 5.2. Domain Mapping

# ---------------------------------------------------------------
# 6. PubSub Subscriptions to events
# ---------------------------------------------------------------
