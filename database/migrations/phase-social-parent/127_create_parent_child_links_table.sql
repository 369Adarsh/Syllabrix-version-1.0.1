-- Table to link parents and children
CREATE TABLE IF NOT EXISTS parent_child_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_user_id INT NOT NULL,
    child_user_id INT NOT NULL,
    relationship VARCHAR(50) DEFAULT 'parent',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (child_user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY idx_parent_child (parent_user_id, child_user_id)
);
