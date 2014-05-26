#!/usr/bin/env node

// requirements
var program = require('commander');
var exec = require('child_process').exec;

// command line options
program
  .version('0.0.1')
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
    if(parts[p].indexOf("-") == 0){
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
            undo += "\n"
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
      if(cmd.indexOf("--cached") > -1){
        info = 'This took files out of the changes staged for commit. All changes will be re-added to staging for this commit.';
        undo = 'git add ' + filename;
      }
      else{
        filenames = cmd.replace("\n", "").split('git rm ')[1];
        info = "Don't panic, but this deleted files from the file system. They're not in the recycle bin; they're gone. These files can be restored from your last commit, but uncommited changes were lost.";
        undo = 'git checkout HEAD ' + filenames;
      }
      autorun = true;
    }
    
    // harmless
    else if(cmd.indexOf('git status') > -1){
      info = "git status doesn't change the repo; it just tells you what changes there are. Use it often!";
      autorun = true;
    }
    else if(cmd.indexOf('git remote') > -1){
      info = "git remote doesn't change the repo; it just tells you what remotes there are. Use it often!";
      autorun = true;
    }
    
    callback(null, info, undo, autorun);
  }
  catch(e){
    callback(e, null, null, false);
  }
};