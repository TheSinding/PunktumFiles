# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
  export ZSH=/home/thesinding/.oh-my-zsh

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-zsh is loaded.
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="bullet-train"

# Zsh Config
# Simon Sinding - renremoulade.me
# 2016 - Oct

plugins=(git osx rake builder zsh-autosuggestions zsh-syntax-highlighting )

source $ZSH/oh-my-zsh.sh

# Custom aliases 
alias c='clear'
alias wee='weechat'
alias grep='grep --color=auto'
alias ls='ls -la --color=auto'
alias eb="vim ~/.zshrc"
alias ewm='vim ~/.config/bspwm/bspwmrc'
alias ekm='vim ~/.config/sxhkd/sxhkdrc'
alias ep='vim ~/.config/bspwm/panels/panel'
alias hej="echo 'Eyyyyyy fucker!'"
alias StatusBat='upower -i /org/freedesktop/UPower/devices/battery_BAT0 | grep "percentage"'
alias rb='pkill -x panel; pkill -x compton; pkill -x lemonbar; bspwmrc'
alias s='cd ..'
alias ch='cd ~'
alias renform="cd /var/www/html/wp-content/plugins/RenForm"
alias e='vim'
alias Pretty="echo Yes I know fucker, better than Peters" 
mkcd(){
    if [[ "$1" ]]
    then mkdir -p "$1" && cd "$1"
    fi
}

alias apt-get="echo 'STOP USING APT-GET!!'"
alias sudo\ apt-get="echo 'STOP USING APT-GET!!'"


if [ -d "$HOME/.local/bin" ]; then
    PATH="$HOME/.local/bin:$PATH"
fi

export TERM='xterm-256color'
export DEFAULT_USER='TheSinding'
export JAVA_HOME=/usr/lib/jvm/
