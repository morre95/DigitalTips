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