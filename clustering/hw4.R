library("RWeka")
require("ggplot2")

######## Arguments ######

file1 <- "0_random.txt"
file2 <- "1_random.txt"
FILE1_CLUSTER_NUM <- 4
FILE2_CLUSTER_NUM <- 4

########################

data1 <- read.table("0_random.txt", col.names = c("x","y"))
data2 <- read.table("1_random.txt", col.names = c("x","y"))

# plot data1 
qplot(data1$x, data1$y, xlab = "x", ylab = "y", main="Plot of data1")
cluster1 <- SimpleKMeans(data1, Weka_control(N = FILE1_CLUSTER_NUM))
clusters1 <- factor(predict(cluster1))
plot1 <- qplot(data1$x, data1$y, xlab = "x", ylab = "y", main="Plot of clustered data1", colour = clusters1)
plot1
data1$cluster <- factor(predict(cluster1))
write.table(data1, "output1.txt", sep=" ", row.names = FALSE, col.names = FALSE, quote = FALSE)

# plot data2
qplot(data2$x, data2$y, xlab = "x", ylab = "y", main="Plot of data2")
cluster2 <- SimpleKMeans(data2, Weka_control(N = FILE2_CLUSTER_NUM))
clusters2 <- factor(predict(cluster2))
plot2 <- qplot(data2$x, data2$y, xlab = "x", ylab = "y", main="Plot of clustered data2", colour = clusters2)
plot2
data2$cluster <- factor(predict(cluster2))
write.table(data2, "output2.txt", sep=" ", row.names = FALSE, col.names = FALSE, quote = FALSE)



