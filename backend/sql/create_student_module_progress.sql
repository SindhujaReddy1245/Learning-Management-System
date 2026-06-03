

CREATE TABLE IF NOT EXISTS student_module_progress (
    student_id TEXT NOT NULL,
    module_id  UUID NOT NULL,
    viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (student_id, module_id),
    -- Foreign keys
    CONSTRAINT fk_student
        FOREIGN KEY (student_id)
        REFERENCES invited_students(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_module
        FOREIGN KEY (module_id)
        REFERENCES modules(id)
        ON DELETE CASCADE
);