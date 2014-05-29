#! /usr/bin/env node

// requirements
var program = require('commander');
var exec = require('child_process').exec;

// command line options
program
  .version('0.0.11')
  .option('-f', '--fix', 'attempt to fix')
  .parse(process.argv);

// get last command
var foundGit = false;
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(last_lines) {
  if(last_lines.indexOf('git ') == -1){
    return;
  }
  last_lines = last_lines.split('\n');

  for(var a=0; a < last_lines.length; a++){
    var initial_command = last_lines[a];
    if(initial_command.indexOf('git ') == -1){
      continue;
    }
    undoCommand(initial_command, function(err, info, command, autorun){
      if(info){
        console.log(info);
      }
      else{
        console.log("I didn't recognize that command");
        return;
      }
      if(command){
        if((program.rawArgs.indexOf('-f') > -1 || program.rawArgs.indexOf('--fix') > -1) && autorun){
          console.log('Running ' + command);
          exec(command, function(){
            console.log('Completed');
          });
        }
        else{
          console.log(command);
        }
      }
      else if(autorun){
        console.log("No undo command necessary");
      }
      else{
        console.log("No undo command known");
      }
    });
    foundGit = true;
    break;
  }
});
process.stdin.on('end', function() {
  if(!foundGit){
    console.log("I didn't find a git command");
  }
});

var getFileNames = function(cmd){
  var parts = cmd.split(" ");
  for(var p = 0; p < parts.length; p++){
    if(parts[p].indexOf("-") === 0){
      parts[p] = "";
    }
  }
  return parts;
};

