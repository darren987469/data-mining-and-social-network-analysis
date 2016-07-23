library("RWeka")

getTuple <- function(line) {
  pairs <- strsplit(line, ",")[[1]]  
  d = data.frame(marital_status=NA, num_children_at_home=NA, member_card=NA, age=NA, year_income=NA)
  
  for(i in 1:length(pairs)) {
    pair = pairs[i]
    attr = as.numeric(strsplit(pair, " ")[[1]][1])
    value = strsplit(pair, " ")[[1]][2]
    
    # 0 -> marital_status {S,M}
    # 1 -> num_children_at_home numeric
    # 2 -> member_card {Basic,Normal,Silver,Gold}
    # 3 -> age numeric
    # 4 -> year_income numeric
    if(attr == 0) {
      d$marital_status <- value 
    } else if(attr == 1) {
      d$num_children_at_home <- as.numeric(value)
    } else if(attr == 2) { 
      d$member_card <- value
    } else if(attr == 3) { 
      d$age <- as.numeric(value)
    } else if(attr == 4) {
      d$year_income <- as.numeric(value)
    } else {
      cat("Error!")
    }
    
  }
  
  # if no member_card type, the type is considered ¡§Basic¡¨
  if(is.na(d[1,3])){d[1,3] <- "Basic"}
  
  return(d)
}

# main 

con.train  <- file("training.arff", open = "r")
con.test <- file("test.arff", open="r")

data.train <- NULL
data.test <- NULL

# read training data line by line
while (length(line <- readLines(con.train, n = 1, warn = FALSE)) > 0) {
  # substr '{' and '}'
  line <- substr(line, 2, nchar(line)-1)
  
  data.train <- rbind(data.train, getTuple(line))
  #print(line) 
} 


# read test data
while (length(line <- readLines(con.test, n = 1, warn = FALSE)) > 0) {
  # substr '{' and '}'
  line <- substr(line, 2, nchar(line)-1)
  
  data.test <- rbind(data.test, getTuple(line))
  #print(line)   
} 

# remove useless attr marital_status
data.train$marital_status <- NULL
data.test$marital_status <- NULL

# transfer member_card attr to factor type
data.train$member_card <- factor(data.train$member_card)

# build classify model
m1 <- J48(member_card ~ ., data.train)

# predict with classifier
result <- predict(m1, newdata = data.test)

stat <- data.frame(value=NULL, predict=NULL)
# compare result with test.arff data
for(i in 1:nrow(data.test)) {
  stat <- rbind(stat, data.frame(value=data.test[i,]$member_card, predict=result[i]))
}

accuracy <- sum(stat$value == stat$predict)/nrow(stat)
cat("accuracy:" ,accuracy)

close(con.train)
close(con.test)