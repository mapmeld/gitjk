#! /usr/bin/env node

// requirements
var program = require('commander');
var exec = require('child_process').exec;

// command line options
program
  .version('0.0.4')
  .option('-f', '--fix', 'attempt to fix')
  .parse(process.argv);

// get last command
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(initial_command) {
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
});

var getFileNames = function(cmd){
  var parts = cmd.split(" ");
  for(var p = 0; p < parts.length; p++){
    if(parts[p].indexOf("-") === 0){
      parts[p] = "";
    }
  }
  return parts.join(" ");
};

var undoCommand = function(cmd, callback){
  try{
    var info = null;
    var undo = null;
    var autorun = false;
    
    if(cmd.indexOf('git init') > -1){
      info = 'This created a .git folder in the current directory. You can remove it.';
      undo = 'sudo rm -r .git';
      autorun = true;
    }
    
    else if(cmd.indexOf('git clone') > -1){
      var outputfolder = null;
      var cloned_into = cmd.split('git clone ')[1].replace('  ', ' ').replace("\n", '').split(' ');
      if(cloned_into.length > 1){
        // specified output folder
        outputfolder = cloned_into[1];
      }
      else{
        // default output folder
        // extract from remote - for example https://github.com/mapmeld/gitjk.git
        outputfolder = cloned_into[0].split("/");
        outputfolder = outputfolder[outputfolder.length-1].split('.git')[0];
      }
      
      info = 'This downloaded a repo and all of its git history to a folder. You can remove it.';
      if(outputfolder){
        undo = 'sudo rm -r ' + outputfolder;
        autorun = true;
      }
      else{
        info += "\nCouldn't figure out what folder this was downloaded to.";
        autorun = false;
      }
    }
    
    else if(cmd.indexOf('git add') > -1){
      filenames = getFileNames(cmd.replace("\n", "").split('git add ')[1]);
      exec('git status ' + filenames, function(err, response){
        var lines = response.split("\n");
        var new_filenames = [];
        var existing_filenames = [];

        filenames = filenames.split(' ');
        for(var i=0; i < lines.length; i++){
          for(var f=0; f < filenames.length; f++){
            if(filenames[f] && lines[i].indexOf(filenames[f]) != -1){
              if(lines[i].indexOf("new file:") != -1){
                new_filenames.push(filenames[f]);
              }
              else{
                existing_filenames.push(filenames[f]);
              }
              filenames[f] = '';
            }
          }
        }
      
        info = 'This added files to the changes staged for commit. All changes to files will be removed from staging for this commit, but remain saved in the local file system.';
        undo = '';
        if(existing_filenames.length){
          undo = 'git reset ' + existing_filenames;
          if(new_filenames.length){
            undo += "\n";
          }
        }
        if(new_filenames.length){
          undo += 'git rm -r --cached ' + new_filenames;
        }
        autorun = true;
        callback(null, info, undo, autorun);
      });
      
      // delay until knowing how to remove files
      return;
    }
    
    else if(cmd.indexOf('git rm') > -1){
      filenames = cmd.replace("\n", "").split('git rm ')[1];
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
      var old_name = cmd.split('git remote rename ')[1].split(' ')[0].replace('\n', '');
      var new_name = cmd.split('git remote rename ')[1].split(' ')[1].replace('\n', '');
      info = 'This changed the remote repo (named ' + old_name + ') to have the name ' + new_name + '. It can be reset.';
      undo = 'git remote rename ' + new_name + ' ' + old_name;
      autorun = true;
    }
    
    // harmless
    
    else if(cmd.indexOf('git diff') > -1){
      info = "git diff doesn't change the repo; it just tells you the changes waiting for commit OR the changes between branches. Use it often!";
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