<?php
// File: backend/getPageContent.php
// PURPOSE: Return page_content + last_user + last_mod + page_name ONLY.
// (No “connected users” logic)

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=UTF-8');

// 0) Connect to the database
$config = json_decode(file_get_contents('../config.json'));
$mysqli = new mysqli('localhost', $config->username, $config->password, $config->db_name, 3306);
if ($mysqli->connect_error) {
    http_response_code(500);
    exit(json_encode(['error' => 'DB connection failed']));
}

// 1) Parse incoming JSON
$in = json_decode(file_get_contents('php://input'));
$pageid  = intval($in->pageid  ?? 0);
$groupid = intval($in->groupid ?? 0);

// 2) Fetch the page record from `pages`
$stmt = $mysqli->prepare("
    SELECT page_content, last_user, last_mod, page_name
      FROM pages
     WHERE page_number = ? AND group_id = ?
");
$stmt->bind_param('ii', $pageid, $groupid);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    http_response_code(404);
    exit(json_encode(['error' => 'Page not found']));
}

$row = $res->fetch_assoc();
$stmt->close();

// 3) Purify the HTML before returning (using your existing HTMLPurifier)
require_once './htmlpurifier/htmlpurifier/library/HTMLPurifier.auto.php';
$cfgP = HTMLPurifier_Config::createDefault();
$cfgP->set('HTML.SafeIframe', true);
$cfgP->set(
    'URI.SafeIframeRegexp',
    '%^(https?:)?//(www\.youtube(?:-nocookie)?\.com/embed/|player\.vimeo\.com/video/)%'
);
$purifier = new HTMLPurifier($cfgP);

// 4) Respond with JSON (only content + metadata)
echo json_encode([
    'content'   => $purifier->purify($row['page_content']),
    'last_user' => $row['last_user'],
    'last_mod'  => $row['last_mod'],
    'page_name' => $row['page_name']
]);

$mysqli->close();
exit;
?>