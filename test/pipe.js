import test from 'ava';
import shell from '..';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
});


//
// Invalids
//

test('commands like `rm` can\'t be on the right side of pipes', t => {
  t.is(typeof shell.ls('.').rm, 'undefined');
  t.is(typeof shell.cat('resources/file1.txt').rm, 'undefined');
});

//
// Valids
//

test('piping to cat() should return roughly the same thing', t => {
  t.true(
    shell.cat('resources/file1.txt').cat().toString() === shell.cat('resources/file1.txt').toString()
  );
});

test('piping ls() into cat() converts to a string', t => {
  t.true(shell.ls('resources/').cat().toString() === shell.ls('resources/').stdout);
});

test('No Test Title #52', t => {
  const result = shell.ls('resources/').grep('file1');
  t.is(result + '', 'file1\nfile1.js\nfile1.txt\n');
});

test('No Test Title #53', t => {
  const result = shell.ls('resources/').cat().grep('file1');
  t.is(result + '', 'file1\nfile1.js\nfile1.txt\n');
});

test('Equivalent to a simple grep() test case', t => {
  const result = shell.cat('resources/grep/file').grep(/alpha*beta/);
  t.is(shell.error(), null);
  t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
});

test('Equivalent to a simple sed() test case', t => {
  const result = shell.cat('resources/grep/file').sed(/l*\.js/, '');
  t.truthy(!shell.error());
  t.is(
    result.toString(),
    'alphaaaaaaabeta\nhowareyou\nalphbeta\nthis line ends in\n\n'
  );
});

test('Sort a file by frequency of each line', t => {
  const result = shell.sort('resources/uniq/pipe').uniq('-c').sort('-n');
  t.is(shell.error(), null);
  t.is(result.toString(), shell.cat('resources/uniq/pipeSorted').toString());
});

// <<<<<<< 2c1adf89f850b509bc5a5a764d08a51754cedcf5
// // Synchronous exec. To support Windows, the arguments must be passed
// // using double quotes because node, following win32 convention,
// // passes single quotes through to process.argv verbatim.
// result = shell.cat('resources/grep/file').exec('shx grep "alpha*beta"');
// assert.ok(!shell.error());
// assert.equal(result, 'alphaaaaaaabeta\nalphbeta\n');

// // Async exec
// shell.cat('resources/grep/file').exec('shx grep "alpha*beta"', function (code, stdout) {
//   assert.equal(code, 0);
//   assert.equal(stdout, 'alphaaaaaaabeta\nalphbeta\n');
//   shell.exit(123);
// =======
// TODO: add windows tests
test('Synchronous exec', t => {
  if (shell.which('grep').stdout) {
    const result = shell.cat('resources/grep/file').exec("grep 'alpha*beta'");
    t.is(shell.error(), null);
    t.is(result.toString(), 'alphaaaaaaabeta\nalphbeta\n');
  } else {
    console.error('Warning: Cannot verify piped exec');
  }
});

// TODO: add windows tests
test.cb('Asynchronous exec', t => {
  if (shell.which('grep').stdout) {
    shell.cat('resources/grep/file').exec("grep 'alpha*beta'", (code, stdout) => {
      t.is(code, 0);
      t.is(stdout, 'alphaaaaaaabeta\nalphbeta\n');
      t.end();
    });
  } else {
    console.error('Warning: Cannot verify piped exec');
    t.end();
  }
// >>>>>>> test: switch to ava framework
});
