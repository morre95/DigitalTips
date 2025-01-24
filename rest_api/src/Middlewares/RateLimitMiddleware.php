<?php

//namespace Middlewares;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

// TODO: sätt upp ett cronjob som kör "DELETE FROM `rate_limit` WHERE `expires_at` < UNIX_TIMESTAMP();" så tabellen inte inte blir för stor


class RateLimitMiddleware implements MiddlewareInterface
{
    private $pdo;
    private $limit;       // max antal anrop tillåtna
    private $timeWindow;  // i sekunder

    private $logger;

    public function __construct(PDO $pdo, int $limit, int $timeWindow, Monolog\Logger $logger)
    {
        $this->pdo = $pdo;
        $this->limit = $limit;
        $this->timeWindow = $timeWindow;
        $this->logger = $logger;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // Exempel: använd IP-adressen för att identifiera klient
        $ip = $request->getServerParams()['REMOTE_ADDR'] ?? 'unknown';

        // Hämta information om nuvarande rate limit för denna klient
        $stmt = $this->pdo->prepare("SELECT `id`, `count`, `expires_at`
                                     FROM `rate_limit`
                                     WHERE `client_key` = :key
                                     LIMIT 1");
        $stmt->execute(['key' => $ip]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        $now = time();
        $newCount = 1;
        $expiresAt = $now + $this->timeWindow;

        if (!$record) {
            // Finns ingen post för denna klient, då skapar vi en

            $insertStmt = $this->pdo->prepare("INSERT INTO `rate_limit`
                (`client_key`, `count`, `expires_at`) VALUES (:key, :count, :expires_at)");
            $insertStmt->execute([
                'key'        => $ip,
                'count'      => 1,
                'expires_at' => $expiresAt
            ]);
        } else {
            // Finns redan en post, kolla om intervallet har löpt ut
            if ($now > $record['expires_at']) {
                // Intervallet har gått ut, börja om på nytt
                //$expiresAt = $now + $this->timeWindow;
                $updateStmt = $this->pdo->prepare("UPDATE `rate_limit`
                    SET `count` = 1, `expires_at` = :expires_at
                    WHERE `id` = :id");
                $updateStmt->execute([
                    'expires_at' => $expiresAt,
                    'id'         => $record['id']
                ]);
            } else {
                // Intervallet gäller fortfarande, kolla om gränsen är nådd
                if ($record['count'] >= $this->limit) {
                    // För många anrop => returnera 429
                    $response = new Response();
                    $response->getBody()->write('Too many requests. Please try again later.');

                    $this->logger->warning("Too many requests by: {$ip}");
                    return $response->withStatus(429);
                }
                // Öka räknaren
                $updateStmt = $this->pdo->prepare("UPDATE `rate_limit`
                    SET `count` = `count` + 1
                    WHERE `id` = :id");
                $updateStmt->execute(['id' => $record['id']]);

                $newCount = $record['count'] + 1;
            }
        }

        // Om vi kom hit har vi inte nått gränsen, så skicka vidare
        $response = $handler->handle($request);
        return $response
            ->withHeader('X-RateLimit-Limit', $this->limit)
            ->withHeader('X-RateLimit-Remaining', $this->limit - $newCount)
            ->withHeader('X-RateLimit-Reset', $expiresAt);
    }
}