# gitjk_cmd

Based on a joke I posted a while ago - if you just ran a command in git that you don't like, this
program will either undo it, tell you how to undo it, or tell you it's impossible to undo.

## Examples

Asking for undo-ing advice.

    git init
    gitjk

    This created a .git folder in the current directory. You can remove it.
    sudo rm -r .git

Asking to fix it automatically

    git add file.js
    gitjk -f

    This added file.js to the changes staged for commit. All changes to file.js will be removed from
    staging for this commit, but remain saved in your file.
    Running... git rm -r --cached file.js
    Completed

## Install

(node and npm are prerequisites)

```npm install -g gitjk```
```alias gitjk="fc -ln -1 | gitjk_cmd"```

## License

Available under GPLv3 license
