# configuration
inputfile <- "seqdata.dat"
outputfile <-"output.txt"

transformData <- function(inputfile, outputfile) {
  # delete output file if exists
  if(file.exists(outputfile)) {
    file.remove(outputfile)
  }
  
  con  <- file(inputfile, open = "r")
  
  # transform data line by line
  while (length(line <- readLines(con, n = 1, warn = FALSE)) > 0) {
    print(line)
    row = strsplit(line," +")[[1]]   
    seqId <- as.numeric(row[2])
    eventId <- as.numeric(row[3])
    items <- NULL
    i = 3
    
    while(i < length(row)){
      time = as.numeric(row[i])
      item = as.numeric(row[i+1])
      # new event
      if(time != eventId){
        # write old event to file
        data = sprintf("%d %d %d %s", seqId, eventId, length(items), paste(items, collapse = " ")) 
        write(data, file=outputfile, append = TRUE)
        
        # create new event
        eventId <- time
        items <- NULL
      }
      
      items <- c(items, item)
      i = i+2
      #print(i)
      #print(row[i])
    }
    data = sprintf("%d %d %d %s", seqId, eventId, length(items), paste(items, collapse = " ")) 
    write(data, file=outputfile, append = TRUE)
  } 
  
  close(con)
}

transformData(inputfile, outputfile)

