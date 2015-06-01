<?php

require('ScalrAPI.php');

//Read config
$creds = @file_get_contents('config.json');
if (!$creds) die('config.json file is missing.');

$config = json_decode($creds);

$scalr = new ScalrAPI($config->api_url, $config->api_key_id, $config->api_key_secret);

// LIST OPERATING SYSTEMS
try {
	$list = $scalr->scroll('/api/user/v1beta0/os/?family=ubuntu');
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($list);


/*

// FETCH SPECIFIC OPERATING SYSTEM
try {
	$item = $scalr->fetch(sprintf('/api/user/v1beta0/os/%s', 'ubuntu-10-10'));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
print_r($item);


// LIST ROLE CATEGORIES
try {
	$list = $scalr->scroll(sprintf('/api/user/v1beta0/%s/role-categories/', $config->env_id));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($list);


// FETCH SPECIFIC ROLE CATEGORY
try {
	$item = $scalr->fetch(sprintf('/api/user/v1beta0/%s/role-categories/%s', $config->env_id, '8'));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($item);


// LIST ALL ROLES
try {
	$list = $scalr->scroll(sprintf('/api/user/v1beta0/%s/roles/', $config->env_id));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
print_r($list);


// FETCH SPECIFIC ROLE
try {
	$item = $scalr->fetch(sprintf('/api/user/v1beta0/%s/roles/%s', $config->env_id, '76131'));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
print_r($item);


// LIST ALL IMAGES
try {
	$list = $scalr->scroll(sprintf('/api/user/v1beta0/%s/images/', $config->env_id));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
print_r($list);


// FETCH SPECIFIC IMAGE
try {
	$item = $scalr->fetch(sprintf('/api/user/v1beta0/%s/images/%s', $config->env_id, '6b901494-a7da-8946-1722-8bd25ac75283'));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($item);


// CREATE IMAGE
try {
	$response = $scalr->create(sprintf('/api/user/v1beta0/%s/images/', $config->env_id), array(
		'name' => 'api-test-image-trusty-1',
		'cloudImageId' => 'ami-10b68a78',
		'cloudPlatform' => 'ec2',
		'cloudLocation' => 'us-east-1',
		'architecture' => 'x86_64',
		'os' => array
		(
			'id' => 'ubuntu-14-04'
		)
	));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
print_r($response);


// CREATE ROLE
try {
	$response = $scalr->create(sprintf('/api/user/v1beta0/%s/roles/', $config->env_id), array(
		'name' => 'api-test-role',
		'category' => array(
			'id' => 1
		),
		'os' => array(
			'id' => 'ubuntu-14-04'
		)
	));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($response);


// CONNECT IMAGE TO ROLE
try {
	$response = $scalr->create(sprintf('/api/user/v1beta0/%s/roles/%s/images/', $config->env_id, '76131'), array(
		'image' => '646539df-0ed0-b0db-c278-1f3c2e7183d6'
	));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($response);


// REPLACE IMAGE IN ROLE
try {
	$response = $scalr->post(sprintf('/api/user/v1beta0/%s/roles/%s/images/%s/actions/replace/', $config->env_id, '76131', '646539df-0ed0-b0db-c278-1f3c2e7183d6'), array(
		'image' => '6b901494-a7da-8946-1722-8bd25ac75283'
	));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}

print_r($response);


// DELETE IMAGE
try {
	$response = $scalr->delete(sprintf('/api/user/v1beta0/%s/images/%s/', $config->env_id, '646539df-0ed0-b0db-c278-1f3c2e7183d6'));
} catch (Exception $e) {
	print_r($e);
	print_r($scalr->errors);
	exit;
}
	
//print_r($response);

*/
