<?php


use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

class TestController
{

    private $logger;

    public function __construct(LoggerInterface $logger) {
        $this->logger = $logger;
    }

    public function test(ServerRequestInterface $request, ResponseInterface $response, array $args): ResponseInterface
    {
        //$this->container['logger']->addInfo("Test Controller");
        $this->logger->info("Test Controller: url = json/test");



        $result = [
            (object) array(
                'key' => '1',
                'title' => 'Titel 1',
                'description' => 'Beskrivning 1',
                'is_right' => (bool)rand(0, 1),
            ),
            (object) array(
                'key' => '2',
                'title' => 'Titel 2',
                'description' => 'Beskrivning 2',
                'is_right' => (bool)rand(0, 1),
            ),
            (object) array(
                'key' => '3',
                'title' => 'Titel 3',
                'description' => 'Beskrivning 3',
                'is_right' => (bool)rand(0, 1),
            )
        ];
        $response->getBody()->write(json_encode($result));
        return $response;
    }

}