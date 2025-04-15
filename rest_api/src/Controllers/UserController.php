<?php

//namespace Controllers;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Modules\DB;
use Psr\Log\LoggerInterface;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

require __DIR__ . '/../../src/Models/DB.php';



class UserController
{

    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function login(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface {
        $params = $request->getParsedBody();
        $username = $params['username'] ?? '';
        $password = $params['password'] ?? '';

        // 1. Verifiera användare (t.ex. kolla i DB om password + username stämmer)
        $db = new Db();
        $conn = $db->connect();

        $sql = "SELECT * FROM users WHERE username = :username LIMIT 1";

        $stmt = $conn->prepare($sql);
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password'])) {
            // 2. Skapa JWT-payload
            $payload = [
                'iss' => 'http://tipsdigitial.mygamesonline.org', // issuer
                'aud' => 'http://tipsdigitial.mygamesonline.org', // audience
                'iat' => time(),               // issued at
                'nbf' => time(),               // token kan inte användas före denna tid
                'exp' => time() + (60 * 60),   // när den slutar gälla (ex: 1 timme)
                'data' => [
                    //'user_id' => 12345,
                    'user_id' => $user['id'],
                    'roles'   => ['app']
                ]
            ];

            $settings = include __DIR__ . '/../../config/settings.php';
            $secret_key = $settings['jwt']['secret_key'];

            // 3. Generera JWT
            $jwt = JWT::encode($payload, $secret_key, 'HS256');

            // 4. Returnera JSON-svar med token
            $responseData = [
                'error' => false,
                'token' => $jwt,
                'user' => $user['id'],
                'playerName' => $user['player_name'],
                'message' => 'Login succeeded'
            ];

            $response->getBody()->write(json_encode($responseData));

            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
        } else {
            $responseData = [
                'error' => true,
                'token' => null,
                'user' => null,
                'message' => 'Login failed, wrong password or username'
            ];

            $response->getBody()->write(json_encode($responseData));

            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
        }
    }

    public function register(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface {
        $params = $request->getParsedBody();
        $username = $params['username'] ?? '';
        $password = $params['password'] ?? '';

        $logger = $this->logger;
        if (empty($username) || empty($password)) {
            $logger->error("Username or password is empty. username: $username, password: $password");

            $response->getBody()->write(json_encode(['error' => 'Username or password is empty']));
            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(401);
        }

        $db = new Db();
        $pdo = $db->connect();

        $sql = "SELECT COUNT(*) AS num FROM users WHERE username = :username";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([':username' => $username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user['num'] > 0) {
            $logger->error("Username '$username' already exists");
            $response->getBody()->write(json_encode(['error' => 'Username already exists']));
            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(409);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO users (username, password, player_name) VALUES (:username, :password, :player_name)";
        $stmt = $pdo->prepare($sql);

        try {
            $stmt->execute([
                ':username' => $username,
                ':password' => $hashedPassword,
                ':player_name' => 'Player 1'
            ]);

            $last_insert_id = $pdo->lastInsertId();

            $responseData = [
                'error' => false,
                'message' => 'Register succeeded',
                'userId' => $last_insert_id
            ];
            $response->getBody()->write(json_encode($responseData));

            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $logger->error("Can not register: " . $e->getMessage());
            //$logger->error("Can not register. username: $username, password: $password, hashedPassword: $hashedPassword");
            $response->getBody()->write(json_encode(['error' => 'Can not register']));
            return $response->withHeader('Content-Type', 'application/json')
                ->withStatus(401);
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
                throw new InvalidArgumentException('Player id was not found');
            }

            $db = null;

            $response->getBody()->write(json_encode(['error' => false]));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        } catch (PDOException $e) {
            $error = array(
                "error" => true,
                "message" => $e->getMessage(),
            );

            $this->logger->error($error["message"]);

            $response->getBody()->write(json_encode($error));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withHeader('x-error-message', $e->getMessage())
                ->withStatus(500);
        } catch (InvalidArgumentException $e) {
            $message = [
                "error" => true,
                "message" => $e->getMessage(),
            ];
            $response->getBody()->write(json_encode($message));
            return $response
                ->withHeader('content-type', 'application/json')
                ->withStatus(200);
        }
    }

}