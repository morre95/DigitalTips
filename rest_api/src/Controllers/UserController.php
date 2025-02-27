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
    public function get_all(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        $sql = "SELECT * FROM users";
        try {
            $db = new Db();
            $conn = $db->connect();
            $stmt = $conn->query($sql);
            $users = $stmt->fetchAll(PDO::FETCH_OBJ);
            $db = null;

            $response->getBody()->write(json_encode($users));
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
}