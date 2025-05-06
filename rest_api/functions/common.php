<?php


function snakeToCamel($string): string {
    return lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $string))));
}

function mapSnakeToCamel(stdClass $object): stdClass {
    $newObject = new stdClass();

    foreach ($object as $key => $value) {
        $newKey = snakeToCamel($key);
        if (is_object($value)) {
            $newObject->$newKey = mapSnakeToCamel($value);
        } elseif (is_array($value)) {
            $newObject->$newKey = array_map(function($item) {
                return is_object($item) ? mapSnakeToCamel($item) : $item;
            }, $value);
        } else {
            $newObject->$newKey = $value;
        }
    }

    return $newObject;
}