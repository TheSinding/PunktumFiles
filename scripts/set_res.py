#!/usr/bin/env python3
import subprocess
import os
import time

#--- set the default resolution below
default = "3840x2160"
#---

# read the datafile
curr_dir = os.path.dirname(os.path.abspath(__file__))
datafile = curr_dir+"/procsdata.txt"
procs_data = [l.split() for l in open(datafile).read().splitlines() if not l == "\n"]
procs = [pdata[0] for pdata in procs_data]
print(procs_data)


def check_matches():
    # function to find possible running (listed) applications
    matches = []
    for p in procs:
        try:
            print(p)
            matches.append([p, subprocess.check_output(["pgrep", "-f", p]).decode("utf-8")])
        except subprocess.CalledProcessError:
            pass
    match = matches[-1][0] if len(matches) != 0 else None
    return match

matches1 = check_matches()

while True:
    time.sleep(2)
    matches2 = check_matches()
    print(matches2)
    if matches2 == matches1:
        pass
    else:
        if matches2 != None:
            # a listed application started up since two seconds ago
            resdata = [("x").join(item[1].split("x")) for item in \
                       procs_data if item[0] == matches2][0]

            print(resdata)
        elif matches2 == None:
            # none of the listed applications is running any more
            resdata = default
            print(resdata)
        #subprocess.Popen(["xrandr", "-s", resdata])
	#print("Hey")
    matches1 = matches2
    time.sleep(1)
