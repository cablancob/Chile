#!/bin/bash
while :
do
	COMMAND="$(pgrep -f "node server.js")"
	RESULTADO="${COMMAND}"
	if [ "$RESULTADO" =  "" ]
	then
		nohup npm start  &
		echo "EJECUTANDO"
	fi
	sleep 1m
done
