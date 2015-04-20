### Social Interaction Graphics

* Extract data from db:

```r
require(RPostgreSQL)
dvr <- dbDriver("PostgreSQL")
con <- dbConnect(dvr, user = "serena", dbname = "postgres")

messages <- dbGetQuery(con, "select * from messages where extract(month from timestamp) = 3 and extract(year from timestamp) = 2015 and is_bot = False;")

people <- dbGetQuery(con, "(select distinct sender_id, sender_email, sender_name from messages);")
people <- people[!duplicated(people$sender_id), ]

dbDisconnect(con)
```

```
## [1] TRUE
```

```r
dbUnloadDriver(dvr)
```

```
## [1] TRUE
```

#### Find messages with @mentions

```r
m <- regexpr("@\\*{2}(.*?)\\*{2}", messages$text, perl = TRUE)
mentions <- regmatches(messages$text, m)
network_df <- data.frame(messages[grep("@\\*{2}(.*?)\\*{2}", messages$text), 
    c("sender_id", "sender_name")], mention_name = sub("\\*{2}", "", sub("@\\*{2}", 
    "", mentions)))
network_df$mention_id <- people$sender_id[match(network_df$mention_name, people$sender_name)]
network_df <- network_df[!is.na(network_df$mention_id), ]
```
#### Build adjacency matrix

```r
ids <- unique(c(network_df$sender_id, network_df$mention_id))  ## unique IDs mentionnig/being mentionned
n_ids <- length(ids)

network_m <- matrix(rep(0, n_ids^2), ncol = n_ids)

rownames(network_m) <- ids
colnames(network_m) <- ids

for (i in 1:length(ids)) {
    at <- network_df[network_df$sender_id == ids[i], "mention_id"]
    if (length(at) > 0) {
        for (j in 1:length(at)) {
            network_m[rownames(network_m) == ids[i], colnames(network_m) == 
                at[j]] <- network_m[rownames(network_m) == ids[i], colnames(network_m) == 
                at[j]] + 1
        }
    }
}
```
#### Graphics

```r
require(igraph)
```

```
## Loading required package: igraph
```

```
## Warning in library(package, lib.loc = lib.loc, character.only = TRUE,
## logical.return = TRUE, : there is no package called 'igraph'
```

```r
net <- graph.adjacency(network_m)
```

```
## Error in eval(expr, envir, enclos): could not find function "graph.adjacency"
```

```r
V(net)$size <- 9
```

```
## Error in V(net)$size <- 9: object 'net' not found
```

```r
plot.igraph(net, vertex.label = people$sender_name[match(V(net)$name, people$sender_id)], 
    layout = layout.fruchterman.reingold)
```

```
## Error in eval(expr, envir, enclos): could not find function "plot.igraph"
```

Save image with png('igraph.png'):
* width = 2000
* height = 2000 
* pointsize = 14
* res = 170

#### Create JSON


```r
nodes <- list()
for (i in 1:(n_ids)) {
    nodes[[as.character(rownames(network_m)[i])]] <- list(id = i - 1, sender_name = people$sender_name[match(rownames(network_m)[i], 
        people$sender_id)], batch = 1)
}

links <- list()
for (i in 1:nrow(network_m)) {
    if (any(network_m[i, ] > 0)) {
        l <- which(network_m[i, ] > 0)
        for (j in 1:length(l)) {
            links[[length(links) + 1]] <- list(source = nodes[[rownames(network_m)[i]]]$id, 
                target = nodes[[names(l)[j]]]$id, value = network_m[i, l[j]])
        }
    }
}

names(nodes) <- NULL

out <- rjson::toJSON(list(nodes = nodes, links = links))
write(out, "social.json")
```