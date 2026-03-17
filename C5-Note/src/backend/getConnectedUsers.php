<?php
// File: backend/getConnectedUsers.php
// PURPOSE: Track presence in `page_connections` and return active viewers.
//
// Caller sends JSON: { "pageid": 3, "groupid": 7 }
// Must have a cookie named "username".

header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('Content-Type: application/json; charset=UTF-8');

// 0) Connect to MySQL
$config = json_decode(file_get_contents('../config.json'));
$mysqli = new mysqli(
    'localhost',
    $config->username,
    $config->password,
    $config->db_name,
    3306
);
if ($mysqli->connect_error) {
    http_response_code(500);
    exit(json_encode(['error' => 'DB connection failed']));
}

// 1) Parse request body
$req = json_decode(file_get_contents('php://input'), true);
if (!isset($req['pageid'], $req['groupid'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'missing pageid or groupid']));
}
$pageid  = intval($req['pageid']);
$groupid = intval($req['groupid']);

// 2) Identify current user by cookie
if (empty($_COOKIE['username'])) {
    http_response_code(401);
    exit(json_encode(['error' => 'username cookie not set']));
}
$username = $_COOKIE['username'];

// 3) Look up user_id in `users`
$stmt = $mysqli->prepare('SELECT user_id FROM users WHERE username = ?');
$stmt->bind_param('s', $username);
$stmt->execute();
$res = $stmt->get_result();
if ($res->num_rows === 0) {
    http_response_code(401);
    exit(json_encode(['error' => 'unknown username']));
}
$user_id = (int) $res->fetch_assoc()['user_id'];
$stmt->close();

// 4) UPSERT a heartbeat row
$upsert = $mysqli->prepare("
    INSERT INTO page_connections
        (user_id, username, pageid, groupid, last_activity)
    VALUES
        (?,       ?,       ?,      ?,       NOW())
    ON DUPLICATE KEY UPDATE
        last_activity = NOW(),
        username      = VALUES(username)
");
$upsert->bind_param('isii', $user_id, $username, $pageid, $groupid);
$upsert->execute();
$upsert->close();

// 5) Gather active viewers (+ delete any stale > 5s)
$active  = [];
$nowUnix = time();

$stmt = $mysqli->prepare("
    SELECT user_id, username, last_activity
      FROM page_connections
     WHERE pageid = ? AND groupid = ?
");
$stmt->bind_param('ii', $pageid, $groupid);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $lastUnix = strtotime($row['last_activity']);
    if ($nowUnix - $lastUnix > 5) {
        // Stale—remove
        $del = $mysqli->prepare("
            DELETE FROM page_connections
             WHERE user_id = ? AND pageid = ? AND groupid = ?
        ");
        $del->bind_param('iii', $row['user_id'], $pageid, $groupid);
        $del->execute();
        $del->close();
    } else {
        $active[] = [
            'username'      => $row['username'],
            'last_activity' => $row['last_activity']
        ];
    }
}
$stmt->close();

// 6) Return JSON
echo json_encode(['connected_users' => $active]);

$mysqli->close();
exit;
?>