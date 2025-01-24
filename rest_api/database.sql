

CREATE TABLE IF NOT EXISTS `rate_limit` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_key` VARCHAR(255) NOT NULL,
    `count` INT NOT NULL DEFAULT 0,
    `expires_at` INT NOT NULL,
    UNIQUE KEY `unique_client_key` (`client_key`)
    );


CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `uniq_id` varchar(150) NOT NULL,
  `username` varchar(150) NOT NULL
);


INSERT INTO `users` (`id`, `uniq_id`, `username`) VALUES
(1, '1456-98754-5241578', 'KalleValle'),
(2, '198745-98654-9654874', 'VemFooBar');


CREATE TABLE routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    question_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE answers (
     answer_id INT AUTO_INCREMENT PRIMARY KEY,
     question_id INT NOT NULL,
     answer_text TEXT NOT NULL,
     is_correct BOOLEAN DEFAULT FALSE,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     CONSTRAINT fk_answers_question
         FOREIGN KEY (question_id) REFERENCES questions(question_id)
             ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE checkpoints (
     checkpoint_id INT AUTO_INCREMENT PRIMARY KEY,
     route_id INT NOT NULL,
     latitude DECIMAL(10, 8) NOT NULL,
     longitude DECIMAL(11, 8) NOT NULL,
     question_id INT NOT NULL,
     checkpoint_order INT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     CONSTRAINT fk_checkpoints_route
         FOREIGN KEY (route_id) REFERENCES routes(route_id)
             ON DELETE CASCADE,
     CONSTRAINT fk_checkpoints_question
         FOREIGN KEY (question_id) REFERENCES questions(question_id)
             ON DELETE CASCADE
) ENGINE=InnoDB;


INSERT INTO routes (name, description)
VALUES ('Min första rutt', 'En rutt i centrala stan.');

INSERT INTO questions (question_text)
VALUES ('Vad heter Sveriges huvudstad?');

INSERT INTO answers (question_id, answer_text, is_correct)
VALUES
    (1, 'Stockholm', TRUE),
    (1, 'Göteborg', FALSE),
    (1, 'Malmö', FALSE);


INSERT INTO checkpoints (route_id, latitude, longitude, question_id, checkpoint_order)
VALUES (1, 59.3293, 18.0686, 1, 1);

SELECT
    r.route_id,
    r.name AS route_name,
    c.checkpoint_id,
    c.latitude,
    c.longitude,
    c.checkpoint_order,
    q.question_id,
    q.question_text,
    a.answer_id,
    a.answer_text,
    a.is_correct
FROM routes r
    JOIN checkpoints c ON r.route_id = c.route_id
    JOIN questions q ON c.question_id = q.question_id
    JOIN answers a ON q.question_id = a.question_id
ORDER BY r.route_id, c.checkpoint_order, a.answer_id;

SELECT route_id, name AS route_name FROM routes;

SELECT * FROM checkpoints WHERE route_id = ?;

SELECT
    q.question_text,
    a.answer_text,
    a.is_correct
    FROM questions q
    JOIN answers a ON q.question_id = a.question_id
WHERE q.question_id = ?
ORDER BY q.question_id;

