<?php

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

class RouteController
{
    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function add_new(ServerRequestInterface $request, ResponseInterface $response, $args) {
        //$this->logger->info("It is possible to add routs");
        $json = $request->getParsedBody();
        //$data = json_decode($json);

        $this->logger->info("Add routs: " . var_export($json,true) /*$json[0]['marker']['question']*/);

        $sql_routes = "INSERT INTO routes (name, city, description)
                VALUES (:name, :city, :description)";
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql_routes);
            // TODO: bör updaters så det kommer från appen
            $statement->execute([
                ':name' => $json["name"],
                ':city' => $json["city"],
                ':description' => $json["description"]
            ]);
            $route_id = $pdo->lastInsertId();

            $sql_question = "INSERT INTO questions (question_text)
                   VALUES (:question_text)";

            $i = 0;
            foreach ($json["data"] as $item) {
                $statement = $pdo->prepare($sql_question);
                $statement->execute([
                    ':question_text' => $item['question']
                ]);

                $question_id = $pdo->lastInsertId();

                $sql = "INSERT INTO answers (question_id, answer_text, is_correct)
                        VALUES (:question_id, :answer_text, :is_correct)";
                foreach ($item['answers'] as $answer) {
                    $statement = $pdo->prepare($sql);
                    $statement->execute([
                        ':question_id' => $question_id,
                        ':answer_text' => $answer['text'],
                        ':is_correct' => $answer['isRight']
                    ]);
                }
                $sql = "INSERT INTO checkpoints (route_id, latitude, longitude, question_id, checkpoint_order)
                        VALUES (:route_id, :latitude, :longitude, :question_id, :checkpoint_order)";

                $checkpoint = $item['marker'];
                $statement = $pdo->prepare($sql);
                $statement->execute([
                    ':route_id' => $route_id,
                    ':latitude' => $checkpoint['latitude'],
                    ':longitude' => $checkpoint['longitude'],
                    ':question_id' => $question_id,
                    ':checkpoint_order' => $i++ // TODO: checkpoint_order bör komma från App sidan
                ]);
            }

            $response->getBody()->write(json_encode(['route_id' => $route_id]));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(500);
        }


        //$response->getBody()->write(json_encode($json));
        /*$response->getBody()->write(json_encode($json[0]['question']));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);*/
    }

    public function get_all(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $sql = "SELECT
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
ORDER BY r.route_id, c.checkpoint_order, a.answer_id";

        try {
            $db = new Db();
            $conn = $db->connect();
            $stmt = $conn->query($sql);
            $routes = $stmt->fetchAll(PDO::FETCH_OBJ);
            $db = null;

            $response->getBody()->write(json_encode($routes));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(500);
        }
    }

    public function get_checkpoint(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $sql = "SELECT
            q.question_text,
            a.answer_text,
            a.is_correct
            FROM questions q
            JOIN answers a ON q.question_id = a.question_id
        WHERE q.question_id = :id
        ORDER BY q.question_id";

        $db = new Db();
        $conn = $db->connect();
        $stmt = $conn->prepare($sql);

        $id = $args['id'];
        $stmt->bindParam(":id", $id);
        $questions = $stmt->fetchAll(PDO::FETCH_OBJ);

        $db = null;
        $result = [];
        if (count($questions) > 0) {
            $result = (object) array('question' => $questions[0]->question_text, "answers" => array());
            foreach ($questions as $question) {
                $result["answers"] = (object) array("text" => $question->answer_text, "is_correct" => $question->is_correct);
            }
        }

        $result = (object) array('question' => $questions[0]->question_text, "answers" => array());
        foreach ($questions as $question) {
            $result["answers"] = (object) array("text" => $question->answer_text, "is_correct" => $question->is_correct);
        }

        foreach ($result as $value) {
            $response->getBody()->write($value->question_text);
            echo "\n";
            foreach ($value->answers as $answer) {
                echo $answer->answer_text;
                echo "\n";
            }
        }
        $response->getBody()->write("Hej");
        return $response;
        /*$response->getBody()->write(json_encode($result));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);*/
    }
}