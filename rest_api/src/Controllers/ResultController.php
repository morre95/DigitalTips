<?php

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

require '../../functions/common.php';

class ResultController
{
    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function add_result(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $params = $request->getParsedBody();
        $route_id = (int)$params['route_id'];
        $user_id = (int)$params['user_id'];
        $correct = (int)$params['correct'];
        $incorrect = (int)$params['incorrect'];
        $not_answered = (int)$params['not_answered'];

        if ($route_id <= 0) {
            $error = array(
                "error" => true,
                "message" => "No route with that id"
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(500);
        }

        $sql = "INSERT INTO results (route_id, user_id, correct, incorrect, not_answered)
                VALUES (:route_id, :user_id, :correct, :incorrect, :not_answered)";

        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':route_id' => $route_id,
                ':user_id' => $user_id,
                ':correct' => $correct,
                ':incorrect' => $incorrect,
                ':not_answered' => $not_answered,
            ]);
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

        $json = [
            'error' => false,
            'message' => 'Successfully saved result',
        ];

        $response->getBody()->write(json_encode($json));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);
    }

    public function get_my_results(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $user_id = $args["user_id"];

        $sql = "SELECT * FROM results WHERE user_id = ?";

        $newResults = [];
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':user_id' => $user_id,
            ]);
            $results = $statement->fetchAll(PDO::FETCH_OBJ);

            $sql = "SELECT name FROM routes WHERE route_id = :route_id";
            foreach ($results as $result) {
                $statement = $pdo->prepare($sql);

                $statement->execute([
                    ':route_id' => $result->route_id,
                ]);

                $name = $statement->fetch(PDO::FETCH_OBJ)->name;
                $result->name = $name;
                $newResults[] = mapSnakeToCamel($result);
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
                ->withStatus(500);
        }

        $json = [
            'error' => false,
            'message' => 'Successfully getting result',
            'results' => $newResults
        ];

        $response->getBody()->write(json_encode($json));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);
    }
}