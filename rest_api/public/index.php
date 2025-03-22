<?php
session_status();
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Container\ContainerInterface;
use Psr\Log\LoggerInterface;
use DI\ContainerBuilder;
use Slim\Factory\AppFactory;
use Slim\Psr7\Response;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

use Modules\DB;


require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Controllers/UserController.php';
require __DIR__ . '/../src/Controllers/RouteController.php';
require __DIR__ . '/../src/Middlewares/RateLimitMiddleware.php';

$settings = include __DIR__ . '/../config/settings.php';

function get_logger(ContainerInterface $c): \Monolog\Logger
{
    $logger = new \Monolog\Logger('my_logger');
    $file_handler = new \Monolog\Handler\StreamHandler('../logs/app.log');
    $logger->pushHandler($file_handler);
    return $logger;
}

$containerBuilder = new ContainerBuilder();
$containerBuilder->addDefinitions([
    LoggerInterface::class => function (ContainerInterface $c) {
        return get_logger($c);
    },
]);

try {
    AppFactory::setContainer($containerBuilder->build());
} catch (Exception $e) {
    die("Something with DI went wrong: " . $e->getMessage());
}

$app = AppFactory::create();

$app->addBodyParsingMiddleware();

$secret_key = $settings['jwt']['secret_key'];

$app->post('/login', function (Request $request, Response $response) use ($secret_key, $app) {
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
    } else if ($user) {
        $responseData = [
            'error' => true,
            'token' => null,
            'user' => null,
            'message' => 'Login failed'
        ];

        $response->getBody()->write(json_encode($responseData));

        return $response->withHeader('Content-Type', 'application/json')
            ->withStatus(200);
    }

    $logger = get_logger($app->getContainer());

    //$logger->error("JWT error: Invalid credentials: DBuser = {$user['username']}, DBpass = {$user['password']}, username = $username, password = $password");

    $loggStr = "JWT error: Invalid credentials";

    if ($user)
    foreach ($user as $item) {
        $loggStr += " $item,";
    }

    $logger->error($loggStr);
    // Felaktiga användaruppgifter
    $response->getBody()->write(json_encode(['error' => 'Invalid credentials', 'message' => 'Can not create JWT token']));
    return $response->withHeader('Content-Type', 'application/json')
        ->withStatus(401);
});

$app->post('/register', function (Request $request, Response $response) use ($secret_key, $app) {
    $params = $request->getParsedBody();
    $username = $params['username'] ?? '';
    $password = $params['password'] ?? '';

    $logger = get_logger($app->getContainer());
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

    $sql = "INSERT INTO users (username, password) VALUES (:username, :password)";
    $stmt = $pdo->prepare($sql);

    try {
        $stmt->execute([
            ':username' => $username,
            ':password' => $hashedPassword
        ]);
        $responseData = [
            'error' => false,
            'message' => 'Register succeeded'
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
});

$jwtMiddleware = function (Request $request, $handler) use ($secret_key, $app) {
    // Läs av Authorization-header
    $authHeader = $request->getHeaderLine('Authorization');

    $logger = get_logger($app->getContainer());
    if (!$authHeader) {
        // Ingen header => 401
        $logger->error("No token provided");
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => 'No token provided']));
        return $response->withStatus(401);
    }

    // Förväntat format: "Bearer_<token>"
    if (preg_match('/^Bearer_(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
    } else {
        $logger->error("Token format is invalid: $authHeader");

        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => 'Token format is invalid']));
        return $response->withStatus(401);
    }

    try {
        // Dekodning och validering av token
        $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
        // Token är giltig -> skriv till request attribut ifall man vill komma åt i routen
        $request = $request->withAttribute('decoded_token', $decoded);
    } catch (\Exception $e) {
        // Token invalid / utgången
        $logger->error("Token is invalid or expired: " . $e->getMessage());

        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => 'Token is invalid or expired']));
        return $response->withStatus(401);
    }

    // Allt gick bra -> fortsätt
    return $handler->handle($request);
};

// TBD: om alla api calls behöver JWT token bör denna göras om till $jwtMiddleware
$beforeMiddleware = function (Request $request, RequestHandler $handler) use ($app) {
    // Example: Check for a specific header before proceeding
    $auth = $request->getHeaderLine('Authorization');

    if (!$auth) {
        $logger = get_logger($app->getContainer());

        $headers = $request->getHeaders();
        $testResult = "";
        foreach ($headers as $name => $values) {
            $testResult .= $name . ": '" . implode(", ", $values) . "'; ";
        }
        // Short-circuit and return a response immediately
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write('Unauthorized');


        $logger->error("Unauthorized don't exists. All Headers: $testResult");

        return $response->withStatus(401)->withHeader('Unauthorized', 'You_are');
    }

    // Proceed with the next middleware
    return $handler->handle($request);
};

$db = new Db();
$rateLimitMiddleware = new RateLimitMiddleware($db->connect(), 100, 60, get_logger($app->getContainer()));
$app->add($rateLimitMiddleware);

$app->add($beforeMiddleware);


$path = dirname(__FILE__);
$pieces = explode(DIRECTORY_SEPARATOR, $path);
if (count($pieces) >= 2 && $pieces[count($pieces) - 2] === 'slimPhp4Test_Slask') {
    // Måste vara med på min lokala server för att inte få httpNotFoundException på vissa klasser
    $app->setBasePath('/myProjects/slimPhp4Test_Slask');
}


/**
 * Add Error Middleware
 *
 * @param bool                  $displayErrorDetails -> Should be set to false in production
 * @param bool                  $logErrors -> Parameter is passed to the default ErrorHandler
 * @param bool                  $logErrorDetails -> Display error details in error log
 * @param LoggerInterface|null  $logger -> Optional PSR-3 Logger
 *
 * Note: This middleware should be added last. It will not handle any exceptions/errors
 * for middleware added after it.
 */
$errorMiddleware = $app->addErrorMiddleware(true, true, true, get_logger($app->getContainer()));

$app->get('/', function (Request $request, Response $response, $args) {
    //$logger = $this->get('logger');
    //$logger->info("Hello World");

    $response->getBody()->write("Hello world!");
    return $response;
});


$app->post('/add/routes', \RouteController::class . ':add_new');

$app->get('/search/routes/{keyword}', \RouteController::class . ':search');
$app->get('/get/checkpoints/{id}', \RouteController::class . ':get_checkpoints');

$app->post('/change/player/name', \UserController::class . ':change_player_name');

// Alla API calls som behöver skyddas behöver ligga under den här gruppen
$app->group('/api', function (\Slim\Routing\RouteCollectorProxy $group) {
    $group->get('/get/google/key', UserController::class . ':get_google_api_key');
})->add($jwtMiddleware);

$app->run();