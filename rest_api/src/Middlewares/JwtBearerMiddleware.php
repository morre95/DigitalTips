<?php

use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Psr\Log\LoggerInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtBearerMiddleware implements MiddlewareInterface
{
    private string $secret_key;
    private LoggerInterface $logger;
    private ResponseFactoryInterface $responseFactory;
    public function __construct(ResponseFactoryInterface $responseFactory, LoggerInterface $logger) {
        $this->responseFactory = $responseFactory;
        $this->logger = $logger;

        $settings = include __DIR__ . '/../../config/settings.php';
        $secret_key = $settings['jwt']['secret_key'];
        $this->secret_key = $secret_key;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $authHeader = $request->getHeaderLine('Authorization');

        $logger = $this->logger;
        if (!$authHeader) {
            // Ingen header => 401
            $logger->error("No token provided");
            $response = $this->responseFactory->createResponse();
            $response->getBody()->write(json_encode(['error' => 'No token provided']));
            return $response->withStatus(401);
        }

        // Förväntat format: "Bearer_<token>"
        if (preg_match('/^Bearer_(\S+)/', $authHeader, $matches)) {
            $jwt = $matches[1];
        } else {
            $logger->error("Token format is invalid: $authHeader");

            $response = $this->responseFactory->createResponse();
            $response->getBody()->write(json_encode(['error' => 'Token format is invalid']));
            return $response->withStatus(401);
        }

        try {
            // Dekodning och validering av token
            $decoded = JWT::decode($jwt, new Key($this->secret_key, 'HS256'));
            // Token är giltig -> skriv till request attribut ifall man vill komma åt i routen
            $request = $request->withAttribute('decoded_token', $decoded);
        } catch (\Exception $e) {
            // Token invalid / utgången
            $logger->error("Token is invalid or expired: " . $e->getMessage());

            $response = $this->responseFactory->createResponse();
            $response->getBody()->write(json_encode(['error' => 'Token is invalid or expired']));
            return $response->withStatus(401);
        }

        // Allt gick bra -> fortsätt
        return $handler->handle($request);
    }
}