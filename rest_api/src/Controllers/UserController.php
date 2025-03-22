<?php

//namespace Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

require __DIR__ . '/../../src/Models/DB.php';



class UserController
{

    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function get_google_api_key(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface {
        $sql = "SELECT secret FROM secrets WHERE `name` = :key";
        try {
            $db = new Db();
            $conn = $db->connect();
            $statement = $conn->prepare($sql);
            $statement->execute([
                ':key' => 'GOOGLE_MAP_API_KEY'
            ]);
            $result = $statement->fetchAll(PDO::FETCH_OBJ);
            $db = null;

            $response->getBody()->write(json_encode(['apiKey' => $result["secret"]]));
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

    public function change_player_name(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface {
        $sql = "SELECT COUNT(*) AS num FROM users WHERE id = :id";
        try {
            $params = $request->getParsedBody();

            $db = new Db();
            $conn = $db->connect();
            $statement = $conn->prepare($sql);
            $statement->execute([
                ':id' => $params['userId']
            ]);
            $count = $statement->fetch(PDO::FETCH_OBJ)->num;

            if ((int)$count === 1) {
                $sql = "UPDATE users SET player_name = :name WHERE id = :id";
                $statement = $conn->prepare($sql);
                $statement->execute([
                    ':name' => $params['playerName'],
                    ':id' => $params['userId']
                ]);
            } else {
                // TBD: kanske inte ska vara PDOException(). Men för att slippa skapa ett catch block till så får detta duga
                throw new PDOException('Player id was not found');
            }

            $db = null;

            $response->getBody()->write(json_encode(['error' => false]));
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