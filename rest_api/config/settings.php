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


        /*'host' => 'localhost',
        'user' => 'root',
        'pass' => '',
        'dbname' => 'slimphp_test_project',
        'port' => 3306,*/

        /*'host' => 'fdb1030.awardspace.net',
        'user' => '4578710_tipsdigital',
        'pass' => 'Bananpaj123_',
        'dbname' => '4578710_tipsdigital',
        'port' => 3306,*/
    ]
];