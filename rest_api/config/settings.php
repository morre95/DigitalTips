<?php
$env = parse_ini_file('.env');
return [
    'db' =>
    [
        'host' => $env['DB_host'],
        'user' => $env['DB_user'],
        'pass' => $env['DB_pass'],
        'dbname' => $env['DB_dbname'],
        'port' => $env['DB_port'],
    ],
    'jwt' => [
       'secret_key' => $env['JWT_secret_key']
    ],
];