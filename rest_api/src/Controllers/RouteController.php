<?php

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

function snakeToCamel($string): string {
    return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $string))));
}

function mapSnakeToCamel(stdClass $object): stdClass {
    $newObject = new stdClass();

    foreach ($object as $key => $value) {
        $newKey = snakeToCamel($key);
        if (is_object($value)) {
            $newObject->$newKey = mapSnakeToCamel($value);
        } elseif (is_array($value)) {
            $newObject->$newKey = array_map(function($item) {
                return is_object($item) ? mapSnakeToCamel($item) : $item;
            }, $value);
        } else {
            $newObject->$newKey = $value;
        }
    }

    return $newObject;
}


class RouteController
{
    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function add_new(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $json = $request->getParsedBody();

        $this->logger->info("Add routes: " . var_export($json,true));

        $sql_routes = "INSERT INTO routes (owner, name, city, description, is_private, in_order, start_at, end_at)
                       VALUES (:owner, :name, :city, :description, :is_private, :in_order, :start_at, :end_at)";
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql_routes);

            $start_at = null;
            $end_at = null;
            if ($json["startAt"] !== null) {
                $start_at = date("Y-m-d H:i:s", strtotime($json["startAt"]));
            }
            if ($json["endAt"] !== null) {
                $end_at = date("Y-m-d H:i:s", strtotime($json["endAt"]));
            }

