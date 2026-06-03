-- Migration: create student_module_progress table
CREATE TABLE IF NOT EXISTS student_module_progress (
    student_id UUID NOT NULL,
    module_id UUID NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    PRIMARY KEY (student_id, module_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);
