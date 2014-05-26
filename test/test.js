var exec = require('child_process').exec;
var assert = require('chai').assert;

describe('git init', function(){
  it('should remove the .git directory', function(done){
    exec('echo "git init\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'sudo rm -r .git');
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
      assert.include(response, 'sudo rm -r gitjk');
      done();
    });
  });

  it('should remove a custom download directory', function(done){
    exec('echo "git clone git@github.com:mapmeld/gitjk.git test_gitjk\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'sudo rm -r test_gitjk');
      done();
    });
  });
});

describe('git add', function(){
  /* calls git status - difficult to test this without a repo
  it('should reset a previously-indexed file', function(done){
    exec('echo "git add package.json\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git reset package.json');
      done();
    });
  });

  it('should rm --cached a previously un-indexed file', function(done){
    exec('echo "git add secret.txt\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, 'git rm -r --cached secret.txt');
      done();
    });
  });
  */
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
      assert.include(response, "git reset --hard HEAD^");
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
      assert.include(response, "git reset --hard HEAD^");
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
  it('should print an error message', function(done){
    exec('echo "ls\n" | ./index.js', function(err, response){
      if(err){
        throw err;
      }
      assert.include(response, "I didn't recognize that command");
      done();
    });
  });
});