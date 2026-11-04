BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 1dac51280265

CREATE TABLE adults (
    id VARCHAR(128) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    profession VARCHAR(20) NOT NULL,
    preferences JSON NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE students (
    id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    supports JSON NOT NULL,
    confirmed_level VARCHAR(40),
    version INTEGER NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE analyses (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    status VARCHAR(30) NOT NULL,
    snapshot JSON NOT NULL,
    snapshot_hash VARCHAR(64) NOT NULL,
    prompt_version VARCHAR(64) NOT NULL,
    model VARCHAR(100) NOT NULL,
    origin VARCHAR(20) NOT NULL,
    result JSON,
    usage JSON,
    request_id VARCHAR(150),
    reviewed_by VARCHAR(128),
    review VARCHAR(20),
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(reviewed_by) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE assessments (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    instrument VARCHAR(80) NOT NULL,
    evidence JSON NOT NULL,
    notes TEXT NOT NULL,
    synthetic BOOLEAN NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE commands (
    id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    key VARCHAR(100) NOT NULL,
    fingerprint VARCHAR(64) NOT NULL,
    response JSON NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    UNIQUE (adult_id, key)
);

CREATE TABLE content (
    id VARCHAR(36) NOT NULL,
    author_id VARCHAR(128) NOT NULL,
    kind VARCHAR(20) NOT NULL,
    title VARCHAR(120) NOT NULL,
    body JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    version INTEGER NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(author_id) REFERENCES adults (id)
);

CREATE TABLE feedback (
    id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    text TEXT NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id)
);

CREATE TABLE grants (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id),
    UNIQUE (student_id, adult_id)
);

CREATE TABLE invitations (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_by VARCHAR(128) NOT NULL,
    expires_at VARCHAR(40) NOT NULL,
    accepted_by VARCHAR(128),
    PRIMARY KEY (id),
    FOREIGN KEY(accepted_by) REFERENCES adults (id),
    FOREIGN KEY(created_by) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id),
    UNIQUE (token_hash)
);

CREATE TABLE observations (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    context VARCHAR(120) NOT NULL,
    text TEXT NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE schools (
    id VARCHAR(36) NOT NULL,
    owner_id VARCHAR(128) NOT NULL,
    name VARCHAR(120) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(owner_id) REFERENCES adults (id)
);

CREATE TABLE assignments (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    content_id VARCHAR(36) NOT NULL,
    content_version INTEGER NOT NULL,
    snapshot JSON NOT NULL,
    position INTEGER NOT NULL,
    created_by VARCHAR(128) NOT NULL,
    completed_at VARCHAR(40),
    PRIMARY KEY (id),
    FOREIGN KEY(content_id) REFERENCES content (id),
    FOREIGN KEY(created_by) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE classrooms (
    id VARCHAR(36) NOT NULL,
    school_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(128) NOT NULL,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(school_id) REFERENCES schools (id),
    FOREIGN KEY(teacher_id) REFERENCES adults (id)
);

CREATE TABLE attempts (
    id VARCHAR(36) NOT NULL,
    assignment_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    responses JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    version INTEGER NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    finished_at VARCHAR(40),
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(assignment_id) REFERENCES assignments (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE enrollments (
    id VARCHAR(36) NOT NULL,
    classroom_id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(classroom_id) REFERENCES classrooms (id),
    FOREIGN KEY(student_id) REFERENCES students (id),
    UNIQUE (classroom_id, student_id)
);

INSERT INTO alembic_version (version_num) VALUES ('1dac51280265') RETURNING alembic_version.version_num;

-- Running upgrade 1dac51280265 -> de664aefab29

ALTER TABLE invitations ADD COLUMN recipient_id VARCHAR(128) NOT NULL;

UPDATE alembic_version SET version_num='de664aefab29' WHERE alembic_version.version_num = '1dac51280265';

-- Running upgrade de664aefab29 -> b472dc6f9663

ALTER TABLE students ADD COLUMN birth_date DATE;

UPDATE alembic_version SET version_num='b472dc6f9663' WHERE alembic_version.version_num = 'de664aefab29';

-- Running upgrade b472dc6f9663 -> f43ecf951f39

CREATE TABLE ai_gate (
    id SERIAL NOT NULL,
    busy BOOLEAN NOT NULL,
    last_started_at VARCHAR(40),
    PRIMARY KEY (id)
);

ALTER TABLE analyses ADD COLUMN command_key VARCHAR(64);

CREATE UNIQUE INDEX ix_analyses_command_key ON analyses (command_key);

UPDATE alembic_version SET version_num='f43ecf951f39' WHERE alembic_version.version_num = 'b472dc6f9663';

-- Running upgrade f43ecf951f39 -> e07f7798bf0d

CREATE TABLE audit_events (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    action VARCHAR(40) NOT NULL,
    resource_id VARCHAR(128) NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE level_confirmations (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    level VARCHAR(40) NOT NULL,
    justification TEXT NOT NULL,
    evidence_ids JSON NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

CREATE TABLE student_guidance (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    title VARCHAR(120) NOT NULL,
    text TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

UPDATE alembic_version SET version_num='e07f7798bf0d' WHERE alembic_version.version_num = 'f43ecf951f39';

-- Running upgrade e07f7798bf0d -> f61472ddf439

ALTER TABLE analyses ADD COLUMN reviewed_at VARCHAR(40);

ALTER TABLE analyses ADD COLUMN revised_result JSON;

ALTER TABLE analyses ADD COLUMN review_note VARCHAR(1000);

UPDATE alembic_version SET version_num='f61472ddf439' WHERE alembic_version.version_num = 'e07f7798bf0d';

-- Running upgrade f61472ddf439 -> d7b83dc0d23a

CREATE TABLE content_reviews (
    id VARCHAR(36) NOT NULL,
    content_id VARCHAR(36) NOT NULL,
    content_version INTEGER NOT NULL,
    reviewer_id VARCHAR(128) NOT NULL,
    approved BOOLEAN NOT NULL,
    note TEXT NOT NULL,
    "references" JSON NOT NULL,
    reviewed_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(content_id) REFERENCES content (id),
    FOREIGN KEY(reviewer_id) REFERENCES adults (id),
    UNIQUE (content_id, content_version)
);

ALTER TABLE assessments ADD COLUMN instrument_snapshot JSON;

UPDATE alembic_version SET version_num='d7b83dc0d23a' WHERE alembic_version.version_num = 'f61472ddf439';

-- Running upgrade d7b83dc0d23a -> 1d276185c1ab

CREATE TABLE followup_events (
    id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    enabled BOOLEAN NOT NULL,
    notice_version VARCHAR(40) NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id)
);

UPDATE alembic_version SET version_num='1d276185c1ab' WHERE alembic_version.version_num = 'd7b83dc0d23a';

-- Running upgrade 1d276185c1ab -> 00441fc6d86f

CREATE TABLE attention_flags (
    id VARCHAR(36) NOT NULL,
    student_id VARCHAR(36) NOT NULL,
    adult_id VARCHAR(128) NOT NULL,
    reason TEXT NOT NULL,
    created_at VARCHAR(40) NOT NULL,
    resolved_at VARCHAR(40),
    resolved_by VARCHAR(128),
    PRIMARY KEY (id),
    FOREIGN KEY(adult_id) REFERENCES adults (id),
    FOREIGN KEY(resolved_by) REFERENCES adults (id),
    FOREIGN KEY(student_id) REFERENCES students (id)
);

UPDATE alembic_version SET version_num='00441fc6d86f' WHERE alembic_version.version_num = '1d276185c1ab';

-- Running upgrade 00441fc6d86f -> 7c923f1b4a20

CREATE TABLE content_revisions (
    id VARCHAR(36) NOT NULL,
    content_id VARCHAR(36) NOT NULL,
    version INTEGER NOT NULL,
    snapshot JSON NOT NULL,
    captured_by VARCHAR(128) NOT NULL,
    captured_at VARCHAR(40) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(content_id) REFERENCES content (id),
    FOREIGN KEY(captured_by) REFERENCES adults (id),
    UNIQUE (content_id, version)
);

UPDATE alembic_version SET version_num='7c923f1b4a20' WHERE alembic_version.version_num = '00441fc6d86f';

COMMIT;
