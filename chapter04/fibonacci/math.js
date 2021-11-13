// Synchronous fibonacci function
module.exports.fibonacci = function (n) {
  if (n === 0) return 0;
  else if (n === 1 || n === 2) return 1;
  else return exports.fibonacci(n - 1) + exports.fibonacci(n - 2);
};

// Asynchronous fibonacci function
module.exports.fibonacciAsync = function (n, done) {
  if (n === 0) done(undefined, 0);
  else if (n === 1 || n === 2) done(undefined, 1);
  else {
    setImmediate(() => {
      exports.fibonacciAsync(n - 1, (err, val1) => {
        if (err) done(err);
        else
          setImmediate(() => {
            exports.fibonacciAsync(n - 2, (err, val2) => {
              if (err) done(err);
              else done(undefined, val1 + val2);
            });
          });
      });
    });
  }
};