            $statement->execute([
                ':owner' => $json["owner"],
                ':name' => $json["name"],
                ':city' => $json["city"],
                ':description' => $json["description"],
                ':is_private' => $json["isPrivate"],
                ':in_order' => $json["inOrder"],
                ':start_at' => $start_at,
                ':end_at' => $end_at,
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
                $sql = "INSERT INTO checkpoints (route_id, latitude, longitude, city, question_id, checkpoint_order)
                        VALUES (:route_id, :latitude, :longitude, :city, :question_id, :checkpoint_order)";

                $checkpoint = $item['marker'];
                $statement = $pdo->prepare($sql);
                $statement->execute([
                    ':route_id' => $route_id,
                    ':latitude' => $checkpoint['latitude'],
                    ':longitude' => $checkpoint['longitude'],
                    ':city' => $checkpoint['city'],
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

    public function edit_route(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $json = $request->getParsedBody();

        $sql = "UPDATE routes SET 
                  owner = :owner, 
                  name = :name, 
                  city = :city, 
                  description = :description, 
                  is_private = :is_private, 
                  in_order = :in_order, 
                  start_at = :start_at, 
                  end_at = :end_at
                  WHERE route_id = :route_id";
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql);

            $start_at = null;
            $end_at = null;
            if ($json["startAt"] !== null) {
                $start_at = date("Y-m-d H:i:s", strtotime($json["startAt"]));
            }
            if ($json["endAt"] !== null) {
                $end_at = date("Y-m-d H:i:s", strtotime($json["endAt"]));
            }

            $statement->execute([
                ':owner' => $json["owner"],
                ':name' => $json["name"],
                ':city' => $json["city"],
                ':description' => $json["description"],
                ':is_private' => $json["isPrivate"],
                ':in_order' => $json["inOrder"],
                ':start_at' => $start_at,
                ':end_at' => $end_at,
                ':route_id' => $json["routeId"]
            ]);

            $sql_question = "UPDATE questions SET question_text = :question_text WHERE question_id = :question_id";

            foreach ($json["data"] as $item) {
                $statement = $pdo->prepare($sql_question);
                $statement->execute([
                    ':question_text' => $item['question'],
                    ':question_id' => $item['questionId']
                ]);

                $answer_sql = "UPDATE answers SET 
                   answer_text = :answer_text, 
                   is_correct = :is_correct 
               WHERE answer_id = :answer_id";

                foreach ($item['answers'] as $answer) {
                    $statement = $pdo->prepare($answer_sql);
                    $statement->execute([
                        ':answer_text' => $answer['text'],
                        ':is_correct' => $answer['isRight'],
                        ':answer_id' => $answer['id']
                    ]);
                }
                $checkpoint_sql = "UPDATE checkpoints SET 
                       latitude = :latitude, 
                       longitude = :longitude, 
                       city = :city,
                       checkpoint_order = :checkpoint_order 
                   WHERE checkpoint_id = :checkpoint_id";

                $checkpoint = $item['marker'];
                $statement = $pdo->prepare($checkpoint_sql);
                $statement->execute([
                    ':latitude' => $checkpoint['latitude'],
                    ':longitude' => $checkpoint['longitude'],
                    ':city' => $checkpoint['city'],
                    ':checkpoint_order' => $checkpoint['markerOrder'],
                    ':checkpoint_id' => $checkpoint['id']
                ]);
            }

            $return = [
                'routeId' => $json["routeId"],
                'message' => 'Successfully updated the route'
            ];

            $response->getBody()->write(json_encode($return));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                'error' => true,
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }
    }

    public function search(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {

        $sql = "SELECT 
                    `route_id`, 
                    `owner`, 
                    `name`, 
                    `city`, 
                    `description`, 
                    IF(`is_private`, 'true', 'false') `is_private`, 
                    IF(`in_order`, 'true', 'false') `in_order`, 
                    `start_at`, 
                    `end_at`,
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

            $this->logger->info("Keyword: $keyword, Result: " . var_export($routes,true));

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
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }

    }

    public function get_route_info(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $sql = "SELECT * FROM `routes` WHERE `route_id` = :route_id";

        try {
            $db = new Db();
            $conn = $db->connect();
            $stmt = $conn->prepare($sql);

            $route_id = (int)$args['id'];
            $stmt->execute([
                ':route_id' => $route_id
            ]);
            $route = $stmt->fetch(PDO::FETCH_OBJ);
            if ($route !== null) {

                $route = mapSnakeToCamel($route);
                $route->inOrder = $route->inOrder === '1';
                $route->isPrivate = $route->isPrivate === '1';
                $response->getBody()->write(json_encode($route));
                return $response
                    ->withHeader('content-type', 'application/json')
                    ->withStatus(200);
            } else {
                throw new \PDOException("Route not found");
            }

        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }
    }

    public function get_checkpoints(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {

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
                    a.answer_id,
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
                        $answers[] = (object) ["id" => $question->answer_id, "text" => $question->answer_text, "isCorrect" => $question->is_correct === '1'];
                    }

                    shuffle($answers);

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
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }
    }

    public function delete_checkpoint(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $route_id = (int)$args['id'];

        try {
            $db = new Db();
            $conn = $db->connect();
        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }


        try {
            // Starta en transaktion för att säkerställa att alla operationer lyckas
            $conn->beginTransaction();

            // Steg 1: Hämta unika question_id från checkpoints som hör till den aktuella route
            $stmt = $conn->prepare("SELECT DISTINCT question_id FROM checkpoints WHERE route_id = :route_id");
            $stmt->bindParam(':route_id', $route_id, PDO::PARAM_INT);
            $stmt->execute();
            $questionIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Steg 2: Om det finns några frågor, ta bort dem
            if (!empty($questionIds)) {
                // Skapa en parameterlista baserat på antalet id:n
                $placeholders = implode(',', array_fill(0, count($questionIds), '?'));
                $stmt = $conn->prepare("DELETE FROM questions WHERE question_id IN ($placeholders)");
                $stmt->execute($questionIds);
            }

            // Steg 3: Ta bort route:n – checkpoints kopplade till denna tas bort automatiskt (ON DELETE CASCADE)
            $stmt = $conn->prepare("DELETE FROM routes WHERE route_id = :route_id");
            $stmt->bindParam(':route_id', $route_id, PDO::PARAM_INT);
            $stmt->execute();

            // Radera route
            $sql = "DELETE FROM routes WHERE route_id = :route_id";
            $stmt = $conn->prepare($sql);

            $stmt->bindParam(':route_id', $route_id, PDO::PARAM_INT);
            $stmt->execute();

            // Avsluta transaktionen
            $conn->commit();

            $result = [
                "error" => false,
                "message" => "The rout with id $route_id has been deleted."
            ];
            $response->getBody()->write(json_encode($result));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (Exception $e) {
            // Återställ transaktionen vid fel
            $conn->rollBack();
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );
            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        }
    }
}