# configuration
support = 0.005
workingDir = "C:\\Users\\test\\Desktop\\¸ê®Æ±´°É"

# trasform data
setwd(workingDir)
source("util.R")

# 
inputfile = "output.txt"
outputfile = "seqoutput.txt"


# import depedent libraries
library(Matrix)
library(arules)
library(arulesSequences)

# trim string leading function
trim.leading <- function (x)  sub("^\\s+", "", x)

writeSeq <- function(seq, sup) {
  str <- NULL
  for(i in 1:length(seq)) {
    itemset = paste(seq[[i]], collapse = " ")
    str = paste(str, itemset)
    str = paste(str, -1)
  }
  str = paste(str, "SUP:", sup)
  str = trim.leading(str)
  
  # write to file
  write(str, file=outputfile, append = TRUE)
}

# delete output file if exists
if(file.exists(outputfile)) {
  file.remove(outputfile)
}

# import data
x <- read_baskets(con = inputfile, info = c("sequenceID","eventID","SIZE"))

# spade algorithm
s1 <- cspade(x, parameter = list(support = support), control = list(verbose = TRUE))

# get support list
sup <- support(s1, x, type="absolute",control = NULL)

# write mining result to file
s3 <- as(s1, "list")
for(i in 1:length(s3)) {
  writeSeq(s3[[i]], sup[i])
}

