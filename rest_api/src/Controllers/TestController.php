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
        $this->logger->info("Test Controller");
        $response->getBody()->write("Hello Test!");
        return $response;
    }

}