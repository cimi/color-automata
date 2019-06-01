fetch("https://requestbin.fullcontact.com/q4c2a9q4", {
  method: "GET", // *GET, POST, PUT, DELETE, etc.
  mode: 'no-cors', // no-cors, cors, *same-origin
  // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
  // credentials: 'omit', // include, *same-origin, omit
  // headers: {
  // 'Content-Type': 'application/x-www-form-urlencoded',
  // 'Content-Type': 'application/x-www-form-urlencoded',
  // },
  redirect: "follow" // manual, *follow, error
  // referrer: 'no-referrer', // no-referrer, *client
  // body: "title=test-title&body=test-body", // body data type must match "Content-Type" header
});
