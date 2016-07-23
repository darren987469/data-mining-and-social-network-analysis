
#Association rule
Compute strong association rules from input file with user-defined min_sup and min_conf </br>

Datasets contains integers (>=0) separated by spaces, one transaction by
line, e.g. 1 2 3 0 9 1 9

Usage with the command line

Compile: $ javac src/*.java </br>
Execute: $ java src.HW1 [fileName] [min support] [min confidence] </br>
Example: $ java src.HW1 hw1.dat 0.5 0.6 </br>
 
Output file: association_rule_mining.txt