var undoCommand = function(cmd, callback){
  try{
    var cmd = cmd.replace(/\r?\n|\r/g, ' ').replace(/\s\s+/g, ' ').replace(/\s$/, '');
    var info = null;
    var undo = null;
    var autorun = false;
    
    if(cmd.indexOf('git init') > -1){
      info = 'This created a .git folder in the current directory. You can remove it.';
      undo = 'rm -rf .git';
      autorun = true;
    }
    
    else if(cmd.indexOf('git clone') > -1){
      var outputfolder = null;
      var cloned_into = cmd.split('git clone ')[1].split(' ');
      if(cloned_into.length > 1){
        // specified output folder
        outputfolder = cloned_into[1];
      }
      else{
        // default output folder
        // extract from remote - for example https://github.com/mapmeld/gitjk.git
        outputfolder = cloned_into[0].split("/");
        outputfolder = outputfolder[outputfolder.length-1];
        outputfolder = outputfolder.split('.git')[0];
      }
      
      info = 'This downloaded a repo and all of its git history to a folder. You can remove it.';
      if(outputfolder && outputfolder.length && outputfolder.indexOf("..") == -1){
        undo = 'rm -rf ./' + outputfolder.replace(' ', '\\ ');
        autorun = true;
      }
      else{
        info += "\nCouldn't figure out what folder this was downloaded to.";
        autorun = false;
      }
    }
    
    else if(cmd.indexOf('git add') > -1){
      var filenames = getFileNames(cmd.split('git add ')[1]);
      info = 'This added files to the changes staged for commit. All changes to files will be removed from staging for this commit, but remain saved in the local file system.';
      if(filenames.indexOf('.') > -1 || filenames.indexOf('*') > -1){
        info += "\nUsing . or * affects all files, so you will need to run 'git reset <file>' on each file you didn't want to add.";
        autorun = false;
      }
      else{
        undo = 'git reset ' + filenames.join(' ');
        autorun = true;
      }
    }
    
    else if(cmd.indexOf('git rm') > -1){
      filenames = cmd.split('git rm ')[1];
      if(cmd.indexOf("--cached") > -1){
        info = 'This took files out of the changes staged for commit. All changes will be re-added to staging for this commit.';
        undo = 'git add ' + filenames.replace('--cached', '');
      }
      else{
        info = "Don't panic, but this deleted files from the file system. They're not in the recycle bin; they're gone. These files can be restored from your last commit, but uncommited changes were lost.";
        undo = 'git checkout HEAD ' + filenames;
      }
      autorun = true;
    }
    
    else if(cmd.indexOf('git mv') > -1){
      var old_name = cmd.split('git mv ')[1].split(' ')[0];
      var new_name = cmd.split('git mv ')[1].split(' ')[1];
      info = 'This moved the file (named ' + old_name + ') to ' + new_name + '. It can be moved back.';
      undo = 'git mv ' + new_name + ' ' + old_name;
      autorun = true;
    }
    
    else if(cmd.indexOf('git checkout') > -1){
      info = 'git checkout moved you into a different branch of the repo. You can checkout any branch by name, or checkout the last one using -';
      undo = 'git checkout -';
      autorun = true;
    }
    
    else if(cmd.indexOf('git remote add') > -1){
      var repo_name = cmd.split('git remote add ')[1].split(' ')[0];
      var repo_url = cmd.split('git remote add ')[1].split(' ')[1];

      info = 'This added a remote repo (named ' + repo_name + ') pointing to ' + repo_url;
      info += "\nIt can be removed.";
      undo = 'git remote rm ' + repo_name;
      autorun = true;
    }
    
    else if(cmd.indexOf('git remote remove') > -1 || cmd.indexOf('git remote rm') > -1){
      var repo_name = cmd.split('git remote ')[1].split(' ')[1];

      info = 'This removed a remote repo (named ' + repo_name + ')';
      info += "\nIt needs to be added back using git remote add " + repo_name + " <git-url>";
      autorun = false;
    }
    
    else if(cmd.indexOf('git remote set-url') > -1){
      var repo_name = cmd.split('git remote set-url ')[1].split(' ')[0];
      var repo_url = cmd.split('git remote set-url ')[1].split(' ')[1];

      info = 'This changed the remote repo (named ' + repo_name + ') to point to ' + repo_url;
      info += "\nIt can be removed (using git remote rm) or set again (using git remote set-url).";
      autorun = false;
    }
    
    else if(cmd.indexOf('git remote rename') > -1){
      var old_name = cmd.split('git remote rename ')[1].split(' ')[0];
      var new_name = cmd.split('git remote rename ')[1].split(' ')[1];
      info = 'This changed the remote repo (named ' + old_name + ') to have the name ' + new_name + '. It can be reset.';
      undo = 'git remote rename ' + new_name + ' ' + old_name;
      autorun = true;
    }
    
    else if(cmd.indexOf('git commit') > -1){
      info = 'This saved your staged changes as a commit, which can be updated with git commit --amend or completely uncommited:';
      undo = "git reset --soft 'HEAD^'";
    }

    else if(cmd.indexOf('git revert') > -1){
      info = 'This made a new commit to retract a commit. You can undo *the revert commit* using a more extreme approach:';
      undo = "git reset --soft 'HEAD^'";
    }

    else if(cmd.indexOf('git fetch') > -1){
      info = 'This updated the local copy of all branches in this repo. Un-updating master (and you can do other branches, too).';
      undo = 'git update-ref refs/remotes/origin/master refs/remotes/origin/master@{1}';
      autorun = true;
    }
    
    else if(cmd.indexOf('git pull') > -1 || cmd.indexOf('git merge') > -1){
      info = 'This merged another branch (local or remote) into your current branch. This resets you to the last version.';
      undo = 'git reset --hard HEAD^';
      autorun = true;
    }
    
    else if(cmd.indexOf('git push') > -1){
      autorun = false;
      info = 'This uploaded all of your committed changes to a remote repo. It may be difficult to reverse it.';
      info += '\nYou can use git revert <commit_id> to tell repos to turn back these commits.';
      info += '\nThere is git checkout <commit_id> and git push --force, but this will mess up others\' git history!';
      if(cmd.indexOf('git push heroku') > -1){
        info += '\nIf you are hosting this app on Heroku, run "heroku rollback" to reset your app now.'; 
      }
    }
    
    else if(cmd.indexOf('git branch') > -1){
      autorun = true;
      if(cmd.indexOf(' -D') > -1){
        // delete branch
        info = 'You deleted a branch. You can use "git branch" to create it again, or "git pull" to restore it from a remote repo.';
        autorun = false;
      }
      else if(cmd.indexOf('git branch ') > -1){
        // create branch
        var branch_name = cmd.split('git branch ')[1].split(' ')[0];
        if(branch_name.length && branch_name[0] != '-'){
          info = 'You created a new branch named ' + branch_name + '. You can delete it:';
          undo = 'git branch -D ' + branch_name;
        }
      }
      if(!info){
        // must have listed branches
        info = "git branch on its own doesn't change the repo; it just lists all branches. Use it often!";
      }
    }

    else if(cmd.indexOf('git stash') > -1){
      if(cmd.indexOf('stash list') > -1){
        info = "git stash list doesn't change the repo; it just tells you the stashed changes which you can restore using git stash apply.";
        autorun = true;
      }
      else if(cmd.indexOf('stash pop') > -1 || cmd.indexOf('stash apply') > -1){
        info = 'You restored changes from the stash. You can stash specific changes again using git stash.';
        autorun = false;
      }
      else{
        info = 'You stashed any changes which were not yet commited. Restore the latest stash using:';
        undo = 'git stash apply';
        autorun = true;
      }
    }

    else if(cmd.indexOf('git archive') > -1){
      info = 'This created an archive of part of the repo - you can delete it using "rm -rf <archive_file_or_folder>".';
      autorun = false;
    }
    
    // harmless
    
    else if(cmd.indexOf('git cat-file') > -1){
      info = "git cat-file doesn't change the repo; it just tells you the type of an object in the repo.";
      autorun = true;
    }
    else if(cmd.indexOf('git diff') > -1){
      info = "git diff doesn't change the repo; it just tells you the changes waiting for commit OR the changes between branches. Use it often!";
      autorun = true;
    }
    else if(cmd.indexOf('git grep') > -1){
      info = "git grep doesn't change the repo; it's a search tool. Use grep and git grep often!";
      autorun = true;
    }
    else if(cmd.indexOf('git ls-tree') > -1){
      info = "git ls-tree doesn't change the repo; it just tells you about an object in the git repo.";
      autorun = true;
    }
    else if(cmd.indexOf('git show') > -1){
      info = "git show doesn't change the repo; it just tells you the changes waiting for commit OR the changes between branches.";
      autorun = true;
    }
    else if(cmd.indexOf('git log') > -1){
      info = "git log doesn't change the repo; it just lists the last several commits in this branch. Use it often!";
      autorun = true;
    }
    else if(cmd.indexOf('git status') > -1){
      info = "git status doesn't change the repo; it just tells you what changes there are. Use it often!";
      autorun = true;
    }
    else if(cmd.indexOf('git remote') > -1){
      info = "git remote (without additional arguments) doesn't change the repo; it just tells you what remotes there are. Use it often!";
      autorun = true;
    }
    
    callback(null, info, undo, autorun);
  }
  catch(e){
    callback(e, null, null, false);
  }
};