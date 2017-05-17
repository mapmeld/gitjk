var exec = require('child_process').exec;
var assert = require('chai').assert;

describe('git init', function(){
  it('should remove the .git directory', function(done){
    exec('echo "git init\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'rm -rf .git');
      done();
    });
  });
});

describe('git clone', function(){
  it('should remove the default download directory', function(done){
    exec('echo "git clone git@github.com:mapmeld/gitjk.git\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'rm -rf ./gitjk');
      done();
    });
  });

  it('should remove a custom download directory', function(done){
    exec('echo "git clone git@github.com:mapmeld/gitjk.git test_gitjk\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'rm -rf ./test_gitjk');
      done();
    });
  });
});

describe('git add', function(){
  it('should reset a previously-indexed file', function(done){
    exec('echo "git add package.json\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git reset package.json');
      done();
    });
  });

  it('should warn instead of doing git reset . or git reset *', function(done){
    exec('echo "git add .\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'Using . or * affects all files');
      done();
    });
  });
});

describe('git rm', function(){
  it('should re-index a cached/removed file', function(done){
    exec('echo "git rm package.json --cached\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git add package.json');
      done();
    });
  });

  it('should un-delete a deleted file', function(done){
    exec('echo "git rm package.json\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git checkout HEAD package.json');
      done();
    });
  });
});

describe('git mv', function(){
  it('should move the file back', function(done){
    exec('echo "git mv package.json p.json\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git mv p.json package.json');
      done();
    });
  });
});

describe('git checkout', function(){
  it('should checkout back to the previous directory', function(done){
    exec('echo "git checkout bogus\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git checkout -');
      done();
    });
  });

  it('should checkout back to the previous directory', function(done){
    exec('echo "git checkout -b created\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git checkout -');
      done();
    });
  });

  it('should warn you can\t undo', function(done){
    exec('echo "git checkout package.json\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'panic');
      done();
    });
  });
});

describe('git remote', function(){
  it('should remove a remote add', function(done){
    exec('echo "git remote add github https://github.com\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git remote rm github');
      done();
    });
  });

  it('should warn a remote remove', function(done){
    exec('echo "git remote remove github\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git remote add github');
      done();
    });
  });

  it('should warn a remote rm', function(done){
    exec('echo "git remote rm github\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git remote add github');
      done();
    });
  });

  it('should swap names in a remote rename', function(done){
    exec('echo "git remote rename github banana\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git remote rename banana github');
      done();
    });
  });

  it('does nothing without args', function(done){
    exec('echo "git remote\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });
});

describe('git commit', function(){
  it('should unseal a commit', function(done){
    exec('echo "git commit\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git reset --soft 'HEAD^'");
      done();
    });
  });
});

describe('git revert', function(){
  it('should unseal the git revert commit', function(done){
    exec('echo "git revert 0ee030\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git reset --soft 'HEAD^'");
      done();
    });
  });
});

describe('git fetch', function(){
  it('should un-update master branch', function(done){
    exec('echo "git fetch\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git update-ref refs/remotes/origin/master refs/remotes/origin/master@{1}");
      done();
    });
  });
});

describe('git pull', function(){
  it('should do a reset after git pull', function(done){
    exec('echo "git pull origin master\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git reset --hard");
      done();
    });
  });
});

describe('git merge', function(){
  it('should do a reset after git merge', function(done){
    exec('echo "git merge merged\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git reset --hard");
      done();
    });
  });
});

describe('git archive', function(){
  it('should tell user to remove archive', function(done){
    exec('echo "git archive HEAD > sample.zip\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "rm -rf");
      done();
    });
  });
});

describe('git stash', function(){
  it('should tell user when they stashed changes', function(done){
    exec('echo "git stash\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git stash apply");
      done();
    });
  });

  it('should tell user when they un-stashed changes', function(done){
    exec('echo "git stash apply\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git stash");
      done();
    });
  });

  it('should tell user when they un-stashed changes', function(done){
    exec('echo "git stash pop\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git stash");
      done();
    });
  });

  it('should tell user when they listed stashes', function(done){
    exec('echo "git stash list\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });
});

describe('git branch', function(){
  it('should tell user when they added a branch', function(done){
    exec('echo "git branch banana\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git branch -D banana");
      done();
    });
  });

  it('should tell user when they deleted a branch', function(done){
    exec('echo "git branch -D banana\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "git branch");
      assert.include(response, "git pull");
      done();
    });
  });

  it('should tell user when they listed branches', function(done){
    exec('echo "git branch -a\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });
});

describe('git push', function(){
  it('should not fix a git push', function(done){
    exec('echo "git push origin master\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "This uploaded all of your committed changes to a remote repo.");
      done();
    });
  });

  it('should help fix a push to heroku', function(done){
    exec('echo "git push heroku master\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "heroku rollback");
      done();
    });
  });
});

describe('reassure user on do-nothing commands', function(){
  it('git status', function(done){
    exec('echo "git status\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git cat-file', function(done){
    exec('echo "git cat-file 0ee030\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git diff', function(done){
    exec('echo "git diff\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git show', function(done){
    exec('echo "git show\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git log', function(done){
    exec('echo "git log\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git ls-tree', function(done){
    exec('echo "git ls-tree 0ee030\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('git grep', function(done){
    exec('echo "git grep\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "doesn't change the repo");
      done();
    });
  });
});

describe('unknown command', function(){
  it('should print an error message with unknown command', function(done){
    exec('echo "git blog\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "I didn't recognize that command");
      done();
    });
  });

  it('should print an error message without git', function(done){
    exec('echo "ls\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "I didn't find a git command");
      done();
    });
  });
});

describe('aliases', function() {
  var renamedConfig = false,
      fs = require('fs'),
      path = require('path'),
      oldPath = path.join(process.env.HOME, '.gitconfig'),
      tempPath = path.join(process.env.HOME, '.GITJKTEMP');

  var newConfig =
    '[alias]\n' +
    '  st = status\n' +
    '  cm = commit\n' +
    '  ac = !git add -A && git commit\n';

  // Create a gitconfig with some aliases before tests run.
  before(function (done) {
    fs.rename(oldPath, tempPath, function (err) {

      // No existing gitconfig.
      if (err) renamedConfig = false;

      fs.writeFile(oldPath, newConfig, function (err) {

        // If something went wrong, try restoring the gitconfig.
        if (err) afterTests(function () {});
      });

      done();
    });
  });

  function afterTests (done) {
    fs.unlink(oldPath, function (err) {

      if (!renamedConfig) return done();

      fs.rename(tempPath, oldPath, function (err) {
        if (err) throw err;

        done();
      });
    });
  }

  after(afterTests);

  it('should properly handle simple aliases (1)', function (done) {
    exec('echo "git st\n" | ./index.js', function(err, response){
      if(err) throw err;

      assert.include(response, "doesn't change the repo");
      done();
    });
  });

  it('should properly handle simple aliases (2)', function (done) {
    exec('echo "git cm\n" | ./index.js', function(err, response){
      if(err) throw err;

      assert.include(response, "git reset --soft 'HEAD^'");
      done();
    });
  });

  it('should inform the user it cannot handle compound aliases.', function (done) {
    exec('echo "git ac\n" | ./index.js', function(err, response){
      if(err) throw err;

      assert.include(response, 'No undo command known');
      done();
    });
  });
});
