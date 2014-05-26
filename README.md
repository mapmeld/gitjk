# gitjk

Based on a joke I posted a while ago - if you just ran a git command that you didn't mean to, this
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

## Coverage
Included:

    add
    checkout
    clone
    commit
    diff
    fetch
    grep
    init
    log
    push
    remote
    rm
    show
    status

Not included:

    bisect
    branch
    merge
    mv
    pull
    rebase
    reset
    tag

## Install

You can't just npm install! The module is named gitjk but you can set up an alias for it to pipe the
last command into the program.

    npm install -g gitjk
    alias gitjk="fc -ln -1 | gitjk_cmd"

## License

Available under GPLv3 license
