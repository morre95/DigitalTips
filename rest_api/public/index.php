<?php
session_status();
use Psr\Http\Message\ResponseInterface;
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
require __DIR__ . '/../src/Controllers/TestController.php';
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

    if (/*$username === 'demo' && $password === 'secret'*/ $user && password_verify($password, $user['password'])) {
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
            'message' => 'Login succeeded'
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
    $response->getBody()->write(json_encode(['error' => 'Invalid credentials']));
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

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $db = new Db();
    $pdo = $db->connect();
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
        $logger->error("Can not register. username: $username, password: $password, hashedPassword: $hashedPassword");
        $response->getBody()->write(json_encode(['error' => 'Can not register']));
        return $response->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
});

$jwtMiddleware = function (Request $request, $handler) use ($secret_key, $app) {
    // Läs av Authorization-header
    $authHeader = $request->getHeaderLine('Authorization');
    if (!$authHeader) {
        // Ingen header => 401
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write(json_encode(['error' => 'No token provided']));
        return $response->withStatus(401);
    }

    // Förväntat format: "Bearer <token>"
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $jwt = $matches[1];
    } else {
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

    $logger = get_logger($app->getContainer());
    if (!$auth) {

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

// TBD: Denna bör kollas om den behövs
$afterMiddleware = function (Request $request, RequestHandler $handler) {
    // Proceed with the next middleware
    $response = $handler->handle($request);

    if (!isset($_SESSION['USER_AUTHORIZATION'])) {
        $_SESSION['USER_AUTHORIZATION'] = "auth_ShouldBeAnEmptyString";
    }

    // Modify the response after the application has processed the request
    return $response->withHeader('X-New-User-Auth', $_SESSION['USER_AUTHORIZATION']);
};

$db = new Db();
$rateLimitMiddleware = new RateLimitMiddleware($db->connect(), 100, 60, get_logger($app->getContainer()));
$app->add($rateLimitMiddleware);

//$app->add($afterMiddleware);

$app->add($beforeMiddleware);



$path = dirname(__FILE__);
$pieces = explode(DIRECTORY_SEPARATOR, $path);
if (count($pieces) >= 2 && $pieces[count($pieces) - 2] === 'slimPhp4Test_Slask') {
    // Måste vara med på min lokala server för att inte få httpNotFoundException på vissa klasser
    $app->setBasePath('/myProjects/slimPhp4Test_Slask');
}


// TBD: Bör tas bort vid prodution
$app->addErrorMiddleware(true, true, true);

$app->get('/', function (Request $request, Response $response, $args) {
    //$logger = $this->get('logger');
    //$logger->info("Hello World");

    $response->getBody()->write("Hello world!");
    return $response;
});

$app->get('/users/all', \UserController::class . ':get_all');
$app->get('/json/test', \TestController::class . ':test');
$app->get('/routes/all', \RouteController::class . ':get_all');
$app->get('/checkpoint/{id}', \RouteController::class . ':get_checkpoint');

$app->post('/post/test', function (Request $request, Response $response) {
    $params = $request->getParsedBody();
    $foo = $params['foo'] ?? '';
    $bar = $params['bar'] ?? '';

    $responseData = [
        'error' => false,
        'message' => "Who would have thought that $foo is in love with $bar"
    ];
    $response->getBody()->write(json_encode($responseData));

    return $response->withHeader('Content-Type', 'application/json')
        ->withStatus(200);
});

// Alla API calls som behöver skyddas behöver ligga under den här gruppen
// TODO: behöver provköras
$app->group('/api', function (\Slim\Routing\RouteCollectorProxy $group) {
    $group->get('/protected', function (Request $request, Response $response) {
        // Här är route som är skyddad
        $decoded = $request->getAttribute('decoded_token');
        $response->getBody()->write(json_encode([
            'success' => true,
            'decoded' => $decoded
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });
})->add($jwtMiddleware);

$app->run();