<?php

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

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

        $sql = "SELECT * FROM results WHERE user_id = :user_id";

        $this->logger->info("get_my_results(): $sql, $user_id");

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

                $name = $statement->fetch(PDO::FETCH_OBJ);
                $result->name = $name->name;
                $newResults[] = mapSnakeToCamel($result);
            }
        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage()
            );

            $this->logger->error('Något gick helt fel');
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

        $this->logger->info(var_export($json, true));

        $response->getBody()->write(json_encode($json));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);
    }

    public function get_leaderboard(ServerRequestInterface $request, ResponseInterface $response, $args): ResponseInterface {
        $route_id = (int)$args["route_id"];

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

        // Best result per player for this route, ranked by most correct then
        // fewest incorrect, tie-broken by who achieved it first.
        // Requires window functions (MySQL 8 / MariaDB 10.2+).
        $sql = "SELECT user_id, name, correct, incorrect, not_answered, created_at FROM (
                    SELECT r.user_id,
                           u.player_name AS name,
                           r.correct,
                           r.incorrect,
                           r.not_answered,
                           r.created_at,
                           ROW_NUMBER() OVER (
                               PARTITION BY r.user_id
                               ORDER BY r.correct DESC, r.incorrect ASC, r.created_at ASC
                           ) AS rn
                    FROM results r
                    JOIN users u ON u.id = r.user_id
                    WHERE r.route_id = :route_id
                ) ranked
                WHERE ranked.rn = 1
                ORDER BY correct DESC, incorrect ASC, created_at ASC";

        $leaderboard = [];
        try {
            $db = new Db();
            $pdo = $db->connect();
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':route_id' => $route_id,
            ]);
            $rows = $statement->fetchAll(PDO::FETCH_OBJ);

            foreach ($rows as $row) {
                $leaderboard[] = mapSnakeToCamel($row);
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
            'message' => 'Successfully getting leaderboard',
            'leaderboard' => $leaderboard
        ];

        $response->getBody()->write(json_encode($json));
        return $response
            ->withHeader('content-type', 'application/json')
            ->withStatus(200);
    }
}