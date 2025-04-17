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
$rateLimitMiddleware = new RateLimitMiddleware($db->connect(), 1000, 60, get_logger($app->getContainer()));
$app->add($rateLimitMiddleware);

$app->add($beforeMiddleware);


$path = dirname(__FILE__);
$pieces = explode(DIRECTORY_SEPARATOR, $path);
if (count($pieces) >= 2 && $pieces[count($pieces) - 2] === 'slimPhp4Test_Slask') {
    // Måste vara med på min lokala server för att inte få httpNotFoundException på vissa klasser
    $app->setBasePath('/myProjects/slimPhp4Test_Slask');
}

$app->get('/', function (Request $request, Response $response, $args) {
    $response->getBody()->write("You are not authorised to be here!!!");
    return $response;
});

$app->get('/ping', function (Request $request, Response $response, $args) {

    $response->getBody()->write(json_encode([
        'ping' => 'pong',
        'timestamp' => time(),
    ]));

    return $response->withHeader('Content-Type', 'application/json')
        ->withStatus(200);
});

$app->post('/login', UserController::class . ':login');
$app->post('/register', UserController::class . ':register');

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

// Alla API calls som behöver skyddas behöver ligga under den här gruppen
$app->group('/api', function (\Slim\Routing\RouteCollectorProxy $group) {
    $group->get('/delete/checkpoint/{id}', RouteController::class . ':delete_checkpoint');
    $group->get('/get/route/info/{id}', RouteController::class . ':get_route_info');
    $group->get('/search/routes/{keyword}', \RouteController::class . ':search');
    $group->get('/get/checkpoints/{id}', \RouteController::class . ':get_checkpoints');
    $group->get('/get/my/routes/{owner}', \RouteController::class . ':get_my_routes');

    $group->post('/add/routes', \RouteController::class . ':add_new');
    $group->post('/edit/route', \RouteController::class . ':edit_route');
    $group->post('/change/player/name', \UserController::class . ':change_player_name');
})->add($jwtMiddleware);


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

$app->run();