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

use Modules\DB;


require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/Controllers/TestController.php';
require __DIR__ . '/../src/Controllers/UserController.php';
require __DIR__ . '/../src/Controllers/RouteController.php';
require __DIR__ . '/../src/Middlewares/RateLimitMiddleware.php';

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
    } else  {
        $logger->info("Authorization token exists. Authorization: '$auth'");
    }

    if (!isset($_SESSION['USER_AUTHORIZATION'])) {
        $_SESSION['USER_AUTHORIZATION'] = "auth_ShouldBeAnEmptyString";
    }

    if ($_SESSION['USER_AUTHORIZATION'] !== $auth) {
        $response = $app->getResponseFactory()->createResponse();
        $response->getBody()->write('Unauthorized');

        $headers = $request->getHeaders();
        $testResult = "";
        foreach ($headers as $name => $values) {
            $testResult .= $name . ": '" . implode(", ", $values) . "'; ";
        }

        $logger->error("USER_AUTHORIZATION token don't match! All Headers: $testResult");

        return $response->withStatus(401)->withHeader('No-Token-You-Give-Me', 'Yes_you_have');
    } else {
        $logger->info("Authorization token and SESSION['USER_AUTHORIZATION'] is equal. SESSION['USER_AUTHORIZATION']: '{$_SESSION['USER_AUTHORIZATION']}'");
    }

    $_SESSION['USER_AUTHORIZATION'] = uniqid('auth_', true);

    // Proceed with the next middleware
    return $handler->handle($request);
};

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

$app->add($afterMiddleware);

$app->add($beforeMiddleware);



$path = dirname(__FILE__);
$pieces = explode(DIRECTORY_SEPARATOR, $path);
if (count($pieces) >= 2 && $pieces[count($pieces) - 2] === 'slimPhp4Test_Slask') {
    // Måste vara med på min lokala server för att inte få httpNotFoundException på vissa klasser
    $app->setBasePath('/myProjects/slimPhp4Test_Slask');
}


// Bör tas bort vid prodution
$app->addErrorMiddleware(true, true, true);

$app->get('/', function (Request $request, Response $response, $args) {
    //$logger = $this->get('logger');
    //$logger->info("Hello World");

    $response->getBody()->write("Hello world!");
    return $response;
});

$app->get('/users/all', \UserController::class . ':get_all');
$app->get('/controller', \TestController::class . ':test');
$app->get('/routes/all', \RouteController::class . ':get_all');
$app->get('/checkpoint/{id}', \RouteController::class . ':get_checkpoint');

$app->run();