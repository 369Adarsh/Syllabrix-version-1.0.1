CREATE TABLE IF NOT EXISTS study_artifacts (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    workspace_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content JSON NOT NULL,
    source_document_ids JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (workspace_id) REFERENCES study_workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_study_artifacts_workspace_id (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
