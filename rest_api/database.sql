

CREATE TABLE IF NOT EXISTS `rate_limit` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_key` VARCHAR(255) NOT NULL,
    `count` INT NOT NULL DEFAULT 0,
    `expires_at` INT NOT NULL,
    UNIQUE KEY `unique_client_key` (`client_key`)
    );


CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL
);


INSERT INTO `users` (`username`, `password`) VALUES
('0b781403-5c0d-4db3-b15b-e5dd1620fa8b', 'b44002618b1d785563d483e27f6fb46ed7b5fafa1be41d5b1e5527c268061841'),
('64d97ba6-b4b6-4159-be44-79c38506d331', 'bda746f3e27928e87eb0de23f82b8261adc385bf025cb5c09cf0fae78e02f269'),
('0bd6d135-3d64-447c-837e-882771413171', '06472b6b853c4c932ac8ca66c6cca8c34eb7c64b338c31322d319be812f10f6c'),
('c786b0f6-8bb8-4521-9f1e-7a34c9fd759e', '6682be8515df2421b1f6c90abb3279b39ed502d180c4cb9c6fc36c97e6a0ecd3');




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

