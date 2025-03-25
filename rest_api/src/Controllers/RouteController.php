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
        $json = $request->getParsedBody();

        $this->logger->info("Add routes: " . var_export($json,true));

        $sql_routes = "INSERT INTO routes (owner, name, city, description, is_private, in_order)
                       VALUES (:owner, :name, :city, :description, :is_private, :in_order)";
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql_routes);

            $statement->execute([
                ':owner' => $json["owner"],
                ':name' => $json["name"],
                ':city' => $json["city"],
                ':description' => $json["description"],
                ':is_private' => $json["isPrivate"],
                ':in_order' => $json["inOrder"],
            ]);
            $route_id = $pdo->lastInsertId();

            $sql_question = "INSERT INTO questions (question_text)
                             VALUES (:question_text)";

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
                    ':checkpoint_order' => $checkpoint['markerOrder'] 
                ]);
            }

            $json = [
                'routeId' => $route_id,
                'message' => 'Successfully saved routes'
            ];

            $response->getBody()->write(json_encode($json));
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

    public function search(ServerRequestInterface $request, ResponseInterface $response, $args) {

        $sql = "SELECT 
                    `route_id`, 
                    `owner`, 
                    `name`, 
                    `city`, 
                    `description`, 
                    IF(`is_private`, 'true', 'false') `is_private`, 
                    IF(`in_order`, 'true', 'false') `in_order`, 
                    `created_at`, 
                    `updated_at` 
                FROM `routes` 
                    WHERE `name` 
                        LIKE :keyword OR `description` LIKE :keyword2";

        try {
            $db = new Db();
            $conn = $db->connect();
            $stmt = $conn->prepare($sql);

            $keyword = "%{$args["keyword"]}%";
            $stmt->bindValue(":keyword", $keyword, PDO::PARAM_STR);
            $stmt->bindValue(":keyword2", $keyword, PDO::PARAM_STR);
            $stmt->execute();
            $routes = $stmt->fetchAll(PDO::FETCH_OBJ);

            for($i = 0; $i < count($routes); $i++) {
                $route = $routes[$i];

                $sql = "SELECT COUNT(*) as num FROM `checkpoints` WHERE `route_id` = :route_id";
                $stmt = $conn->prepare($sql);
                $stmt->bindValue(":route_id", $route->route_id, PDO::PARAM_INT);
                $stmt->execute();
                
                $marker_count = $stmt->fetch(PDO::FETCH_OBJ);
                $routes[$i]->marker_count = $marker_count->num;

                // Konvertera från sträng till boolean
                $routes[$i]->is_private = $routes[$i]->is_private === 'true';
                $routes[$i]->in_order = $routes[$i]->in_order === 'true';
            }

            $db = null;

            $this->logger->info("Search routes: " . var_export($routes,true));

            $result = (object) [
                "routes" => $routes,
                "count" => count($routes),
                "error" => false
            ];

            $response->getBody()->write(json_encode($result));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(500);
        }

    }

    public function get_checkpoints(ServerRequestInterface $request, ResponseInterface $response, $args) {

        try {
            $db = new Db();
            $sql = "SELECT * FROM checkpoints WHERE route_id = :route_id";
            $conn = $db->connect();
            $stmt = $conn->prepare($sql);

            $id = $args['id'];
            $stmt->bindParam(":route_id", $id);
            $stmt->execute();

            $checkpoints = $stmt->fetchAll(PDO::FETCH_OBJ);

            $result = ["checkpoints" => []];
            foreach ($checkpoints as $checkpoint) {
                $sql = "SELECT
                    q.question_text,
                    a.answer_text,
                    a.is_correct
                    FROM questions q
                    JOIN answers a ON q.question_id = a.question_id
                WHERE q.question_id = :question_id
                ORDER BY q.question_id";
                $stmt = $conn->prepare($sql);

                $question_id = $checkpoint->question_id;
                $stmt->bindValue(":question_id", $question_id);
                $stmt->execute();

                $questions = $stmt->fetchAll(PDO::FETCH_OBJ);

                if (count($questions) > 0) {
                    $answers = [];
                    foreach ($questions as $question) {
                        $answers[] = (object) ["text" => $question->answer_text, "isCorrect" => $question->is_correct === '1'];
                        $this->logger->info("question: " . var_export($question,true));
                    }
                    $checkpoint->question = new stdClass();
                    $checkpoint->question->text = $questions[0]->question_text;
                    $checkpoint->question->answers = $answers;
                    $result["checkpoints"][] = $checkpoint;
                } else {
                    // TBD: Hit ska inte skritet komma eftersom alla checkpoints ska ha frågor. Men om det är något fel i appen så finns det ett meddelande i alla fall
                    $result = (object) array(
                        "error" => true,
                        "message" => 'No question found'
                    );
                    break;
                }
            }

            $response->getBody()->write(json_encode($result));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(500);
        }
    }
}