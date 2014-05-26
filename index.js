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
      console.log(command);
      if((program.rawArgs.indexOf('-f') > -1 || program.rawArgs.indexOf('--fix') > -1) && autorun){
        exec(command, function(){
          console.log('Completed');
        });
      }
    }
    else{
      console.log("No undo command known");
    }
  });
});

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
      info = 'This added file.js to the changes staged for commit. All changes to file.js will be removed from staging for this commit, but remain saved in your file.';
      undo = 'git rm -r --cached ' + filename;
      autorun = true;
    }
    
    callback(null, info, undo, autorun);
  }
  catch(e){
    callback(e, null, null, false);
  }
};