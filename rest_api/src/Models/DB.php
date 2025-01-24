<?php

namespace Modules;

use PDO;
use Psr\Container\ContainerInterface;

class DB
{
    private $host;
    private $user;
    private $pass;
    private $dbname;
    private $port;

    public function __construct() {
        $settings = include __DIR__ . '/../../config/settings.php';
        $this->host = $settings['db']['host'];
        $this->user = $settings['db']['user'];
        $this->pass = $settings['db']['pass'];
        $this->dbname = $settings['db']['dbname'];
        $this->port = $settings['db']['port'];
    }

    public function connect(): PDO
    {
        $conn_str = "mysql:port=$this->port;host=$this->host;dbname=$this->dbname";
        //$conn_str = "mysql:host=$this->host;dbname=$this->dbname";
        $conn = new PDO($conn_str, $this->user, $this->pass);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $conn;
    }
}