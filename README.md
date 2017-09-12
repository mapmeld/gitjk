# gitjk

[![Greenkeeper badge](https://badges.greenkeeper.io/mapmeld/gitjk.svg)](https://greenkeeper.io/)

If you just ran a git command that you didn't mean to, this program will either undo it,
tell you how to undo it, or tell you it's impossible to undo. Based on a joke I posted a while ago.

## Examples

Asking for undo-ing advice.

    git init
    gitjk

    This created a .git folder in the current directory. You can remove it.
    rm -rf .git

Asking to fix it automatically

    git add file.js
    gitjk -f

    This added file.js to the changes staged for commit. All changes to file.js will be removed from
    staging for this commit, but remain saved in your file.
    Running... git reset file.js
    Completed

## Coverage

### Included:

    add,
    archive,
    branch,
    cat-file,
    checkout,
    clone,
    commit,
    diff,
    fetch,
    grep,
    init,
    log,
    ls-tree,
    merge,
    mv,
    pull,
    push,
    remote,
    revert,
    rm,
    show,
    stash,
    status

Basic [aliases](http://git-scm.com/book/en/Git-Basics-Tips-and-Tricks#Git-Aliases) are also supported (e.g. `git cm` for `git commit`).

### Not included:

    bisect,
    fsck,
    gc,
    prune,
    rebase,
    reset,
    tag

Compound aliases are not supported (e.g. `git ac` for `git add -A && git commit`).

## Install

You need to run npm install and alias to fully install.
The module is named gitjk but you need to set up an alias to pipe the most recent commands into the program.

### OSX or BSD

    npm install -g gitjk
    alias gitjk="history 10 | tail -r | gitjk_cmd"

### Ubuntu / other Linux

    npm install -g gitjk
    alias gitjk="history 10 | tac | gitjk_cmd"

### Different Terminals

If you are using `fish`, place this is in `~/.config/fish.config` (from [lunixbochs](https://news.ycombinator.com/user?id=lunixbochs) on Hacker News):
    
    alias jk="history | head -n+10 | tail -r | gitjk_cmd"

If you are using `iTerm`

    alias gitjk="history | tail -r -n 10 | gitjk_cmd"

## License

Available under GPLv3 license
