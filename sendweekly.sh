#!bin/bash
sudo node /home/ubuntu/shiny-email-logs/biweekly_email.js
/usr/sbin/sendmail evandev@gastrograph.com  < /tmp/shiny-email.txt
/usr/sbin/sendmail jasoncec@gastrograph.com  < /tmp/shiny-email.txt
now=$(date +"%m_%d_%Y")
sudo tar -zcvf /var/log/shiny-daily-archive/$now.log.tar /var/log/shiny-daily/
sudo rm /var/log/shiny-daily/*
