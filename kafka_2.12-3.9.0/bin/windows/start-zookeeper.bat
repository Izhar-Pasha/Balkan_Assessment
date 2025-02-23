@echo off
cd /d "C:\Users\DELL\Desktop\Balkan Assessment\kafka_2.12-3.9.0\bin\windows"
start cmd /k zookeeper-server-start.bat ..\..\config\zookeeper.properties
