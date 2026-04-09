CREATE TABLE IF NOT EXISTS study_documents (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    workspace_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    mime_type VARCHAR(100) NULL,
    size_bytes BIGINT UNSIGNED NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    extracted_text LONGTEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (workspace_id) REFERENCES study_workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_study_docs_workspace_id (workspace_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
