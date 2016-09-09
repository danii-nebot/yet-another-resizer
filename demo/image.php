<?php
// DEMO SERVER SIDE SCRIPT: grab files and save them
// this is horribly unsafe but hey this is a quick and dirty demo
// DO NOT under any circumstances use in production
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST,GET,OPTIONS,PUT,DELETE');
header('Access-Control-Allow-Headers: Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With');

// read input stream
$data = file_get_contents("php://input");
if($data) {
  // filtering and decoding code adapted from
  // http://stackoverflow.com/questions/11843115/uploading-canvas-context-as-image-using-ajax-and-php?lq=1
  // Filter out the headers (data:,) part.
  $filteredData = substr($data, strpos($data, ",") + 1);
  // Need to decode before saving since the data we received is already base64 encoded
  $decodedData = base64_decode($filteredData);

  // store in server
  $fic_name = 'img'.rand(1000,9999).'.png';
  $fp = fopen('./uploads/'.$fic_name, 'wb');
  $ok = fwrite( $fp, $decodedData);
  fclose($fp);

  if($ok) {
    echo $fic_name;
  } else {
    echo "ERROR";
  }
}
