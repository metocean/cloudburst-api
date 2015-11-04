#!/bin/bash
CBDATA=/home/richardlaw/Documents/metocean/cloudburst-data
CBSOURCE=/home/richardlaw/Documents/metocean/cloudburst
docker run -p 6060:6060 \
-v $CBDATA/data:/var/cloudburst/datasets/enabled \
-v $CBSOURCE/cloudburst:/usr/lib/python2.7/site-packages/cloudburst \
-v $CBDATA/log:/var/log \
-v $CBDATA/www:/var/cloudburst/www \
-v $CBSOURCE/docker/config/nginx/cloudburst.conf:/etc/nginx/conf.d/cloudburst.conf \
greg/cloudburst
